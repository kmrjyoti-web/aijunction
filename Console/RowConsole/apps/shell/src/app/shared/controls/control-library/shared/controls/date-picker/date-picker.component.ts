
import { Component, computed, signal, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';
import { StyleHelper } from '../../../helpers/style.helper';

@Component({
  selector: 'smart-date-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    input[type="date"]::-webkit-calendar-picker-indicator {
      display: none;
      -webkit-appearance: none;
    }
    input[type="date"].is-empty:not(:focus)::-webkit-datetime-edit {
      color: transparent;
    }
    input[type="date"].is-empty:not(:focus) {
      color: transparent; 
    }
    input[type="date"] {
      display: block;
      min-height: 2.5rem;
      align-items: center;
    }
  `],
  template: `
    <div [class]="containerClasses()" [style]="variableStyles()">
      
      <div class="relative group">
        
        @if (fieldSignal().prefixIcon) {
          <div 
            [class]="ui.iconPrefixWrapper"
            [innerHTML]="getSafeIcon(fieldSignal().prefixIcon)">
          </div>
        }

        <input
          #dateInput
          type="date"
          [id]="fieldSignal().key"
          [formControl]="$any(control())"
          placeholder=" "
          [min]="fieldSignal().validators?.min"
          [max]="fieldSignal().validators?.max"
          (focus)="onFocus(); onCommand('focus', $event)"
          (blur)="onBlur(); onCommand('blur', $event)"
          (input)="onCommand('input', $event)"
          (click)="onInputClick($event)"
          [class]="inputClasses() + ' ' + customClasses()"
          [style]="customStyles()"
          [class.is-empty]="!hasValue()"
        />

        <label
          [for]="fieldSignal().key"
          [class]="labelClasses()"
          [class.text-danger]="hasError()"
          [class.peer-focus:text-danger]="hasError()"
        >
          <span>{{ fieldSignal().label }}</span>
          @if(fieldSignal().validators?.required){ <span class="text-danger">*</span> }
        </label>

        <div 
          [class]="ui.iconSuffixWrapper"
          class="cursor-pointer hover:text-primary transition-colors z-10 right-3"
          [class.top-1]="isTiny()"
          (click)="onIconClick($event)"
          [innerHTML]="getSafeIcon(fieldSignal().suffixIcon || 'calendar')">
        </div>

      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class DatePickerComponent extends BaseDynamicControl {
  private sanitizer = inject(DomSanitizer);

  @ViewChild('dateInput') dateInputRef!: ElementRef<HTMLInputElement>;

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
    let base = [
      this.ui.input,
      this.fieldSignal().prefixIcon ? this.ui.inputHasPrefix : '',
      this.ui.inputHasSuffix, // Always has suffix (calendar icon)
      this.sizeStyles().input
    ].join(' ');

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
    // Override standard float logic for floating labels 'over'/'off' which are static
    if (this.floatLabel() === 'over' || this.floatLabel() === 'off') return true;
    return this.isFocused() || this.hasValue();
  });

  labelClasses = computed(() => {
    const startClasses = [
      this.ui.label,
      this.sizeStyles().label,
      this.fieldSignal().prefixIcon ? this.ui.labelHasPrefix : '',
      'flex items-center gap-1 transition-all duration-200 pointer-events-none'
    ].join(' ');

    // If 'over' or 'off', label is static
    if (this.floatLabel() === 'over' || this.floatLabel() === 'off') {
      return startClasses + ' ' + this.activeClasses();
    }

    // Dynamic floating
    const active = this.shouldFloatLabel() ? this.activeClasses() : this.ui.idle;
    return `${startClasses} ${active}`;
  });

  onFocus() {
    this.isFocused.set(true);
    this.triggerShowPicker();
  }

  onBlur() {
    this.isFocused.set(false);
  }

  onInputClick(event: MouseEvent) {
    this.triggerShowPicker();
  }

  onIconClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.triggerShowPicker();
  }

  private triggerShowPicker() {
    const input = this.dateInputRef?.nativeElement;
    if (input) {
      if (document.activeElement !== input) {
        input.focus();
      }
      if (typeof input.showPicker === 'function') {
        try { input.showPicker(); } catch (error) { }
      }
    }
  }

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }
}
