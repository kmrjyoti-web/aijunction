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
    }

    getSystemTables(): TableMaster[] {
        return [
            {
                Table_Code: 'SYS_TM',
                Table_Name: 'TableMaster',
                Table_Schema: 'Table_Code, Table_Name, Sync_Frequency',
                Sync_Frequency: 'D',
                sync_frequency_value: 0,
                What_Operation_Allowed: ['R'],
                Recycle_Soft_Delete: false,
                schema_validate_server: 'DAILY',
                sync_warning_type: 'WARNING',
                Encryption: false,
                encryption_field: [],
                caching: false,
                caching_ttl: 0
            },
            {
                Table_Code: 'SYS_SL',
                Table_Name: 'SyncLog',
                Table_Schema: '++id, entityType, status, timestamp',
                Sync_Frequency: 'M',
                sync_frequency_value: 0,
                What_Operation_Allowed: ['R'],
                Recycle_Soft_Delete: false,
                schema_validate_server: 'DAILY',
                sync_warning_type: 'WARNING',
                Encryption: false,
                encryption_field: [],
                caching: false,
                caching_ttl: 0
            },
            {
                Table_Code: 'SYS_DB',
                Table_Name: 'DatabaseBackups',
                Table_Schema: '++id, name, type, createdAt',
                Sync_Frequency: 'M',
                sync_frequency_value: 0,
                What_Operation_Allowed: ['R'],
                Recycle_Soft_Delete: false,
                schema_validate_server: 'DAILY',
                sync_warning_type: 'WARNING',
                Encryption: false,
                encryption_field: [],
                caching: false,
                caching_ttl: 0
            }
        ];
    }

    loadAll() {
        this.ensureDefaults().then(() => {
            this.tableRepo.getAll().subscribe(data => this.tableStore.setTables(data));
            this.apiRepo.getAll().subscribe(data => this.apiStore.setEndpoints(data));
        });
    }

    private async ensureDefaults() {
        // Seed RowContact into TableMaster so it's manageable
        const contactTable = await this.tableRepo['db'].table('TableMaster').get('SYS_RC');
        if (!contactTable) {
            await this.tableRepo.addOrUpdate({
                Table_Code: 'SYS_RC',
                Table_Name: 'RowContact',
                Table_Schema: 'rowContactUniqueId, contactPerson, organizationName, mobileNumber, emailId, syncStatus',
                Sync_Frequency: 'M',
                sync_frequency_value: 1,
                What_Operation_Allowed: ['R', 'U', 'D', 'I'],
                Recycle_Soft_Delete: true,
                schema_validate_server: 'DAILY',
                sync_warning_type: 'WARNING',
                Encryption: true,
                encryption_field: ['mobileNumber', 'emailId'],
                caching: true,
                caching_ttl: 300,
                fields: [
                    { name: 'rowContactUniqueId', type: 'string', isEncrypted: false, isPrimary: true, isIndexed: true },
                    { name: 'contactPerson', type: 'string', isEncrypted: false, isIndexed: true },
                    { name: 'organizationName', type: 'string', isEncrypted: false, isIndexed: true },
                    { name: 'mobileNumber', type: 'string', isEncrypted: true, isIndexed: true },
                    { name: 'emailId', type: 'string', isEncrypted: true, isIndexed: true },
                    { name: 'syncStatus', type: 'string', isEncrypted: false, isIndexed: true }
                ]
            });
        }

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
