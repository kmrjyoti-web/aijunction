
import { Directive, ElementRef, Input, OnInit, computed, signal, inject, OnChanges, SimpleChanges } from '@angular/core';
import { GLOBAL_UI_CONFIG, ControlSize, CONTROL_SIZES } from '../../models/ui-config.model';

/**
 * Applies the standard container styling.
 * Usage: <div smartContainer>...</div>
 */
@Directive({
  selector: '[smartContainer]',
  standalone: true
})
export class SmartContainerDirective implements OnInit {
  private el = inject(ElementRef);

  ngOnInit() {
    this.el.nativeElement.className = `${GLOBAL_UI_CONFIG.container} ${this.el.nativeElement.className}`;
  }
}

/**
 * Applies the standard Input styling to any <input>, <textarea>, or <select>.
 * Usage: <input smartInput size="small">
 */
@Directive({
  selector: '[smartInput]',
  standalone: true
})
export class SmartInputDirective implements OnInit, OnChanges {
  private el = inject(ElementRef);
  
  @Input() size: ControlSize = 'medium';
  @Input() hasError: boolean = false;
  @Input() hasIconPrefix: boolean = false;
  @Input() hasIconSuffix: boolean = false;

  ngOnInit() {
    this.applyClasses();
  }

  ngOnChanges() {
    this.applyClasses();
  }

  private applyClasses() {
    const base = GLOBAL_UI_CONFIG.input;
    const sizeStyles = CONTROL_SIZES[this.size].input;
    const error = this.hasError ? 'border-danger focus:ring-danger focus:border-danger' : '';
    const prefix = this.hasIconPrefix ? GLOBAL_UI_CONFIG.inputHasPrefix : '';
    const suffix = this.hasIconSuffix ? GLOBAL_UI_CONFIG.inputHasSuffix : '';

    this.el.nativeElement.className = `
      ${base} 
      ${sizeStyles} 
      ${error} 
      ${prefix} 
      ${suffix} 
      ${this.el.nativeElement.getAttribute('class')?.replace(base, '') || ''}
    `.trim();
  }
}

/**
 * Applies the Floating Label styling.
 * Usage: <label smartLabel>My Label</label>
 */
@Directive({
  selector: '[smartLabel]',
  standalone: true
})
export class SmartLabelDirective implements OnInit, OnChanges {
  private el = inject(ElementRef);

  @Input() size: ControlSize = 'medium';
  @Input() floatingMode: 'IN' | 'ON' = 'ON';
  @Input() hasError: boolean = false;
  @Input() hasIconPrefix: boolean = false;

  ngOnInit() {
    this.applyClasses();
  }

  ngOnChanges() {
    this.applyClasses();
  }

  private applyClasses() {
    const base = GLOBAL_UI_CONFIG.label;
    const sizeStyles = CONTROL_SIZES[this.size].label;
    const error = this.hasError ? 'text-danger peer-focus:text-danger' : '';
    const prefix = this.hasIconPrefix ? GLOBAL_UI_CONFIG.labelHasPrefix : '';
    const mode = this.floatingMode === 'ON' ? 'peer-focus:-top-2.5' : 'peer-focus:top-1';

    this.el.nativeElement.className = `
      ${base} 
      ${sizeStyles} 
      ${error} 
      ${prefix} 
      ${mode}
      ${this.el.nativeElement.getAttribute('class')?.replace(base, '') || ''}
    `.trim();
  }
}

/**
 * Applies Checkbox styling.
 * Usage: <input type="checkbox" smartCheckbox>
 */
@Directive({
  selector: '[smartCheckbox]',
  standalone: true
})
export class SmartCheckboxDirective implements OnInit, OnChanges {
  private el = inject(ElementRef);
  @Input() size: ControlSize = 'medium';

  ngOnInit() { this.applyClasses(); }
  ngOnChanges() { this.applyClasses(); }

  private applyClasses() {
    const base = GLOBAL_UI_CONFIG.checkboxInput;
    const sizeStyles = CONTROL_SIZES[this.size].checkbox;
    
    // Simple replacement to allow updates
    this.el.nativeElement.className = `
      ${base} 
      ${sizeStyles} 
      ${this.el.nativeElement.getAttribute('class')?.replace(base, '') || ''}
    `.trim();
  }
}

/**
 * Applies Radio styling.
 * Usage: <input type="radio" smartRadio>
 */
@Directive({
  selector: '[smartRadio]',
  standalone: true
})
export class SmartRadioDirective implements OnInit {
  private el = inject(ElementRef);
  
  ngOnInit() {
    // Basic tailwind radio styles matching the theme
    const base = 'cursor-pointer h-4 w-4 border-gray-300 text-primary focus:ring-primary';
    this.el.nativeElement.className = `${base} ${this.el.nativeElement.className}`;
  }
}

/**
 * Applies Button styling.
 * Usage: <button smartButton variant="primary" size="small">Click Me</button>
 */
@Directive({
  selector: '[smartButton]',
  standalone: true
})
export class SmartButtonDirective implements OnInit, OnChanges {
  private el = inject(ElementRef);
  
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary';
  @Input() size: ControlSize = 'medium';

  ngOnInit() { this.applyClasses(); }
  ngOnChanges() { this.applyClasses(); }

  private applyClasses() {
    const base = GLOBAL_UI_CONFIG.actionButton;
    
    // Size Logic from Central Config
    const sizeClass = CONTROL_SIZES[this.size]?.button || CONTROL_SIZES['medium'].button;

    // Color Logic
    let colorClass = '';
    switch (this.variant) {
      case 'secondary': colorClass = 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'; break;
      case 'outline': colorClass = 'bg-transparent border border-primary text-primary hover:bg-blue-50'; break;
      case 'ghost': colorClass = 'bg-transparent text-gray-600 hover:bg-gray-100 shadow-none'; break;
      case 'danger': colorClass = 'bg-red-600 text-white border border-red-600 hover:bg-red-700'; break;
      case 'primary': default: colorClass = 'bg-primary border border-primary text-white hover:bg-blue-600'; break;
    }

    this.el.nativeElement.className = `
      ${base} 
      ${sizeClass} 
      ${colorClass}
      ${this.el.nativeElement.getAttribute('class')?.replace(base, '') || ''}
    `.trim();
  }
}
