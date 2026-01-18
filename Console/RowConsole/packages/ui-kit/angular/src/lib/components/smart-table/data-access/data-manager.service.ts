import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { ApiRequest, ApiResponse, SyncManagerService } from '@ai-junction/core';
import { ConfigService } from './config.service';
import { OnlineDataService } from './online-data.service';
import { OfflineDataService } from './offline/offline-data.service';
import { ConnectionStatusService } from './connection-status.service';
import { TableConfig } from '../models/table-config.model';
// Core imports
import { Inject, InjectionToken, Optional, Injector } from '@angular/core';
import { IDataProvider, DATA_PROVIDER_TOKEN } from '../models/data-provider.interface';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {
  private configService = inject(ConfigService);

  private connectionStatusService = inject(ConnectionStatusService);
  private syncManager = inject(SyncManagerService);
  private injector = inject(Injector);

  private get onlineDataService() { return this.injector.get(OnlineDataService); }
  private get offlineDataService() { return this.injector.get(OfflineDataService); }

  constructor(
    @Optional() @Inject(DATA_PROVIDER_TOKEN) private customDataProvider: IDataProvider
  ) {
    console.log('[DataManagerService] Initialized');
    console.log('[DataManagerService] Custom Provider Present:', !!this.customDataProvider);
  }

  /**
   * Gets data based on the configured data strategy.
   * This is the single entry point for the UI to request data.
   * @param request The API request object.
   * @returns An Observable of the ApiResponse.
   */
  getData(request: ApiRequest): Observable<ApiResponse> {
    const config: TableConfig = this.configService.config();
    const strategy = config.config.dataStrategy;

    // Delegate to custom provider if available (e.g. RowContactDataService)
    if (this.customDataProvider) {
      return this.customDataProvider.getData(request);
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
