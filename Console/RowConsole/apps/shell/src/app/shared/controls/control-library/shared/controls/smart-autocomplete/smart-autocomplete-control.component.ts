
import { Component, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDynamicControl } from '../base-control';
import { SmartAutocompleteMainComponent } from '../smart-autocomplete-core/components/smart-autocomplete-main.component';
import { AutocompleteSourceConfig } from '../smart-autocomplete-core/models/autocomplete-config.model';

@Component({
  selector: 'smart-autocomplete-control',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SmartAutocompleteMainComponent],
  template: `
    <div [class]="ui.container">
      @if (config()) {
        <app-smart-autocomplete-main
          [sourceConfig]="config()!"
          [label]="field.label"
          [required]="!!field.validators?.required"
          [preselectedValue]="control()?.value"
          (selectionChange)="onSelection($event)"
        ></app-smart-autocomplete-main>
      } @else {
        <div class="text-red-500 text-xs border border-red-300 p-2 rounded">
           Missing 'smartConfig' in field props for {{ field.key }}
        </div>
      }

      @if (hasError()) {
        <div [class]="ui.error">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class SmartAutocompleteControlComponent extends BaseDynamicControl {
  
  // Extract the specific configuration from field props
  config = computed<AutocompleteSourceConfig | null>(() => {
    return this.field.props?.['smartConfig'] as AutocompleteSourceConfig || null;
  });

  onSelection(value: any) {
    this.control()?.setValue(value);
    this.control()?.markAsDirty();
    this.control()?.markAsTouched();
  }
}
