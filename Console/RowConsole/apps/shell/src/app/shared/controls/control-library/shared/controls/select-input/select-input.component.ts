
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { FormStore } from '../../../services/form.store';
import { IconHelper, IconName } from '../../../helpers/icon.helper';
import { StyleHelper } from '../../../helpers/style.helper';

@Component({
  selector: 'smart-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="containerClasses()" [style]="variableStyles()">
      <div class="relative group">
        <select
          [id]="fieldSignal().key"
          [formControl]="$any(control())"
          [class]="inputClasses() + ' ' + customClasses()"
          [style]="customStyles()"
          (change)="onCommand('change', $event)"
          (focus)="onCommand('focus', $event)"
          (blur)="onCommand('blur', $event)"
          class="appearance-none bg-transparent w-full"
        >
          <option value="" disabled selected></option>
          @for (opt of resolvedOptions(); track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
        
        <!-- Loading & Chevron -->
        <div 
          [class]="ui.selectIconWrapper"
          [ngClass]="sizeStyles().selectIcon"
          [class.top-1]="isTiny()"
        >
          @if (isLoading()) {
            <svg class="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          }
          <div class="w-4 h-4 text-gray-400" [innerHTML]="getSafeIcon('chevronRight')"></div>
        </div>

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
export class SelectInputComponent extends BaseDynamicControl {
  private store = inject(FormStore, { optional: true });
  private sanitizer = inject(DomSanitizer);

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

  labelClasses = computed(() => {
    const startClasses = [
      this.ui.label,
      this.activeClasses(),
      this.sizeStyles().label,
      'flex items-center gap-1 pointer-events-none'
    ].join(' ');

    if (this.floatLabel() === 'over' || this.floatLabel() === 'off') {
      return startClasses;
    }

    return startClasses + ' ' + (this.hasValue() ? '' : 'top-1/2 -translate-y-1/2 scale-100 text-gray-500');
  });

  getSafeIcon(name: IconName): SafeHtml {
    // Chevron right is rotated 90deg usually for select, but IconHelper has chevronRight. 
    // We might need a generic 'chevronDown' or rotate 'chevronRight'.
    // For now using chevronRight and rotating it if needed via class, or just accept.
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }
}
