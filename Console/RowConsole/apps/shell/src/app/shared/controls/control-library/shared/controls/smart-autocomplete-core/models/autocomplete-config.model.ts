
export type AutocompleteViewMode = 'general' | 'cards' | 'table';
export type SmartAutocompleteViewMode = 'table' | 'cards' | 'general';

export type AutocompleteWildcardOperator = 'AUTO' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'EXACT';
export type AutocompleteConditionalOperator = 'AND' | 'NOT' | 'AND_NOT';

// Request Models
export interface AutoCompleteSearchParam {
    parameter_name?: string;
    parameter_code?: string;
    conditional_operator?: string;
    wildcard_operator?: string;
    parameter_value?: string;
}

export interface AutoCompleteSearchString extends AutoCompleteSearchParam {}

export interface AutoCompleteRequest {
    take: number;
    base_filters: AutoCompleteSearchParam[];
    search_filters: AutoCompleteSearchString[];
}

// Config Models
export interface AutocompleteTableColumn {
    header: string;
    field: string;
    width?: string;
    align?: 'left' | 'right' | 'center';
    cardHeader?: boolean;
    cardRow?: boolean;
    cardOrder?: number;
    cardLabel?: string;
    index?: number;
    columnType?: 'TEXT' | 'IMAGE';
}

export interface AutocompleteFieldConfig {
    code: string;
    label: string;
    parameterName: string;
    defaultWildcard?: AutocompleteWildcardOperator;
    allowNot?: boolean;
}

export interface SmartAutocompleteFeatureFlags {
    shiftHelperEnabled: boolean;
    autoSpaceBetweenTokens: boolean;
    allowWildcardShortcuts: boolean;
    allowPrefixShortcuts: boolean;
    showFieldBadgesInHelper: boolean;
}

export interface AutocompleteSelectionConfig {
    closeOnSelect?: boolean;
    displayMode?: 'single' | 'multi';
    displayField?: string;
    displayFields?: string[];
    displaySeparator?: string;
}

export interface AutocompletePanelConfig {
    maxHeight?: string;
    minWidth?: string;
    maxWidth?: string;
}

export interface AutocompleteSourceConfig<TModel = any> {
    key: string;
    apiUrl: string;
    takeDefault?: number;
    fields: AutocompleteFieldConfig[];
    viewMode: AutocompleteViewMode;
    showClear?: boolean;
    tableColumns?: AutocompleteTableColumn[];
    featureFlags?: Partial<SmartAutocompleteFeatureFlags>;
    baseFilters?: Record<string, any>;
    selectionConfig?: AutocompleteSelectionConfig;
    panelConfig?: AutocompletePanelConfig;
}

export interface ApiResult<T> {
    is_success: boolean;
    data?: T;
    value?: T;
    response_message?: string;
}
