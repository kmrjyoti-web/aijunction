import { AbstractControl } from '@angular/forms';

/**
 * Utility for extracting validation messages and checking validity.
 */
export class ValidationUtil {
  
  /**
   * Returns a human-readable error message based on the Angular Validation Errors.
   * @param control The AbstractControl to check.
   * @param label Optional label to include in the message (e.g., "Email is required").
   */
  static getErrorMessage(control: AbstractControl | null, label?: string): string {
    if (!control || !control.errors) return '';

    const errors = control.errors;
    const fieldName = label || 'Field';

    if (errors['required']) {
      return `${fieldName} is required`;
    }
    
    if (errors['email']) {
      return `Invalid email format`;
    }

    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} characters required`;
    }

    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      return `Maximum ${requiredLength} characters allowed`;
    }

    if (errors['pattern']) {
      return `Invalid format`;
    }

    if (errors['min']) {
        return `Value must be at least ${errors['min'].min}`;
    }

    if (errors['max']) {
        return `Value must be at most ${errors['max'].max}`;
    }

    return 'Invalid value';
  }

  /**
   * Checks if a control is invalid and has been touched or dirty.
   */
  static hasError(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}