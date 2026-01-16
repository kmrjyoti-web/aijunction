import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, debounceTime, switchMap } from 'rxjs/operators';

import { BaseDynamicControl } from '../base-control';
import { TranslationService } from '../../../services/translation.service';
import { GLOBAL_APP_CONFIG } from '../../../models/app-config.model';
import { IconHelper, IconName } from '../../../helpers/icon.helper';
import { StyleHelper } from '../../../helpers/style.helper';
@Component({
  selector: 'smart-textbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="containerClasses()" [style]="variableStyles()">
      
      <div class="relative group w-full">
        
        <!-- Prefix Icon -->
        @if (fieldSignal().prefixIcon) {
          <div 
            [class]="ui.iconPrefixWrapper"
            [class.text-token-color]="hasTokens()"
            [class.top-3]="isTextarea()" 
            [class.-translate-y-0]="isTextarea()">
            <div [innerHTML]="getSafeIcon(fieldSignal().prefixIcon)" [class]="sizeStyles().icon"></div>
          </div>
        }

        <!-- Language Controls -->
        @if (showTransliterationControls()) {
          <div class="absolute right-0 -top-7 flex items-center gap-2 z-20">
             <div class="text-gray-400 w-3.5 h-3.5" [innerHTML]="getSafeIcon('language')"></div>
             <select 
               class="text-xs border-none bg-transparent text-gray-500 focus:ring-0 cursor-pointer"
               (change)="onLanguageChange($event)"
               [value]="selectedLanguage()">
               @for (lang of supportedLanguages(); track lang.code) {
                 <option [value]="lang.code">{{ lang.label }}</option>
               }
             </select>
             <button type="button" (click)="toggleAutoConvert()" class="text-xs" [class.text-primary]="isAutoConvert()" [class.font-bold]="isAutoConvert()">
                {{ isAutoConvert() ? 'Auto On' : 'Auto Off' }}
             </button>
             <button type="button" (click)="manualConvert()" class="text-xs hover:text-primary" title="Convert Now">
               <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
             </button>
          </div>
        }

        <!-- Input / Textarea -->
        @if (fieldSignal().type === 'textarea') {
          <textarea
            [id]="fieldSignal().key"
            [class]="inputClasses() + ' ' + customClasses()"
            [style]="customStyles()"
            [formControl]="$any(control())"
            placeholder=" "
            [rows]="fieldSignal().props?.['rows'] || 3"
            (input)="onInput($event); onCommand('input', $event)"
            (focus)="onCommand('focus', $event)"
            (blur)="onCommand('blur', $event)"
            (keydown)="onCommand('keydown', $event)"
            [class.border-danger]="hasError()"
            [class.focus:ring-danger]="hasError()"
            [class.focus:border-danger]="hasError()"
          ></textarea>
        } @else {
          <input
            [type]="inputType()"
            [id]="fieldSignal().key"
            [class]="inputClasses() + ' ' + customClasses()"
            [style]="customStyles()"
            [formControl]="$any(control())"
            placeholder=" "
            (input)="onInput($event); onCommand('input', $event)"
            (focus)="onCommand('focus', $event)"
            (blur)="onCommand('blur', $event)"
            (keydown)="onCommand('keydown', $event)"
            [class.border-danger]="hasError()"
            [class.focus:ring-danger]="hasError()"
            [class.focus:border-danger]="hasError()"
          />
        }

        <!-- Floating Label -->
        <label
          [for]="field.key"
          [class]="labelClasses()"
          [class.text-danger]="hasError()"
          [class.peer-focus:text-danger]="hasError()"
        >
          <span>{{ field.label }}</span>
          @if(field.validators?.required){ <span class="text-danger">*</span> }
          
          @if(hasTooltip()) {
            <span [title]="field.tooltip" class="ml-1 text-gray-400 hover:text-gray-500 cursor-help" (click)="$event.stopPropagation()">
              ?
            </span>
          }
        </label>

        <!-- Suffix Icon / Action / Button -->
        <div 
            [class]="ui.iconSuffixWrapper"
            [class.text-token-color]="hasTokens()"
            [class.top-3]="isTextarea()" 
            [class.-translate-y-0]="isTextarea()"
        >
            @if (isConverting()) {
               <span class="animate-spin w-4 h-4 block border-2 border-gray-300 border-t-primary rounded-full"></span>
            } 
            @else if (suffixType() === 'button' && (field.suffixIcon || field.suffixAction)) {
                 <button 
                   type="button"
                   (click)="handleSuffixClick($event)"
                   class="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded px-2 py-1 text-xs border border-gray-300 transition-colors flex items-center gap-1"
                 >
                    @if (field.suffixIcon) { <div [innerHTML]="getSafeIcon(field.suffixIcon)" class="w-3.5 h-3.5"></div> }
                    @if (field.suffixLabel) { <span>{{ field.suffixLabel }}</span> }
                 </button>
            }
            @else if (currentSuffixIcon()) {
                <div (click)="handleSuffixClick($event)" [class.cursor-pointer]="!!field.suffixAction" class="hover:text-gray-600 transition-colors">
                  <div [innerHTML]="getSafeIcon(currentSuffixIcon())" [class]="sizeStyles().icon"></div>
                </div>
            }
        </div>

      </div>

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `,
  styles: [`
    /* DYNAMIC THEME SUPPORT */
    .token-input {
      background-color: var(--p-inputtext-background, white);
      border-color: var(--p-inputtext-border-color, #d1d5db);
      color: var(--p-inputtext-color, #1f2937);
      border-radius: var(--p-inputtext-border-radius, 0.375rem);
      padding: var(--p-inputtext-padding-y, 0.5rem) var(--p-inputtext-padding-x, 0.75rem);
      transition-duration: var(--p-inputtext-transition-duration, 200ms);
    }
    .token-input:hover { border-color: var(--p-inputtext-hover-border-color, #9ca3af); }
    .token-input:focus {
      border-color: var(--p-inputtext-focus-border-color, #3b82f6);
      box-shadow: 0 0 0 var(--p-inputtext-focus-ring-width, 2px) var(--p-inputtext-focus-ring-color, #bfdbfe);
    }
    .text-token-color { color: var(--p-inputtext-color, #374151); }
    
    /* Filled Variant */
    .variant-filled {
      background-color: var(--p-inputtext-filled-background, #f3f4f6);
      border: none;
      border-bottom: 2px solid var(--p-inputtext-border-color, #d1d5db);
      border-radius: 4px 4px 0 0;
    }
    .variant-filled:focus {
      background-color: var(--p-inputtext-filled-focus-background, #e5e7eb);
      border-bottom-color: var(--p-inputtext-focus-border-color, #3b82f6);
    }
  `]
})
export class TextInputComponent extends BaseDynamicControl {
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private translationService: TranslationService = inject(TranslationService); // Safe injection
  private destroyRef = inject(DestroyRef);

  isPasswordVisible = signal(false);
  isTextarea = computed(() => this.fieldSignal().type === 'textarea');

  // --- Dynamic Styling Signals ---
  dt = computed(() => this.fieldSignal().props?.['dt']);
  hasTokens = computed(() => !!this.dt());

  variableStyles = computed(() => {
    const tokens = this.dt();
    if (!tokens) return {};
    return StyleHelper.generateCssVariables(tokens, 'p');
  });

  variant = computed<'outlined' | 'filled'>(() => this.fieldSignal().props?.['variant'] || 'outlined');

  // floatLabel: 'auto' | 'in' | 'on' | 'over' | 'off'
  floatLabel = computed(() => this.fieldSignal().props?.['floatLabel'] || 'auto');

  // shape: 'rounded' | 'square' | 'circle'
  shape = computed(() => this.fieldSignal().props?.['shape'] || 'rounded');

  // suffixType: 'icon' | 'button'
  suffixType = computed(() => this.fieldSignal().props?.['suffixType'] || 'icon');

  isFluid = computed(() => !!this.fieldSignal().props?.['fluid']);

  // --- Computed Classes ---
  containerClasses = computed(() => {
    let classes = this.ui.container + (this.showTransliterationControls() ? ' mt-6' : '');
    if (this.isFluid()) classes += ' w-full';

    // Add margin for 'over' label
    if (this.floatLabel() === 'over') classes += ' mt-5';

    return classes;
  });

  inputClasses = computed(() => {
    // If tokens used, use .token-input base
    if (this.hasTokens()) {
      let base = 'token-input w-full outline-none peer appearance-none block ';
      if (this.variant() === 'filled') base += 'variant-filled ';
      else base += 'border ';

      if (this.shape() === 'square') base += 'rounded-none ';
      else if (this.shape() === 'circle') base += 'rounded-full ';
      else base += 'rounded-lg ';

      if (this.fieldSignal().prefixIcon) base += 'pl-10 ';
      if (this.fieldSignal().suffixIcon || this.suffixType() === 'button') base += 'pr-10 ';

      return base;
    }

    // Default Tailwind path
    let base = [
      this.ui.input,
      this.fieldSignal().prefixIcon ? this.ui.inputHasPrefix : '',
      (this.fieldSignal().suffixIcon || this.suffixType() === 'button' || this.isTransliterationEnabled()) ? this.ui.inputHasSuffix : '',
      this.textareaStyles(),
      this.computedInputClasses()
    ].join(' ');

    // Shape overrides
    if (this.shape() === 'square') base = base.replace('rounded-lg', 'rounded-none');
    if (this.shape() === 'circle') base = base.replace('rounded-lg', 'rounded-full');

    // Filled variant style (simple tailwind approximation)
    if (this.variant() === 'filled') {
      base = base.replace('border-gray-300', 'border-b-2 border-gray-300 border-x-0 border-t-0 bg-gray-100 rounded-t-md rounded-b-none');
    }

    return base;
  });

  labelClasses = computed(() => {
    // Custom Token Styling
    if (this.hasTokens()) {
      let base = 'absolute text-sm duration-150 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent ';
      if (this.fieldSignal().prefixIcon) base += 'left-10 ';
      else base += 'left-3 ';
      base += 'peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 ';
      base += 'text-token-color peer-focus:text-[var(--p-inputtext-focus-border-color,#3b82f6)]';
      return base;
    }

    const startClasses = [
      this.ui.label,
      this.activeClasses(), // Determine floating/active state
      this.fieldSignal().prefixIcon ? this.ui.labelHasPrefix : '',
      this.sizeStyles().label
    ].join(' ');

    // Static Floating (Over/Off)
    if (this.floatLabel() === 'over' || this.floatLabel() === 'off') {
      // 'over' means always floating above
      // 'off' means static label above
      return 'absolute -top-6 left-0 text-sm font-medium text-gray-700 transition-all';
    }

    return startClasses + ' ' + this.labelPositionClasses();
  });

  // --- Transliteration Logic ---
  isTransliterationEnabled = computed(() => !!this.fieldSignal().transliteration?.enabled);
  showTransliterationControls = computed(() => this.isTransliterationEnabled() && !!this.fieldSignal().transliteration?.showControls);

  inputType = computed(() => {
    if (this.isTransliterationEnabled()) return 'text';
    const base = this.fieldSignal().type || 'text';
    if (base === 'password' && this.isPasswordVisible()) return 'text';
    return base;
  });

  supportedLanguages = computed(() =>
    this.fieldSignal().transliteration?.languages || GLOBAL_APP_CONFIG.transliteration.languages
  );
  selectedLanguage = signal(GLOBAL_APP_CONFIG.transliteration.defaultLanguage);
  isAutoConvert = signal(false);
  isConverting = signal(false);

  computedInputClasses = computed(() => {
    const defaultClasses = this.sizeStyles().input;
    const customHeight = this.fieldSignal().props?.['height'];
    if (customHeight) { // Replace default height if custom provided (e.g. h-10)
      return `${defaultClasses.replace(/\bh-\S+/g, '').trim()} ${customHeight}`;
    }
    return defaultClasses;
  });

  private inputSubject = new Subject<string>();

  override ngOnInit() {
    super.ngOnInit();
    const fieldDefault = this.fieldSignal().transliteration?.defaultLanguage;
    if (fieldDefault) this.selectedLanguage.set(fieldDefault);
    if (this.fieldSignal().transliteration?.autoConvert) this.isAutoConvert.set(true);

    this.inputSubject.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => this.isAutoConvert()),
      debounceTime(800),
      switchMap(text => {
        if (!text) return Promise.resolve('');
        this.isConverting.set(true);
        return this.translationService.transliterate(text, this.selectedLanguage());
      })
    ).subscribe({
      next: (converted) => {
        this.isConverting.set(false);
        if (converted) this.control()?.setValue(converted, { emitEvent: false });
      },
      error: () => this.isConverting.set(false)
    });
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    if (this.isTransliterationEnabled()) this.inputSubject.next(val);
  }

  toggleAutoConvert() { this.isAutoConvert.update(v => !v); }
  onLanguageChange(event: Event) { this.selectedLanguage.set((event.target as HTMLSelectElement).value); }

  async manualConvert() {
    const val = this.control()?.value;
    if (!val) return;
    this.isConverting.set(true);
    const converted = await this.translationService.transliterate(val, this.selectedLanguage());
    this.control()?.setValue(converted);
    this.isConverting.set(false);
  }

  currentSuffixIcon = computed<IconName | undefined>(() => {
    if (this.fieldSignal().suffixAction === 'toggleVisibility') return this.isPasswordVisible() ? 'eye' : 'eyeSlash';
    return this.fieldSignal().suffixIcon;
  });

  activeClasses = computed(() => {
    const mode = this.floatLabel();
    if (mode === 'in') return 'peer-placeholder-shown:scale-75 peer-placeholder-shown:-translate-y-3 peer-placeholder-shown:top-3 left-3 bg-transparent';
    if (mode === 'on') return '-top-2.5 left-2 px-1 bg-white scale-90';
    // Fallback to auto/standard
    return this.ui.activeOn; // Default behavior
  });

  textareaStyles = computed(() => this.sizeStyles().input + ' !h-auto py-2');

  labelPositionClasses = computed(() => {
    if (this.isTextarea()) return 'peer-placeholder-shown:top-3 peer-placeholder-shown:-translate-y-0';
    return 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2';
  });

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }

  handleSuffixClick(event: Event) {
    if (!this.field.suffixAction) return;
    event.stopPropagation();
    event.preventDefault();
    if (this.field.suffixAction === 'toggleVisibility') this.isPasswordVisible.update(v => !v);
    else if (this.field.suffixAction === 'clear') this.control()?.setValue('');
    else if (this.field.props?.['suffixType'] === 'button') {
      // Emit button command
      this.onCommand('suffixClick', event);
    }
  }
}
