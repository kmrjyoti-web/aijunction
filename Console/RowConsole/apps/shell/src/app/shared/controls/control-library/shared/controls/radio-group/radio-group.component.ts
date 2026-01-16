
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';

@Component({
  selector: 'smart-radio-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-5">
      <label class="block text-sm font-medium text-gray-700 mb-3">
        {{ field.label }}
        @if(field.validators?.required){ <span class="text-danger">*</span> }
      </label>

      <div 
        [class]="ui.optionGroupContainer"
        [class.grid-cols-1]="!cols()"
        [class.grid-cols-2]="cols() === 2"
        [class.grid-cols-3]="cols() === 3"
        [class.grid-cols-4]="cols() >= 4"
        [class.md:grid-cols-2]="!cols()"
      >
        @for (opt of field.options; track opt.value) {
          <label 
            [class]="ui.optionCard"
            [ngClass]="[
              isSelected(opt.value) ? ui.optionCardSelected : '',
              ui.optionCardHover
            ]"
          >
            <input 
              type="radio" 
              [formControl]="$any(control())" 
              [value]="opt.value" 
              class="sr-only" 
            />
            
            @if (opt.icon) {
              <div [class]="ui.optionIcon" [class.text-primary]="isSelected(opt.value)">
                 <div [innerHTML]="getSafeIcon(opt.icon)"></div>
              </div>
            }

            @if (opt.image) {
              <img [src]="opt.image" alt="" [class]="ui.optionImage" />
            }

            <span [class]="ui.optionContent">
              <span [class]="ui.optionLabel" [class.text-primary]="isSelected(opt.value)">
                {{ opt.label }}
              </span>
              @if (opt.description) {
                <span [class]="ui.optionDescription">{{ opt.description }}</span>
              }
            </span>

            @if (isSelected(opt.value)) {
              <div class="absolute top-4 right-4 text-primary">
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            }
          </label>
        }
      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class RadioGroupComponent extends BaseDynamicControl {
  private sanitizer = inject(DomSanitizer);
  cols = computed(() => this.field.props?.['cols']);

  isSelected(val: any): boolean {
    return this.control()?.value === val;
  }

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }
}
