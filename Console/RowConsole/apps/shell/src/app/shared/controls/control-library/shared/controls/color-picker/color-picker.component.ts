
import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDynamicControl } from '../base-control';

@Component({
  selector: 'smart-color-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container">
      
      <div class="relative flex items-center gap-3">
        
        <!-- Color Swatch (Native Picker Overlay) -->
        <div [class]="ui.colorPreview" [style.background-color]="safeColor()">
          <!-- Native input covers the div and makes it clickable -->
          <input 
             type="color" 
             [value]="safeColor()" 
             (input)="onColorPickerChange($event)"
             class="absolute inset-0 opacity-0 w-full h-full cursor-pointer p-0 border-0" 
          />
        </div>

        <!-- Hex Text Input -->
        <div class="relative flex-grow group">
           <!-- Prefix Icon (#) -->
           <div [class]="ui.iconPrefixWrapper">
             <span class="text-sm font-bold text-gray-500">#</span>
           </div>

           <input
            type="text"
            [id]="field.key"
            [formControl]="$any(control())"
            placeholder=" "
            [class]="ui.input"
            [ngClass]="[
               ui.inputHasPrefix,
               sizeStyles().input
            ]"
            maxlength="7"
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
              ui.labelHasPrefix,
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

      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class ColorPickerComponent extends BaseDynamicControl {

  // Computed helper to get a safe hex color for the native picker
  // Native picker REQUIRES 6-digit hex (e.g. #ffffff). It breaks with shortcuts or empty strings.
  safeColor = computed(() => {
    const val = this.control()?.value;
    if (this.isValidHex(val)) {
      // Ensure it starts with #
      return val.startsWith('#') ? val : `#${val}`;
    }
    return '#000000'; // Fallback
  });

  activeClasses = computed(() => {
    // Always active if there's a value (to avoid label collision with placeholder logic, though color picker always has value usually)
    if (this.control()?.value) {
      return this.ui.floatingMode === 'IN' ? this.ui.activeIn : this.ui.activeOn;
    }
    // If empty (allowed?)
    return '';
  });

  onColorPickerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const color = input.value; // Returns #RRGGBB
    
    // Update the form control with the new hex
    this.control()?.setValue(color);
    this.control()?.markAsDirty();
  }

  private isValidHex(color: string): boolean {
    if (!color) return false;
    return /^#?([0-9A-F]{3}){1,2}$/i.test(color);
  }
}
