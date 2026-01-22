import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableMaster } from '../../../../../../../packages/core/src/index';

@Component({
    selector: 'app-table-schema-editor',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-gray-800">
          {{ isEdit ? 'Edit Table: ' + table.Table_Name : 'Add New Table' }}
        </h3>
        <button (click)="cancel.emit()" class="text-gray-400 hover:text-gray-600">
          <i class="fa fa-times"></i>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Basic Info -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Table Name</label>
            <input [(ngModel)]="table.Table_Name" 
                   placeholder="e.g. Products"
                   class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Table Code (Unique ID)</label>
            <input [(ngModel)]="table.Table_Code" 
                   [disabled]="isEdit"
                   placeholder="e.g. TBL_001"
                   class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1 text-blue-600">Dexie Schema Definition</label>
            <input [(ngModel)]="table.Table_Schema" 
                   placeholder="e.g. ++id, name, price, category"
                   class="w-full px-4 py-2 rounded-lg border border-blue-100 bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm">
            <p class="text-[10px] text-gray-400 mt-1 italic">Use standard Dexie format: ++id for auto-inc PK, followed by indexed fields.</p>
          </div>
        </div>

        <!-- Sync & Encryption -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Sync Freq</label>
              <select [(ngModel)]="table.Sync_Frequency" class="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none">
                <option value="M">Minutes</option>
                <option value="H">Hours</option>
                <option value="D">Days</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Interval Value</label>
              <input type="number" [(ngModel)]="table.sync_frequency_value" class="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none">
            </div>
          </div>

          <!-- Encryption Policy -->
          <div class="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div class="flex items-center justify-between mb-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [(ngModel)]="table.Encryption" class="w-4 h-4 rounded text-amber-600 focus:ring-amber-500">
                <span class="text-sm font-bold text-amber-800">Encryption Policy</span>
              </label>
              <i class="fa fa-shield-alt text-amber-500"></i>
            </div>
            
            <div *ngIf="table.Encryption">
              <label class="block text-[10px] font-bold text-amber-700 uppercase mb-1">Encrypted Fields (comma separated)</label>
              <input [(ngModel)]="encryptionFieldsString" 
                     (blur)="syncEncryptionFields()"
                     placeholder="e.g. mobileNumber, emailId"
                     class="w-full px-3 py-1.5 rounded border border-amber-200 bg-white text-sm outline-none focus:ring-1 focus:ring-amber-400 transition-all font-mono">
              <div class="flex flex-wrap gap-1 mt-2">
                 <span *ngFor="let field of table.encryption_field" class="px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-[10px] font-bold">
                    {{ field }}
                 </span>
              </div>
            </div>
            <p *ngIf="!table.Encryption" class="text-[10px] text-amber-600 italic">Enable to protect sensitive data at rest using AES-256.</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
        <button (click)="cancel.emit()" 
                class="px-6 py-2 rounded-lg text-gray-500 hover:bg-gray-100 font-medium transition-colors">
          Cancel
        </button>
        <button (click)="onSave()" 
                [disabled]="!isValid()"
                class="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-200 disabled:opacity-50 transition-all">
          Save Schema Change
        </button>
      </div>
    </div>
  `
})
export class TableSchemaEditorComponent {
    @Input() table!: TableMaster;
    @Input() isEdit = false;
    @Output() save = new EventEmitter<TableMaster>();
    @Output() cancel = new EventEmitter<void>();

    encryptionFieldsString = '';

    ngOnChanges() {
        if (this.table && this.table.encryption_field) {
            this.encryptionFieldsString = this.table.encryption_field.join(', ');
        } else {
            this.encryptionFieldsString = '';
        }
    }

    syncEncryptionFields() {
        this.table.encryption_field = this.encryptionFieldsString
            .split(',')
            .map(f => f.trim())
            .filter(f => !!f);
    }

    isValid() {
        return this.table.Table_Name && this.table.Table_Code && this.table.Table_Schema;
    }

    onSave() {
        this.syncEncryptionFields();
        this.save.emit(this.table);
    }
}
