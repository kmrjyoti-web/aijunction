
import { Component, Input, Output, EventEmitter, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormFieldConfig, ControlType } from '../../models/form-schema.model';

@Component({
  selector: 'app-field-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-50 border-l border-gray-200 h-full p-4 overflow-y-auto w-80 flex-shrink-0">
      <h3 class="font-bold text-gray-800 mb-4 border-b pb-2">Edit Field</h3>

      @if (field) {
        <div class="space-y-4">
          
          <!-- Key (ID) -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Key (ID)</label>
            <input type="text" [(ngModel)]="field.key" class="w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary px-2 py-1.5" />
          </div>

          <!-- Label -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Label</label>
            <input type="text" [(ngModel)]="field.label" class="w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary px-2 py-1.5" />
          </div>

          <!-- Type -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
            <select [(ngModel)]="field.type" class="w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary px-2 py-1.5">
              @for (type of controlTypes; track type) {
                <option [value]="type">{{ type }}</option>
              }
            </select>
          </div>

          <!-- Placehoder -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Placeholder (Button Text)</label>
            <input type="text" [(ngModel)]="field.placeholder" class="w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary px-2 py-1.5" />
          </div>

          <div class="h-px bg-gray-200 my-2"></div>

          <!-- Validation -->
          <div>
            <label class="flex items-center gap-2">
              <input type="checkbox" [ngModel]="field.validators?.required" (ngModelChange)="updateValidator('required', $event)" class="rounded text-primary focus:ring-primary">
              <span class="text-sm text-gray-700">Required</span>
            </label>
          </div>

          <div class="h-px bg-gray-200 my-2"></div>

          <!-- AI & Smart Features -->
          <h4 class="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-2">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            AI & Transliteration
          </h4>

          <div class="space-y-3 bg-purple-50 p-3 rounded-lg border border-purple-100">
            <label class="flex items-center gap-2">
              <input 
                type="checkbox" 
                [ngModel]="field.transliteration?.enabled" 
                (ngModelChange)="updateTransliteration('enabled', $event)" 
                class="rounded text-purple-600 focus:ring-purple-500"
              >
              <span class="text-sm text-gray-800 font-medium">Enable Transliteration</span>
            </label>

            @if (field.transliteration?.enabled) {
              <div class="space-y-3 pt-1 animate-fadeIn">
                 <div>
                   <label class="block text-xs font-semibold text-purple-700 uppercase mb-1">Target Language</label>
                   <select 
                     [ngModel]="field.transliteration?.defaultLanguage" 
                     (ngModelChange)="updateTransliteration('defaultLanguage', $event)"
                     class="w-full text-sm border-purple-200 rounded-md focus:ring-purple-500 focus:border-purple-500 px-2 py-1.5"
                   >
                     <option value="Hindi">Hindi</option>
                     <option value="Gujarati">Gujarati</option>
                     <option value="Marathi">Marathi</option>
                     <option value="Urdu">Urdu</option>
                     <option value="Bengali">Bengali</option>
                     <option value="Tamil">Tamil</option>
                     <option value="Telugu">Telugu</option>
                     <option value="Kannada">Kannada</option>
                     <option value="Punjabi">Punjabi</option>
                     <option value="Arabic">Arabic</option>
                   </select>
                 </div>

                 <label class="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      [ngModel]="field.transliteration?.showControls" 
                      (ngModelChange)="updateTransliteration('showControls', $event)" 
                      class="rounded text-purple-600 focus:ring-purple-500"
                    >
                    <span class="text-xs text-gray-700">Show Controls (UI)</span>
                  </label>
              </div>
            }
          </div>

          <div class="h-px bg-gray-200 my-2"></div>

          <!-- Navigation Logic -->
          <h4 class="font-semibold text-gray-700 text-sm mb-2">Keyboard Navigation</h4>
          
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Previous Control Key</label>
            <input type="text" [(ngModel)]="field.previousControl" placeholder="Key of prev field" class="w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary px-2 py-1.5" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Next Control Key</label>
            <input type="text" [(ngModel)]="field.nextControl" placeholder="Key of next field" class="w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary px-2 py-1.5" />
          </div>
          
           <div class="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
              Logic: Left Arrow → Prev, Right Arrow → Next.
           </div>

           <div class="h-px bg-gray-200 my-2"></div>

           <!-- Shortcuts -->
           <div>
             <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Shortcut (e.g. "ctrl+k")</label>
             <input 
               type="text" 
               [ngModel]="field.props?.['shortcut']" 
               (ngModelChange)="updateProp('shortcut', $event)" 
               class="w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary px-2 py-1.5" 
             />
           </div>

        </div>
      } @else {
        <p class="text-sm text-gray-500 italic">Select a field from the preview to edit its properties.</p>
      }
    </div>
  `,
  styles: [`
    .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class FieldEditorComponent {
  @Input() field: FormFieldConfig | null = null;
  @Output() fieldChange = new EventEmitter<void>();

  controlTypes: ControlType[] = [
    'text', 'number', 'email', 'password', 'textarea', 'select', 'multi-select', 
    'checkbox', 'radio-group', 'switch', 'date', 'mobile', 'currency', 'rating', 'slider', 'tags', 'segment',
    'file-upload', 'signature', 'otp', 'button', 'confirm-dialog', 'alert-dialog'
  ];

  updateValidator(key: string, value: boolean) {
    if (!this.field) return;
    if (!this.field.validators) this.field.validators = {};
    (this.field.validators as any)[key] = value;
    this.fieldChange.emit();
  }

  updateProp(key: string, value: any) {
    if (!this.field) return;
    if (!this.field.props) this.field.props = {};
    this.field.props[key] = value;
    this.fieldChange.emit();
  }

  updateTransliteration(key: string, value: any) {
    if (!this.field) return;
    
    if (!this.field.transliteration) {
      this.field.transliteration = { enabled: false, defaultLanguage: 'Hindi' };
    }

    (this.field.transliteration as any)[key] = value;

    // Cleanup if disabled to keep schema clean
    if (key === 'enabled' && value === false) {
      delete this.field.transliteration;
    }

    this.fieldChange.emit();
  }
}
