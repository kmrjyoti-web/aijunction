
import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDynamicControl } from '../base-control';

@Component({
  selector: 'smart-currency',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" [class]="ui.container">
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
          [id]="field.key"
          [placeholder]="computedPlaceholder()"
          
          [value]="displayValue()"
          (input)="handleInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"

          [class]="ui.input"
          class="text-right font-mono"
          [ngClass]="[
             currencySymbol() ? ui.inputHasPrefix : '',
             sizeStyles().input
          ]"
          [class.border-danger]="hasError()"
          [class.focus:ring-danger]="hasError()"
          [class.focus:border-danger]="hasError()"
        />

        <!-- Floating Label -->
        <label
          [for]="field.key"
          [class]="ui.label"
          [ngClass]="[
            activeClasses(),
            currencySymbol() ? ui.labelHasPrefix : '',
            sizeStyles().label
          ]"
          class="peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-500 peer-focus:translate-y-0 flex items-center gap-1"
          [class.peer-focus:-top-2.5]="ui.floatingMode === 'ON'"
          [class.peer-focus:top-1]="ui.floatingMode === 'IN'"
          [class.text-danger]="hasError()"
          [class.peer-focus:text-danger]="hasError()"
        >
          <span>{{ field.label }}</span>
          
          @if(field.validators?.required){ <span class="text-danger">*</span> }

        </label>

      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class CurrencyInputComponent extends BaseDynamicControl implements OnInit {
  displayValue = signal('');
  isFocused = signal(false);

  // Props
  currencySymbol = computed(() => this.field.props?.['currency']);
  decimals = computed(() => {
    const d = this.field.props?.['decimals'];
    return (d !== undefined && d !== null) ? d : 2;
  });

  computedPlaceholder = computed(() => {
    return this.isFocused() ? '' : ' '; 
  });

  activeClasses = computed(() => {
    if (this.isFocused() || this.displayValue().length > 0) {
      return this.ui.floatingMode === 'IN' ? this.ui.activeIn : this.ui.activeOn;
    }
    return '';
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
