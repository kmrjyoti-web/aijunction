
export interface EditorOption {
  label: string;
  value: string;
}

export interface EditorToolbarVisibility {
  history: boolean;       // Undo, Redo
  basicFormatting: boolean; // Bold, Italic, Underline, Strikethrough
  colors: boolean;        // Font Color, Highlight
  alignment: boolean;     // Left, Center, Right, Justify
  lists: boolean;         // Indent, Outdent, Bullet, Ordered
  scripts: boolean;       // Subscript, Superscript, Inline Code
  codeView: boolean;      // Toggle HTML Source view
  
  // Dropdown Visibility
  templates: boolean;
  headings: boolean;
  fonts: boolean;
  fontSizes: boolean;
}

export interface EditorConfig {
  showToolbar: EditorToolbarVisibility;
  
  dropdownOptions: {
    templates: EditorOption[];
    headings: EditorOption[];
    fonts: string[];
    fontSizes: EditorOption[];
  };
}

export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  showToolbar: {
    history: true,
    basicFormatting: true,
    colors: true,
    alignment: true,
    lists: true,
    scripts: true,
    codeView: true,
    templates: true,
    headings: true,
    fonts: true,
    fontSizes: true
  },
  
  dropdownOptions: {
    templates: [
      { label: 'Basic Table', value: 'TABLE' },
      { label: 'Comparison Table', value: 'COMP_TABLE' },
      { label: 'Simple Card', value: 'CARD' },
      { label: 'Product Card', value: 'PRODUCT_CARD' },
      { label: 'Quote Block', value: 'QUOTE' },
      { label: 'Smart List', value: 'CHECKLIST' },
      { label: 'Alert Info', value: 'ALERT_INFO' },
      { label: 'Social Links', value: 'SOCIAL_LINKS' },
      { label: 'Social Feed', value: 'SOCIAL_FEED' },
      { label: 'Signature', value: 'SIGNATURE' }
    ],
    headings: [
      { label: 'Normal', value: 'P' },
      { label: 'Heading 1', value: 'H1' },
      { label: 'Heading 2', value: 'H2' },
      { label: 'Heading 3', value: 'H3' },
      { label: 'Code', value: 'PRE' }
    ],
    fonts: [
      'Arial', 'Courier New', 'Georgia', 'Helvetica', 'Impact', 
      'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
    ],
    fontSizes: [
      { label: 'Small', value: '2' },
      { label: 'Normal', value: '3' },
      { label: 'Large', value: '4' },
      { label: 'Huge', value: '6' }
    ]
  }
};
