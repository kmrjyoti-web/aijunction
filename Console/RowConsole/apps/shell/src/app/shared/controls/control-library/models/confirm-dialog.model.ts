
export type DialogType = 'info' | 'success' | 'warning' | 'danger';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean; // Optional flag to hide cancel button (e.g. for alerts)
}
