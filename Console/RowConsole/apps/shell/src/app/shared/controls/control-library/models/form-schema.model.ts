
import { UiConfig, ControlSize } from './ui-config.model';
import { IconName } from '../helpers/icon.helper';

export type ControlType = 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'multi-select' | 'checkbox' | 'radio' | 'date' | 'mobile' | 'currency' | 'radio-group' | 'checkbox-group' | 'list-checkbox' | 'switch' | 'color' | 'editor' | 'toggle-button' | 'button' | 'autocomplete' | 'smart-autocomplete' | 'rating' | 'slider' | 'tags' | 'segment' | 'file-upload' | 'signature' | 'otp' | 'fieldset' | 'confirm-dialog' | 'alert-dialog' | 'table';

export type SuffixAction = 'toggleVisibility' | 'clear' | 'search' | 'calendar';

export interface ValidationConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number | string; // Updated to support Date strings (YYYY-MM-DD)
  max?: number | string; // Updated to support Date strings (YYYY-MM-DD)
  email?: boolean;
}

export interface ApiConfig {
  endpoint: string;
  method?: 'GET' | 'POST';
  labelKey: string; // Key to show in dropdown
  valueKey: string; // Key to save
  dependency?: string; // Field key this control depends on
  paramKey?: string; // Query param or body key for the dependency value
}

export interface Option {
  label: string;
  value: string | number | boolean;
  icon?: IconName; // For Icon variants
  image?: string; // For Image variants
  description?: string; // Helper text for cards
  command?: string; // For buttons
}

export interface TransliterationConfig {
  enabled: boolean;
  languages?: { code: string; label: string }[] | string[]; // e.g. [{code:'hi', label:'Hindi'}]
  defaultLanguage?: string;
  showControls?: boolean; // Defaults to false (Hidden UI)
  autoConvert?: boolean; // Defaults to false
}

export interface FormFieldConfig {
  key: string;
  type: ControlType;
  label: string;
  placeholder?: string;
  defaultValue?: any;
  options?: Option[]; // Static options
  api?: ApiConfig; // Dynamic options
  validators?: ValidationConfig;
  hidden?: boolean;
  props?: Record<string, any>; // Extra props like rows, layout ('list' | 'grid'), cols

  // Icon & Action Configuration
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  suffixAction?: SuffixAction;

  // Transliteration
  transliteration?: TransliterationConfig;

  // Visuals
  size?: ControlSize;
  tooltip?: string;

  // Keyboard Navigation
  previousControl?: string; // Key of the previous control to focus on ArrowLeft
  nextControl?: string;     // Key of the next control to focus on ArrowRight

  // Allow overriding global UI config for this specific field
  ui?: Partial<UiConfig>;
}

export interface ColumnConfig {
  span: string; // Tailwind class e.g., 'col-span-12 md:col-span-6'
  field: FormFieldConfig;
}

export interface RowConfig {
  columns: ColumnConfig[];
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: IconName;
  image?: string; // Support images in tabs
  rows: RowConfig[];
}

export interface FormSchema {
  title: string;
  description?: string;
  layout?: 'standard' | 'tabs'; // Support different layouts
  tabs?: TabConfig[]; // Only used if layout is 'tabs'
  rows?: RowConfig[]; // Used if layout is 'standard' (default)
}
