import { Injectable } from '@angular/core';
import { TableMasterStore } from '../stores/table-master.store';
import { ApiEndpointsStore } from '../stores/api-endpoints.store';
import { TableMasterRepo, ApiEndpointRepo, TableMaster, ApiConfiguration } from '@ai-junction/core';

@Injectable({
    providedIn: 'root'
})
export class DbManagementFacade {
    tables;
    endpoints;

    constructor(
        private tableRepo: TableMasterRepo,
        private tableStore: TableMasterStore,
        private apiRepo: ApiEndpointRepo,
        private apiStore: ApiEndpointsStore
    ) {
        this.tables = this.tableStore.tables;
        this.endpoints = this.apiStore.endpoints;
    }

    loadAll() {
        this.ensureDefaults().then(() => {
            this.tableRepo.getAll().subscribe(data => this.tableStore.setTables(data));
            this.apiRepo.getAll().subscribe(data => this.apiStore.setEndpoints(data));
        });
    }

    private async ensureDefaults() {
        const existing = await this.apiRepo.db.table('ApiConfiguration').get('SMART_TABLE');
        if (!existing) {
            await this.apiRepo.put({
                API_CODE: 'SMART_TABLE',
                Api_End_point: 'https://localhost:7232',
                method: 'GET'
            });
        }
    }

    async addTable(config: TableMaster) {
        await this.tableRepo.addOrUpdate(config);
        this.loadAll();
    }

    async deleteTable(code: string) {
        await this.tableRepo.delete(code);
        this.loadAll();
    }

    async saveApiConfig(config: ApiConfiguration) {
        await this.apiRepo.put(config);
        this.loadAll();
    }
}
