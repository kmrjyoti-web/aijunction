import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbManagementFacade } from '../services/db-management.facade';
import { TableMaster } from '../../../../../../../packages/core/src/index';
import { TableSchemaEditorComponent } from '../components/table-schema-editor.component';
import { TableDetailDrawerComponent } from '../components/table-detail-drawer.component';

@Component({
  selector: 'app-table-master-page',
  standalone: true,
  imports: [CommonModule, TableSchemaEditorComponent, TableDetailDrawerComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header Area -->
      <div class="flex justify-between items-end mb-6">
        <div>
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">Database Architecture</h1>
          <p class="text-gray-500 mt-1 text-sm">Manage schemas, synchronization policies, and data security policies.</p>
        </div>
        <button (click)="addNew()" 
                class="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-xl font-black flex items-center gap-2 shadow-xl transition-all active:scale-95 group text-sm">
          <i class="fa fa-plus-circle text-blue-400 group-hover:rotate-90 transition-transform"></i> Define Architecture
        </button>
      </div>

      <!-- Quick Editor (Standard) -->
      <div *ngIf="isEditingSummary()" class="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
        <app-table-schema-editor 
          [table]="currentTable!" 
          [isEdit]="isEditMode"
          (save)="saveTable($event)"
          (cancel)="isEditingSummary.set(false)">
        </app-table-schema-editor>
      </div>

      <!-- Main Grid View -->
      <div class="space-y-8">
        
        <!-- CUSTOM TABLES SECTION -->
        <section>
          <div class="flex items-center gap-2 mb-3">
            <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom Application Schemas</h2>
            <div class="h-[1px] flex-1 bg-gray-100"></div>
          </div>
          
          <div class="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th class="px-6 py-3">Table Info</th>
                  <th class="px-4 py-3">Sync Policy</th>
                  <th class="px-4 py-3">Encryption</th>
                  <th class="px-4 py-3">Architecture</th>
                  <th class="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr *ngFor="let t of facade.tables()" class="group hover:bg-blue-50/10 transition-all">
                  <td class="px-6 py-3">
                    <div class="font-bold text-gray-800 text-sm">{{ t.Table_Name }}</div>
                    <div class="text-[9px] font-mono text-gray-400 tracking-tighter">{{ t.Table_Code }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-1.5">
                      <span class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-black">
                        {{ t.Sync_Frequency }}
                      </span>
                      <span class="text-[10px] font-bold text-gray-700">x{{ t.sync_frequency_value }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div *ngIf="t.Encryption" class="flex flex-col gap-0.5">
                       <span class="flex items-center gap-1 text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full w-fit">
                         <i class="fa fa-shield-alt text-[6px]"></i> ACTIVE
                       </span>
                    </div>
                    <span *ngIf="!t.Encryption" class="text-[9px] font-bold text-gray-300">Off</span>
                  </td>
                  <td class="px-4 py-3">
                    <button (click)="openDrawer(t)" class="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                       Detail <i class="fa fa-caret-right"></i>
                    </button>
                    <div class="text-[8px] text-gray-300 mt-0.5 truncate max-w-[100px] font-mono">{{ t.Table_Schema }}</div>
                  </td>
                  <td class="px-6 py-3 text-right">
                    <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button (click)="editBasic(t)" class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                        <i class="fa fa-cog"></i>
                      </button>
                      <button (click)="deleteTable(t)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                        <i class="fa fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr *ngIf="facade.tables().length === 0">
                  <td colspan="5" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center gap-2">
                      <i class="fa fa-database text-xl text-gray-100"></i>
                      <p class="text-gray-300 text-[10px] font-bold uppercase tracking-widest">No architectures</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- SYSTEM TABLES SECTION -->
        <section class="opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
           <div class="flex items-center gap-2 mb-3">
            <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Architecture</h2>
            <div class="h-[1px] flex-1 bg-gray-50"></div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
             <div *ngFor="let t of systemTables()" 
                  class="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
                  (click)="openDrawer(t)">
                <div class="flex justify-between items-start mb-2">
                   <div class="w-6 h-6 bg-gray-50 rounded flex items-center justify-center text-[10px] text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <i class="fa fa-lock-alt"></i>
                   </div>
                   <span class="text-[8px] font-black text-gray-200">SYS</span>
                </div>
                <h3 class="text-[11px] font-black text-gray-800 truncate">{{ t.Table_Name }}</h3>
                <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                   <span class="text-[8px] font-black text-blue-400 uppercase">View</span>
                   <i class="fa fa-shield-alt text-amber-500 text-[8px]" *ngIf="t.Encryption"></i>
                </div>
             </div>
          </div>
        </section>

      </div>

      <!-- Detail Drawer / Slider -->
      <app-table-detail-drawer 
        *ngIf="isDrawerOpen()"
        [table]="currentTable!" 
        (save)="saveTable($event)"
        (close)="isDrawerOpen.set(false)">
      </app-table-detail-drawer>

    </div>
  `
})
export class TableMasterPage implements OnInit {
  isEditingSummary = signal(false);
  isDrawerOpen = signal(false);
  isEditMode = false;
  currentTable: TableMaster | null = null;
  systemTables = signal<TableMaster[]>([]);

  constructor(public facade: DbManagementFacade) { }

  ngOnInit() {
    this.facade.loadAll();
    this.systemTables.set(this.facade.getSystemTables());
  }

  addNew() {
    this.isEditMode = false;
    this.currentTable = this.getEmptyTable();
    this.isEditingSummary.set(true);
  }

  editBasic(table: TableMaster) {
    this.isEditMode = true;
    this.currentTable = { ...table };
    this.isEditingSummary.set(true);
  }

  openDrawer(table: TableMaster) {
    this.currentTable = { ...table };
    this.isDrawerOpen.set(true);
  }

  async saveTable(table: TableMaster) {
    try {
      await this.facade.addTable(table);
      this.isEditingSummary.set(false);
      this.isDrawerOpen.set(false);
    } catch (err) {
      alert('Failed to save schema: ' + err);
    }
  }

  async deleteTable(table: TableMaster) {
    try {
      // Safety check: count data
      const db = (this.facade as any).tableRepo.db; // facade has tableRepo initialized with db
      const recordCount = await db.table(table.Table_Name).count();

      let message = `Are you sure you want to delete "${table.Table_Name}"? This action is irreversible.`;
      if (recordCount > 0) {
        message = `WARNING: The table "${table.Table_Name}" contains ${recordCount} records. Deleting this table will PERMANENTLY ERASE all data. \n\nAre you absolutely sure you want to proceed?`;
      }

      if (confirm(message)) {
        await this.facade.deleteTable(table.Table_Code);
      }
    } catch (err) {
      // Fallback if table doesn't exist in IndexedDB yet
      if (confirm(`Are you sure you want to delete "${table.Table_Name}"? This action is irreversible.`)) {
        await this.facade.deleteTable(table.Table_Code);
      }
    }
  }

  private getEmptyTable(): TableMaster {
    return {
      Table_Code: 'TBL_' + Date.now(),
      Table_Name: '',
      Table_Schema: '++id, ',
      Sync_Frequency: 'M',
      sync_frequency_value: 10,
      What_Operation_Allowed: ['I', 'U', 'D', 'R'],
      Recycle_Soft_Delete: false,
      schema_validate_server: 'DAILY',
      sync_warning_type: 'WARNING',
      Encryption: false,
      encryption_field: [],
      caching: false,
      caching_ttl: 300,
      fields: [
        { name: 'id', type: 'number', isEncrypted: false, isPrimary: true, isIndexed: true }
      ]
    };
  }
}
