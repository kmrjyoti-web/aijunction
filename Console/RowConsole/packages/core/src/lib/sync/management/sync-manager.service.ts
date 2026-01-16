import { Injectable, signal, effect, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { SyncLogRepository } from '../logging/sync-log.repository';
import { SyncStatus } from '../models/sync-status.enum';
import { SyncHandler } from '../models/sync-handler.interface';
import { SyncLogEntity } from '../logging/sync-log.entity';

@Injectable({
    providedIn: 'root'
})
export class SyncManagerService implements OnDestroy {
    private handlers = new Map<string, SyncHandler>();
    private isProcessing = false;

    // State Observables
    private syncStateSubject = new BehaviorSubject<SyncStatus>(SyncStatus.PENDING); // Default or Idle
    syncState$ = this.syncStateSubject.asObservable();

    // Connectivity State
    readonly isOnline = signal<boolean>(true);

    // Injections
    private logRepo = inject(SyncLogRepository);
    private platformId = inject(PLATFORM_ID);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.isOnline.set(navigator.onLine);
            window.addEventListener('online', () => this.handleConnectionChange(true));
            window.addEventListener('offline', () => this.handleConnectionChange(false));
        }

        // Auto-sync effect
        effect(() => {
            if (this.isOnline()) {
                this.processQueue();
            }
        });
    }

    getPendingCount(): Observable<number> {
        return from(this.logRepo.livePendingCount() as unknown as Promise<number>);
    }

    private handleConnectionChange(status: boolean) {
        this.isOnline.set(status);
        if (status) {
            console.log('[SyncManager] Online. Attempting sync...');
            this.processQueue();
        } else {
            console.log('[SyncManager] Offline. Sync paused.');
        }
    }

    registerHandler(entityType: string, handler: SyncHandler) {
        this.handlers.set(entityType, handler);
    }

    async processQueue() {
        if (this.isProcessing || !this.isOnline()) return;

        try {
            this.isProcessing = true;
            this.syncStateSubject.next(SyncStatus.IN_PROGRESS);

            const logs = await this.logRepo.getPendingLogs();

            if (logs.length === 0) {
                this.isProcessing = false;
                this.syncStateSubject.next(SyncStatus.COMPLETED); // Idle/Completed
                return;
            }

            console.log(`[SyncManager] Processing ${logs.length} pending operations...`);

            // Sequential processing to maintain order
            for (const log of logs) {
                await this.processLog(log);
            }

            // Check if more logs arrived while processing
            const moreLogs = await this.logRepo.getPendingLogs();
            if (moreLogs.length > 0) {
                await this.processQueue();
            } else {
                this.syncStateSubject.next(SyncStatus.COMPLETED);
            }

        } catch (error) {
            console.error('[SyncManager] Queue processing error', error);
            this.syncStateSubject.next(SyncStatus.FAILED);
        } finally {
            this.isProcessing = false;
        }
    }

    private async processLog(log: SyncLogEntity) {
        const handler = this.handlers.get(log.entityType);
        if (!handler) {
            console.warn(`[SyncManager] No handler registered for entity type: ${log.entityType}`);
            return;
        }

        try {
            await this.logRepo.updateStatus(log.id!, SyncStatus.IN_PROGRESS);

            // Execute the operation via the handler
            await handler.sync(log.operation as any, log.data);

            // If successful, mark absolute completion
            await this.logRepo.updateStatus(log.id!, SyncStatus.COMPLETED);
            console.log(`[SyncManager] Synced log #${log.id} (${log.entityType} - ${log.operation})`);

        } catch (error: any) {
            console.error(`[SyncManager] Failed to sync log #${log.id}`, error);
            await this.logRepo.updateStatus(log.id!, SyncStatus.FAILED, error.message || 'Unknown error');
        }
    }

    ngOnDestroy() {
        if (isPlatformBrowser(this.platformId)) {
            window.removeEventListener('online', () => { });
            window.removeEventListener('offline', () => { });
        }
    }
}
