
import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseDynamicControl } from '../base-control';
import { IconHelper, IconName } from '../../../helpers/icon.helper';

@Component({
  selector: 'smart-mobile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="group" [class]="ui.container">
      
      <div [class]="ui.mobileGroup">
        <!-- Country Code Dropdown -->
        <div class="relative">
          <select
            [value]="selectedCountry()"
            (change)="onCountryChange($event)"
            [class]="ui.mobileCountrySelect"
            [ngClass]="sizeStyles().input"
            style="height: 100%;"
          >
            @for (c of countries; track c.code) {
              <option [value]="c.dial_code">{{ c.flag }} {{ c.dial_code }}</option>
            }
          </select>
        </div>

        <!-- Phone Number Input + Suffix Icon Overlay -->
        <div class="relative flex-grow group">
          <input
            type="tel"
            [id]="field.key"
            
            [value]="displayValue()"
            (input)="onInput($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            [placeholder]="activePlaceholder()"
            
            [class]="ui.mobileInput"
            class="rounded-r-md"
            [ngClass]="[
              sizeStyles().input
            ]"
            [class.pr-10]="showValidationIcon()" 
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

          <!-- Verification Icon Overlay -->
          @if (showValidationIcon()) {
            <div 
              [class]="ui.iconSuffixWrapper"
              [class.cursor-pointer]="!isVerified()"
              [class.hover:text-primary]="!isVerified() && !isValidating()"
              (click)="onValidate($event)"
            >
              @if (isValidating()) {
                <svg class="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              } @else {
                 <div [innerHTML]="getSafeIcon(isVerified() ? 'checkCircle' : 'shieldCheck')"
                      [class.text-green-500]="isVerified()"
                      [class.text-gray-400]="!isVerified()">
                 </div>
              }
            </div>
          }
        </div>
      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class MobileInputComponent extends BaseDynamicControl implements OnInit {
  private sanitizer = inject(DomSanitizer);

  // Logic for mobile specific features
  selectedCountry = signal('+91');
  isValidating = signal(false);
  isVerified = signal(false);
  isFocused = signal(false);
  displayValue = signal('');

  // Static list for demo with masks
  countries = [
    { code: 'US', dial_code: '+1', flag: '🇺🇸', mask: '(000) 000-0000' },
    { code: 'IN', dial_code: '+91', flag: '🇮🇳', mask: '00000-00000' },
    { code: 'UK', dial_code: '+44', flag: '🇬🇧', mask: '00000 000000' },
    { code: 'CA', dial_code: '+1', flag: '🇨🇦', mask: '(000) 000-0000' }
  ];

  activeMask = computed(() => {
    const country = this.countries.find(c => c.dial_code === this.selectedCountry());
    return country ? country.mask : '0000000000';
  });

  activePlaceholder = computed(() => {
    return this.isFocused() ? this.activeMask().replace(/0/g, '_') : ' ';
  });

  override ngOnInit() {
    super.ngOnInit();

    // Check for default props
    if (this.field.props?.['defaultCountry']) {
      this.selectedCountry.set(this.field.props['defaultCountry']);
    }

    // Initialize display value from control value
    const val = this.control()?.value;
    if (val) {
      this.displayValue.set(this.applyMask(val.toString(), this.activeMask()));
    }

    // Watch for external updates
    this.control()?.valueChanges.subscribe(val => {
       const rawCurrent = this.displayValue().replace(/\D/g, '');
       const rawNew = (val || '').toString();
       // Only update if the raw values differ (prevents loops)
       if (rawCurrent !== rawNew) {
           this.displayValue.set(this.applyMask(rawNew, this.activeMask()));
       }
    });
  }

  showValidationIcon = computed(() => {
    return !!this.field.props?.['enableValidation'];
  });

  activeClasses = computed(() => {
    // If focused or has value, float the label
    if (this.isFocused() || this.displayValue()) {
       return this.ui.floatingMode === 'IN' ? this.ui.activeIn : this.ui.activeOn;
    }
    return '';
  });

  onCountryChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedCountry.set(select.value);
    
    // Reformat current value with new mask
    const currentRaw = (this.control()?.value || '').toString();
    const formatted = this.applyMask(currentRaw, this.activeMask());
    this.displayValue.set(formatted);
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const rawInput = input.value;
    
    // Strip formatting to get raw numbers
    const rawNumbers = rawInput.replace(/\D/g, '');
    
    // Apply Mask
    const formatted = this.applyMask(rawNumbers, this.activeMask());
    
    this.displayValue.set(formatted);
    input.value = formatted; // Enforce format in input immediately

    // Set Control Value (Raw Numbers)
    this.control()?.setValue(rawNumbers);
    this.control()?.markAsDirty();
  }

  onFocus() {
    this.isFocused.set(true);
  }

  onBlur() {
    this.isFocused.set(false);
    this.control()?.markAsTouched();
  }

  onValidate(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    if (this.isVerified() || this.isValidating()) return;

    // Simulate API call
    this.isValidating.set(true);
    setTimeout(() => {
      this.isValidating.set(false);
      this.isVerified.set(true);
    }, 1500);
  }

  applyMask(rawValue: string, mask: string): string {
    let i = 0; // mask index
    let j = 0; // value index
    let result = '';
    
    while (i < mask.length && j < rawValue.length) {
      if (mask[i] === '0') {
        result += rawValue[j++];
        i++;
      } else {
        result += mask[i++]; 
      }
    }
    return result;
  }

  getSafeIcon(name: IconName): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }
}
