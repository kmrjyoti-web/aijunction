import { Injectable, inject } from '@angular/core';
import { SyncHandler } from '../models/sync-handler.interface';
import { SyncManagerService } from '../management/sync-manager.service';
import { SyncOperation } from '../models/sync-status.enum';
import { lastValueFrom } from 'rxjs';
import { HttpModuleService } from '../../online/http-module.service';

@Injectable({
    providedIn: 'root'
})
export class RowContactSyncHandler implements SyncHandler {
    private readonly ENTITY_TYPE = 'ROW_CONTACT';
    private http = inject(HttpModuleService);

    // Config
    private readonly MODULE_KEY = 'CONTACT'; // Maps to environment.api.CONTACT
    private readonly API_PATH = '/RowContact'; // Relative path

    constructor(
        private syncManager: SyncManagerService
    ) {
        // Register itself
        this.syncManager.registerHandler(this.ENTITY_TYPE, this);
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
