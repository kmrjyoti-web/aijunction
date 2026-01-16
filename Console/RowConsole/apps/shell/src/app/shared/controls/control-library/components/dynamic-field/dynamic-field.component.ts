
import { Component, Input, computed, forwardRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormFieldConfig, RowConfig } from '../../models/form-schema.model';
import { GLOBAL_UI_CONFIG, UiConfig } from '../../models/ui-config.model';
import { IconHelper, IconName } from '../../helpers/icon.helper';
import { BaseDynamicControl } from '../../shared/controls/base-control';

// Import Shared Controls
import { TextInputComponent } from '../../shared/controls/text-input/text-input.component';
import { SelectInputComponent } from '../../shared/controls/select-input/select-input.component';
import { MultiSelectInputComponent } from '../../shared/controls/multi-select-input/multi-select-input.component';
import { CheckboxInputComponent } from '../../shared/controls/checkbox-input/checkbox-input.component';
import { SwitchInputComponent } from '../../shared/controls/switch-input/switch-input.component';
import { MobileInputComponent } from '../../shared/controls/mobile-input/mobile-input.component';
import { CurrencyInputComponent } from '../../shared/controls/currency-input/currency-input.component';
import { RadioGroupComponent } from '../../shared/controls/radio-group/radio-group.component';
import { CheckboxGroupComponent } from '../../shared/controls/checkbox-group/checkbox-group.component';
import { ListCheckboxComponent } from '../../shared/controls/list-checkbox/list-checkbox.component';
import { ColorPickerComponent } from '../../shared/controls/color-picker/color-picker.component';
import { DatePickerComponent } from '../../shared/controls/date-picker/date-picker.component';
import { RichTextEditorComponent } from '../../shared/controls/rich-text-editor/rich-text-editor.component';
import { ToggleButtonComponent } from '../../shared/controls/toggle-button/toggle-button.component';
import { AutocompleteComponent } from '../../shared/controls/autocomplete/autocomplete.component';
import { RatingComponent } from '../../shared/controls/rating/rating.component';
import { SliderComponent } from '../../shared/controls/slider/slider.component';
import { TagsInputComponent } from '../../shared/controls/tags-input/tags-input.component';
import { SegmentedControlComponent } from '../../shared/controls/segmented-control/segmented-control.component';
import { FileUploadComponent } from '../../shared/controls/file-upload/file-upload.component';
import { SignatureComponent } from '../../shared/controls/signature/signature.component';
import { OtpInputComponent } from '../../shared/controls/otp-input/otp-input.component';
import { ButtonControlComponent } from '../../shared/controls/button-control/button-control.component';
import { DialogButtonComponent } from '../../shared/controls/dialog-button/dialog-button.component';
import { SmartAutocompleteControlComponent } from '../../shared/controls/smart-autocomplete/smart-autocomplete-control.component';


/**
 * FIELDSET COMPONENT
 * Defined first to allow DynamicFieldComponent to reference it more easily, 
 * though mutual recursion still requires care.
 */
@Component({
  selector: 'smart-fieldset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, forwardRef(() => DynamicFieldComponent)],
  template: `
    <div 
      [class]="containerClass()"
      [class.overflow-hidden]="appearance() === 'panel' && isToggleable()"
    >
      @if (appearance() === 'panel') {
        <div [class]="ui.fieldsetHeader" [class.cursor-pointer]="isToggleable()" (click)="toggle()">
          <div class="flex items-center gap-3">
             @if (image()) { <img [src]="image()" class="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-200" alt="Avatar" /> }
             @if (icon()) { <div [innerHTML]="getSafeIcon(icon())" class="text-primary w-5 h-5"></div> }
             <div class="flex flex-col">
               <span [class]="ui.fieldsetLegend">{{ field.label }}</span>
               @if (subtitle()) { <span class="text-xs text-gray-500 font-medium">{{ subtitle() }}</span> }
             </div>
          </div>
          @if (isToggleable()) {
            <button type="button" class="focus:outline-none">
               <svg [class]="ui.fieldsetToggleIcon" [class.rotate-180]="!collapsed()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
               </svg>
            </button>
          }
        </div>
      } @else {
         <div class="absolute -top-3 left-4 px-2 bg-white flex items-center gap-2 select-none z-10 transition-colors"
           [class.cursor-pointer]="isToggleable()" [class.text-primary]="isToggleable() && !collapsed()" [class.text-gray-700]="!isToggleable() || collapsed()" (click)="toggle()">
             @if (isToggleable()) {
               <div class="border border-gray-200 rounded-full p-0.5 bg-gray-50 transition-transform duration-200" [class.rotate-180]="!collapsed()">
                 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
               </div>
             }
             @if (image()) { <img [src]="image()" class="w-6 h-6 rounded-full object-cover border border-gray-100 shadow-sm" alt="Avatar" /> }
             @if (icon()) { <div [innerHTML]="getSafeIcon(icon())" class="w-4 h-4"></div> }
             <span class="font-bold text-sm leading-none">{{ field.label }}</span>
         </div>
      }

      @if (!collapsed()) {
        <div [class]="ui.fieldsetContent" [class.animate-slideDown]="isToggleable()" [class.pt-6]="appearance() === 'legend'">
           @for (row of rows(); track $index) {
              <div class="grid grid-cols-12 gap-4 md:gap-6 mb-4 last:mb-0">
                @for (col of row.columns; track $index) {
                  @if(col.field) {
                    <div [class]="col.span">
                      <smart-field [field]="col.field" [group]="group"></smart-field>
                    </div>
                  }
                }
              </div>
           }
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-slideDown { animation: slideDown 0.2s ease-out; transform-origin: top; }
    @keyframes slideDown { from { opacity: 0; transform: scaleY(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class FieldsetComponent extends BaseDynamicControl {
  private sanitizer = inject(DomSanitizer);
  collapsed = signal(false);
  isToggleable = computed(() => !!this.field.props?.['toggleable']);
  appearance = computed<'legend' | 'panel'>(() => this.field.props?.['appearance'] || 'legend');
  rows = computed<RowConfig[]>(() => this.field.props?.['rows'] || []);
  image = computed<string | undefined>(() => this.field.props?.['image']);
  icon = computed<IconName | undefined>(() => this.field.prefixIcon);
  subtitle = computed<string | undefined>(() => this.field.props?.['subtitle']);

  containerClass = computed(() => {
    if (this.appearance() === 'panel') {
      return this.ui.fieldsetContainer;
    }
    return 'relative border border-gray-300 rounded-lg bg-white mt-4';
  });

  override ngOnInit() {
    super.ngOnInit();
    if (this.field.props?.['collapsed']) {
      this.collapsed.set(true);
    }
  }

  toggle() {
    if (this.isToggleable()) {
      this.collapsed.update(v => !v);
    }
  }

  getSafeIcon(name?: IconName): SafeHtml {
    if (!name || !IconHelper[name]) return '';
    return this.sanitizer.bypassSecurityTrustHtml(IconHelper[name]);
  }
}

/**
 * MAIN DYNAMIC FIELD DISPATCHER
 */
@Component({
  selector: 'smart-field',
  standalone: true,
  imports: [
    CommonModule,
    TextInputComponent,
    SelectInputComponent,
    MultiSelectInputComponent,
    CheckboxInputComponent,
    SwitchInputComponent,
    MobileInputComponent,
    CurrencyInputComponent,
    RadioGroupComponent,
    CheckboxGroupComponent,
    ListCheckboxComponent,
    ColorPickerComponent,
    DatePickerComponent,
    RichTextEditorComponent,
    ToggleButtonComponent,
    AutocompleteComponent,
    RatingComponent,
    SliderComponent,
    TagsInputComponent,
    SegmentedControlComponent,
    FileUploadComponent,
    SignatureComponent,
    OtpInputComponent,
    ButtonControlComponent,
    DialogButtonComponent,
    SmartAutocompleteControlComponent,
    SmartAutocompleteControlComponent,
    FieldsetComponent
  ],
  template: `
    @switch (field.type) {
      
      <!-- Text / Number / Email / Password / Textarea -->
      @case ('text') { <smart-textbox [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('number') { <smart-textbox [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('email') { <smart-textbox [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('password') { <smart-textbox [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('textarea') { <smart-textbox [group]="group" [field]="field" [ui]="uiConfig()" /> }

      <!-- Rich Text -->
      @case ('editor') { <smart-rich-editor [group]="group" [field]="field" [ui]="uiConfig()" /> }

      <!-- Specialized Inputs -->
      @case ('date') { <smart-date-picker [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('mobile') { <smart-mobile [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('currency') { <smart-currency [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('color') { <smart-color-picker [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('otp') { <smart-otp [group]="group" [field]="field" [ui]="uiConfig()" /> }

      <!-- Lists / Groups -->
      @case ('radio-group') { <smart-radio-group [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('checkbox-group') { <smart-checkbox-group [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('list-checkbox') { <smart-list-checkbox [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('segment') { <smart-segment [group]="group" [field]="field" [ui]="uiConfig()" /> }

      <!-- Selects -->
      @case ('select') { <smart-select [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('multi-select') { <smart-multi-select [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('autocomplete') { <smart-autocomplete [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('tags') { <smart-tags [group]="group" [field]="field" [ui]="uiConfig()" /> }
      
      <!-- NEW: Advanced Smart Autocomplete -->
      @case ('smart-autocomplete') { <smart-autocomplete-control [group]="group" [field]="field" [ui]="uiConfig()" /> }

      <!-- Interactive Widgets -->
      @case ('rating') { <smart-rating [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('slider') { <smart-slider [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('file-upload') { <smart-file-upload [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('signature') { <smart-signature [group]="group" [field]="field" [ui]="uiConfig()" /> }

      <!-- Boolean Toggles -->
      @case ('checkbox') { <smart-checkbox [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('switch') { <smart-switch [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('toggle-button') { <smart-toggle-button [group]="group" [field]="field" [ui]="uiConfig()" /> }
      
      <!-- Containers -->
      @case ('fieldset') { <smart-fieldset [group]="group" [field]="field" [ui]="uiConfig()" /> }

      <!-- Actions -->
      @case ('button') { <smart-button [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('confirm-dialog') { <smart-dialog-button [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('confirm-dialog') { <smart-dialog-button [group]="group" [field]="field" [ui]="uiConfig()" /> }
      @case ('alert-dialog') { <smart-dialog-button [group]="group" [field]="field" [ui]="uiConfig()" /> }
      
      <!-- Complex Controls -->


      @default { 
        <div class="text-red-500 p-2 border border-red-300 rounded">
          Unknown control type: {{ field.type }}
        </div> 
      }
    }
  `
})
export class DynamicFieldComponent {
  @Input({ required: true }) field!: FormFieldConfig;
  @Input({ required: true }) group!: FormGroup;

  uiConfig = computed<UiConfig>(() => {
    return {
      ...GLOBAL_UI_CONFIG,
      ...(this.field.ui || {})
    };
  });
}
