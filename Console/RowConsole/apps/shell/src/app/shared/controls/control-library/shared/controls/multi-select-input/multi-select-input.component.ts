
import { Component, computed, inject, signal, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDynamicControl } from '../base-control';
import { FormStore } from '../../../services/form.store';
import { StyleHelper } from '../../../helpers/style.helper';

@Component({
  selector: 'smart-multi-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="containerClasses()" #container [style]="variableStyles()">
      <div class="relative group">
        
        <!-- Trigger Button (Mimics Input) -->
        <button
          type="button"
          (click)="toggleDropdown()"
          [class]="inputClasses() + ' ' + customClasses()"
          [style]="customStyles()"
          (focus)="onCommand('focus', $event)"
          (blur)="onCommand('blur', $event)"
        >
          <span class="block truncate text-left" [class.text-gray-500]="!hasSelection()">
            {{ getDisplayLabel() }}
          </span>

          <!-- Chevron / Loading -->
          <span class="pointer-events-none flex items-center ml-2">
            @if (isLoading()) {
              <svg class="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            } @else {
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            }
          </span>
        </button>

        <!-- Floating Label -->
        <label
          [class]="labelClasses()"
          class="flex items-center gap-1 cursor-pointer"
          (click)="toggleDropdown()"
          [class.text-danger]="hasError()"
          [class.peer-focus:text-danger]="hasError()"
        >
          <span>{{ fieldSignal().label }}</span>
          @if(fieldSignal().validators?.required){ <span class="text-danger">*</span> }
        </label>

        <!-- Dropdown Menu -->
        @if (isOpen()) {
          <div 
             class="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm animate-fadeIn"
             [ngClass]="shape() === 'square' ? 'rounded-none' : 'rounded-md'"
          >
             @if (resolvedOptions().length === 0) {
               <div class="py-2 px-4 text-gray-500 italic">No options available</div>
             }
             
             @for (opt of resolvedOptions(); track opt.value) {
                <div 
                  (click)="toggleOption(opt.value)"
                  class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 flex items-center"
                >
                  <div class="flex items-center">
                    <!-- Checkbox Appearance -->
                    <div 
                      class="h-4 w-4 border rounded mr-3 flex items-center justify-center transition-colors"
                      [class.rounded-none]="shape() === 'square'"
                      [class.bg-primary]="isSelected(opt.value)"
                      [class.border-primary]="isSelected(opt.value)"
                      [class.border-gray-300]="!isSelected(opt.value)"
                    >
                      @if (isSelected(opt.value)) {
                        <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      }
                    </div>
                    <span class="block truncate font-normal" [class.font-semibold]="isSelected(opt.value)">
                      {{ opt.label }}
                    </span>
                  </div>
                </div>
             }
          </div>
          
          <!-- Invisible Backdrop -->
          <div class="fixed inset-0 z-40 bg-transparent" (click)="closeDropdown()"></div>
        }

      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class MultiSelectInputComponent extends BaseDynamicControl {
  private store = inject(FormStore, { optional: true });

  isOpen = signal(false);

  fieldState = computed(() => {
    if (this.store && this.group && this.group.get(this.fieldSignal().key)) {
      return this.store.getFieldState(this.fieldSignal().key)();
    }
    return { loading: false, options: this.fieldSignal().options || [] };
  });

  isLoading = computed(() => this.fieldState().loading);
  resolvedOptions = computed(() => this.fieldState().options);

  // --- Dynamic Styling Signals ---
  dt = computed(() => this.fieldSignal().props?.['dt']);

  variableStyles = computed(() => {
    const tokens = this.dt();
    if (!tokens) return {};
    return StyleHelper.generateCssVariables(tokens, 'p');
  });

  // --- New Props ---
  floatLabel = computed<'auto' | 'in' | 'on' | 'over' | 'off'>(() =>
    this.fieldSignal().props?.['floatLabel'] || 'auto'
  );

  shape = computed<'rounded' | 'square' | 'circle'>(() =>
    this.fieldSignal().props?.['shape'] || 'rounded'
  );

  isFluid = computed(() => !!this.fieldSignal().props?.['fluid']);
  isTiny = computed(() => this.fieldSignal().size === 'tiny');

  // --- Computed Classes ---
  containerClasses = computed(() => {
    let classes = this.ui.container;
    if (this.isFluid()) classes += ' w-full';
    if (this.floatLabel() === 'over') classes += ' mt-5';
    return classes;
  });

  inputClasses = computed(() => {
    let base = this.ui.input + ' ' + this.sizeStyles().input;
    base += ' text-left flex items-center justify-between cursor-pointer';

    // Shape overrides
    if (this.shape() === 'square') base = base.replace('rounded-lg', 'rounded-none');
    if (this.shape() === 'circle') base = base.replace('rounded-lg', 'rounded-full');

    return base;
  });

  activeClasses = computed(() => {
    const mode = this.floatLabel();
    if (mode === 'in') return this.ui.activeIn;
    if (mode === 'on') return this.ui.activeOn;
    if (mode === 'over') return '-top-6 left-0 text-gray-600 scale-100';
    if (mode === 'off') return '-top-6 left-0 text-gray-600 scale-100';

    // Default Auto behavior
    if (this.isOpen() || this.hasSelection()) {
      return this.ui.floatingMode === 'IN' ? this.ui.activeIn : this.ui.activeOn;
    }
    return '';
  });

  labelClasses = computed(() => {
    const startClasses = [
      this.ui.label,
      this.sizeStyles().label,
      'flex items-center gap-1 pointer-events-none'
    ].join(' ');

    if (this.floatLabel() === 'over' || this.floatLabel() === 'off') {
      // Force active state styling for static labels
      const staticActive = '-top-6 left-0 text-gray-600 scale-100';
      return startClasses + ' ' + staticActive;
    }

    const active = this.activeClasses();
    return startClasses + ' ' + active;
  });


  toggleDropdown() {
    if (this.isLoading()) return;
    this.isOpen.update(v => !v);
  }

  closeDropdown() {
    this.isOpen.set(false);
    this.control()?.markAsTouched();
  }

  isSelected(val: any): boolean {
    const current = this.control()?.value;
    return Array.isArray(current) && current.includes(val);
  }

  toggleOption(val: any) {
    const ctrl = this.control();
    if (!ctrl) return;

    const current: any[] = Array.isArray(ctrl.value) ? ctrl.value : [];

    let newValue;
    if (current.includes(val)) {
      newValue = current.filter(v => v !== val);
    } else {
      newValue = [...current, val];
    }

    ctrl.setValue(newValue);
    ctrl.markAsDirty();
  }

  hasSelection(): boolean {
    const val = this.control()?.value;
    return Array.isArray(val) && val.length > 0;
  }

  getDisplayLabel(): string {
    const val = this.control()?.value;
    if (!Array.isArray(val) || val.length === 0) {
      return ''; // Placeholder space handled by layout
    }

    if (val.length === 1) {
      const opt = this.resolvedOptions().find(o => o.value === val[0]);
      return opt ? opt.label : val[0];
    }

    return `${val.length} items selected`;
  }
}
