
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';

@Component({
  selector: 'smart-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container">
      
      <!-- Standard Checkbox Layout -->
      @if (!isRichLayout()) {
        <div [class]="ui.checkboxWrapper">
            <div class="relative flex items-center">
              <input 
                type="checkbox" 
                [id]="field.key" 
                [formControl]="$any(control())"
                [class]="ui.checkboxInput"
                [ngClass]="sizeStyles().checkbox"
              />
               <svg class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <label 
              [for]="field.key" 
              [class]="ui.checkboxLabel" 
              [ngClass]="sizeStyles().checkboxLabel"
              class="flex items-center gap-1"
            >
              <span>{{ field.placeholder || field.label }}</span>
              @if(field.validators?.required){ <span class="text-danger">*</span> }
            </label>
        </div>
      } 
      <!-- Rich Checkbox Layout -->
      @else {
        <label 
          [class]="ui.optionCard" 
          class="flex items-center p-3"
          [ngClass]="[
             isChecked() ? ui.optionCardSelected : '',
             ui.optionCardHover
          ]"
        >
          <input 
            type="checkbox" 
            [formControl]="$any(control())" 
            class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-3"
          />
          @if (icon()) {
             <div class="mr-3 text-gray-500" [class.text-primary]="isChecked()">
               <div [innerHTML]="getSafeIcon(icon())"></div>
             </div>
          }
          @if (image()) {
            <img [src]="image()" class="w-10 h-10 rounded object-cover mr-3" alt="" />
          }
          <div class="flex flex-col">
            <span class="font-medium text-gray-900" [class.text-primary]="isChecked()">{{ field.label }}</span>
            @if (field.props?.['description']) {
              <span class="text-xs text-gray-500">{{ field.props?.['description'] }}</span>
            }
          </div>
        </label>
      }
      
      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class CheckboxInputComponent extends BaseDynamicControl {
  private sanitizer = inject(DomSanitizer);

  icon = computed<IconName | undefined>(() => this.field.props?.['icon']);
  image = computed<string | undefined>(() => this.field.props?.['image']);
  isRichLayout = computed(() => !!(this.icon() || this.image()));

  isChecked() {
    return this.control()?.value === true;
  }

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }
}
