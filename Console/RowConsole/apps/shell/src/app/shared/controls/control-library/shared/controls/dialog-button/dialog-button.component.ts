
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { IconHelper, IconName } from '../../../helpers/icon.helper';
import { DialogType } from '../../../models/confirm-dialog.model';

@Component({
  selector: 'smart-dialog-button',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container">
      
      <!-- Optional Label (if separate from button text) -->
      @if (field.label && field.label !== field.placeholder) {
        <label class="block text-sm font-medium text-gray-700 mb-2">
           {{ field.label }}
        </label>
      }

      <button 
        type="button" 
        (click)="openDialog()"
        [class]="ui.actionButton"
        [ngClass]="[
          sizeStyles().button,
          colorClasses(),
          isFullWidth() ? 'w-full' : 'w-auto'
        ]"
      >
         <!-- Image Avatar -->
         @if (image()) {
           <img [src]="image()" class="rounded-full object-cover border border-white/20 mr-2" [class]="sizeStyles().icon" />
         }

         <!-- Prefix Icon -->
         @if (field.prefixIcon) {
            <div [innerHTML]="getSafeIcon(field.prefixIcon)" [class]="sizeStyles().icon"></div>
         }

         <!-- Button Text -->
         @if (field.placeholder) {
           <span>{{ field.placeholder }}</span>
         }

         <!-- Suffix Icon -->
         @if (field.suffixIcon) {
            <div [innerHTML]="getSafeIcon(field.suffixIcon)" [class]="sizeStyles().icon"></div>
         }
      </button>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class DialogButtonComponent extends BaseDynamicControl {
  private dialogService = inject(ConfirmDialogService);
  private sanitizer = inject(DomSanitizer);

  // Props
  variant = computed(() => this.field.props?.['variant'] || 'primary');
  image = computed(() => this.field.props?.['image']);
  isFullWidth = computed(() => this.field.props?.['fullWidth'] !== false); // Default true

  // Dialog Configuration
  dialogTitle = computed(() => this.field.props?.['dialogTitle'] || 'Confirm Action');
  dialogMessage = computed(() => this.field.props?.['dialogMessage'] || 'Are you sure you want to proceed?');
  dialogType = computed<DialogType>(() => this.field.props?.['dialogType'] || 'info');
  confirmText = computed(() => this.field.props?.['confirmText'] || 'Confirm');
  cancelText = computed(() => this.field.props?.['cancelText'] || 'Cancel');

  async openDialog() {
    const isAlert = this.field.type === 'alert-dialog';
    
    const result = await this.dialogService.confirm({
      title: this.dialogTitle(),
      message: this.dialogMessage(),
      type: this.dialogType(),
      confirmText: this.confirmText(),
      cancelText: this.cancelText(),
      showCancel: !isAlert // Hide cancel for alerts
    });

    if (result) {
      // If used as a control, we can set the value to true when confirmed
      this.control()?.setValue(true);
      this.control()?.markAsDirty();
      console.log(`[DialogButton] ${this.field.key} confirmed.`);
    } else {
      console.log(`[DialogButton] ${this.field.key} cancelled.`);
    }
  }

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }

  // --- Styling (Shares standard button styles from BaseDynamicControl > sizeStyles()) ---

  colorClasses = computed(() => {
    // Override default variant if dialog type is danger
    if (!this.field.props?.['variant'] && this.dialogType() === 'danger') {
      return 'bg-red-600 border border-red-600 text-white hover:bg-red-700 focus:ring-red-200';
    }

    switch (this.variant()) {
      case 'secondary': 
        return 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200';
      case 'outline': 
        return 'bg-transparent border border-primary text-primary hover:bg-blue-50 focus:ring-primary';
      case 'ghost': 
        return 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-200 shadow-none';
      case 'danger': 
        return 'bg-red-600 text-white border border-red-600 hover:bg-red-700 focus:ring-red-200';
      case 'link': 
        return 'bg-transparent text-primary hover:underline shadow-none p-0 h-auto justify-start';
      case 'primary':
      default: 
        return 'bg-primary border border-primary text-white hover:bg-blue-600 focus:ring-primary';
    }
  });
}
