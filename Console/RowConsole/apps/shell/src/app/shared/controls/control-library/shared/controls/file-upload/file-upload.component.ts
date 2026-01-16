
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDynamicControl } from '../base-control';

@Component({
  selector: 'smart-file-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container">
      
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ field.label }}
        @if(field.validators?.required){ <span class="text-danger">*</span> }
      </label>

      <!-- Dropzone -->
      <div 
        [id]="field.key"
        tabindex="0"
        (keydown.enter)="fileInput.click()"
        (keydown.space)="fileInput.click(); $event.preventDefault()"
        class="focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        [class]="ui.fileUploadDropzone"
        [class.border-danger]="hasError()"
        [class.border-primary]="isDragOver()"
        [class.bg-blue-50]="isDragOver()"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <input 
          #fileInput 
          type="file" 
          class="hidden" 
          (change)="onFileSelected($event)" 
          [accept]="field.props?.['accept'] || '*'"
        />

        @if (previewUrl()) {
          <div class="relative group">
            <!-- Image Preview -->
            @if (isImage()) {
              <img [src]="previewUrl()" [class]="ui.fileUploadPreview" />
            } @else {
              <!-- Generic File Icon -->
              <div class="flex flex-col items-center justify-center py-8">
                 <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                 <span class="mt-2 text-sm text-gray-600 font-medium truncate max-w-[200px]">{{ fileName() }}</span>
              </div>
            }

            <!-- Remove Button Overlay -->
            <button 
              type="button" 
              (click)="removeFile($event)"
              class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
              title="Remove file"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        } @else {
          <!-- Empty State -->
          <div class="flex flex-col items-center justify-center py-4 text-gray-500">
            <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-sm font-medium">Click to upload or drag and drop</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ field.props?.['accept'] ? 'Accepts: ' + field.props?.['accept'] : 'Any file' }} 
              (Max {{ field.props?.['maxSize'] || '5MB' }})
            </p>
          </div>
        }

      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class FileUploadComponent extends BaseDynamicControl {
  isDragOver = signal(false);
  previewUrl = signal<string | null>(null);
  fileName = signal<string>('');
  
  isImage = computed(() => {
    const url = this.previewUrl();
    if (!url) return false;
    return url.startsWith('data:image');
  });

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    this.fileName.set(file.name);
    
    // Read file as Data URL for preview and value
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.previewUrl.set(result);
      
      // Update Control Value
      this.control()?.setValue({
        name: file.name,
        size: file.size,
        type: file.type,
        data: result
      });
      this.control()?.markAsDirty();
    };
    reader.readAsDataURL(file);
  }

  removeFile(event: Event) {
    event.stopPropagation();
    this.previewUrl.set(null);
    this.fileName.set('');
    this.control()?.setValue(null);
  }
}
