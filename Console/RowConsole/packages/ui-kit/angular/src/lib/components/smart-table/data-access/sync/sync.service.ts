import { Injectable, inject, signal } from '@angular/core';
import { OnlineDataService } from '../online-data.service';
import { OfflineDataService } from '../offline/offline-data.service';
import { ApiRequest } from '@ai-junction/core';
import { SyncLogService } from './sync-log.service';
import { finalize } from 'rxjs';
import { ConnectionStatusService } from '../connection-status.service';
import { PersistenceService } from '../persistence.service';

/**
 * Orchestrates the background data synchronization process.
 */
@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private onlineDataService = inject(OnlineDataService);
  private offlineDataService = inject(OfflineDataService);
  private syncLogService = inject(SyncLogService);
  private connectionStatusService = inject(ConnectionStatusService);
  private persistenceService = inject(PersistenceService);
  private readonly LAST_SYNC_KEY = 'smartTableLastSync';

  /** A signal that becomes true once the initial data priming is complete. */
  isPrimed = signal(false);
  lastSyncTime = signal<number | null>(this.persistenceService.loadState<number>(this.LAST_SYNC_KEY));
  isSyncing = signal(false);

  constructor() {
    // If a sync has been completed in a previous session, mark the data as primed.
    if (this.lastSyncTime()) {
      this.isPrimed.set(true);
      console.log('[SyncService] Local data is primed from a previous session.');
    }
  }

  /**
   * Initializes the synchronization process.
   * This should be called when the application starts or when a manual sync is requested.
   * It checks if data needs to be primed from the server and starts
   * the background sync loops.
   */
  startFullSync(): void {
    console.log('[SyncService] Starting full sync...');
    this.primeDataFromServer();

    // In a full implementation, you would start periodic sync processes here:
    // setInterval(() => this.pushLocalChanges(), 30000); // Push changes every 30s
    // setInterval(() => this.pullRemoteChanges(), 60000); // Pull changes every 60s
  }

  /**
   * Fetches all data from the remote server and stores it locally.
   * This is typically done on the first launch or after a data reset.
   * In a real app, this would fetch data in chunks and handle pagination.
   */
  private primeDataFromServer(): void {
    if (this.isSyncing()) {
      console.log('[SyncService] Sync already in progress.');
      return;
    }

    console.log('[SyncService] Starting to prime data from server...');
    this.isSyncing.set(true);
    this.isPrimed.set(false); // Reset primed status before starting
    this.connectionStatusService.setConnecting();

    // A mock request to get ALL data. A real API might have a dedicated endpoint for this.
    const request: ApiRequest = {
      page_number: 1,
      page_size: 5000, // Fetch a large number of records for priming to ensure all mock data is retrieved.
      search_filters: [],
      sort_column: [],
    };

    this.onlineDataService.getData(request).pipe(
      finalize(() => {
        this.isSyncing.set(false);
        console.log('[SyncService] Data priming finished.');
      })
    ).subscribe({
      next: response => {
        console.log(`[SyncService] Fetched ${response.data.length} records from server.`);
        this.offlineDataService.bulkUpsert(response.data).subscribe(() => {
          console.log('[SyncService] Successfully saved records to local DB.');
          const now = Date.now();
          this.lastSyncTime.set(now);
          this.persistenceService.saveState(this.LAST_SYNC_KEY, now);
          this.isPrimed.set(true);
        });
        this.connectionStatusService.setOnline();
      },
      error: err => {
        console.error('[SyncService] Error priming data from server:', err);
        this.connectionStatusService.setOffline();
      }
    });
  }

  /**
   * Pushes locally logged changes to the server. (Uplink)
   */
  private pushLocalChanges(): void {
    console.log('[SyncService] Pushing local changes to server...');
    // 1. Get pending changes from SyncLogService.
    // 2. Send them to a batch update API endpoint.
    // 3. On success, clear the logs from the SyncLogService.
  }

  /**
   * Pulls the latest changes from the server. (Downlink)
   */
  private pullRemoteChanges(): void {
    console.log('[SyncService] Pulling remote changes from server...');
    // 1. Make an API call to get records updated since the last sync timestamp.
    // 2. Use OfflineDataService.bulkUpsert() to update the local database.
    // 3. Update the last sync timestamp.
  }
}