export interface SyncLogEntity {
    id?: number; // Auto-increment PK
    entityType: string; // e.g., 'ROW_CONTACT'
    entityId: string;   // e.g., rowContactUniqueId
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE';
    data: any;          // The record data at the time of operation
    timestamp: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'FAILED' | 'COMPLETED';
    retryCount: number;
    errorMessage?: string;
}
