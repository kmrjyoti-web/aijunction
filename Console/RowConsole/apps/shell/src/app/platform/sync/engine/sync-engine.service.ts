import { Injectable } from '@angular/core';
import { TableMasterRepo, ApiEndpointRepo } from '@ai-junction/core';

@Injectable({
    providedIn: 'root'
})
export class SyncEngineService {
    constructor(
        private tableRepo: TableMasterRepo,
        private apiRepo: ApiEndpointRepo
    ) { }

    start() {
        console.log('Sync Engine Started');
        // Implementation of Sync Runner loop goes here
    }
}
