
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SchemaGeneratorService } from '../../services/schema-generator.service';
import { FormStore } from '../../services/form.store';
import { FormSchema, RowConfig, FormFieldConfig } from '../../models/form-schema.model';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';
import { FieldEditorComponent } from './field-editor.component';

@Component({
  selector: 'app-schema-builder',
  standalone: true,
  imports: [CommonModule, DynamicFieldComponent, FieldEditorComponent, ReactiveFormsModule, FormsModule],
  providers: [FormStore], // Provide local store for preview
  template: `
    <div class="flex h-[calc(100vh-100px)] bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
      
      <!-- 1. LEFT: Builder / Preview Area -->
      <div class="flex-1 flex flex-col min-w-0">
        
        <!-- Toolbar -->
        <div class="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
             <h2 class="font-bold text-lg text-gray-800">Schema Builder</h2>
             <span class="px-2 py-1 text-xs font-medium rounded-full" 
                   [class.bg-green-100]="schema()" 
                   [class.text-green-700]="schema()"
                   [class.bg-gray-200]="!schema()"
                   [class.text-gray-600]="!schema()">
                {{ schema() ? 'Edit Mode' : 'Upload Mode' }}
             </span>
          </div>

          <div class="flex items-center gap-2">
            @if (schema()) {
              <button (click)="downloadJson()" class="px-3 py-1.5 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors">Download JSON</button>
              <button (click)="reset()" class="px-3 py-1.5 text-danger text-sm hover:bg-red-50 rounded transition-colors">Reset</button>
            }
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-8 relative bg-gray-50/50">
          
          @if (loading()) {
             <div class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
               <svg class="animate-spin h-10 w-10 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <p class="text-gray-600 font-medium">Generating Schema with AI...</p>
             </div>
          }

          @if (!schema()) {
            <!-- Upload State -->
            <div class="max-w-xl mx-auto mt-10 space-y-8 animate-fadeIn">
              
              <!-- Mode Toggle -->
              <div class="flex justify-center">
                 <label class="flex items-center cursor-pointer gap-3 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <span class="text-sm font-medium text-gray-700">Single Page</span>
                    <div class="relative">
                      <input type="checkbox" [(ngModel)]="isTabbedMode" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-700">Tabbed View</span>
                 </label>
              </div>

              <!-- Image Upload -->
              <div 
                class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer group"
                (click)="fileInput.click()"
              >
                <!-- accept multiple files if tabbed mode -->
                <input 
                  #fileInput 
                  type="file" 
                  accept="image/*" 
                  [multiple]="isTabbedMode()" 
                  class="hidden" 
                  (change)="onFileSelected($event)" 
                />
                
                <div class="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                   <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ isTabbedMode() ? 'Upload Screenshots' : 'Upload Screenshot' }}
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                  {{ isTabbedMode() ? 'Select multiple images (Header + Tabs) to combine.' : 'Upload a single image of a form.' }}
                </p>
              </div>

              <!-- OR Separator -->
              <div class="relative">
                <div class="absolute inset-0 flex items-center" aria-hidden="true">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center">
                  <span class="bg-gray-50 px-2 text-sm text-gray-500">OR</span>
                </div>
              </div>

              <!-- HTML Paste -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Paste HTML Snippet</label>
                <textarea 
                  #htmlInput
                  rows="4" 
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border"
                  placeholder="<form>...</form>"
                ></textarea>
                <button 
                  (click)="onHtmlSubmit(htmlInput.value)"
                  [disabled]="!htmlInput.value"
                  class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate from HTML
                </button>
              </div>

            </div>
          } @else {
            <!-- Preview State -->
            <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto min-h-[500px]">
               <div class="mb-6 border-b pb-4">
                 <h1 class="text-2xl font-bold text-gray-900">{{ schema()?.title }}</h1>
                 <p class="text-gray-500 mt-1">{{ schema()?.description }}</p>
               </div>

               <!-- Render the Form for Preview -->
               <form [formGroup]="previewGroup" class="space-y-6">
                 
                 <!-- Header Rows (for Tabbed layouts) -->
                 @if (schema()?.layout === 'tabs' && schema()?.rows) {
                    <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6 relative">
                       <span class="absolute top-0 right-0 px-2 py-1 bg-gray-200 text-[10px] text-gray-600 rounded-bl-lg">Header</span>
                       @for (row of schema()?.rows; track rowIndex; let rowIndex = $index) {
                         <div class="grid grid-cols-12 gap-6 mb-4">
                           @for (col of row.columns; track colIndex; let colIndex = $index) {
                             <!-- Header fields not draggable in this simplified demo, but consistent styling -->
                             <div 
                               [class]="col.span" 
                               class="relative group rounded-lg p-2 -m-2 hover:bg-blue-50/50 border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                               [class.ring-2]="col.field && selectedField() === col.field"
                               [class.ring-primary]="col.field && selectedField() === col.field"
                               [class.bg-blue-50]="col.field && selectedField() === col.field"
                               (click)="col.field && selectField(col.field)"
                             >
                               @if(col.field) {
                                  <div class="pointer-events-none">
                                    <smart-field [field]="col.field" [group]="previewGroup"></smart-field>
                                  </div>
                               } @else {
                                  <div class="h-8 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">Empty</div>
                               }
                             </div>
                           }
                         </div>
                       }
                    </div>
                 }

                 <!-- Tabs Navigation Mock (Visual Only for Builder) -->
                 @if (schema()?.layout === 'tabs' && schema()?.tabs) {
                   <div class="flex gap-2 border-b mb-4">
                     @for (tab of schema()?.tabs; track tab.id; let first = $first) {
                       <div class="px-4 py-2 text-sm font-medium border-b-2" [class.border-primary]="first" [class.text-primary]="first" [class.border-transparent]="!first">{{ tab.label }}</div>
                     }
                   </div>
                 }

                 <!-- Main Content Rows (from First Tab or Standard Rows) -->
                 <!-- These rows are DRAGGABLE -->
                 @for (row of getPreviewRows(); track rowIndex; let rowIndex = $index) {
                   <div class="grid grid-cols-12 gap-6">
                     @for (col of row.columns; track colIndex; let colIndex = $index) {
                       <div 
                         [class]="col.span" 
                         class="relative group rounded-lg p-2 -m-2 hover:bg-blue-50/50 border border-transparent hover:border-blue-100 transition-all cursor-move"
                         [class.ring-2]="col.field && selectedField() === col.field"
                         [class.ring-primary]="col.field && selectedField() === col.field"
                         [class.bg-blue-50]="col.field && selectedField() === col.field"
                         [class.opacity-50]="isDragging() && draggedItem()?.rowIndex === rowIndex && draggedItem()?.colIndex === colIndex"
                         draggable="true"
                         (dragstart)="onDragStart($event, rowIndex, colIndex)"
                         (dragover)="onDragOver($event)"
                         (drop)="onDrop($event, rowIndex, colIndex)"
                         (click)="col.field && selectField(col.field)"
                       >
                         @if(col.field) {
                            <div class="pointer-events-none">
                              <smart-field [field]="col.field" [group]="previewGroup"></smart-field>
                            </div>
                         } @else {
                            <div class="h-8 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">Empty Slot</div>
                         }
                       </div>
                     }
                   </div>
                 }
               </form>
            </div>
          }

        </div>
      </div>

      <!-- 2. RIGHT: Property Editor -->
      <app-field-editor 
        [field]="selectedField()"
        (fieldChange)="refreshPreview()"
      ></app-field-editor>

    </div>
  `,
  styles: [`
    .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SchemaBuilderComponent {
  private generator = inject(SchemaGeneratorService);
  private store = inject(FormStore);
  
  schema = signal<FormSchema | null>(null);
  loading = signal(false);
  selectedField = signal<FormFieldConfig | null>(null);
  isTabbedMode = signal(false);

  // Drag State
  draggedItem = signal<{ rowIndex: number, colIndex: number } | null>(null);
  isDragging = signal(false);

  previewGroup: FormGroup = new FormGroup({});

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      
      this.loading.set(true);
      const files = Array.from(input.files);

      // Read all files concurrently
      const readPromises = files.map(file => {
        return new Promise<{data: string, mimeType: string}>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve({
              data: result.split(',')[1],
              mimeType: file.type
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises).then(async (images) => {
         const generatedSchema = await this.generator.generateFromImages(images);
         this.loadSchema(generatedSchema);
         this.loading.set(false);
      });
    }
  }

  async onHtmlSubmit(html: string) {
    if (!html.trim()) return;
    this.loading.set(true);
    const generatedSchema = await this.generator.generateFromHtml(html);
    this.loadSchema(generatedSchema);
    this.loading.set(false);
  }

  loadSchema(s: FormSchema) {
    this.schema.set(s);
    this.store.init(s);
    this.previewGroup = this.store.formGroup();
  }

  getPreviewRows(): RowConfig[] {
    const s = this.schema();
    if (!s) return [];
    
    // For preview, if tabs exist, show first tab rows.
    if (s.layout === 'tabs' && s.tabs && s.tabs.length > 0) {
      return s.tabs[0].rows || [];
    }
    // Else return standard rows
    if (s.layout === 'standard') {
       return s.rows || [];
    }
    return [];
  }

  selectField(field: FormFieldConfig) {
    this.selectedField.set(field);
  }

  refreshPreview() {
    const s = this.schema();
    if (s) {
       this.store.init(s);
       this.previewGroup = this.store.formGroup();
    }
  }

  reset() {
    this.schema.set(null);
    this.selectedField.set(null);
  }

  downloadJson() {
    const s = this.schema();
    if (!s) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(s, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "form-schema.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  // --- Drag and Drop Logic ---

  onDragStart(event: DragEvent, rowIndex: number, colIndex: number) {
    this.draggedItem.set({ rowIndex, colIndex });
    this.isDragging.set(true);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({ rowIndex, colIndex }));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Allows drop
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, targetRowIndex: number, targetColIndex: number) {
    event.preventDefault();
    this.isDragging.set(false);
    
    const source = this.draggedItem();
    if (!source) return;

    // Avoid drop on self
    if (source.rowIndex === targetRowIndex && source.colIndex === targetColIndex) {
      this.draggedItem.set(null);
      return;
    }

    this.moveField(source.rowIndex, source.colIndex, targetRowIndex, targetColIndex);
    this.draggedItem.set(null);
  }

  moveField(fromRowIdx: number, fromColIdx: number, toRowIdx: number, toColIdx: number) {
    this.schema.update(s => {
      if (!s) return null;
      
      const newSchema = JSON.parse(JSON.stringify(s));
      let rows: RowConfig[] = [];
      
      if (newSchema.layout === 'tabs' && newSchema.tabs && newSchema.tabs.length > 0) {
        rows = newSchema.tabs[0].rows;
      } else {
        rows = newSchema.rows;
      }

      if (!rows) return newSchema;

      const sourceRow = rows[fromRowIdx];
      const targetRow = rows[toRowIdx];
      
      if (!sourceRow || !targetRow) return newSchema;
      
      const itemToMove = sourceRow.columns[fromColIdx];
      
      // Remove from source
      sourceRow.columns.splice(fromColIdx, 1);
      
      let insertIndex = toColIdx;
      
      targetRow.columns.splice(insertIndex, 0, itemToMove);
      
      return newSchema;
    });

    // Refresh Preview
    if (this.schema()) {
      this.refreshPreview();
    }
  }
}
