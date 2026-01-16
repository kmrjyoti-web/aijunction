import { RowContactDto } from '../models/row-contact.dto';
import { RowContactMapper } from '../models/row-contact.mapper';
// Moving Core -> UI-Kit dependency. Ideally this interface should be in Core or Shared.
// For now, relative path to UI-Kit.
import { ApiRequest, ApiResponse } from '../../../online/models/api.model';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '@ai-junction/ui-kit';
import { Injectable, inject } from '@angular/core';
import { RowContactOfflineRepository } from '../../row-contact/data-access/row-contact-offline.repository';
import { SyncLogRepository } from '../../../sync/logging/sync-log.repository';
import { RowContactEntity } from '../models/row-contact.entity';
import { SyncLogEntity } from '../../../sync/logging/sync-log.entity';

@Injectable({
    providedIn: 'root'
})
export class RowContactDataService {
    private readonly ENTITY_TYPE = 'ROW_CONTACT';
    private configService = inject(ConfigService);

    constructor(
        private offlineRepo: RowContactOfflineRepository,
        private syncLogRepo: SyncLogRepository
    ) { }

    getAll() {
        return this.offlineRepo.getAll();
    }

    async getById(id: string) {
        return this.offlineRepo.getById(id);
    }

    async create(dto: RowContactDto): Promise<string> {
        const entity = RowContactMapper.toEntity(dto);
        entity.syncStatus = 'PENDING';

        // 1. Save to Offline DB
        const id = await this.offlineRepo.add(entity);

        // 2. Add to Sync Log
        const log: SyncLogEntity = {
            entityType: this.ENTITY_TYPE,
            entityId: id,
            operation: 'CREATE', // Mapping enum manually if needed or using casting
            data: dto, // We send the DTO payload
            timestamp: Date.now(),
            status: 'PENDING' as any, // Cast to match enum string
            retryCount: 0
        };
        await this.syncLogRepo.addLog(log);

        return id;
    }

    async update(id: string, dto: Partial<RowContactDto>): Promise<void> {
        const current = await this.offlineRepo.getById(id);
        if (!current) throw new Error('Entity not found');

        // 1. Update Offline DB
        await this.offlineRepo.update(id, {
            ...dto,
            syncStatus: 'PENDING',
            lastModified: Date.now()
        } as any);

        // 2. Add to Sync Log
        const log: SyncLogEntity = {
            entityType: this.ENTITY_TYPE,
            entityId: id,
            operation: 'UPDATE',
            data: dto,
            timestamp: Date.now(),
            status: 'PENDING' as any,
            retryCount: 0
        };
        await this.syncLogRepo.addLog(log);
    }

    async delete(id: string): Promise<void> {
        // 1. Delete from Offline DB
        await this.offlineRepo.delete(id);

        // 2. Add to Sync Log
        const log: SyncLogEntity = {
            entityType: this.ENTITY_TYPE,
            entityId: id,
            operation: 'DELETE',
            data: { rowContactUniqueId: id },
            timestamp: Date.now(),
            status: 'PENDING' as any,
            retryCount: 0
        };
        await this.syncLogRepo.addLog(log);
    }

    // --- Implementation for DataManagerService compatibility ---

    bulkUpsert(data: any[]): Observable<void> {
        const entities = data.map((item: any) => {
            return {
                ...item,
                syncStatus: 'SYNCED',
                lastModified: Date.now()
            } as RowContactEntity;
        });

        return from((this.offlineRepo as any).db.RowContact.bulkPut(entities)).pipe(
            map(() => void 0)
        );
    }

    getData(request: ApiRequest): Observable<ApiResponse> {
        const { page_number, page_size, sort_column, search_filters } = request;
        const table = (this.offlineRepo as any).db.RowContact;

        let collection;

        // --- Sorting ---
        if (sort_column.length > 0 && sort_column[0].coloum_id) {
            const { coloum_id, short_type } = sort_column[0];
            collection = table.orderBy(coloum_id);
            if (short_type === 'desc') {
                collection = collection.reverse();
            }
        } else {
            collection = table.toCollection();
        }

        // --- Filtering ---
        if (search_filters.length > 0) {
            collection = collection.filter((record: any) => {
                return search_filters.every((filter: any) => {
                    if (!filter.parameter_code || !filter.parameter_value) return true;

                    const filterValue = filter.parameter_value.toLowerCase();
                    const recordValue = String(record[filter.parameter_code] || '').toLowerCase();

                    return recordValue.includes(filterValue);
                });
            });
        }

        // --- Pagination ---
        const totalRecordsPromise = collection.count();
        const pageNum = Number(page_number);
        const pageSizeNum = Number(page_size);
        const startIndex = (pageNum - 1) * pageSizeNum;

        const pagedDataPromise = collection.offset(startIndex).limit(pageSizeNum).toArray();

        return from(Promise.all([totalRecordsPromise, pagedDataPromise]).then(([total, data]) => {
            return {
                data: data,
                total_records: total
            };
        }));
    }
}
