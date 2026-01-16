import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceStatus } from '../services/health-check.service';

@Component({
    selector: 'app-service-status-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-4 rounded-lg border shadow-sm transition-all duration-300"
         [class.bg-green-50]="status.status === 'ONLINE'"
         [class.border-green-200]="status.status === 'ONLINE'"
         [class.bg-red-50]="status.status === 'OFFLINE'"
         [class.border-red-200]="status.status === 'OFFLINE'"
         [class.bg-gray-50]="status.status === 'CHECKING'"
    >
      <div class="flex justify-between items-start">
        <div>
           <h3 class="font-bold text-gray-700">{{ status.name }}</h3>
           <div class="text-xs text-gray-500 break-all mt-1">{{ status.url }}</div>
        </div>
        <div class="status-indicator">
            <span *ngIf="status.status === 'ONLINE'" class="px-2 py-1 rounded bg-green-200 text-green-800 text-xs font-bold">ONLINE</span>
            <span *ngIf="status.status === 'OFFLINE'" class="px-2 py-1 rounded bg-red-200 text-red-800 text-xs font-bold">OFFLINE</span>
            <span *ngIf="status.status === 'CHECKING'" class="px-2 py-1 rounded bg-gray-200 text-gray-800 text-xs font-bold animate-pulse">CHECKING...</span>
        </div>
      </div>

      <div class="mt-4 flex justify-between items-end">
          <div class="text-sm">
             <span *ngIf="status.latency" class="font-mono text-gray-600">{{ status.latency }}ms</span>
          </div>
          <div *ngIf="status.error" class="text-xs text-red-500 max-w-[200px] truncate" title="{{status.error}}">
             {{ status.error }}
          </div>
      </div>
    </div>
  `
})
export class ServiceStatusCardComponent {
    @Input({ required: true }) status!: ServiceStatus;
}
