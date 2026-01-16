import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncManagerService, SyncStatus } from '@ai-junction/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'lib-sync-indicator',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="pendingCount$ | async as count" class="flex items-center space-x-2 text-xs" 
         [ngClass]="{'text-green-600': (isSyncing$ | async) === false, 'text-blue-600': (isSyncing$ | async) === true}">
      <span *ngIf="(isSyncing$ | async)" class="animate-spin">⟳</span>
      <span *ngIf="!(isSyncing$ | async)">✓</span>
      <span>{{ count > 0 ? count + ' Pending' : 'Synced' }}</span>
    </div>
  `
})
export class SyncIndicatorComponent {
    private syncManager = inject(SyncManagerService);

    // Expose observables for template
    pendingCount$ = this.syncManager.getPendingCount();
    isSyncing$ = this.syncManager.syncState$.pipe(map(state => state === SyncStatus.IN_PROGRESS));
}
