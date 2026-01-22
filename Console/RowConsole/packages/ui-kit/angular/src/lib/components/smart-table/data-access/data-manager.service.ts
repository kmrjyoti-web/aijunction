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
        console.log('[DataManager] Using HYBRID strategy (Local Search + Background Refresh).');
        this.connectionStatusService.setConnecting();

        // 1. Trigger background refresh from Online
        this.onlineDataService.getData(request).subscribe({
          next: (response) => {
            console.log('[DataManager] HYBRID: Online data fetched. Updating Local DB.');
            this.connectionStatusService.setOnline();
            this.offlineDataService.bulkUpsert(response.data).subscribe();
          },
          error: (err) => {
            console.warn('[DataManager] HYBRID: Background fetch failed.', err);
            this.connectionStatusService.setOffline();
          }
        });

        // 2. Return Local Data immediately
        return this.offlineDataService.getData(request);

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
