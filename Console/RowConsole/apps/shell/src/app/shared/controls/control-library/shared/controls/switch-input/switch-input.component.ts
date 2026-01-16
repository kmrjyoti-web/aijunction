
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';

@Component({
  selector: 'smart-switch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container">
      
      <label 
        [class]="isRichLayout() ? ui.optionCard : ui.switchWrapper"
        [ngClass]="[
           isRichLayout() && isChecked() ? ui.optionCardSelected : '',
           isRichLayout() ? ui.optionCardHover : ''
        ]"
      >
        <input 
            type="checkbox" 
            [formControl]="$any(control())" 
            class="sr-only peer"
        >
        
        <div [class]="ui.switchTrack"></div>

        <div class="ml-3 flex flex-1 items-center">
            @if (image()) {
               <img [src]="image()" class="w-10 h-10 rounded object-cover mr-3 border border-gray-100" alt="">
            }
            @if (icon()) {
               <div class="mr-3 text-gray-500" [class.text-primary]="isChecked()">
                   <div [innerHTML]="getSafeIcon(icon())"></div>
               </div>
            }
            <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900" [class.text-primary]="isChecked() && isRichLayout()">
                    {{ field.label }}
                </span>
                @if (resolvedDescription()) {
                    <span class="text-xs text-gray-500">{{ resolvedDescription() }}</span>
                }
            </div>
        </div>
        @if(field.validators?.required){ <span class="text-danger ml-1 self-start">*</span> }
      </label>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class SwitchInputComponent extends BaseDynamicControl {
  private sanitizer = inject(DomSanitizer);

  icon = computed<IconName | undefined>(() => this.field.props?.['icon']);
  image = computed<string | undefined>(() => this.field.props?.['image']);
  resolvedDescription = computed<string | undefined>(() => this.field.props?.['description']);
  isRichLayout = computed(() => !!(this.icon() || this.image() || this.resolvedDescription()));

  isChecked() {
    return this.control()?.value === true;
  }

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }
}
