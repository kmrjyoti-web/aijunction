import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SyncLoggerService {
    log(message: string, context: any = {}) {
        console.log(`[SYNC LOG] ${message}`, context);
        // Persist to sync-log.repo if needed
    }

    error(message: string, error: any) {
        console.error(`[SYNC ERROR] ${message}`, error);
    }
}
