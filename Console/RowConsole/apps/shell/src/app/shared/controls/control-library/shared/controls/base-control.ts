
import { Directive, Input, computed, inject, OnInit, OnChanges, SimpleChanges, HostListener, signal } from '@angular/core';
import { AbstractControl, FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { FormFieldConfig, Option, ControlType } from '../../models/form-schema.model';
import { UiConfig, CONTROL_SIZES, GLOBAL_UI_CONFIG, ControlSize } from '../../models/ui-config.model';
import { IconName } from '../../helpers/icon.helper';
import { KeyboardNavUtil } from '../../utility/keyboard-nav.util';
import { ValidationUtil } from '../../utility/validation.util';

@Directive()
export abstract class BaseDynamicControl implements OnInit, OnChanges {
  // --- Core Inputs ---
  @Input() field: FormFieldConfig = { key: 'standalone_control', type: 'text', label: '' };
  @Input() group: FormGroup = new FormGroup({});
  @Input() ui: UiConfig = GLOBAL_UI_CONFIG;

  // --- Standalone Support ---
  // Allow passing the control instance directly: <smart-text [formControl]="myCtrl">
  @Input('formControl') directControl?: AbstractControl | null;

  // --- HTML-like Inputs for Standalone Config ---
  @Input() id: string | undefined;
  @Input() label: string | undefined;
  @Input() type: ControlType | undefined;
  @Input() placeholder: string | undefined;
  @Input() value: any;

  @Input() disabled: boolean | undefined;
  @Input() readonly: boolean | undefined;
  @Input() required: boolean | undefined;

  // Validators
  @Input() min: number | string | undefined;
  @Input() max: number | string | undefined;
  @Input() minLength: number | undefined;
  @Input() maxLength: number | undefined;
  @Input() pattern: string | undefined;

  // Data & Visuals
  @Input() options: Option[] | undefined;
  @Input() prefixIcon: IconName | undefined;
  @Input() suffixIcon: IconName | undefined;
  @Input() size: ControlSize | undefined;
  @Input() description: string | undefined;

  // Props bag for extra config
  @Input() props: Record<string, any> | undefined;

  // -------------------------------

  // Reactive signal for the active control
  // 1. If directControl is passed, use it.
  // 2. Else try to find it in the group.
  // Reactive signal for the field config (enables computed props to update on reuse)
  fieldSignal = signal<FormFieldConfig>(this.field);

  control = computed(() => {
    if (this.directControl) return this.directControl;
    return this.group.get(this.fieldSignal().key); // Depend on signal
  });

  sizeStyles = computed(() => {
    const size = this.fieldSignal().size || 'medium'; // Depend on signal
    return CONTROL_SIZES[size];
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['field']) {
      this.fieldSignal.set(this.field);
    }

    // 1. Sync simple properties to Field Config (for standalone usage styling)
    if (changes['id'] && this.id) this.field.key = this.id;
    if (changes['label']) this.field.label = this.label || '';
    if (changes['type'] && this.type) this.field.type = this.type;
    if (changes['placeholder']) this.field.placeholder = this.placeholder;
    if (changes['prefixIcon']) this.field.prefixIcon = this.prefixIcon;
    if (changes['suffixIcon']) this.field.suffixIcon = this.suffixIcon;
    if (changes['size']) this.field.size = this.size;

    // Update signal after sync
    if (changes['id'] || changes['label'] || changes['type'] || changes['placeholder'] ||
      changes['prefixIcon'] || changes['suffixIcon'] || changes['size'] ||
      changes['options'] || changes['description'] || changes['readonly'] || changes['props']) {
      this.fieldSignal.set({ ...this.field });
    }

    // 2. Sync Complex/Props
    if (changes['options']) {
      this.field.options = this.options;
    }

    if (changes['description']) {
      if (!this.field.props) this.field.props = {};
      this.field.props['description'] = this.description;
    }

    if (changes['readonly']) {
      if (!this.field.props) this.field.props = {};
      this.field.props['readonly'] = this.readonly;
    }

    if (changes['props'] && this.props) {
      this.field.props = { ...this.field.props, ...this.props };
    }

    // 3. Handle Value (Write only if changed)
    if (changes['value']) {
      const c = this.control();
      if (c && c.value !== this.value) {
        c.setValue(this.value, { emitEvent: false });
      } else if (!c && !this.directControl) {
        this.field.defaultValue = this.value;
      }
    }

    // 4. Handle Disabled State
    if (changes['disabled']) {
      const c = this.control();
      if (c) {
        this.disabled ? c.disable() : c.enable();
      }
    }

    // 5. Update Validators dynamically
    const validationChanged = changes['required'] || changes['min'] || changes['max'] ||
      changes['minLength'] || changes['maxLength'] || changes['pattern'];

    if (validationChanged) {
      this.updateValidators();
    }
  }

  ngOnInit(): void {
    // SELF-HEALING FORM GROUP (Only if NOT using direct control):
    // If the control doesn't exist in the group and no direct control is provided, create it.
    if (!this.directControl && this.group && !this.group.get(this.field.key)) {
      this.group.addControl(
        this.field.key,
        new FormControl(this.field.defaultValue || '', [])
      );
      // Apply initial state
      if (this.disabled) this.control()?.disable();
      this.updateValidators();
    }
  }

  private updateValidators() {
    const c = this.control();
    if (!c) return;

    // Merge Input validators with existing Field Config validators
    const config = this.field.validators || {};

    const isRequired = this.required !== undefined ? this.required : config.required;
    const minVal = this.min !== undefined ? this.min : config.min;
    const maxVal = this.max !== undefined ? this.max : config.max;
    const minLen = this.minLength !== undefined ? this.minLength : config.minLength;
    const maxLen = this.maxLength !== undefined ? this.maxLength : config.maxLength;
    const pat = this.pattern !== undefined ? this.pattern : config.pattern;

    const validators: ValidatorFn[] = [];

    if (isRequired) validators.push(Validators.required);
    if (config.email || this.field.type === 'email') validators.push(Validators.email);

    if (minLen !== undefined) validators.push(Validators.minLength(minLen));
    if (maxLen !== undefined) validators.push(Validators.maxLength(maxLen));
    if (pat !== undefined) validators.push(Validators.pattern(pat));

    if (minVal !== undefined && minVal !== null) {
      const v = Number(minVal);
      if (!isNaN(v)) validators.push(Validators.min(v));
    }
    if (maxVal !== undefined && maxVal !== null) {
      const v = Number(maxVal);
      if (!isNaN(v)) validators.push(Validators.max(v));
    }

    c.setValidators(validators);
    c.updateValueAndValidity({ emitEvent: false });
  }

  @HostListener('keydown', ['$event'])
  handleKeyboardNav(event: KeyboardEvent) {
    const target = event.target as HTMLElement;

    const isTextInput = (target instanceof HTMLInputElement && this.isTextType(target.type)) ||
      target instanceof HTMLTextAreaElement;

    const isSelect = target.tagName === 'SELECT';
    const isRadio = target instanceof HTMLInputElement && target.type === 'radio';
    const isRange = target instanceof HTMLInputElement && target.type === 'range';

    // Date inputs have internal navigation (Day/Month/Year), so we shouldn't hijack arrows
    const isDate = target instanceof HTMLInputElement &&
      ['date', 'datetime-local', 'month', 'week', 'time'].includes(target.type);

    const isContentEditable = target.isContentEditable;

    const isNativeNav = isSelect || isRadio || isRange || isDate || isContentEditable;

    // Navigate Previous (ArrowLeft)
    if (event.key === 'ArrowLeft' && this.field.previousControl) {
      if (isTextInput) {
        const input = target as HTMLInputElement | HTMLTextAreaElement;
        if (input.selectionStart === 0 && input.selectionEnd === 0) {
          event.preventDefault();
          KeyboardNavUtil.focus(this.field.previousControl);
        }
      } else if (!isNativeNav) {
        event.preventDefault();
        KeyboardNavUtil.focus(this.field.previousControl);
      }
    }

    // Navigate Next (ArrowRight)
    if (event.key === 'ArrowRight' && this.field.nextControl) {
      if (isTextInput) {
        const input = target as HTMLInputElement | HTMLTextAreaElement;
        if (input.selectionStart === input.value.length && input.selectionEnd === input.value.length) {
          event.preventDefault();
          KeyboardNavUtil.focus(this.field.nextControl);
        }
      } else if (!isNativeNav) {
        event.preventDefault();
        KeyboardNavUtil.focus(this.field.nextControl);
      }
    }
  }

  private isTextType(type: string): boolean {
    return ['text', 'password', 'email', 'number', 'search', 'tel', 'url'].includes(type);
  }

  hasValue(): boolean {
    const c = this.control();
    return c ? (c.value !== null && c.value !== undefined && c.value !== '') : false;
  }

  hasError(): boolean {
    return ValidationUtil.hasError(this.control());
  }

  hasTooltip(): boolean {
    return !!(this.field.tooltip && this.field.tooltip.trim().length > 0);
  }

  // --- Direct Binding Helpers ---

  // 1. Direct Styles: [style]="fieldSignal().props?.style"
  // Note: We expose this as a computed for cleaner access in template, 
  // but it's often used directly as field.props?.['style']
  customStyles = computed(() => this.fieldSignal().props?.['style'] || {});

  // 2. Direct Classes: [class]="fieldSignal().props?.class"
  customClasses = computed(() => this.fieldSignal().props?.['class'] || '');

  // 3. Command Handling
  // Use (event)="onCommand('eventName', $event)" in templates
  onCommand(eventName: string, eventData: any) {
    const events = this.fieldSignal().props?.['events'];
    if (!events || !events[eventName]) return;

    const commandName = events[eventName];
    console.log(`[Command] Event: ${eventName} -> Command: ${commandName}`, eventData);
    // Ideally this emits to a parent orchestrator via Output() or Service.
    // For now we log it as the infrastructure for global command handling is TBD.
  }
}
