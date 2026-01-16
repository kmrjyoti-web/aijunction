import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbManagementFacade } from '../../services/db-management.facade';
import { SyncLogEntity } from '../../../../../../../../packages/core/src/index';

@Component({
  selector: 'app-sync-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border p-4 bg-white rounded mt-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-bold">Sync Activity Log</h2>
        <div class="gap-2 flex">
          <button (click)="refresh()" class="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300">Refresh</button>
          <button (click)="retry()" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Retry Pending</button>
          <button (click)="clear()" class="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200">Clear Completed</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-50 text-gray-700 uppercase">
            <tr>
              <th class="px-4 py-2">ID</th>
              <th class="px-4 py-2">Entity</th>
              <th class="px-4 py-2">Operation</th>
              <th class="px-4 py-2">Time</th>
              <th class="px-4 py-2">Status</th>
              <th class="px-4 py-2">Info</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs()" class="border-b hover:bg-gray-50">
              <td class="px-4 py-2 text-gray-500">#{{ log.id }}</td>
              <td class="px-4 py-2 font-medium">{{ log.entityType }}</td>
              <td class="px-4 py-2">
                <span class="px-2 py-0.5 rounded text-xs border"
                  [ngClass]="{
                    'bg-green-50 text-green-700 border-green-200': log.operation === 'CREATE',
                    'bg-blue-50 text-blue-700 border-blue-200': log.operation === 'UPDATE',
                    'bg-red-50 text-red-700 border-red-200': log.operation === 'DELETE'
                  }">
                  {{ log.operation }}
                </span>
              </td>
              <td class="px-4 py-2 text-gray-500">{{ log.timestamp | date:'mediumTime' }}</td>
              <td class="px-4 py-2">
                 <span class="px-2 py-1 rounded-full text-xs font-bold"
                  [ngClass]="{
                    'bg-yellow-100 text-yellow-800': log.status === 'PENDING',
                    'bg-blue-100 text-blue-800': log.status === 'IN_PROGRESS',
                    'bg-green-100 text-green-800': log.status === 'COMPLETED',
                    'bg-red-100 text-red-800': log.status === 'FAILED'
                  }">
                  {{ log.status }}
                 </span>
              </td>
              <td class="px-4 py-2 text-xs text-gray-400 max-w-xs truncate">
                {{ log.errorMessage || '-' }}
              </td>
            </tr>
            <tr *ngIf="logs().length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-gray-500">No sync logs found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SyncDashboardComponent implements OnInit {
  facade = inject(DbManagementFacade);
  logs = signal<SyncLogEntity[]>([]);

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.facade.getAllLogs().then(data => this.logs.set(data));
  }

  retry() {
    this.facade.retrySync().then(() => {
      // give it a moment to process before refreshing
      setTimeout(() => this.refresh(), 1000);
    });
  }

  clear() {
    this.facade.clearCompletedLogs().then(() => this.refresh());
  }
}
