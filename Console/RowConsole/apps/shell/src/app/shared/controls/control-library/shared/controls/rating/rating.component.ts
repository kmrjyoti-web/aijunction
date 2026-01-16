
import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';

@Component({
  selector: 'smart-rating',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ field.label }}
        @if(field.validators?.required){ <span class="text-danger">*</span> }
      </label>
      
      <div class="flex items-center gap-1" (mouseleave)="hoverValue.set(0)">
        @for (star of stars(); track star) {
          <button
            type="button"
            (click)="setValue(star)"
            (mouseenter)="hoverValue.set(star)"
            class="focus:outline-none transition-transform active:scale-95"
            [class.text-yellow-400]="isFilled(star)"
            [class.text-gray-300]="!isFilled(star)"
            [title]="star + ' stars'"
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
              <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
            </svg>
          </button>
        }
        
        @if (currentValue() > 0) {
          <span class="ml-2 text-sm font-medium text-gray-600 min-w-[3rem]">
            {{ hoverValue() > 0 ? hoverValue() : currentValue() }} / {{ maxStars() }}
          </span>
        }
      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class RatingComponent extends BaseDynamicControl {
  hoverValue = signal(0);
  
  maxStars = computed(() => this.field.props?.['max'] || 5);
  
  stars = computed(() => {
    return Array.from({ length: this.maxStars() }, (_, i) => i + 1);
  });

  currentValue = computed(() => this.control()?.value || 0);

  isFilled(star: number) {
    const target = this.hoverValue() || this.currentValue();
    return star <= target;
  }

  setValue(val: number) {
    this.control()?.setValue(val);
    this.control()?.markAsDirty();
  }
}
