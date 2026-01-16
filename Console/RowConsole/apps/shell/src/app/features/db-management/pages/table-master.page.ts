import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbManagementFacade } from '../services/db-management.facade';

@Component({
    selector: 'app-table-master-page',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6">
       <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">DB Management (Table Master)</h1>
            <button (click)="addExample()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Add Example Table</button>
       </div>
       
       <div class="border p-6 bg-white rounded shadow-sm">
            <h2 class="font-bold mb-4 text-lg">Configured Tables</h2>
            <div *ngIf="facade.tables().length === 0" class="text-gray-500 italic">No tables configured.</div>
            <ul class="space-y-2">
               <li *ngFor="let t of facade.tables()" class="p-3 border rounded hover:bg-gray-50 flex justify-between items-center">
                    <div>
                        <span class="font-semibold">{{ t.Table_Name }}</span> 
                        <span class="text-sm text-gray-500 ml-2">({{ t.Table_Schema }})</span>
                    </div>
                    <div class="space-x-2">
                        <span class="text-xs px-2 py-1 bg-gray-200 rounded">{{ t.Sync_Frequency }}</span>
                        <!-- Add Edit/Delete buttons here later -->
                    </div>
               </li>
            </ul>
       </div>
    </div>
  `
})
export class TableMasterPage implements OnInit {
    constructor(public facade: DbManagementFacade) { }

    ngOnInit() {
        this.facade.loadAll();
    }

    addExample() {
        this.facade.addTable({
            Table_Code: 'TBL_' + Date.now(),
            Table_Name: 'Example Table ' + Math.floor(Math.random() * 100),
            Table_Schema: '++id, name, created_at',
            Sync_Frequency: 'D',
            sync_frequency_value: 1,
            What_Operation_Allowed: ['R', 'C'],
            Recycle_Soft_Delete: true,
            schema_validate_server: 'DAILY',
            sync_warning_type: 'WARNING',
            Encryption: false,
            encryption_field: [],
            caching: true,
            caching_ttl: 3600
        });
    }
}
