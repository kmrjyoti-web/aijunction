import { SyncOperation } from '../models/sync-status.enum';

export interface SyncHandler {
    sync(operation: SyncOperation, data: any): Promise<any>;
}
