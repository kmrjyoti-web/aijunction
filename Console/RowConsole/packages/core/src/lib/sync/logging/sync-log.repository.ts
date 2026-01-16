import { liveQuery } from 'dexie';
import { Injectable } from '@angular/core';
import { AppDb } from '../../db/dexie/app-db';
import { SyncLogEntity } from './sync-log.entity';
import { SyncStatus } from '../models/sync-status.enum';

@Injectable({
    providedIn: 'root'
})
export class SyncLogRepository {
    constructor(private db: AppDb) { }

    async addLog(log: SyncLogEntity): Promise<number> {
        return this.db.SyncLog.add(log);
    }

    async getPendingLogs(): Promise<SyncLogEntity[]> {
        return this.db.SyncLog
            .where('status')
            .equals(SyncStatus.PENDING)
            .toArray();
    }

    async updateStatus(id: number, status: SyncStatus, errorMessage?: string): Promise<number> {
        return this.db.SyncLog.update(id, {
            status,
            errorMessage,
            retryCount: status === SyncStatus.FAILED ? undefined : 0 // Logic to handle retries can be more complex
        });
    }

    async clearCompleted(): Promise<number> {
        return this.db.SyncLog
            .where('status')
            .equals(SyncStatus.COMPLETED)
            .delete();
    }

    livePendingCount() {
        return liveQuery(() => this.db.SyncLog.where('status').equals(SyncStatus.PENDING).count());
    }
}
