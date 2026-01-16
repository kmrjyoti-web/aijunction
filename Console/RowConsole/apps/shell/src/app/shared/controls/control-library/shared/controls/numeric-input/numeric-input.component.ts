
import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDynamicControl } from '../base-control';

@Component({
  selector: 'smart-numeric',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="containerClasses()" [style]="variableStyles()">
      <div class="relative group">
        
        <!-- Currency Symbol Prefix -->
        @if (currencySymbol()) {
          <div 
            [class]="ui.iconPrefixWrapper"
            class="flex items-center justify-center font-bold text-gray-500 text-sm">
            {{ currencySymbol() }}
          </div>
        }

        <input
          type="text"
          [id]="fieldSignal().key"
          [placeholder]="computedPlaceholder()"
          
          [value]="displayValue()"
          (input)="handleInput($event); onCommand('input', $event)"
          (blur)="onBlur(); onCommand('blur', $event)"
          (focus)="onFocus(); onCommand('focus', $event)"

          [class]="inputClasses() + ' ' + customClasses()"
          [style]="customStyles()"
          
          [class.border-danger]="hasError()"
          [class.focus:ring-danger]="hasError()"
          [class.focus:border-danger]="hasError()"
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

      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class NumericInputComponent extends BaseDynamicControl implements OnInit {
  displayValue = signal('');
  isFocused = signal(false);

  // Props
  currencySymbol = computed(() => this.fieldSignal().props?.['currency']);
  decimals = computed(() => {
    const d = this.fieldSignal().props?.['decimals'];
    return (d !== undefined && d !== null) ? d : 2;
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
    base += ' text-right font-mono'; // Default numeric styles

    if (this.currencySymbol()) base += ' pl-8'; // Handle prefix spacing manually if needed, or rely on ui.inputHasPrefix logic

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
    if (this.isFocused() || this.displayValue().length > 0) {
      return this.ui.floatingMode === 'IN' ? this.ui.activeIn : this.ui.activeOn;
    }
    return '';
  });

  shouldFloatLabel = computed(() => {
    if (this.floatLabel() === 'over' || this.floatLabel() === 'off') return true;
    return this.isFocused() || this.displayValue().length > 0;
  });

  labelClasses = computed(() => {
    const startClasses = [
      this.ui.label,
      this.sizeStyles().label,
      this.currencySymbol() ? this.ui.labelHasPrefix : '',
      'flex items-center gap-1 pointer-events-none'
    ].join(' ');

    if (this.floatLabel() === 'over' || this.floatLabel() === 'off') {
      return startClasses + ' ' + this.activeClasses();
    }

    const active = this.shouldFloatLabel() ? this.activeClasses() : 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-500';
    return startClasses + ' ' + active;
  });


  computedPlaceholder = computed(() => {
    return this.isFocused() ? '' : ' ';
  });

  override ngOnInit() {
    // Initial Sync
    const val = this.control()?.value;
    this.updateDisplay(val);

    // Watch for external updates
    this.control()?.valueChanges.subscribe(val => {
      if (!this.isFocused()) {
        this.updateDisplay(val);
      }
    });
  }

  handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const raw = input.value;

    // Allow typing, but keep track for display
    this.displayValue.set(raw);

    // Parse for Model
    // Remove commas, spaces
    const clean = raw.replace(/,/g, '').replace(/\s/g, '');

    // Handle empty
    if (clean === '') {
      this.control()?.setValue(null, { emitEvent: false });
      return;
    }

    // Check if it's a partial number (e.g. "-")
    if (clean === '-' || clean === '.') {
      // Don't set model yet, or set null
      return;
    }

    const num = parseFloat(clean);
    if (!isNaN(num)) {
      this.control()?.setValue(num, { emitEvent: false });
    }
  }

  onFocus() {
    this.isFocused.set(true);
    // Switch to raw number for editing
    const val = this.control()?.value;
    if (val !== null && val !== undefined) {
      this.displayValue.set(val.toString());
    } else {
      this.displayValue.set('');
    }
  }

  onBlur() {
    this.isFocused.set(false);
    this.updateDisplay(this.control()?.value);
  }

  private updateDisplay(val: any) {
    if (val === null || val === undefined || val === '') {
      this.displayValue.set('');
      return;
    }

    const num = Number(val);
    if (!isNaN(num)) {
      try {
        const fmt = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: this.decimals(),
          maximumFractionDigits: this.decimals(),
          useGrouping: true
        }).format(num);
        this.displayValue.set(fmt);
      } catch (e) {
        this.displayValue.set(val.toString());
      }
    } else {
      this.displayValue.set(val.toString());
    }
  }
}
