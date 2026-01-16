
import { Component, computed, signal, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDynamicControl } from '../base-control';

@Component({
  selector: 'smart-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="ui.container">
      
      <label class="block text-sm font-medium text-gray-700 mb-3 text-center">
        {{ field.label }}
        @if(field.validators?.required){ <span class="text-danger">*</span> }
      </label>

      <div [class]="ui.otpContainer">
        @for (digit of digits(); track $index) {
          <input
            #otpDigit
            type="text"
            inputmode="numeric"
            maxlength="1"
            [value]="digits()[$index]"
            (input)="onInput($index, $event)"
            (keydown)="onKeyDown($index, $event)"
            (focus)="onFocus($event)"
            [class]="ui.otpInput"
            [class.border-danger]="hasError()"
            [class.focus:ring-danger]="hasError()"
            [class.focus:border-danger]="hasError()"
          />
        }
      </div>

      @if (hasError()) {
        <div [class]="ui.error" class="text-center mt-2">{{ getErrorMessage() }}</div>
      }
    </div>
  `
})
export class OtpInputComponent extends BaseDynamicControl implements OnInit {
  @ViewChildren('otpDigit') inputElements!: QueryList<ElementRef<HTMLInputElement>>;

  length = 6; // Default OTP length
  digits = signal<string[]>([]);

  override ngOnInit() {
    // Determine length from props or default
    this.length = this.field.props?.['length'] || 6;
    this.digits.set(new Array(this.length).fill(''));
    
    // Sync if value exists
    const val = this.control()?.value;
    if (val && typeof val === 'string' && val.length === this.length) {
      this.digits.set(val.split(''));
    }

    // Call base logic
    super.ngOnInit();
  }

  onInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Handle paste or single char
    if (value.length > 1) {
      // Paste detected?
      const chars = value.split('').slice(0, this.length);
      this.digits.set(chars.concat(new Array(this.length - chars.length).fill('')));
      this.updateControl();
      // Focus last filled
      const nextIndex = Math.min(chars.length, this.length - 1);
      this.focusIndex(nextIndex);
      return;
    }

    const currentDigits = [...this.digits()];
    currentDigits[index] = value;
    this.digits.set(currentDigits);
    this.updateControl();

    if (value && index < this.length - 1) {
      this.focusIndex(index + 1);
    }
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      const currentDigits = [...this.digits()];
      if (!currentDigits[index] && index > 0) {
        // If empty, move back and delete
        currentDigits[index - 1] = '';
        this.digits.set(currentDigits);
        this.updateControl();
        this.focusIndex(index - 1);
      } else {
        // Just delete current
        currentDigits[index] = '';
        this.digits.set(currentDigits);
        this.updateControl();
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
       this.focusIndex(index - 1);
    } else if (event.key === 'ArrowRight' && index < this.length - 1) {
       this.focusIndex(index + 1);
    }
  }

  onFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  private focusIndex(index: number) {
    const inputs = this.inputElements.toArray();
    if (inputs[index]) {
      inputs[index].nativeElement.focus();
    }
  }

  private updateControl() {
    const val = this.digits().join('');
    // Only set value if full length? Or partial? usually full length for OTP
    this.control()?.setValue(val);
    this.control()?.markAsDirty();
    this.control()?.markAsTouched();
  }
}
