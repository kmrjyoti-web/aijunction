
import { Injectable, signal } from '@angular/core';
import { ConfirmDialogConfig } from '../models/confirm-dialog.model';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  // State: Holds visibility and configuration
  private _state = signal<{ isOpen: boolean; config: ConfirmDialogConfig | null }>({
    isOpen: false,
    config: null
  });

  // Read-only signal for the component
  state = this._state.asReadonly();
  
  // Internal reference to the resolve function of the current promise
  private resolveFn: ((result: boolean) => void) | null = null;

  /**
   * Opens the confirm dialog and returns a promise that resolves when the user closes it.
   */
  confirm(config: ConfirmDialogConfig): Promise<boolean> {
    this._state.set({ isOpen: true, config });
    
    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  /**
   * Closes the dialog and resolves the promise with the given result.
   */
  close(result: boolean) {
    this._state.set({ isOpen: false, config: null });
    if (this.resolveFn) {
      this.resolveFn(result);
      this.resolveFn = null;
    }
  }
}
