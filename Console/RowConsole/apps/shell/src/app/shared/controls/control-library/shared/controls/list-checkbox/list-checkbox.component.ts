
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';
import { FormStore } from '../../../services/form.store';

@Component({
  selector: 'smart-list-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    /* Hide scrollbar for Chrome, Safari and Opera */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    .no-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `],
  template: `
    <div [formGroup]="group" [class]="ui.container">
      @if (field.label) {
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ field.label }}
          @if(field.validators?.required){ <span class="text-danger">*</span> }
        </label>
      }

      <div class="border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden flex flex-col transition-all duration-200 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
        
        <!-- Header: Search & Chips Unified -->
        <div class="p-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          
          <div class="flex flex-wrap items-center gap-2 w-full border border-gray-300 rounded-md bg-white px-2 py-1.5 transition-shadow duration-200 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary min-h-[38px]">
            
            <!-- Search Icon -->
            <div class="text-gray-400 flex-shrink-0 select-none">
               <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            <!-- Chips Display (Inside Box) -->
            @for (opt of visibleSelectedOptions(); track opt.value) {
              <span class="animate-fadeIn inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200 shadow-sm whitespace-nowrap">
                {{ opt.label }}
                <button 
                  type="button" 
                  (click)="removeValue(opt.value, $event)"
                  class="hover:text-blue-900 hover:bg-blue-200 rounded-full p-0.5 transition-colors focus:outline-none flex-shrink-0"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </span>
            }

            @if (remainingCount() > 0) {
               <span class="animate-fadeIn inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 whitespace-nowrap">
                 +{{ remainingCount() }} more
               </span>
            }

            <!-- Search Input (Blends in) -->
            <input 
              type="text" 
              [placeholder]="selectedOptionDetails().length === 0 ? (field.placeholder || 'Search...') : ''"
              (input)="onSearch($event)"
              class="flex-1 min-w-[60px] bg-transparent border-none outline-none focus:ring-0 p-0 text-sm text-gray-700 placeholder-gray-400 leading-relaxed"
            >
          </div>
        </div>

        <!-- Scrollable List (No Scrollbar) -->
        <div 
          class="overflow-y-auto bg-white no-scrollbar"
          [style.max-height]="maxHeight()"
        >
           @for (opt of filteredOptions(); track opt.value; let last = $last) {
              <div 
                (click)="toggleValue(opt.value)"
                class="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-gray-100"
                [class.border-b]="!last"
                [class.bg-blue-50]="isChecked(opt.value)"
              >
                <!-- Checkbox Input -->
                <div class="flex h-5 items-center">
                  <input
                    type="checkbox"
                    [checked]="isChecked(opt.value)"
                    class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none"
                    readonly 
                  />
                </div>
                
                <!-- Content -->
                <div class="ml-3 text-sm flex-1">
                  <div class="flex items-center gap-2">
                    @if (opt.icon) {
                       <span [innerHTML]="getSafeIcon(opt.icon)" class="text-gray-400 w-4 h-4"></span>
                    }
                    <span class="font-medium text-gray-900" [class.text-primary]="isChecked(opt.value)">
                      {{ opt.label }}
                    </span>
                  </div>
                  @if (opt.description) {
                    <p class="text-gray-500 text-xs mt-0.5">{{ opt.description }}</p>
                  }
                </div>
              </div>
           }
           
           @if (filteredOptions().length === 0) {
              <div class="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                <svg class="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                No items found
              </div>
           }
        </div>
        
        <!-- Footer / Summary -->
        <div class="bg-gray-50 px-4 py-2 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
           <span>{{ selectionCount() }} selected</span>
           @if (selectionCount() > 0) {
             <button type="button" (click)="clearSelection()" class="text-primary hover:text-blue-700 font-medium transition-colors">Clear All</button>
           }
        </div>

      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class ListCheckboxComponent extends BaseDynamicControl implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private store = inject(FormStore, { optional: true });
  
  searchQuery = signal('');
  
  // Local signal to track Form Control value changes for the View
  currentValueSignal = signal<any[]>([]);
  
  // Props
  maxHeight = computed(() => this.field.props?.['maxHeight'] || '250px');
  maxChips = computed(() => this.field.props?.['maxChips'] || 5); 

  // Options Source
  fieldState = computed(() => {
    if (this.store) {
      return this.store.getFieldState(this.field.key)();
    }
    return { loading: false, options: this.field.options || [] };
  });

  allOptions = computed(() => this.fieldState().options);

  // Filtered List for View
  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const opts = this.allOptions();
    if (!query) return opts;
    return opts.filter(o => o.label.toLowerCase().includes(query));
  });

  // Derived View State
  selectionCount = computed(() => this.currentValueSignal().length);

  selectedOptionDetails = computed(() => {
    const selectedValues = this.currentValueSignal();
    const opts = this.allOptions();
    return opts.filter(o => selectedValues.includes(o.value));
  });

  visibleSelectedOptions = computed(() => {
    return this.selectedOptionDetails().slice(0, this.maxChips());
  });

  remainingCount = computed(() => {
    return Math.max(0, this.selectedOptionDetails().length - this.maxChips());
  });

  override ngOnInit() {
    super.ngOnInit(); // Initialize Control

    const ctrl = this.control();
    if (ctrl) {
      // Init Signal
      this.currentValueSignal.set(Array.isArray(ctrl.value) ? ctrl.value : []);

      // Subscribe to updates to keep UI signal in sync
      ctrl.valueChanges.subscribe(val => {
        this.currentValueSignal.set(Array.isArray(val) ? val : []);
      });
    }
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  isChecked(val: any): boolean {
    return this.currentValueSignal().includes(val);
  }

  toggleValue(val: any) {
    const ctrl = this.control();
    if (!ctrl) return;

    // Use raw control value for logic to ensure consistency
    const rawVal = ctrl.value;
    const current = Array.isArray(rawVal) ? rawVal : [];
    
    let newVal;
    if (current.includes(val)) {
      newVal = current.filter((v: any) => v !== val);
    } else {
      newVal = [...current, val];
    }
    
    ctrl.setValue(newVal);
    ctrl.markAsDirty();
    ctrl.markAsTouched();
    // The subscription in ngOnInit will update the signal/UI
  }

  removeValue(val: any, event: Event) {
    event.stopPropagation();
    this.toggleValue(val);
  }

  clearSelection() {
    this.control()?.setValue([]);
    this.control()?.markAsDirty();
  }

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }
}
