import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableMaster, FieldDefinition, AppDb } from '../../../../../../../packages/core/src/index';
// import { TableMasterRepo } from '../../../../../../../packages/core/src/index';

@Component({
    selector: 'app-table-detail-drawer',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity" (click)="close.emit()"></div>
    <div class="fixed top-0 right-0 w-[500px] h-full bg-white shadow-2xl z-[101] flex flex-col animate-slide-in">
      
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 class="text-xl font-bold text-gray-800">{{ table.Table_Name }}</h2>
          <p class="text-[10px] font-mono text-gray-400 mt-0.5 tracking-wider uppercase">{{ table.Table_Code }}</p>
        </div>
        <button (click)="close.emit()" class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
          <i class="fa fa-times"></i>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex px-6 border-b border-gray-100 bg-white">
        <button *ngFor="let tab of tabs" 
                (click)="activeTab.set(tab.id)"
                [class]="activeTab() === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                class="px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all">
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="flex-1 overflow-y-auto p-6 bg-white">
        
        <!-- FIELDS TAB -->
        <div *ngIf="activeTab() === 'fields'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-bold text-gray-800">Field Definitions</h3>
            <button (click)="addField()" class="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold transition-colors">
              <i class="fa fa-plus-circle mr-1"></i> Add Field
            </button>
          </div>

          <div class="space-y-3">
             <div *ngFor="let field of fields; let i = index" class="group border border-gray-100 rounded-xl p-4 bg-gray-50/30 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all">
                <div class="flex items-start justify-between">
                  <div class="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
                    <div class="col-span-2 flex items-center gap-2">
                      <input [(ngModel)]="field.name" placeholder="Field Name" 
                             class="flex-1 bg-transparent border-none p-0 focus:ring-0 font-bold text-gray-800 placeholder-gray-300">
                      <span *ngIf="field.isEncrypted" class="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black uppercase">Encrypted</span>
                    </div>
                    <div>
                      <label class="text-[9px] font-bold text-gray-400 uppercase">Data Type</label>
                      <select [(ngModel)]="field.type" class="w-full bg-transparent text-xs border-none p-0 focus:ring-0 text-gray-600">
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="object">Object</option>
                        <option value="array">Array</option>
                      </select>
                    </div>
                    <div>
                      <label class="text-[9px] font-bold text-gray-400 uppercase">Length</label>
                      <input type="number" [(ngModel)]="field.length" placeholder="N/A"
                             class="w-full bg-transparent text-xs border-none p-0 focus:ring-0 text-gray-600 placeholder-gray-300">
                    </div>
                    <div class="col-span-2 mt-2 flex items-center gap-4 border-t border-gray-100 pt-2">
                       <label class="flex items-center gap-1.5 cursor-pointer">
                         <input type="checkbox" [(ngModel)]="field.isEncrypted" class="w-3 h-3 rounded text-amber-500">
                         <span class="text-[10px] font-bold text-gray-500">Encrypt Field</span>
                       </label>
                       <label class="flex items-center gap-1.5 cursor-pointer">
                         <input type="checkbox" [(ngModel)]="field.isPrimary" class="w-3 h-3 rounded text-blue-500">
                         <span class="text-[10px] font-bold text-gray-500">Primary Key</span>
                       </label>
                       <label class="flex items-center gap-1.5 cursor-pointer">
                         <input type="checkbox" [(ngModel)]="field.isIndexed" class="w-3 h-3 rounded text-green-500">
                         <span class="text-[10px] font-bold text-gray-500">Indexed</span>
                       </label>
                    </div>
                  </div>
                  <button (click)="removeField(i)" class="text-red-300 hover:text-red-500 mt-1 transition-colors">
                    <i class="fa fa-trash-alt"></i>
                  </button>
                </div>
             </div>
          </div>
        </div>

        <!-- DATA TAB -->
        <div *ngIf="activeTab() === 'data'" class="h-full flex flex-col">
          <div class="flex justify-between items-center mb-4">
             <h3 class="text-sm font-bold text-gray-800">Live Data (First 100)</h3>
             <button (click)="refreshData()" class="text-[10px] font-bold text-blue-600 hover:underline">
               <i class="fa fa-redo mr-1"></i> Refresh
             </button>
          </div>
          <div class="flex-1 overflow-auto border border-gray-100 rounded-lg">
             <table class="w-full text-[10px] text-left">
                <thead class="bg-gray-50 sticky top-0 font-bold uppercase text-gray-400">
                  <tr>
                    <th *ngFor="let f of fields" class="px-3 py-2 border-b border-gray-100">{{ f.name }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr *ngFor="let row of liveData" class="hover:bg-blue-50/20 transition-colors">
                    <td *ngFor="let f of fields" class="px-3 py-2 max-w-[120px] truncate text-gray-600">
                       {{ row[f.name] }}
                    </td>
                  </tr>
                  <tr *ngIf="liveData.length === 0">
                    <td [attr.colspan]="fields.length" class="p-8 text-center text-gray-400 italic">No data found in this table.</td>
                  </tr>
                </tbody>
             </table>
          </div>
        </div>

        <!-- QUERY TAB -->
        <div *ngIf="activeTab() === 'query'" class="space-y-4">
           <div>
             <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Dexie Query (JS)</label>
             <div class="relative">
               <textarea [(ngModel)]="queryText" 
                         placeholder="return await db.table('{{ table.Table_Name }}').toArray();"
                         class="w-full h-40 bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm border-none outline-none focus:ring-2 focus:ring-blue-500 shadow-inner leading-relaxed"></textarea>
               <div class="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-50 group-hover:opacity-100">
                 <span class="text-[8px] font-bold text-green-700 bg-green-900/50 px-1.5 py-0.5 rounded border border-green-800">Dexie v3+</span>
               </div>
             </div>
           </div>
           <button (click)="runQuery()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
             <i class="fa fa-play text-xs"></i> Execute Query
           </button>
           
           <div *ngIf="queryResult" class="mt-6 border-t border-gray-100 pt-6 animate-in fade-in duration-300">
             <div class="flex justify-between items-center mb-2">
               <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Result</h4>
               <span class="text-[10px] text-gray-300">JSON Format</span>
             </div>
             <pre class="bg-gray-50 p-4 rounded-xl text-[10px] font-mono text-gray-600 overflow-auto max-h-60 border border-gray-100">{{ queryResult | json }}</pre>
           </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
        <button (click)="onSave()" 
                class="flex-1 bg-gray-900 hover:bg-black text-white font-black py-3 rounded-xl shadow-xl transition-all active:scale-[0.98]">
          Apply Architecture Changes
        </button>
      </div>

    </div>

    <style>
      .animate-slide-in {
        animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
    </style>
  `
})
export class TableDetailDrawerComponent {
    @Input() table!: TableMaster;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<TableMaster>();

    private db = inject(AppDb);

    activeTab = signal('fields');
    tabs = [
        { id: 'fields', label: 'Fields' },
        { id: 'data', label: 'Data view' },
        { id: 'query', label: 'Query console' }
    ];

    fields: FieldDefinition[] = [];
    liveData: any[] = [];
    queryText = '';
    queryResult: any = null;

    ngOnInit() {
        this.fields = this.table.fields ? JSON.parse(JSON.stringify(this.table.fields)) : [];
        if (this.fields.length === 0 && this.table.Table_Schema) {
            // Sync back from string if missing
            this.parseSchemaToString();
        }
        this.queryText = `return await db.table('${this.table.Table_Name}').limit(10).toArray();`;
        this.refreshData();
    }

    addField() {
        this.fields.push({
            name: 'newField_' + Date.now().toString().slice(-4),
            type: 'string',
            isEncrypted: false,
            isIndexed: true
        });
    }

    removeField(index: number) {
        this.fields.splice(index, 1);
    }

    async refreshData() {
        try {
            this.liveData = await this.db.table(this.table.Table_Name).limit(100).toArray();
        } catch (e) {
            console.error('Data pull failed', e);
            this.liveData = [];
        }
    }

    async runQuery() {
        try {
            const fn = new Function('db', `return (async () => { ${this.queryText} })();`);
            this.queryResult = await fn(this.db);
        } catch (e: any) {
            this.queryResult = { error: e.message };
        }
    }

    onSave() {
        // Before saving, regenerate the Table_Schema string for Dexie compatibility
        // and sync encryption_field array
        const pk = this.fields.find(f => f.isPrimary)?.name || '++id';
        const indexed = this.fields.filter(f => f.isIndexed && !f.isPrimary).map(f => f.name).join(', ');

        this.table.Table_Schema = indexed ? `${pk}, ${indexed}` : pk;
        this.table.fields = this.fields;
        this.table.encryption_field = this.fields.filter(f => f.isEncrypted).map(f => f.name);
        this.table.Encryption = this.table.encryption_field.length > 0;

        this.save.emit(this.table);
    }

    private parseSchemaToString() {
        // Basic parser for existing schemas like "++id, name, age"
        const parts = this.table.Table_Schema.split(',').map(s => s.trim());
        this.fields = parts.map(p => {
            const name = p.replace('++', '').replace('&', '').replace('*', '');
            return {
                name,
                type: 'string',
                isPrimary: p.includes('++') || (!this.table.Table_Schema.includes('++') && p === parts[0]),
                isIndexed: true,
                isEncrypted: this.table.encryption_field?.includes(name) || false
            };
        });
    }
}
