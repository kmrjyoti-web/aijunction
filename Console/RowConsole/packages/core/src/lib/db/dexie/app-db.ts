import Dexie, { Table } from 'dexie';
import { Injectable } from '@angular/core';
// For purist arch, we should redefine or move interfaces to shared/domain.
// But to save time and duplication, I'll assume usage of existing interfaces or quick re-definition.
// Let's redefine common interfaces in shared/models if needed, but imports are fine for types.

export interface FieldDefinition {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    length?: number;
    isEncrypted: boolean;
    isPrimary?: boolean;
    isIndexed?: boolean;
}

export interface TableMaster {
    Table_Name: string;
    Table_Code: string; // PK
    Table_Schema: string;
    Sync_Frequency: 'D' | 'M' | 'H';
    sync_frequency_value: number;
    What_Operation_Allowed: string[];
    Recycle_Soft_Delete: boolean;
    schema_validate_server: 'DAILY' | 'AFTER_APP_START' | 'AFTER_APP_END';
    sync_warning_type: 'BLOCK' | 'WARNING';
    Encryption: boolean;
    encryption_field: string[];
    caching: boolean;
    caching_ttl: number;
    fields?: FieldDefinition[];
}

export interface ApiConfiguration {
    API_CODE: string; // PK
    Api_End_point: string;
    method: string;
}

export interface BackupHistory {
    id?: number;
    name: string;
    type: 'MANUAL' | 'AUTO';
    blob: Blob;
    createdAt: Date;
}

export interface BackupProfile {
    id?: number;
    name: string;      // e.g. "Hourly Transactions"
    isEnabled: boolean;
    frequency: 'INTERVAL' | 'DAILY' | 'WEEKLY'; // Interval (e.g. every 10m) or Time (Every Day at 10 AM)
    intervalValue?: number; // Minutes
    timeOfDay?: string;     // "10:30"
    backupType: 'FULL' | 'DIFFERENTIAL'; // Full or "Since Last Success"
    tables: string[];       // Specific tables or ['*'] for all
    lastRunAt?: number;
    lastSuccessAt?: number; // Used as the "Start Time" for next Differential backup
}

@Injectable({
    providedIn: 'root'
})
export class AppDb extends Dexie {
    TableMaster!: Table<TableMaster, string>;
    ApiConfiguration!: Table<ApiConfiguration, string>;
    _recycleBin!: Table<any, number>;
    RowContact!: Table<any, string>; // Using any for now to avoid circular dependency with UI-Kit
    SyncLog!: Table<any, number>;    // Using any for now
    SyncMeta!: Table<any, string>;
    DatabaseBackups!: Table<BackupHistory, number>;
    BackupProfiles!: Table<BackupProfile, number>;

    constructor() {
        const dbName = 'AIJunctionDB_Refactored';
        super(dbName);
        console.log('[AppDb] Initialized with name:', dbName);
        // New DB name to avoid conflict or reuse? User might want reuse.
        // "AIJunctionDB" was used before. Let's stick to it if we want to keep data, or migrated.
        // I will use 'AIJunctionDB' to persist data.

        // Schema V5 (Added BackupProfiles)
        this.version(5).stores({
            TableMaster: 'Table_Code, Table_Name, Sync_Frequency',
            ApiConfiguration: 'API_CODE, Api_End_point',
            _recycleBin: '++id, originalTable, deletedAt',
            RowContact: 'rowContactUniqueId, contactPerson, organizationName, mobileNumber, emailId, syncStatus', // PK & Indexable fields

            SyncLog: '++id, entityType, status, timestamp', // PK & Indexable fields
            SyncMeta: 'id, updated_at',
            DatabaseBackups: '++id, name, type, createdAt',
            BackupProfiles: '++id, name, isEnabled'
        });
    }

    async ensureDynamicTables() {
        if (!this.isOpen()) {
            await this.open();
        }

        const masterTables = await this.table('TableMaster').toArray();
        // If TableMaster is empty, we still apply v101 to ensure consistency

        const newStores: { [key: string]: string } = {
            TableMaster: 'Table_Code, Table_Name, Sync_Frequency',
            ApiConfiguration: 'API_CODE, Api_End_point',
            _recycleBin: '++id, originalTable, deletedAt',
            RowContact: 'rowContactUniqueId, contactPerson, organizationName, mobileNumber, emailId, syncStatus',

            SyncLog: '++id, entityType, status, timestamp',
            SyncMeta: 'id, updated_at'
        };

        if (masterTables.length > 0) {
            masterTables.forEach((t: TableMaster) => {
                if (t.Table_Schema) {
                    newStores[t.Table_Name] = t.Table_Schema;
                }
            });
        }

        this.close();
        this.version(101).stores(newStores);
        await this.open();
    }
}
