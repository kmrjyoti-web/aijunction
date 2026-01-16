import { Injectable } from '@angular/core';
import { TableMasterStore } from '../stores/table-master.store';
import { ApiEndpointsStore } from '../stores/api-endpoints.store';
import { TableMasterRepo, ApiEndpointRepo, TableMaster, ApiConfiguration, SyncLogRepository, SyncManagerService, SyncLogEntity } from '../../../../../../../packages/core/src/index';

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
        private apiStore: ApiEndpointsStore,
        private syncLogRepo: SyncLogRepository,
        private syncManager: SyncManagerService
    ) {
        this.tables = this.tableStore.tables;
        this.endpoints = this.apiStore.endpoints;
        // Signal for logs? Or just a simple fetch for now since we don't have a store for it yet.
        // Let's rely on liveQuery or manual fetch. For simplicity, manual fetch in this iteration.
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

    // Sync Management
    getPendingLogs(): Promise<SyncLogEntity[]> {
        return this.syncLogRepo.getPendingLogs();
    }

    // Helper to get all logs if repo supports it (repo currently only has getPending, let's add getAll to repo later if needed)
    // For now, let's add a method to get specific status or all if we modify repo.
    // Assuming we want to show ALL logs for the dashboard.
    async getAllLogs(): Promise<SyncLogEntity[]> {
        return this.syncLogRepo['db'].SyncLog.reverse().toArray(); // Accessing DB directly for now to save time on Repo update
    }

    async retrySync() {
        await this.syncManager.processQueue();
    }

    async clearCompletedLogs() {
        await this.syncLogRepo.clearCompleted();
    }
}
