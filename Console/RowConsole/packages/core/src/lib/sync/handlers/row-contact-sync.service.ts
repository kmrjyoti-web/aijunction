import { Injectable, inject } from '@angular/core';
import { SyncHandler } from '../models/sync-handler.interface';
import { SyncManagerService } from '../management/sync-manager.service';
import { SyncOperation } from '../models/sync-status.enum';
import { lastValueFrom, Subject } from 'rxjs';
import { HttpModuleService } from '../../online/http-module.service';

import { RowContactOfflineRepository } from '../../offline/row-contact/data-access/row-contact-offline.repository';
import { RowContactDto } from '../../offline/row-contact/models/row-contact.dto';
import { RowContactMapper } from '../../offline/row-contact/models/row-contact.mapper';
import { AppDb } from '../../db/dexie/app-db';
import { calculateNextSyncStep, SyncMetaData } from '../utils/sync-calculation.util';

@Injectable({
    providedIn: 'root'
})
export class RowContactSyncHandler implements SyncHandler {
    private readonly ENTITY_TYPE = 'ROW_CONTACT';
    private http = inject(HttpModuleService);
    private offlineRepo = inject(RowContactOfflineRepository);
    private db = inject(AppDb);

    // Config
    private readonly MODULE_KEY = 'CONTACT'; // Maps to environment.api.CONTACT
    private readonly API_PATH = '/v1/Master/RowContact'; // Corrected path based on user snippet

    constructor(
        private syncManager: SyncManagerService
    ) {
        // Register itself
        this.syncManager.registerHandler(this.ENTITY_TYPE, this);
    }

    public firstPageSynced$ = new Subject<void>();

    async syncDown(): Promise<void> {
        console.log('[RowContactSyncHandler] Starting Smart Sync...');

        try {
            let syncing = true;

            while (syncing) {
                // 1. Get Metadata
                let meta = await this.db.SyncMeta.get(this.ENTITY_TYPE) as SyncMetaData | undefined;

                // HEURISTIC FIX: if total_records is suspiciously low (e.g. from a bad sync), reset it.
                if (meta && meta.total_records > 0 && meta.total_records < 50) {
                    console.log('[RowContactSyncHandler] Detected stale/low metadata. Resetting sync status...');
                    await this.db.SyncMeta.delete(this.ENTITY_TYPE);
                    meta = undefined;
                }

                // 2. Calculate Next Step (Server Total is unknown initially, passed as -1)
                const serverTotal = meta?.total_records ?? -1;
                const decision = calculateNextSyncStep(meta, serverTotal);

                if (!decision.shouldSync) {
                    console.log(`[RowContactSyncHandler] Sync Complete. Local: ${meta?.current_data_total}, Server: ${meta?.total_records}`);
                    syncing = false;
                    break;
                }

                console.log(`[RowContactSyncHandler] Fetching Page ${decision.nextPageNumber} (Size: ${decision.nextPageSize})...`);
                // Use a larger page size for bulk sync if possible, but respect decision
                const fetchSize = decision.nextPageSize;

                // 3. Fetch Data
                const response: any = await lastValueFrom(
                    this.http.getAll(this.MODULE_KEY, {
                        page_number: decision.nextPageNumber,
                        page_size: fetchSize
                        // sort_column: '', 
                    }, `${this.API_PATH}/GetAll`)
                );

                if (response) {
                    // console.log('[RowContactSyncHandler] Raw API Response Keys:', Object.keys(response));
                    // console.log('[RowContactSyncHandler] Raw API Response:', response);
                }

                let dtos: RowContactDto[] = [];
                let latestServerTotal = -1;

                if (response) {
                    if (Array.isArray(response)) {
                        dtos = response;
                    } else if (response.data && Array.isArray(response.data)) {
                        dtos = response.data;
                        latestServerTotal = response.pagination_info?.total_records ?? -1;
                    }
                }

                if (dtos.length > 0) {
                    try {
                        const entities = dtos.map((dto, index) => {
                            try {
                                return RowContactMapper.toEntity(dto);
                            } catch (mapErr) {
                                console.error(`[RowContactSyncHandler] Mapping error at index ${index}`, dto, mapErr);
                                throw mapErr;
                            }
                        });
                        // console.log(`[RowContactSyncHandler] Mapped ${entities.length} entities.`);

                        // 4. Save Data
                        console.log(`[RowContactSyncHandler] Saving ${entities.length} items to Offline Repo...`);
                        const validDtos = dtos.map(dto => RowContactMapper.toEntity(dto));
                        const uniqueIds = new Set(validDtos.map(d => d.rowContactUniqueId));
                        console.log(`[RowContactSyncHandler] Batch analysis - Received: ${dtos.length}, Unique IDs: ${uniqueIds.size}`);

                        await this.offlineRepo.bulkUpsert(validDtos);
                        // console.log(`[RowContactSyncHandler] Saved successfully.`);

                        // Notify UI that first page is ready
                        if (decision.nextPageNumber === 1) {
                            this.firstPageSynced$.next();
                        }

                        // 5. Update Metadata
                        // Count local data
                        const currentCount = await this.offlineRepo.count();

                        // If we didn't get a total from the server (direct array response), infer it
                        if (latestServerTotal === -1) {
                            // If we received fewer items than requested, we are done.
                            if (dtos.length < decision.nextPageSize) {
                                latestServerTotal = currentCount; // We are done
                            } else {
                                // We are NOT done. Keep total as -1 so calculateNextSyncStep continues.
                                latestServerTotal = -1;
                            }
                        } else {
                            // Use the explicit server total if we have it (and didn't default to -1)
                            latestServerTotal = response.pagination_info?.total_records ?? latestServerTotal;
                        }

                        const newMeta: SyncMetaData = {
                            id: this.ENTITY_TYPE,
                            total_records: latestServerTotal,
                            current_data_total: currentCount,
                            page_size: decision.nextPageSize,
                            page_number: decision.nextPageNumber,
                            updated_at: Date.now()
                        };

                        await this.db.SyncMeta.put(newMeta);
                        console.log(`[RowContactSyncHandler] Synced Batch. New Local: ${currentCount} / Server Total: ${latestServerTotal}`);

                        // 6. Loop Condition
                        // If latestServerTotal is -1, it means we anticipate more pages.
                        if (latestServerTotal !== -1 && currentCount >= latestServerTotal) {
                            syncing = false;
                        }
                        // Also stop if we got 0 items (handled by `if (dtos.length > 0) else` block) OR partial page
                        if (dtos.length < decision.nextPageSize) {
                            syncing = false;
                        }

                    } catch (innerError) {
                        console.error('[RowContactSyncHandler] Error processing chunk:', innerError);
                        syncing = false; // Stop sync on error to prevent infinite retries
                        throw innerError;
                    }

                    // Throttle slightly to respect UI responsiveness
                    // await new Promise(resolve => setTimeout(resolve, 100));
                } else {
                    // Empty data received
                    console.log('[RowContactSyncHandler] Received empty data set. Sync finished.');
                    syncing = false;

                    // Update meta to indicate completion (total = current)
                    if (meta) {
                        const currentCount = await this.offlineRepo.count();
                        const finalMeta: SyncMetaData = {
                            ...meta,
                            total_records: currentCount,
                            current_data_total: currentCount,
                            updated_at: Date.now()
                        };
                        await this.db.SyncMeta.put(finalMeta);
                    }
                }
            }
        } catch (error) {
            console.error('[RowContactSyncHandler] Smart Sync failed', error);
            throw error;
        }
    }

    async sync(operation: SyncOperation, data: any): Promise<any> {
        switch (operation) {
            case SyncOperation.CREATE:
                return lastValueFrom(this.http.create(this.MODULE_KEY, data, this.API_PATH));

            case SyncOperation.UPDATE:
                // Check if API expects ID in URL or Body. Standard is Body for PUT usually, or ID in URL.
                // Based on previous code: put(`${URL}/${id}`, data)
                // HttpModuleService.update uses PATCH and body only. 
                // Let's use updatePost or update if API accepts it.
                // Assuming standard Rest: PUT /resource/id or PATCH /resource/id. 
                // The user service generic 'update' uses PATCH. 
                // Let's stick to user service pattern: `update(key, data, url)` -> PATCH url with body.
                // So we construct the URL with ID here.
                return lastValueFrom(this.http.update(this.MODULE_KEY, data, `${this.API_PATH}/${data.rowContactUniqueId}`));

            case SyncOperation.DELETE:
                // HttpModuleService delete uses DELETE method with body.
                // If API expects ID in URL:
                return lastValueFrom(this.http.delete(this.MODULE_KEY, data, `${this.API_PATH}/${data.rowContactUniqueId}`));

            case 'SOFT_DELETE' as any: // Cast if enum doesn't have it yet, or add to Enum
                return lastValueFrom(this.http.updatePost(this.MODULE_KEY, { ...data, isDeleted: true }, `${this.API_PATH}/${data.rowContactUniqueId}`));

            default:
                throw new Error(`Unsupported sync operation: ${operation}`);
        }
    }
}
