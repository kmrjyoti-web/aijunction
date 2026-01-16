import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncDashboardComponent } from '../components/sync-dashboard/sync-dashboard.component';

@Component({
    selector: 'app-sync-log-page',
    standalone: true,
    imports: [CommonModule, SyncDashboardComponent],
    template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Synchronization Logs</h1>
      <p class="text-sm text-gray-500 mb-6">Monitor and manage offline data synchronization.</p>
      <app-sync-dashboard></app-sync-dashboard>
    </div>
  `
})
export class SyncLogPage { }
