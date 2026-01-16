import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbManagementFacade } from '../services/db-management.facade';
import { SyncDashboardComponent } from '../components/sync-dashboard/sync-dashboard.component';

@Component({
   selector: 'app-db-management-page',
   standalone: true,
   imports: [CommonModule, SyncDashboardComponent],
   template: `
    <div class="p-6">
       <h1 class="text-2xl font-bold">DB Management (Refactored)</h1>
       <div class="grid grid-cols-2 gap-4 mt-6">
          <div class="border p-4 bg-white rounded">
             <h2 class="font-bold mb-4">Tables</h2>
             <ul>
               <li *ngFor="let t of facade.tables()">{{ t.Table_Name }} ({{ t.Table_Schema }})</li>
             </ul>
             <!-- Placeholder for TableSchemaEditor -->
             <button (click)="addExample()" class="mt-4 bg-blue-500 text-white px-2 py-1 rounded">Add Example</button>
          </div>
          <div class="border p-4 bg-white rounded">
             <h2 class="font-bold mb-4">API Endpoints</h2>
             <ul>
                <li *ngFor="let a of facade.endpoints()">{{ a.API_CODE }} -> {{ a.Api_End_point }}</li>
             </ul>
          </div>
       </div>

       <!-- Sync Dashboard -->
       <app-sync-dashboard></app-sync-dashboard>
    </div>
  `
})
export class DbManagementPage implements OnInit {
   constructor(public facade: DbManagementFacade) { }

   ngOnInit() {
      this.facade.loadAll();
   }

   addExample() {
      this.facade.addTable({
         Table_Code: 'TBL_' + Date.now(),
         Table_Name: 'New Table',
         Table_Schema: '++id, name',
         Sync_Frequency: 'D',
         sync_frequency_value: 1,
         What_Operation_Allowed: ['R'],
         Recycle_Soft_Delete: false,
         schema_validate_server: 'DAILY',
         sync_warning_type: 'WARNING',
         Encryption: false,
         encryption_field: [],
         caching: false,
         caching_ttl: 0
      });
   }
}
