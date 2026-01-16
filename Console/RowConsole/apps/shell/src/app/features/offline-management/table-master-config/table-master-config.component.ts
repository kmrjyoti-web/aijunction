import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalDbService } from '@ai-junction/platform-angular';
import { TableMaster } from '@ai-junction/platform-core';

@Component({
    selector: 'app-table-master-config',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div>
      <!-- List View -->
      <table class="w-full text-sm text-left text-gray-500 mb-4">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th class="px-3 py-2">Code</th>
            <th class="px-3 py-2">Name</th>
            <th class="px-3 py-2">Sync</th>
            <th class="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let table of tables()" class="bg-white border-b">
            <td class="px-3 py-2">{{ table.Table_Code }}</td>
            <td class="px-3 py-2">{{ table.Table_Name }}</td>
            <td class="px-3 py-2">{{ table.Sync_Frequency }} ({{ table.sync_frequency_value }})</td>
            <td class="px-3 py-2">
              <button (click)="edit(table)" class="text-blue-600 hover:underline mr-2">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Simple Form (Toggleable) -->
      <button (click)="isEditing.set(!isEditing())" class="bg-blue-500 text-white px-4 py-2 rounded">
        {{ isEditing() ? 'Cancel' : 'Add New Table' }}
      </button>

      <div *ngIf="isEditing()" class="mt-4 p-4 border rounded bg-gray-50">
        <div class="grid gap-4 mb-4">
            <div>
                <label>Table Code</label>
                <input [(ngModel)]="currentTable.Table_Code" class="border p-1 w-full" placeholder="TBL_001">
            </div>
            <div>
                <label>Table Name</label>
                <input [(ngModel)]="currentTable.Table_Name" class="border p-1 w-full" placeholder="Products">
            </div>
            <div>
                <label>Schema (Dexie format)</label>
                <input [(ngModel)]="currentTable.Table_Schema" class="border p-1 w-full" placeholder="++id, name, code">
            </div>
            <div class="flex gap-4">
               <div>
                  <label>Sync Freq</label>
                  <select [(ngModel)]="currentTable.Sync_Frequency" class="border p-1">
                     <option value="D">Daily</option>
                     <option value="H">Hourly</option>
                     <option value="M">Minute</option>
                  </select>
               </div>
               <div>
                  <label>Value</label>
                  <input type="number" [(ngModel)]="currentTable.sync_frequency_value" class="border p-1 w-20">
               </div>
            </div>
             <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="currentTable.Encryption">
                <label>Enable Encryption</label>
            </div>
        </div>
        <button (click)="save()" class="bg-green-600 text-white px-4 py-2 rounded">Save & Create</button>
      </div>
    </div>
  `
})
export class TableMasterConfigComponent implements OnInit {
    tables = signal<TableMaster[]>([]);
    isEditing = signal(false);

    currentTable: TableMaster = this.getEmptyTable();

    constructor(private localDb: LocalDbService) { }

    ngOnInit() {
        this.loadTables();
    }

    loadTables() {
        this.localDb.getAllTables().subscribe(data => {
            this.tables.set(data);
        });
    }

    edit(table: TableMaster) {
        this.currentTable = { ...table };
        this.isEditing.set(true);
    }

    async save() {
        // Validate schema basic
        if (!this.currentTable.Table_Name || !this.currentTable.Table_Schema) return;

        if (this.currentTable.Table_Code) {
            await this.localDb.addTable(this.currentTable); // Update usually same as add/put
        }

        this.isEditing.set(false);
        this.loadTables();
        this.currentTable = this.getEmptyTable();
    }

    private getEmptyTable(): TableMaster {
        return {
            Table_Code: '',
            Table_Name: '',
            Table_Schema: '',
            Sync_Frequency: 'M',
            sync_frequency_value: 10,
            What_Operation_Allowed: ['I', 'U', 'D', 'R'],
            Recycle_Soft_Delete: false,
            schema_validate_server: 'DAILY',
            sync_warning_type: 'WARNING',
            Encryption: false,
            encryption_field: [],
            caching: false,
            caching_ttl: 300
        };
    }
}
