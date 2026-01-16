
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';
import { Option } from '../../../models/form-schema.model';

@Component({
  selector: 'smart-button',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" [class]="ui.container">
      
      <!-- Optional Label (Rarely used for buttons but supported) -->
      @if (field.label && field.label !== field.placeholder) {
        <label class="block text-sm font-medium text-gray-700 mb-2">
           {{ field.label }}
        </label>
      }

      @switch (buttonType()) {
        
        <!-- CASE 1: BUTTON GROUP (Toolbar/Radio) -->
        @case ('group') {
          <div [class]="ui.buttonGroup">
            @for (opt of buttonOptions(); track opt.value) {
              <button
                type="button"
                (click)="onGroupClick(opt, $event)"
                [class]="ui.buttonGroupItem"
                [class.bg-blue-50]="isActive(opt.value)"
                [class.text-primary]="isActive(opt.value)"
                [class.z-20]="isActive(opt.value)"
                [title]="opt.label"
              >
                <!-- Icon -->
                @if (opt.icon) {
                  <div [innerHTML]="getSafeIcon(opt.icon)" [class]="sizeStyles().icon" [class.mr-2]="!!opt.label"></div>
                }
                <!-- Label -->
                <span>{{ opt.label }}</span>
              </button>
            }
          </div>
        }

        <!-- CASE 2: SPLIT BUTTON -->
        @case ('split') {
           <div [class]="ui.splitButtonContainer">
              
              <!-- Main Action -->
              <button 
                type="button" 
                (click)="onClick($event)"
                [class]="ui.splitButtonMain"
                [ngClass]="[
                  colorClasses(),
                  sizeStyles().button,
                  'pr-2'
                ]"
              >
                 @if (field.prefixIcon) {
                    <div [innerHTML]="getSafeIcon(field.prefixIcon)" [class]="sizeStyles().icon" class="mr-2"></div>
                 }
                 <span>{{ field.placeholder || 'Action' }}</span>
              </button>
              
              <!-- Dropdown Toggle -->
              <button 
                type="button" 
                (click)="toggleDropdown($event)"
                [class]="ui.splitButtonToggle"
                [ngClass]="[
                  colorClasses(),
                  'px-2'
                ]"
              >
                 <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              <!-- Dropdown Menu -->
              @if (isDropdownOpen()) {
                <div [class]="ui.dropdownMenu">
                   @for (opt of buttonOptions(); track opt.value) {
                     <div (click)="onSplitItemClick(opt, $event)" [class]="ui.dropdownItem">
                        @if (opt.icon) {
                          <div [innerHTML]="getSafeIcon(opt.icon)" class="w-4 h-4 text-gray-400"></div>
                        }
                        {{ opt.label }}
                     </div>
                   }
                </div>
                <!-- Backdrop -->
                <div class="fixed inset-0 z-40 bg-transparent" (click)="closeDropdown()"></div>
              }
           </div>
        }

        <!-- CASE 3: STANDARD BUTTON (Default) -->
        @default {
           <button 
            type="button" 
            (click)="onClick($event)"
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
        }
      }

    </div>
  `
})
export class ButtonControlComponent extends BaseDynamicControl {
  private sanitizer = inject(DomSanitizer);

  // Signals
  isDropdownOpen = signal(false);

  // Props
  buttonType = computed(() => this.field.props?.['buttonType'] || 'standard'); // standard, split, group
  variant = computed(() => this.field.props?.['variant'] || 'primary'); // primary, secondary, outline, ghost, danger, link
  image = computed(() => this.field.props?.['image']);
  isFullWidth = computed(() => this.field.props?.['fullWidth'] !== false); // Default true
  
  // For Groups/Split
  buttonOptions = computed(() => this.field.options || []);

  onClick(event: MouseEvent) {
    const cmd = this.field.props?.['command'];
    console.log(`[Button] Clicked: ${this.field.key}, Command: ${cmd}`);
    
    // If it's a toggle button behavior via props, simple toggle logic (optional)
    if (this.field.props?.['toggle']) {
       this.control()?.setValue(!this.control()?.value);
    }
  }

  onGroupClick(opt: Option, event: MouseEvent) {
    console.log(`[Button Group] Clicked: ${opt.label}, Value: ${opt.value}`);
    this.control()?.setValue(opt.value);
    this.control()?.markAsDirty();
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen.update(v => !v);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  onSplitItemClick(opt: Option, event: MouseEvent) {
    console.log(`[Split Button] Clicked Item: ${opt.label}, Cmd: ${opt.command}`);
    // If the option has a value, we set the control value
    if (opt.value) {
      this.control()?.setValue(opt.value);
      this.control()?.markAsDirty();
    }
    this.closeDropdown();
  }

  isActive(val: any): boolean {
    return this.control()?.value === val;
  }

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }

  colorClasses = computed(() => {
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
