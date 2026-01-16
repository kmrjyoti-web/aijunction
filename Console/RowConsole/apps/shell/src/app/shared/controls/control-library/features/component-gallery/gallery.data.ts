
import { FormFieldConfig } from '../../models/form-schema.model';
import { GLOBAL_APP_CONFIG } from '../../models/app-config.model';

export interface ComponentDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  versions: {
    version: string;
    config: FormFieldConfig;
    apiDocs: string;
  }[];
}

export const COMPONENT_GALLERY_DATA: ComponentDef[] = [
  {
    id: 'inputs',
    name: 'Text & Inputs',
    description: 'Collection of standard text-based inputs.',
    icon: 'documentText',
    versions: [
      {
        version: 'Standard',
        config: {
          key: 'demo_text',
          type: 'text',
          label: 'Full Name',
          placeholder: 'John Doe',
          validators: { required: true, minLength: 3 }
        },
        apiDocs: 'Basic text input.'
      },
      {
        version: 'With Validation',
        config: {
          key: 'demo_email',
          type: 'email',
          label: 'Email',
          placeholder: 'Enter email...',
          validators: { required: true, email: true }
        },
        apiDocs: 'Includes built-in validation.'
      },
      {
        version: 'Custom Themed',
        config: {
          key: 'demo_theme',
          type: 'text',
          label: 'Branded Input',
          placeholder: 'Type something...',
          props: {
            variant: 'filled',
            fluid: true,
            dt: {
              'inputtext.background': '#edf7ff',
              'inputtext.border.color': '#3b82f6',
              'inputtext.color': '#1e3a8a',
              'inputtext.focus.border.color': '#2563eb',
              'inputtext.filled.background': '#dbeafe',
              'inputtext.placeholder.color': '#93c5fd'
            }
          }
        },
        apiDocs: 'Uses "dt" prop for Design Token injection (CSS Variables).'
      },
      {
        version: 'Direct Flexible',
        config: {
          key: 'demo_direct',
          type: 'text',
          label: 'Direct props & Tiny Size',
          placeholder: 'Tiny input...',
          size: 'tiny',
          props: {
            style: { 'padding-left': '2.5rem', 'background-color': '#f0fdf4' },
            class: 'font-bold text-green-700',
            events: {
              focus: 'customFocusCommand',
              blur: 'customBlurCommand'
            }
          }
        },
        apiDocs: 'Demonstrates direct [style], [class], size="tiny", and event mapping.'
      },
      {
        version: 'Floating Labels',
        config: {
          key: 'demo_float',
          type: 'text',
          label: 'Label Variants (Over/In/On)',
          placeholder: 'Try variants...',
          props: {
            floatLabel: 'over' // Default demo
          }
        },
        apiDocs: 'Change "floatLabel" in config to "in", "on", "over", or "off". Default is "auto".'
      },
      {
        version: 'Shape & Icon Btn',
        config: {
          key: 'demo_shape',
          type: 'text',
          label: 'Square Search',
          placeholder: 'Search query...',
          suffixIcon: 'search',
          prefixIcon: 'documentText',
          props: {
            shape: 'square',
            suffixType: 'button',
            suffixAction: 'search'
          }
        },
        apiDocs: 'Demonstrates shape="square" and suffixType="button".'
      },
      {
        version: 'Transliteration',
        config: {
          key: 'demo_transliteration',
          type: 'text',
          label: 'Phonetic Typing',
          placeholder: 'Type "Namaste"...',
          transliteration: {
            enabled: true,
            autoConvert: true,
            showControls: true,
            languages: GLOBAL_APP_CONFIG.transliteration.languages
          }
        },
        apiDocs: 'Enables phonetic typing. Languages derived from Global Config.'
      },
      {
        version: 'Email',
        config: {
          key: 'demo_email_classic',
          type: 'email',
          label: 'Email Address',
          placeholder: 'user@example.com',
          validators: { required: true, email: true }
        },
        apiDocs: 'Validates email format.'
      },
      {
        version: 'Password',
        config: {
          key: 'demo_password',
          type: 'password',
          label: 'Password',
          suffixAction: 'toggleVisibility'
        },
        apiDocs: 'Includes visibility toggle.'
      },
      {
        version: 'Textarea',
        config: {
          key: 'demo_textarea',
          type: 'textarea',
          label: 'Bio',
          props: { rows: 4 }
        },
        apiDocs: 'Multi-line text input.'
      },
      {
        version: 'Number',
        config: {
          key: 'demo_number',
          type: 'number',
          label: 'Age',
          validators: { min: 18, max: 100 }
        },
        apiDocs: 'Numeric input with min/max validation.'
      },
      {
        version: 'Square Number',
        config: {
          key: 'demo_number_sq',
          type: 'number',
          label: 'Quantity',
          props: {
            shape: 'square',
            floatLabel: 'in'
          }
        },
        apiDocs: 'Numeric input with square shape.'
      }
    ]
  },
  {
    id: 'editor',
    name: 'Rich Text Editor',
    description: 'WYSIWYG editor for complex content.',
    icon: 'documentText', // Using generic icon
    versions: [
      {
        version: 'Basic',
        config: {
          key: 'demo_editor',
          type: 'editor',
          label: 'Article Content',
          props: { height: '200px' }
        },
        apiDocs: 'Rich text editor wrapper.'
      }
    ]
  },
  {
    id: 'select-group',
    name: 'Selectors',
    description: 'Dropdowns and Multi-selects.',
    icon: 'listBullet',
    versions: [
      {
        version: 'Select',
        config: {
          key: 'demo_select',
          type: 'select',
          label: 'Department',
          options: [
            { label: 'HR', value: 'hr' },
            { label: 'Engineering', value: 'eng' },
            { label: 'Sales', value: 'sales' }
          ]
        },
        apiDocs: 'Single selection dropdown.'
      },
      {
        version: 'Floating Label Select',
        config: {
          key: 'demo_select_float',
          type: 'select',
          label: 'Select (Floating)',
          options: [
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' }
          ],
          props: {
            floatLabel: 'in',
            shape: 'square'
          }
        },
        apiDocs: 'Shows "in" floatLabel and "square" shape.'
      },
      {
        version: 'Multi-Select',
        config: {
          key: 'demo_multi',
          type: 'multi-select',
          label: 'Skills',
          options: [
            { label: 'Angular', value: 'ng' },
            { label: 'React', value: 'react' },
            { label: 'Vue', value: 'vue' },
            { label: 'Svelte', value: 'svelte' }
          ]
        },
        apiDocs: 'Multiple selection dropdown.'
      },
      {
        version: 'Floating Multi-Select',
        config: {
          key: 'demo_multi_float',
          type: 'multi-select',
          label: 'Tags (Floating)',
          options: [
            { label: 'Red', value: 'r' },
            { label: 'Green', value: 'g' },
            { label: 'Blue', value: 'b' }
          ],
          props: {
            floatLabel: 'in',
            shape: 'rounded'
          }
        },
        apiDocs: 'Multi-select with floating label.'
      },
      {
        version: 'Autocomplete (Simple)',
        config: {
          key: 'demo_auto',
          type: 'autocomplete',
          label: 'Country',
          options: [
            { label: 'USA', value: 'us' },
            { label: 'Canada', value: 'ca' },
            { label: 'UK', value: 'uk' },
            { label: 'India', value: 'in' },
            { label: 'Australia', value: 'au' }
          ]
        },
        apiDocs: 'Autocomplete with local data filtering.'
      },
      {
        version: 'Square Autocomplete',
        config: {
          key: 'demo_auto_sq',
          type: 'autocomplete',
          label: 'Search City',
          options: [
            { label: 'New York', value: 'ny' },
            { label: 'London', value: 'ldn' },
            { label: 'Paris', value: 'prs' }
          ],
          props: {
            shape: 'square',
            floatLabel: 'on'
          }
        },
        apiDocs: 'Autocomplete with square shape.'
      }
    ]
  },
  {
    id: 'check-radio',
    name: 'Checks & Radios',
    description: 'Radio groups, Checkboxes, and Switches.',
    icon: 'checkCircle',
    versions: [
      {
        version: 'Radio Group',
        config: {
          key: 'demo_radio',
          type: 'radio-group',
          label: 'Gender',
          options: [
            { label: 'Male', value: 'm' },
            { label: 'Female', value: 'f' },
            { label: 'Other', value: 'o' }
          ]
        },
        apiDocs: 'Standard radio group.'
      },
      {
        version: 'Checkbox Group',
        config: {
          key: 'demo_check_group',
          type: 'checkbox-group',
          label: 'Preferences',
          options: [
            { label: 'Newsletter', value: 'news' },
            { label: 'Notifications', value: 'notif' }
          ]
        },
        apiDocs: 'Multiple checkbox selection.'
      },
      {
        version: 'Switch',
        config: {
          key: 'demo_switch',
          type: 'switch',
          label: 'Dark Mode'
        },
        apiDocs: 'Toggle switch.'
      },
      {
        version: 'Checkbox (Boolean)',
        config: {
          key: 'demo_check_bool',
          type: 'checkbox',
          label: 'I agree to terms'
        },
        apiDocs: 'Single boolean checkbox.'
      },
      {
        version: 'Segmented',
        config: {
          key: 'demo_segment',
          type: 'segment',
          label: 'View',
          options: [
            { label: 'List', value: 'list' },
            { label: 'Grid', value: 'grid' },
            { label: 'Map', value: 'map' }
          ]
        },
        apiDocs: 'Segmented control for mutually exclusive options.'
      }
    ]
  },
  {
    id: 'specialized',
    name: 'Specialized Inputs',
    description: 'Mobile, Currency, Color, OTP, etc.',
    icon: 'sparkles', // Using custom or generic
    versions: [
      {
        version: 'Mobile',
        config: {
          key: 'demo_mobile',
          type: 'mobile',
          label: 'Phone Number',
          validators: { required: true }
        },
        apiDocs: 'Mobile input with country code support.'
      },
      {
        version: 'Currency',
        config: {
          key: 'demo_currency',
          type: 'currency',
          label: 'Salary',
          props: { currencyCode: 'USD' }
        },
        apiDocs: 'Currency formatting.'
      },
      {
        version: 'Color Picker',
        config: {
          key: 'demo_color',
          type: 'color',
          label: 'Theme Color',
          defaultValue: '#3b82f6'
        },
        apiDocs: 'Native or custom color picker.'
      },
      {
        version: 'OTP',
        config: {
          key: 'demo_otp',
          type: 'otp',
          label: 'Enter Code',
          props: { length: 4 }
        },
        apiDocs: 'One-Time Password input.'
      }
    ]
  },
  {
    id: 'date-time',
    name: 'Date & Time',
    description: 'Date pickers.',
    icon: 'calendar',
    versions: [
      {
        version: 'Date',
        config: {
          key: 'demo_date',
          type: 'date',
          label: 'Birth Date'
        },
        apiDocs: 'Standard date picker.'
      },
      {
        version: 'Square Datepicker',
        config: {
          key: 'demo_date_sq',
          type: 'date',
          label: 'Deadline',
          props: {
            shape: 'square',
            floatLabel: 'over'
          }
        },
        apiDocs: 'Date picker with square shape and floating label.'
      }
    ]
  },
  {
    id: 'interactive',
    name: 'Interactive',
    description: 'Ratings, Sliders, Tags.',
    icon: 'cursor',
    versions: [
      {
        version: 'Rating',
        config: {
          key: 'demo_rating',
          type: 'rating',
          label: 'Feedback',
          props: { max: 5 }
        },
        apiDocs: 'Star rating component.'
      },
      {
        version: 'Slider',
        config: {
          key: 'demo_slider',
          type: 'slider',
          label: 'Volume',
          props: { min: 0, max: 100, step: 1 }
        },
        apiDocs: 'Range slider.'
      },
      {
        version: 'Tags',
        config: {
          key: 'demo_tags',
          type: 'tags',
          label: 'Keywords',
          placeholder: 'Add tag...'
        },
        apiDocs: 'Tag input.'
      }
    ]
  },
  {
    id: 'files-signature',
    name: 'Files & Signature',
    description: 'Uploaders and Signature pad.',
    icon: 'paperClip',
    versions: [
      {
        version: 'File Upload',
        config: {
          key: 'demo_file',
          type: 'file-upload',
          label: 'Attachment',
          props: { multiple: false, accept: '.pdf,.png,.jpg' }
        },
        apiDocs: 'File upload control.'
      },
      {
        version: 'Signature',
        config: {
          key: 'demo_sign',
          type: 'signature',
          label: 'Sign Here'
        },
        apiDocs: 'Canvas based signature pad.'
      }
    ]
  },
  {
    id: 'smart-autocomplete',
    name: 'Smart Search',
    description: 'Advanced search with fields and table views.',
    icon: 'search',
    versions: [
      {
        version: 'Default',
        config: {
          key: 'smart_search',
          type: 'smart-autocomplete',
          label: 'Pharma Search',
          props: {
            smartConfig: {
              key: "demo_source",
              apiUrl: "",
              fields: [{ code: "ON", label: "Org Name", parameterName: "Name" }],
              viewMode: "table",
              tableColumns: [
                { header: "Organization", field: "organization_name", index: 1 },
                { header: "City", field: "city", index: 2 }
              ]
            }
          }
        },
        apiDocs: 'Requires SmartAutocompleteConfig.'
      }
    ]
  },
  {
    id: 'actions',
    name: 'Actions',
    description: 'Buttons and Dialog Triggers.',
    icon: 'cursor',
    versions: [
      {
        version: 'Standard Variants',
        config: {
          key: 'demo_btn_variants',
          type: 'button',
          label: '',
          // Showcasing variants via separate buttons isn't directly supported by one config key 
          // unless we make a container. But here we show one Primary button as the main example.
          // For the Gallery, users switch versions to see others.
          placeholder: 'Primary Button',
          props: { variant: 'primary' }
        },
        apiDocs: 'Primary variant. Change variant prop to: secondary, outline, ghost, danger, link.'
      },
      {
        version: 'Secondary',
        config: {
          key: 'demo_btn_sec',
          type: 'button',
          label: '',
          placeholder: 'Secondary',
          props: { variant: 'secondary' }
        },
        apiDocs: 'Secondary styling.'
      },
      {
        version: 'Outline',
        config: {
          key: 'demo_btn_out',
          type: 'button',
          label: '',
          placeholder: 'Outline',
          props: { variant: 'outline' }
        },
        apiDocs: 'Outline styling.'
      },
      {
        version: 'Ghost',
        config: {
          key: 'demo_btn_ghost',
          type: 'button',
          label: '',
          placeholder: 'Ghost Button',
          props: { variant: 'ghost' }
        },
        apiDocs: 'Ghost styling (minimal).'
      },
      {
        version: 'Danger',
        config: {
          key: 'demo_btn_danger',
          type: 'button',
          label: '',
          placeholder: 'Delete Action',
          props: { variant: 'danger' }
        },
        apiDocs: 'Danger styling (Red).'
      },
      {
        version: 'Sizing (Large)',
        config: {
          key: 'demo_btn_lg',
          type: 'button',
          label: '',
          placeholder: 'Large Button',
          size: 'large',
          props: { variant: 'primary' }
        },
        apiDocs: 'Size: large.'
      },
      {
        version: 'Sizing (Small)',
        config: {
          key: 'demo_btn_sm',
          type: 'button',
          label: '',
          placeholder: 'Small',
          size: 'small',
          props: { variant: 'secondary' }
        },
        apiDocs: 'Size: small.'
      },
      {
        version: 'With Icons',
        config: {
          key: 'demo_btn_icon',
          type: 'button',
          label: '',
          placeholder: 'Save Changes',
          prefixIcon: 'checkCircle',
          suffixIcon: 'chevronRight',
          props: { variant: 'primary' }
        },
        apiDocs: 'Supports prefixIcon and suffixIcon.'
      },
      {
        version: 'With Image Avatar',
        config: {
          key: 'demo_btn_img',
          type: 'button',
          label: '',
          placeholder: 'John Doe',
          props: {
            variant: 'secondary',
            image: 'https://i.pravatar.cc/150?u=a042581f4e29026024d'
          }
        },
        apiDocs: 'Displays user avatar via `image` prop.'
      },
      {
        version: 'Split Button',
        config: {
          key: 'demo_split',
          type: 'button',
          label: 'Save Options',
          placeholder: 'Save Options',
          props: {
            buttonType: 'split',
            variant: 'primary'
          },
          options: [
            { label: 'Save Draft', value: 'draft', icon: 'documentText' }, // Using available icons as proxy
            { label: 'Save & Publish', value: 'publish', icon: 'checkCircle' },
            { label: 'Export PDF', value: 'pdf', icon: 'tag' }
          ]
        },
        apiDocs: 'Split button with main action and dropdown menu.'
      },
      {
        version: 'Button Group',
        config: {
          key: 'demo_group',
          type: 'button',
          label: 'Text Alignment',
          props: {
            buttonType: 'group'
          },
          options: [
            { label: 'Left', value: 'left', icon: 'alignLeft' }, // Using available icons as proxy
            { label: 'Center', value: 'center', icon: 'alignCenter' },
            { label: 'Right', value: 'right', icon: 'alignRight' }
          ]
        },
        apiDocs: 'Grouped buttons behaving like a radio selector.'
      },
      {
        version: 'Full Width',
        config: {
          key: 'demo_btn_full',
          type: 'button',
          label: '',
          placeholder: 'Sign In',
          props: { variant: 'primary', fullWidth: true }
        },
        apiDocs: 'Spans full container width.'
      },
      {
        version: 'Confirm Dialog',
        config: {
          key: 'demo_confirm',
          type: 'confirm-dialog',
          label: 'Delete Item',
          props: {
            variant: 'danger',
            dialogTitle: 'Delete Record?',
            dialogMessage: 'This action cannot be undone.'
          }
        },
        apiDocs: 'Button that triggers a confirmation dialog.'
      }
    ]
  },
  {
    id: 'data-table',
    name: 'Table',
    description: 'Data grid with sorting, pagination, and selection.',
    icon: 'table',
    versions: [
      {
        version: 'Basic Table',
        config: {
          key: 'demo_table_basic',
          type: 'table',
          label: 'Employee List',
          props: {
            rows: 5,
            paginator: true,
            columns: [
              { field: 'id', header: 'ID', sortable: true, width: '10%' },
              { field: 'name', header: 'Name', sortable: true, width: '40%' },
              { field: 'role', header: 'Role', sortable: true, width: '30%' },
              { field: 'status', header: 'Status', sortable: false, width: '20%' }
            ],
            value: [
              { id: 101, name: 'Alice Johnson', role: 'Engineer', status: 'Active' },
              { id: 102, name: 'Bob Smith', role: 'Designer', status: 'Active' },
              { id: 103, name: 'Charlie Davis', role: 'Manager', status: 'On Leave' },
              { id: 104, name: 'Diana Evans', role: 'Engineer', status: 'Active' },
              { id: 105, name: 'Ethan Harris', role: 'QA', status: 'Inactive' },
              { id: 106, name: 'Fiona Green', role: 'HR', status: 'Active' }
            ]
          }
        },
        apiDocs: 'Standard table with pagination and sorting.'
      },
      {
        version: 'Selection Table',
        config: {
          key: 'demo_table_select',
          type: 'table',
          label: 'Select Users',
          props: {
            rows: 5,
            selectionMode: 'multiple',
            dataKey: 'id',
            columns: [
              { field: 'name', header: 'Name', width: '50%' },
              { field: 'email', header: 'Email', width: '50%' }
            ],
            value: [
              { id: 1, name: 'John Doe', email: 'john@example.com' },
              { id: 2, name: 'Jane Roe', email: 'jane@example.com' },
              { id: 3, name: 'Sam Smith', email: 'sam@example.com' }
            ]
          }
        },
        apiDocs: 'Table with multiple row selection checkboxes.'
      }
    ]
  }
];
