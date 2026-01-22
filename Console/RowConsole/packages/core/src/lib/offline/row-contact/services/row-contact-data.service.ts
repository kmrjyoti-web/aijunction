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
import { RowContactOnlineRepository } from '../../../online/row-contact/data-access/row-contact-online.repository';
import { LocalStorageService } from '../../../caching/local-storage.service';
import { RowContactSyncHandler } from '../../../sync/handlers/row-contact-sync.service';

@Injectable({
    providedIn: 'root'
})
export class RowContactDataService {
    private readonly ENTITY_TYPE = 'ROW_CONTACT';
    private configService = inject(ConfigService);

    constructor(
        private offlineRepo: RowContactOfflineRepository,
        private onlineRepo: RowContactOnlineRepository,
        private syncLogRepo: SyncLogRepository,
        private localStorage: LocalStorageService,
        private syncHandler: RowContactSyncHandler
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
        const strategy = this.configService.config().config.dataStrategy?.toUpperCase() || 'OFFLINE_FIRST';
        // Check for specific flag or config if autoSync logic is separate, but user requirement links it to SYNC strategy details.

        const processFn = async (): Promise<ApiResponse> => {
            console.log(`[RowContactDataService] getData strategy: ${strategy}`);

            // 1. OFFLINE_FIRST
            if (strategy === 'OFFLINE_FIRST') {
                return this.getFromOffline(request);
            }

            // 2. ONLINE_FIRST
            if (strategy === 'ONLINE_FIRST') {
                try {
                    console.log('[RowContactDataService] ONLINE_FIRST: Fetching from API...');
                    const onlineData = await (this.onlineRepo.getData(request).toPromise());
                    // User requirement: "Fully Online". No fallback mentioned.
                    if (onlineData) {
                        // Optional: we can cache it silently if we want, but requirement says "Fully Online".
                        // However, keeping local DB updated is generally good for HYBRID switching later.
                        // But strictly following user: "ONLINE_FIRST Fully Online".
                        return onlineData;
                    }
                    throw new Error('No data returned from Online Repo');
                } catch (error) {
                    console.error('[RowContactDataService] ONLINE_FIRST failed.', error);
                    throw error;
                }
            }

            // 3. SYNC
            if (strategy === 'SYNC') {
                const pageNum = Number(request.page_number) || 1;

                // Optimization: Only use Online for Page 1 (to check freshness/meta).
                // Use Offline for Page 2+ (assuming sync is effectively handling it).
                if (pageNum > 1) {
                    console.log(`[RowContactDataService] SYNC: Page ${pageNum} > 1. Fetching from Offline DB for performance.`);
                    return this.getFromOffline(request);
                }

                // "First Call Appi then Get data acording to screen page size"
                try {
                    console.log('[RowContactDataService] SYNC: Page 1. Fetching from API to verify consistency...');
                    const onlineData = await (this.onlineRepo.getData(request).toPromise());

                    if (onlineData) {
                        // "then check previus meta log total record"
                        const LAST_TOTAL_KEY = 'RowContact_LastTotalRecords';
                        const savedTotal = Number(this.localStorage.getData(LAST_TOTAL_KEY) || -1);
                        const currentTotal = onlineData.total_records ?? 0;

                        if (savedTotal !== currentTotal) {
                            console.log(`[RowContactDataService] SYNC: Total changed (Old: ${savedTotal}, New: ${currentTotal}). Triggering Background Sync...`);
                            this.localStorage.saveData(LAST_TOTAL_KEY, String(currentTotal));
                            // Trigger background sync
                            this.syncHandler.syncDown();
                        } else {
                            console.log('[RowContactDataService] SYNC: Total matched. Skipping background sync.');
                        }

                        // We also likely want to cache the viewed page so looking offline later works partially
                        if (onlineData.data && onlineData.data.length > 0) {
                            console.log('[RowContactDataService] DEBUG: First item ID:', onlineData.data[0].rowContactUniqueId);
                            console.log('[RowContactDataService] DEBUG: First item keys:', Object.keys(onlineData.data[0]));
                            await this.bulkUpsert(onlineData.data).toPromise();
                        }

                        return onlineData;
                    }
                    throw new Error('No data from Online Repo in SYNC mode');

                } catch (error) {
                    console.error('[RowContactDataService] SYNC strategy failed to fetch online. Fallback to Offline.', error);
                    return this.getFromOffline(request);
                }
            }

            // 4. HYBRID
            if (strategy === 'HYBRID') {
                // "first work like offline"
                const offlineData = await this.getFromOffline(request);

                // "supose user search any record and data not exist in local then call API"
                const hasFilters = request.search_filters && request.search_filters.length > 0;
                // Heuristic: If we are searching AND got no results (or very few?), try online.
                // Or simply if total_records is 0?
                // User said: "search any record and data not exist in local"

                if (hasFilters && (!offlineData.data || offlineData.data.length === 0)) {
                    console.log('[RowContactDataService] HYBRID: Search miss in Offline. Trying Online...');
                    try {
                        const onlineData = await (this.onlineRepo.getData(request).toPromise());
                        if (onlineData && onlineData.data && onlineData.data.length > 0) {
                            console.log('[RowContactDataService] HYBRID: Found data Online. Updating Local DB...');
                            // "match LOCAL_DB in background or update local db"
                            await this.bulkUpsert(onlineData.data).toPromise();

                            // Return the online result as it is what the user searched for
                            return onlineData;
                        } else {
                            console.log('[RowContactDataService] HYBRID: Online also returned empty.');
                        }
                    } catch (error) {
                        console.warn('[RowContactDataService] HYBRID: Online fallback failed.', error);
                    }
                }

                return offlineData;
            }

            // Fallback / Default
            return this.getFromOffline(request);
        };

        return from(processFn());
    }

    private async getFromOffline(request: ApiRequest): Promise<ApiResponse> {
        const table = (this.offlineRepo as any).db.RowContact;
        console.log('[RowContactDataService] Fetching from Offline DB...');
        try {
            // const rawCount = await table.count(); // Unused

            const { page_number, page_size, sort_column, search_filters } = request;

            if (search_filters && search_filters.length > 0) {
                console.log('[RowContactDataService] Active Filters:', JSON.stringify(search_filters));
            }

            // --- Pagination ---

            let countCollection = table.toCollection();
            let pagedCollection = table.toCollection();

            // Apply Sort
            let safeSort = 'rowContactUniqueId'; // Default PK (always indexed)

            if (sort_column && sort_column.length > 0 && sort_column[0].column_name) {
                let { column_name, sortOrder } = sort_column[0];
                if (column_name.includes('_')) {
                    column_name = column_name.replace(/_([a-z])/g, (g: any) => g[1].toUpperCase());
                }

                // Specific check for known indices (from AppDb schema)
                const validIndices = ['rowContactUniqueId', 'contactPerson', 'organizationName', 'mobileNumber', 'emailId', 'syncStatus'];

                if (validIndices.includes(column_name)) {
                    safeSort = column_name;
                    countCollection = table.orderBy(safeSort);
                    pagedCollection = table.orderBy(safeSort);

                    if (sortOrder === 'desc') {
                        countCollection = countCollection.reverse();
                        pagedCollection = pagedCollection.reverse();
                    }
                } else {
                    console.warn(`[RowContactDataService] Sort column '${column_name}' is not indexed. Falling back to PK sort.`);
                    countCollection = table.orderBy('rowContactUniqueId');
                    pagedCollection = table.orderBy('rowContactUniqueId');
                }
            } else {
                countCollection = table.orderBy('rowContactUniqueId');
                pagedCollection = table.orderBy('rowContactUniqueId');
            }

            // Apply Filters
            if (search_filters && search_filters.length > 0) {
                const searchConfig = this.configService.config()?.config?.searchConfig;
                const fallbackGlobalFields = this.configService.config()?.config?.globalFilterFields || [];

                const filterFn = (record: any) => {
                    return search_filters.every((filter: any) => {
                        const filterValue = String(filter.parameter_value || '').toLowerCase().trim();
                        if (!filter.parameter_code || !filterValue) return true;

                        // 1. Handle Global Search (GS)
                        if (filter.parameter_code === 'GS') {
                            if (searchConfig?.enabled === false) return true;

                            // Helper to match a field with basic operator support
                            const matchField = (code: string, operator: string = 'CONTAINS'): boolean => {
                                // Support both direct key and camelCase mapped key
                                let val = '';
                                if (record[code] !== undefined && record[code] !== null) {
                                    val = String(record[code]);
                                } else {
                                    const camelCode = code.replace(/_([a-z])/g, (g: any) => g[1].toUpperCase());
                                    if (record[camelCode] !== undefined && record[camelCode] !== null) {
                                        val = String(record[camelCode]);
                                    }
                                }

                                val = val.toLowerCase();
                                switch (operator) {
                                    case 'STARTS_WITH': return val.startsWith(filterValue);
                                    case 'ENDS_WITH': return val.endsWith(filterValue);
                                    case 'EXACT': return val === filterValue;
                                    case 'CONTAINS':
                                    default: return val.includes(filterValue);
                                }
                            };

                            // Priority 1: fieldConfigs (detailed per-field config)
                            if (searchConfig?.fieldConfigs && searchConfig.fieldConfigs.length > 0) {
                                return searchConfig.fieldConfigs.some(cfg => matchField(cfg.code, cfg.operator));
                            }

                            // Priority 2: fields (simple array) OR globalFilterFields (legacy/default list)
                            const targetFields = (searchConfig?.fields && searchConfig.fields.length > 0)
                                ? searchConfig.fields
                                : fallbackGlobalFields;

                            if (targetFields.length > 0) {
                                return targetFields.some(f => matchField(f));
                            }

                            // Priority 3: Absolute Fallback - Search all keys in record
                            return Object.keys(record).some(k => {
                                // Avoid searching internal/meta keys starting with underscore or rowContext
                                if (k.startsWith('_') || k === 'syncStatus' || k === 'lastModified') return false;
                                return matchField(k);
                            });
                        }

                        // 2. Handle Regular Column/Field Filters
                        const filterValues = filterValue.split(',').map(v => v.trim());
                        let recordValue = '';
                        if (record[filter.parameter_code] !== undefined && record[filter.parameter_code] !== null) {
                            recordValue = String(record[filter.parameter_code]);
                        } else {
                            const camelCode = filter.parameter_code.replace(/_([a-z])/g, (g: any) => g[1].toUpperCase());
                            if (record[camelCode] !== undefined && record[camelCode] !== null) {
                                recordValue = String(record[camelCode]);
                            }
                        }

                        const lowerRecordValue = recordValue.toLowerCase();
                        return filterValues.some(fv => lowerRecordValue.includes(fv));
                    });
                };

                countCollection = countCollection.filter(filterFn);
                pagedCollection = pagedCollection.filter(filterFn);
            }

            const pageNum = Number(page_number) || 1;
            const pageSizeNum = Number(page_size) || 10;
            const startIndex = (pageNum - 1) * pageSizeNum;

            const totalRecordsPromise = countCollection.count();
            const pagedDataPromise = pagedCollection.offset(startIndex).limit(pageSizeNum).toArray();

            const [total, data] = await Promise.all([totalRecordsPromise, pagedDataPromise]);
            console.log(`[RowContactDataService] Offline Fetch: Total: ${total}, Data: ${data.length}`);

            return {
                data: data,
                total_records: total
            } as ApiResponse;

        } catch (error) {
            console.error('[RowContactDataService] Error in getFromOffline:', error);
            throw error;
        }
    }
}
