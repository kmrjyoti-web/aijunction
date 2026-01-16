
import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDynamicControl } from '../base-control';

@Component({
  selector: 'smart-slider',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container">
      
      <div class="flex justify-between items-center mb-1">
         <label class="text-sm font-medium text-gray-700">
            {{ field.label }}
            @if(field.validators?.required){ <span class="text-danger">*</span> }
         </label>
         <span class="text-sm font-bold text-primary">{{ control()?.value || minVal() }}</span>
      </div>

      <div class="relative flex items-center h-6">
        <!-- Track Background -->
        <div class="absolute w-full h-2 bg-gray-200 rounded-lg overflow-hidden">
           <!-- Active Fill -->
           <div 
             class="h-full bg-primary transition-all duration-100 ease-out"
             [style.width.%]="percentage()"
           ></div>
        </div>

        <input
          type="range"
          [id]="field.key"
          [formControl]="$any(control())"
          [min]="minVal()"
          [max]="maxVal()"
          [step]="step()"
          class="
            absolute w-full h-2 opacity-0 cursor-pointer z-10
          "
        />
        
        <!-- Custom Thumb (Visual only, follows percentage) -->
        <div 
            class="absolute h-5 w-5 bg-white border-2 border-primary rounded-full shadow pointer-events-none transition-all duration-100 ease-out"
            [style.left.%]="percentage()"
            style="transform: translateX(-50%);"
        ></div>
      </div>

      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>{{ minVal() }}</span>
        <span>{{ maxVal() }}</span>
      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class SliderComponent extends BaseDynamicControl {
  minVal = computed(() => this.field.validators?.min || 0);
  maxVal = computed(() => this.field.validators?.max || 100);
  step = computed(() => this.field.props?.['step'] || 1);

  percentage = computed(() => {
    const val = Number(this.control()?.value || this.minVal());
    const min = Number(this.minVal());
    const max = Number(this.maxVal());
    return ((val - min) * 100) / (max - min);
  });
}
