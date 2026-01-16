export enum SyncStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    FAILED = 'FAILED',
    COMPLETED = 'COMPLETED'
}

export enum SyncOperation {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    SOFT_DELETE = 'SOFT_DELETE'
}
