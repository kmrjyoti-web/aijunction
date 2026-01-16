import { Density, DensitySetting } from './density.model';

export interface TableConfig {
  feature: string;
  key: string;
  api: ApiConfig;
  config: Config;
  columns: Column[];
  rowMenu: RowMenuItem[];
  rowActions?: RowActionItem[];
  headerMenu?: RowMenuItem[];
  drawerConfig: DrawerConfig;
  advancedFilters?: AdvancedFilterConfig;
}

export interface ApiConfig {
  url: string;
  pathTable: string;
  pathExport: string;
  method: string;
  defaultPageSize: number;
}

export interface EncryptionConfig {
  enabled: boolean;
  // An array of field codes (e.g., 'email_id') to encrypt.
  // If empty and enabled=true, all fields will be encrypted.
  encryptedFields: string[];
  // A secret key for encryption. In a real app, this should be managed securely.
  secretKey: string;
}

export type DataStrategy = 'ONLINE_FIRST' | 'OFFLINE_FIRST' | 'HYBRID' | 'SYNC';

export interface ExportOption {
  label: string;
  key: 'csv' | 'pdf' | 'excel';
  icon: string;
}

export interface ExportConfig {
  enabled: boolean;
  options: ExportOption[];
}

export interface EmptyStateAction {
  label: string;
  icon?: string;
  key: string;
  class?: string;
}

export interface EmptyStateMigration {
  enabled: boolean;
  title: string;
  logos: { src: string; alt: string }[];
  moreText: string;
  action: EmptyStateAction;
}

export interface EmptyStateConfig {
  enabled: boolean;
  imageUrl?: string;
  title: string;
  subtitle: string;
  actions?: EmptyStateAction[];
  migration?: EmptyStateMigration;
}

export interface Config {
  id: string;
  title: string;
  dataStrategy: DataStrategy;
  pagingMode: 'paginator' | 'infinite';
  infiniteScrollBehavior?: 'append' | 'replace';
  paginatorPosition?: 'top' | 'bottom' | 'both';
  stripedRows?: boolean;
  showGridlines?: boolean;
  rowHover?: boolean;
  globalFilterFields?: string[];
  enableColumnChooser: boolean;
  exportConfig?: ExportConfig;
  enableRowMenu: boolean;
  enableHeaderActions: boolean;
  enableSavedQueries: boolean;
  enableConfigButton: boolean;
  enableChipFilters?: boolean;
  enableMultiSelect?: boolean;
  enableFreeze?: boolean;
  defaultRows: number;
  role: string;
  toolbarActions: ToolbarAction[];
  toolbarButtonMode?: 'iconAndText' | 'iconOnly';
  sizerConfig: SizerConfig;
  encryptionConfig?: EncryptionConfig;
  cardViewConfig?: CardViewConfig;
  emptyStateConfig?: EmptyStateConfig;
  footerConfig?: FooterConfig;
  styleConfig?: StyleConfig;
}

export interface StyleConfig {
  headerBackgroundColor?: string;
  footerBackgroundColor?: string;
  enableTransparency: boolean;
  backgroundImageUrl?: string; // Optional URL for background image
}

export interface ToolbarAction {
  label: string;
  icon: string;
  key: string;
}

export interface SizerConfig {
  enabled: boolean;
  defaultDensity: Density;
  densities: DensitySetting[];
  additionalReservedSpace?: number;
}

export interface CardViewConfig {
  cardsPerRow: number;
}

export interface ImageConfig {
  shape: 'circle' | 'square';
}

export interface CellTemplateItem {
  code: string;
  tag?: 'p' | 'small' | 'span';
  bold?: boolean;
  columnType?: 'TEXT' | 'IMAGE';
  imageConfig?: ImageConfig;
}

export interface MaskConfig {
  enabled: boolean;
  unmaskEnabled?: boolean;
  visibleStart?: number;
  visibleEnd?: number;
  maskChar?: string;
}

// New Validation Interfaces
export interface ValidationStyle {
  bgcolor?: string;
  textcolor?: string;
  tooltip?: string;
}

export interface RequiredValidation extends ValidationStyle {
  status: boolean;
}

export interface MobileValidation extends ValidationStyle {
    required?: boolean;
    allowedPrefixes?: string[];
    notAllowedPrefixes?: string[];
    minDigits?: number;
    maxDigits?: number;
    blacklist?: string[];
}

export interface EmailValidation extends ValidationStyle {
    required?: boolean;
    allowedDomains?: string[];
    notAllowedDomains?: string[];
    blacklist?: string[];
    highlightColor?: string;
}

export interface GenericValidation extends ValidationStyle {
    minLength?: number;
    maxLength?: number;
    onlyNumbers?: boolean;
    pattern?: string;
}

export interface FieldValidation {
  code: string;
  isRequired?: RequiredValidation;
  mobileValidation?: MobileValidation;
  emailValidation?: EmailValidation;
  genericValidation?: GenericValidation;
}

export interface FilterConfig {
  defaultOperator: 'STARTS_WITH' | 'ENDS_WITH' | 'EXACT' | 'CONTAINS';
}

export interface Column {
  index: number;
  name: string;
  code: string;
  display: string;
  columnType?: 'CHECKBOX' | 'ACTION' | 'MOBILE' | 'EMAIL' | 'TEXT' | 'IMAGE' | 'DATE' | 'numeric';
  imageConfig?: ImageConfig;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  frozen?: boolean;
  filterConfig?: FilterConfig;
  filterOnCodes?: string[];
  cardHeader?: boolean;
  cardHeader1?: boolean;
  cardRow?: boolean;
  listRow?: boolean;
  mask?: MaskConfig;
  isRequired?: RequiredValidation;
  requiredMinLength?: number;
  mobileValidation?: MobileValidation;
  emailValidation?: EmailValidation;
  genericValidation?: GenericValidation;
  cellTemplate?: CellTemplateItem[];
  showOnColumnChooser?: boolean;
  validations?: FieldValidation[];
}

export interface RowMenuItem {
  label: string;
  items: RowMenuSubItem[];
}

export interface RowMenuSubItem {
  label: string;
  icon?: string;
  action?: string;
  shortcut?: string;
  items?: RowMenuSubItem[]; // Recursive property for sub-menus
}

export interface RowActionItem {
  label: string;
  icon: string;
  action: string;
  color?: string; // e.g., 'text-blue-500'
  shortcut?: string;
}


export interface DrawerConfig {
  width: string;
  position: string;
  buttons: DrawerButton[];
  headerActions: DrawerHeaderAction[];
}

export interface DrawerButton {
  label: string;
  icon: string;
  class: string;
  action: string;
  type: string;
}

export interface DrawerHeaderAction {
  icon: string;
  tooltip: string;
  action: string;
}

// --- Advanced Filter Models ---

export type FilterOperator = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'between' | 'not between' | 'contains';
export type DateOperator = 'age in' | 'previous' | 'next' | 'today' | 'this week' | 'this month' | 'this year' | 'in the last 30 days';

export interface FilterDefinition {
  code: string;
  name: string;
  type: 'numeric' | 'text' | 'date' | 'select';
  operators?: FilterOperator[];
  dateOperators?: DateOperator[];
  defaultOperator?: FilterOperator | DateOperator;
  value?: any;
  value2?: any;
  // fix: Added 'options' property to support 'select' type filters.
  options?: string[];
}

export interface FilterGroup {
  name: string;
  collapsible: boolean;
  filters: FilterDefinition[];
}

export interface AdvancedFilterConfig {
  enabled: boolean;
  groups: FilterGroup[];
}

export interface ActiveFilter {
  code: string;
  name: string;
  type: 'numeric' | 'text' | 'date' | 'select';
  operator: FilterOperator | DateOperator;
  value1: any;
  value2?: any;
}

// fix: Added missing FooterConfig interface for the footer component.
export interface FooterColumn {
  code: string;
  aggregation: 'sum' | 'avg' | 'count';
  display: string;
}

export interface FooterConfig {
  enabled: boolean;
  columns: FooterColumn[];
}
