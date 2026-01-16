
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';

@Component({
  selector: 'smart-segment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container">
      
      <!-- Label -->
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ field.label }}
        @if(field.validators?.required){ <span class="text-danger">*</span> }
      </label>

      <!-- Segment Container -->
      <div [class]="ui.segmentContainer">
        @for (opt of field.options; track opt.value) {
          <button
            type="button"
            (click)="selectOption(opt.value)"
            [class]="ui.segmentButton"
            [ngClass]="[
              sizeStyles().button,
              isSelected(opt.value) ? ui.segmentButtonActive : ui.segmentButtonIdle
            ]"
          >
            <!-- Image (if any) -->
            @if (opt.image) {
              <img 
                [src]="opt.image" 
                class="rounded-full object-cover" 
                [class]="sizeStyles().icon"
                [class.ring-2]="isSelected(opt.value)"
                [class.ring-offset-1]="isSelected(opt.value)"
                [class.ring-primary]="isSelected(opt.value)"
              />
            }

            <!-- Icon (if any) -->
            @if (opt.icon) {
               <div 
                 [innerHTML]="getSafeIcon(opt.icon)" 
                 [class]="sizeStyles().icon"
                 [class.text-primary]="isSelected(opt.value)"
                 [class.text-gray-400]="!isSelected(opt.value)"
               ></div>
            }

            <!-- Text -->
            <span class="truncate">{{ opt.label }}</span>
          </button>
        }
      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class SegmentedControlComponent extends BaseDynamicControl {
  private sanitizer = inject(DomSanitizer);

  isSelected(val: any): boolean {
    return this.control()?.value === val;
  }

  selectOption(val: any) {
    this.control()?.setValue(val);
    this.control()?.markAsDirty();
  }

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }
}
