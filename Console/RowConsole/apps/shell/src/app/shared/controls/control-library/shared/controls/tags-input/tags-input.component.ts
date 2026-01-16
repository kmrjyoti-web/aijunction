
import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDynamicControl } from '../base-control';

@Component({
  selector: 'smart-tags',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container">
      
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ field.label }}
        @if(field.validators?.required){ <span class="text-danger">*</span> }
      </label>

      <div 
        class="
          w-full rounded-lg border border-gray-300 bg-white
          focus-within:border-primary focus-within:ring-1 focus-within:ring-primary
          flex flex-wrap gap-2 items-center transition-all
        "
        [class]="containerStyles()"
        [class.border-danger]="hasError()"
        [class.focus-within:border-danger]="hasError()"
        [class.focus-within:ring-danger]="hasError()"
        (click)="inputRef.focus()"
      >
        <!-- Chips -->
        @for (tag of tags(); track $index) {
          <span class="inline-flex items-center gap-1 py-0.5 px-2 rounded-md font-medium bg-blue-50 text-blue-700 border border-blue-100 animate-fadeIn text-sm">
            {{ tag }}
            <button 
              type="button" 
              (click)="removeTag($index, $event)"
              class="hover:text-blue-900 focus:outline-none rounded-full p-0.5 hover:bg-blue-200 transition-colors"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </span>
        }

        <!-- Input -->
        <input
          #inputRef
          type="text"
          [placeholder]="tags().length === 0 ? (field.placeholder || 'Type and press Enter') : ''"
          class="flex-1 outline-none border-none bg-transparent min-w-[120px] p-0"
          [ngClass]="sizeStyles().input.replace('w-full', '')"
          style="height: auto; box-shadow: none;"
          (keydown.enter)="addTag($event)"
          (keydown.backspace)="handleBackspace($event)"
        />

      </div>
      
      <p class="mt-1 text-xs text-gray-500">Press <strong>Enter</strong> to add a tag.</p>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `,
  styles: [`
    .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class TagsInputComponent extends BaseDynamicControl {

  tags = computed(() => {
    const val = this.control()?.value;
    return Array.isArray(val) ? val : [];
  });

  // Map sizes to min-heights since tags can grow vertically
  containerStyles = computed(() => {
    const base = 'px-2 py-1.5';
    const size = this.field.size || 'medium';
    let minHeight = 'min-h-[3rem]'; // medium (12)
    
    switch (size) {
      case 'large': minHeight = 'min-h-[3.5rem]'; break; // 14
      case 'small': minHeight = 'min-h-[2.5rem]'; break; // 10
      case 'xsmall': minHeight = 'min-h-[2rem]'; break; // 8
      case 'tiny': minHeight = 'min-h-[1.5rem]'; break; // 6
    }

    return `${base} ${minHeight}`;
  });

  addTag(event: Event) {
    event.preventDefault(); // Prevent form submit
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    if (value) {
      const current = this.tags();
      // Prevent duplicates if desired (optional)
      if (!current.includes(value)) {
        const newVal = [...current, value];
        this.control()?.setValue(newVal);
        this.control()?.markAsDirty();
      }
      input.value = '';
    }
  }

  removeTag(index: number, event: Event) {
    event.stopPropagation();
    const current = this.tags();
    const newVal = current.filter((_, i) => i !== index);
    this.control()?.setValue(newVal);
    this.control()?.markAsDirty();
  }

  handleBackspace(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '' && this.tags().length > 0) {
      this.removeTag(this.tags().length - 1, event);
    }
  }
}
