import { Injectable, computed, signal, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { FormSchema, FormFieldConfig, Option, ApiConfig } from '../models/form-schema.model';
import { ApiService } from './api.service';

interface FieldState {
  loading: boolean;
  options: Option[];
}

@Injectable()
export class FormStore {
  private apiService = inject(ApiService);

  // State
  private _schema = signal<FormSchema | null>(null);
  private _formGroup = signal<FormGroup>(new FormGroup({}));
  
  // Field specific state (loading, dynamic options)
  private _fieldStates = signal<Map<string, FieldState>>(new Map());

  // Exposed Signals
  schema = this._schema.asReadonly();
  formGroup = this._formGroup.asReadonly();
  
  // Helpers to get specific field state
  getFieldState(key: string) {
    return computed(() => this._fieldStates().get(key) || { loading: false, options: [] });
  }

  init(schema: FormSchema) {
    this._schema.set(schema);
    const group: any = {};
    const fieldStateMap = new Map<string, FieldState>();

    // 1. recursively find all fields to ensure no key is missed, even inside Tabs
    const allFields = this.extractFields(schema);

    // 2. Build Form Controls & Initial State
    allFields.forEach(field => {
      const validators: ValidatorFn[] = [];
      if (field.validators?.required) validators.push(Validators.required);
      if (field.validators?.email || field.type === 'email') validators.push(Validators.email);
      if (field.validators?.minLength) validators.push(Validators.minLength(field.validators.minLength));
      if (field.validators?.maxLength) validators.push(Validators.maxLength(field.validators.maxLength));
      if (field.validators?.pattern) validators.push(Validators.pattern(field.validators.pattern));
      
      if (field.validators?.min !== undefined && field.validators?.min !== null) {
        const minVal = Number(field.validators.min);
        if (!isNaN(minVal)) validators.push(Validators.min(minVal));
      }
      if (field.validators?.max !== undefined && field.validators?.max !== null) {
         const maxVal = Number(field.validators.max);
         if (!isNaN(maxVal)) validators.push(Validators.max(maxVal));
      }

      // Check if control already exists in the group (deduplication)
      if (!group[field.key]) {
        group[field.key] = new FormControl(field.defaultValue || '', validators);
      }

      // Initial field state
      fieldStateMap.set(field.key, {
        loading: false,
        options: field.options || []
      });

      // Initial API Load (if no dependency required)
      if (field.api && !field.api.dependency) {
        this.loadOptions(field.key, field.api);
      }
    });

    const newFormGroup = new FormGroup(group);
    this._formGroup.set(newFormGroup);
    this._fieldStates.set(fieldStateMap);

    // 3. Setup Dependency Listeners
    allFields.forEach(field => {
      if (field.api?.dependency) {
        const parentKey = field.api.dependency;
        const parentControl = newFormGroup.get(parentKey);
        
        if (parentControl) {
          // React to parent changes
          parentControl.valueChanges.subscribe(val => {
            newFormGroup.get(field.key)?.setValue('');
            if (val) {
              this.loadOptions(field.key, field.api!, val);
            } else {
              this.updateFieldState(field.key, { options: [] });
            }
          });
        }
      }
    });
  }

  // Helper to extract fields from any structure (Tabs, Rows, etc.)
  private extractFields(schema: FormSchema): FormFieldConfig[] {
    const fields: FormFieldConfig[] = [];

    const processRows = (rows: any[]) => {
      if (!rows) return;
      rows.forEach(row => {
        if (row.columns) {
          row.columns.forEach((col: any) => {
            if (col.field) fields.push(col.field);
          });
        }
      });
    };

    // Standard Layout
    if (schema.rows) {
      processRows(schema.rows);
    }

    // Tabbed Layout
    if (schema.tabs) {
      schema.tabs.forEach(tab => {
        if (tab.rows) processRows(tab.rows);
      });
    }

    return fields;
  }

  private loadOptions(fieldKey: string, apiConfig: ApiConfig, dependencyVal?: any) {
    this.updateFieldState(fieldKey, { loading: true });

    this.apiService.fetchOptions(apiConfig, dependencyVal).subscribe({
      next: (data) => {
        const options: Option[] = data.map(item => ({
          label: item[apiConfig.labelKey],
          value: item[apiConfig.valueKey]
        }));
        this.updateFieldState(fieldKey, { loading: false, options });
      },
      error: (err) => {
        console.error(`Failed to load options for ${fieldKey}`, err);
        this.updateFieldState(fieldKey, { loading: false, options: [] });
      }
    });
  }

  private updateFieldState(key: string, partial: Partial<FieldState>) {
    this._fieldStates.update(map => {
      const current = map.get(key) || { loading: false, options: [] };
      const newMap = new Map(map);
      newMap.set(key, { ...current, ...partial });
      return newMap;
    });
  }

  getFormValue() {
    return this._formGroup().getRawValue();
  }

  isValid() {
    return this._formGroup().valid;
  }
}