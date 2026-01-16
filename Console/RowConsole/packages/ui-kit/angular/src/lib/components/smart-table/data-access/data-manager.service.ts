import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { ApiRequest, ApiResponse } from '@ai-junction/core';
import { ConfigService } from './config.service';
import { OnlineDataService } from './online-data.service';
import { OfflineDataService } from './offline/offline-data.service';
import { ConnectionStatusService } from './connection-status.service';
// Core imports
import { RowContactDataService, RowContactSyncHandler, SyncManagerService } from '@ai-junction/core';
import { TableConfig } from '../models/table-config.model';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {
  private configService = inject(ConfigService);
  private onlineDataService = inject(OnlineDataService);
  private offlineDataService = inject(OfflineDataService);
  private connectionStatusService = inject(ConnectionStatusService);

  // Specific Data Services
  private rowContactDataService = inject(RowContactDataService);

  // Ensure Sync Handler is initialized (eagerly loading it)
  private rowContactSyncHandler = inject(RowContactSyncHandler);
  private syncManager = inject(SyncManagerService);

  /**
   * Gets data based on the configured data strategy.
   * This is the single entry point for the UI to request data.
   * @param request The API request object.
   * @returns An Observable of the ApiResponse.
   */
  getData(request: ApiRequest): Observable<ApiResponse> {
    const config: TableConfig = this.configService.config();
    const strategy = config.config.dataStrategy;

    // Delegate to specific services based on feature/key
    // Assuming 'RowContact' as the key or feature identifier
    if (config.key === 'RowContact' || config.feature === 'RowContact') {
      // For RowContact, we currently force Offline First / Sync logic via the service
      // regardless of global strategy, OR we can respect the strategy if RowContactDataService supports it.
      // RowContactDataService as implemented is Offline-Backed.
      return this.rowContactDataService.getData(request);
    }

    switch (strategy) {
      case 'ONLINE_FIRST':
        console.log('[DataManager] Using ONLINE_FIRST strategy.');
        this.connectionStatusService.setConnecting();
        return this.onlineDataService.getData(request).pipe(
          tap(() => this.connectionStatusService.setOnline()),
          catchError(err => {
            console.warn('[DataManager] ONLINE_FIRST failed, falling back to offline.', err);
            this.connectionStatusService.setOffline();
            return this.offlineDataService.getData(request);
          })
        );

      case 'OFFLINE_FIRST':
        console.log('[DataManager] Using OFFLINE_FIRST strategy.');
        return this.offlineDataService.getData(request);

      case 'HYBRID':
        console.log('[DataManager] Using HYBRID strategy.');
        this.connectionStatusService.setConnecting();
        return this.onlineDataService.getData(request).pipe(
          tap(response => {
            console.log('[DataManager] HYBRID: Fetched online, updating local DB in background.');
            this.connectionStatusService.setOnline();
            // Fire-and-forget update to local DB
            this.offlineDataService.bulkUpsert(response.data).subscribe({
              next: () => console.log('[DataManager] HYBRID: Local DB updated successfully.'),
              error: (dbErr) => console.error('[DataManager] HYBRID: Error updating local DB.', dbErr)
            });
          }),
          catchError(err => {
            console.warn('[DataManager] HYBRID: Online fetch failed, falling back to offline.', err);
            this.connectionStatusService.setOffline();
            return this.offlineDataService.getData(request);
          })
        );

      case 'SYNC':
        console.log('[DataManager] Using SYNC strategy (reading from local DB).');
        // In SYNC mode, all reads are from the local database for speed.
        // The SyncService handles background synchronization.
        return this.offlineDataService.getData(request);

      default:
        console.warn(`[DataManager] Unknown data strategy: ${strategy}. Defaulting to ONLINE_FIRST.`);
        this.connectionStatusService.setConnecting();
        return this.onlineDataService.getData(request).pipe(
          tap(() => this.connectionStatusService.setOnline()),
          catchError(err => {
            this.connectionStatusService.setOffline();
            return this.offlineDataService.getData(request);
          })
        );
    }
  }
}
