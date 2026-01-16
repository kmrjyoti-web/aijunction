
import { Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDynamicControl } from '../base-control';
import { FormStore } from '../../../services/form.store';
import { Option } from '../../../models/form-schema.model';
import { StyleHelper } from '../../../helpers/style.helper';

@Component({
  selector: 'smart-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="containerClasses()" [style]="variableStyles()">
      <div class="relative group">
        
        <!-- Input -->
        <input
          type="text"
          [id]="fieldSignal().key"
          [placeholder]="' '"
          
          [value]="displayValue()"
          (input)="onInput($event); onCommand('input', $event)"
          (focus)="onFocus(); onCommand('focus', $event)"
          (blur)="onBlur(); onCommand('blur', $event)"
          
          [class]="inputClasses() + ' ' + customClasses()"
          [style]="customStyles()"
          
          [class.border-danger]="hasError()"
          [class.focus:ring-danger]="hasError()"
          [class.focus:border-danger]="hasError()"
          autocomplete="off"
        />

        <!-- Floating Label -->
        <label
          [for]="fieldSignal().key"
          [class]="labelClasses()"
          [class.text-danger]="hasError()"
          [class.peer-focus:text-danger]="hasError()"
        >
          <span>{{ fieldSignal().label }}</span>
          @if(fieldSignal().validators?.required){ <span class="text-danger">*</span> }
        </label>

        <!-- Loading / Chevron Indicator -->
        <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-400">
           @if (isLoading()) {
              <svg class="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
           } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
           }
        </div>

        <!-- Dropdown Options -->
        @if (isOpen()) {
          <ul class="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm animate-fadeIn">
            @if (filteredOptions().length === 0) {
               <li class="py-2 px-4 text-gray-500 italic">No matches found</li>
            }

            @for (opt of filteredOptions(); track opt.value) {
              <li 
                (mousedown)="selectOption(opt)"
                class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900"
                [class.bg-blue-50]="isSelected(opt.value)"
                [class.text-primary]="isSelected(opt.value)"
                [class.font-medium]="isSelected(opt.value)"
              >
                <div class="flex items-center">
                   @if (opt.icon) {
                     <!-- Icon rendering simplified for brevity, assume text only for most autocomplete -->
                   }
                   <span class="block truncate">{{ opt.label }}</span>
                </div>

                @if (isSelected(opt.value)) {
                  <span class="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </span>
                }
              </li>
            }
          </ul>
        }

      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `,
  styles: [`
    .animate-fadeIn { animation: fadeIn 0.1s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AutocompleteComponent extends BaseDynamicControl {
  private store = inject(FormStore, { optional: true });

  // State
  fieldState = computed(() => {
    if (this.store && this.group && this.group.get(this.fieldSignal().key)) {
      return this.store.getFieldState(this.fieldSignal().key)();
    }
    return { loading: false, options: this.fieldSignal().options || [] };
  });

  isLoading = computed(() => this.fieldState().loading);
  allOptions = computed(() => this.fieldState().options);

  // UI State
  isOpen = signal(false);
  displayValue = signal('');
  isFocused = signal(false);

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
    if (this.isLoading()) base += ' pr-10';

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
    return this.ui.floatingMode === 'IN' ? this.ui.activeIn : this.ui.activeOn;
  });

  shouldFloatLabel = computed(() => {
    if (this.floatLabel() === 'over' || this.floatLabel() === 'off') return true;
    return this.isFocused() || !!this.displayValue();
  });

  labelClasses = computed(() => {
    const startClasses = [
      this.ui.label,
      this.sizeStyles().label,
      'flex items-center gap-1 pointer-events-none'
    ].join(' ');

    if (this.floatLabel() === 'over' || this.floatLabel() === 'off') {
      return startClasses + ' ' + this.activeClasses();
    }

    const active = this.shouldFloatLabel() ? this.activeClasses() : 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-500';
    return startClasses + ' ' + active;
  });

  // Derived
  filteredOptions = computed(() => {
    const query = this.displayValue().toLowerCase();
    const all = this.allOptions();
    if (!query) return all;
    return all.filter(opt => opt.label.toLowerCase().includes(query));
  });

  constructor() {
    super();
    // Sync Display Value
    effect(() => {
      const val = this.control()?.value;
      const opts = this.allOptions();

      const match = opts.find(o => o.value === val);
      if (match) {
        if (!this.isFocused()) {
          this.displayValue.set(match.label);
        }
      } else if (!val) {
        if (!this.isFocused()) {
          this.displayValue.set('');
        }
      }
    }, { allowSignalWrites: true });
  }

  onFocus() {
    this.isFocused.set(true);
    this.isOpen.set(true);
  }

  onBlur() {
    this.isFocused.set(false);
    this.isOpen.set(false);

    // Strict Mode: Check match
    const currentText = this.displayValue();
    const match = this.allOptions().find(o => o.label.toLowerCase() === currentText.toLowerCase());

    if (match) {
      this.control()?.setValue(match.value);
      this.displayValue.set(match.label);
    } else {
      this.control()?.setValue(null);
      this.displayValue.set('');
    }
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.displayValue.set(input.value);
    this.isOpen.set(true);

    if (input.value === '') {
      this.control()?.setValue(null);
    }
  }

  selectOption(option: Option) {
    this.control()?.setValue(option.value);
    this.displayValue.set(option.label);
    this.isOpen.set(false);
    this.control()?.markAsDirty();
  }

  isSelected(val: any) {
    return this.control()?.value === val;
  }
}
