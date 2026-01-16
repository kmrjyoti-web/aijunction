import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthCheckService } from '../services/health-check.service';
import { ServiceStatusCardComponent } from '../components/service-status-card.component';

@Component({
    selector: 'app-health-check-page',
    standalone: true,
    imports: [CommonModule, ServiceStatusCardComponent],
    template: `
    <div class="p-6">
       <div class="flex justify-between items-center mb-6">
           <h1 class="text-2xl font-bold">System Health Check</h1>
           <button (click)="refresh()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2">
              <span class="material-icons-outlined text-sm">refresh</span> Refresh Status
           </button>
       </div>

       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-service-status-card *ngFor="let s of healthService.services()" [status]="s"></app-service-status-card>
       </div>
    </div>
  `
})
export class HealthCheckPage implements OnInit {
    healthService = inject(HealthCheckService);

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.healthService.checkAll();
    }
}
