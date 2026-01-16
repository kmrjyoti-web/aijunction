
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';

@Component({
  selector: 'smart-checkbox-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" [class]="ui.container">
      @if (field.label) {
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ field.label }}
          @if(field.validators?.required){ <span class="text-danger">*</span> }
        </label>
      }

      <!-- List Variant (Scrollable List Box) -->
      @if (isListVariant()) {
        <div 
          class="border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col w-full"
          [style.max-height]="maxHeight()"
          [class.overflow-y-auto]="!!maxHeight()"
        >
           @for (opt of field.options; track opt.value; let last = $last) {
              <div 
                (click)="toggleValue(opt.value)"
                class="flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors border-gray-100"
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
           
           @if (!field.options || field.options.length === 0) {
              <div class="p-4 text-center text-gray-500 text-sm italic">
                No items available
              </div>
           }
        </div>
      } 
      <!-- Grid/Card Variant (Default) -->
      @else {
        <div 
          [class]="ui.optionGroupContainer"
          [class.grid-cols-1]="!cols()"
          [class.grid-cols-2]="cols() === 2"
          [class.grid-cols-3]="cols() === 3"
          [class.grid-cols-4]="cols() >= 4"
          [class.md:grid-cols-2]="!cols()"
        >
          @for (opt of field.options; track opt.value) {
            <div 
              (click)="toggleValue(opt.value)"
              [class]="ui.optionCard"
              [ngClass]="[
                isChecked(opt.value) ? ui.optionCardSelected : '',
                ui.optionCardHover
              ]"
            >
              <!-- Visible Checkbox (Optional, but good for UX) -->
              <div class="flex h-5 items-center">
                <input
                  type="checkbox"
                  [checked]="isChecked(opt.value)"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  readonly 
                  onclick="return false;" 
                />
              </div>

              <!-- Icon Variation -->
              @if (opt.icon) {
                <div [class]="ui.optionIcon" class="ml-3" [class.text-primary]="isChecked(opt.value)">
                   <div [innerHTML]="getSafeIcon(opt.icon)"></div>
                </div>
              }

              <!-- Image Variation -->
              @if (opt.image) {
                <img [src]="opt.image" alt="" [class]="ui.optionImage" class="ml-3" />
              }

              <!-- Content -->
              <div [class]="ui.optionContent" class="ml-3">
                <span [class]="ui.optionLabel" [class.text-primary]="isChecked(opt.value)">
                  {{ opt.label }}
                </span>
                @if (opt.description) {
                  <span [class]="ui.optionDescription">{{ opt.description }}</span>
                }
              </div>
            </div>
          }
        </div>
      }

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class CheckboxGroupComponent extends BaseDynamicControl {
  private sanitizer = inject(DomSanitizer);
  
  cols = computed(() => this.field.props?.['cols']);
  isListVariant = computed(() => this.field.props?.['variant'] === 'list');
  maxHeight = computed(() => this.field.props?.['maxHeight'] || '250px');

  isChecked(val: any): boolean {
    const current = this.control()?.value;
    return Array.isArray(current) && current.includes(val);
  }

  toggleValue(val: any) {
    const ctrl = this.control();
    if (!ctrl) return;

    const current: any[] = Array.isArray(ctrl.value) ? ctrl.value : [];
    
    if (current.includes(val)) {
      // Remove
      ctrl.setValue(current.filter(v => v !== val));
    } else {
      // Add
      ctrl.setValue([...current, val]);
    }
    ctrl.markAsDirty();
    ctrl.markAsTouched();
  }

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }
}
