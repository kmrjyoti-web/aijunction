
import { Component, Input, Output, EventEmitter, inject, OnInit, Signal, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormStore } from '../../services/form.store';
import { FormSchema, RowConfig } from '../../models/form-schema.model';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';
import { IconHelper, IconName } from '../../helpers/icon.helper';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFieldComponent],
  providers: [FormStore],
  template: `
    <div class="w-full max-w-5xl mx-auto">
      
      <!-- Form Title -->
      <div class="mb-8 border-b border-gray-200 pb-5">
        <h2 class="text-3xl font-bold text-slate-800">{{ schema()?.title }}</h2>
        @if (schema()?.description) {
          <p class="text-slate-500 mt-2 text-lg">{{ schema()?.description }}</p>
        }
      </div>

      <form [formGroup]="formGroup()" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <!-- 
           1. COMMON HEADER ROWS
           If layout is 'tabs', rows in the root are considered "Header Fields" visible on all tabs.
        -->
        @if (isTabLayout() && schema()?.rows) {
          <div class="mb-8 border-b border-gray-100 pb-6">
            @for (row of schema()?.rows; track $index) {
              <div class="grid grid-cols-12 gap-4 md:gap-6 animate-fadeIn mb-4">
                @for (col of row.columns; track $index) {
                  @if(col.field) {
                    <div [class]="col.span">
                      <smart-field 
                        [field]="col.field" 
                        [group]="formGroup()">
                      </smart-field>
                    </div>
                  }
                }
              </div>
            }
          </div>
        }

        <!-- 2. Tab Navigation -->
        @if (isTabLayout()) {
          <div class="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
             @for (tab of schema()?.tabs; track tab.id) {
               <button
                 type="button"
                 (click)="setActiveTab(tab.id)"
                 class="
                    flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all border-b-2
                 "
                 [class.border-primary]="activeTab() === tab.id"
                 [class.text-primary]="activeTab() === tab.id"
                 [class.bg-blue-50]="activeTab() === tab.id"
                 [class.border-transparent]="activeTab() !== tab.id"
                 [class.text-gray-500]="activeTab() !== tab.id"
                 [class.hover:text-gray-700]="activeTab() !== tab.id"
                 [class.hover:bg-gray-50]="activeTab() !== tab.id"
               >
                 <!-- Tab Image -->
                 @if (tab.image) {
                   <img [src]="tab.image" class="w-5 h-5 rounded-full object-cover" />
                 }

                 <!-- Tab Icon -->
                 @if (tab.icon) {
                   <div [innerHTML]="getSafeIcon(tab.icon)" class="w-4 h-4"></div>
                 }
                 
                 <!-- Tab Label -->
                 {{ tab.label }}
               </button>
             }
          </div>
        }

        <!-- 3. Dynamic Grid System (Tab Content or Standard Rows) -->
        @for (row of visibleRows(); track $index) {
          <div class="grid grid-cols-12 gap-4 md:gap-6 animate-fadeIn">
            @for (col of row.columns; track $index) {
              @if(col.field) {
                <div [class]="col.span">
                  <smart-field 
                    [field]="col.field" 
                    [group]="formGroup()">
                  </smart-field>
                </div>
              }
            }
          </div>
        }

        <!-- Actions -->
        <div class="pt-6 border-t border-gray-200 flex justify-end gap-4">
          <button 
            type="button" 
            (click)="onReset()"
            class="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200">
            Reset
          </button>
          
          <button 
            type="submit"
            [disabled]="formGroup().invalid || formGroup().pristine"
            class="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed">
            Submit Form
          </button>
        </div>

      </form>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `]
})
export class DynamicFormComponent implements OnInit {
  @Input({ required: true }) config!: FormSchema;
  @Output() formSubmit = new EventEmitter<any>();

  store = inject(FormStore);
  sanitizer = inject(DomSanitizer);
  
  schema: Signal<FormSchema | null> = this.store.schema;
  formGroup: Signal<FormGroup> = this.store.formGroup;

  // Tab State
  activeTab = signal<string>('');
  
  // Computed Properties
  isTabLayout = computed(() => this.schema()?.layout === 'tabs');

  visibleRows = computed<RowConfig[]>(() => {
    const s = this.schema();
    if (!s) return [];

    if (s.layout === 'tabs' && s.tabs) {
       const currentTab = s.tabs.find(t => t.id === this.activeTab());
       return currentTab ? currentTab.rows : [];
    }

    return s.rows || [];
  });

  constructor() {
    // When schema changes, reset active tab if needed
    effect(() => {
      const s = this.schema();
      if (s?.layout === 'tabs' && s.tabs?.length && !this.activeTab()) {
        this.activeTab.set(s.tabs[0].id);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    if (this.config) {
      this.store.init(this.config);
      // Initialize active tab if applicable
      if (this.config.layout === 'tabs' && this.config.tabs?.length) {
        this.activeTab.set(this.config.tabs[0].id);
      }
    }
  }

  setActiveTab(id: string) {
    this.activeTab.set(id);
  }

  getSafeIcon(name: IconName): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }

  onSubmit() {
    if (this.store.isValid()) {
      this.formSubmit.emit(this.store.getFormValue());
    } else {
      // Mark all as touched to show errors
      this.formGroup().markAllAsTouched();
    }
  }

  onReset() {
    this.formGroup().reset();
  }
}
