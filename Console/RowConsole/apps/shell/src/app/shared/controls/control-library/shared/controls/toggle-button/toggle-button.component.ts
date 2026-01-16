
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';

@Component({
  selector: 'smart-toggle-button',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" [class]="ui.container">
      
      <!-- Button Control -->
      <button
        type="button"
        (click)="toggle()"
        [id]="field.key"
        class="
          flex items-center justify-center gap-2 w-full
          rounded-lg border transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary
        "
        [ngClass]="[
          sizeStyles().button,
          isActive() 
            ? 'bg-primary border-primary text-white shadow-md' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900',
          hasError() ? 'ring-2 ring-danger border-danger' : ''
        ]"
      >
        <!-- Icon -->
        @if (field.prefixIcon) {
          <div [innerHTML]="getSafeIcon(field.prefixIcon)" [class]="sizeStyles().icon"></div>
        }

        <span class="font-medium">{{ field.label }}</span>

        <!-- Checkmark if active -->
        @if (isActive()) {
           <svg [class]="sizeStyles().icon" class="opacity-90 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
           </svg>
        }
      </button>

      <!-- Label / Description (Optional below button if needed, but label is inside button usually) -->
      @if (field.props?.['description']) {
        <p class="mt-1 text-xs text-gray-500 text-center">{{ field.props?.['description'] }}</p>
      }

      @if (hasError()) {
        <div [class]="ui.error" class="text-center">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class ToggleButtonComponent extends BaseDynamicControl {
  private sanitizer = inject(DomSanitizer);

  isActive = computed(() => !!this.control()?.value);

  toggle() {
    const val = !this.isActive();
    this.control()?.setValue(val);
    this.control()?.markAsTouched();
    this.control()?.markAsDirty();
  }

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }
}
