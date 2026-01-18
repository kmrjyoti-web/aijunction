// fix: Removed circular dependency on UI-Kit

export interface SearchFilter {
  parameter_name: string | null;
  parameter_code: string | null;
  conditional_operator: string | null;
  wildcard_operator: 'STARTS_WITH' | 'ENDS_WITH' | 'EXACT' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN_OR_EQUAL' | 'NOT_EQUAL' | 'BETWEEN' | 'NOT_BETWEEN' | null;
  parameter_value: string | null;
}

export interface SortColumn {
  column_name: string;
  sortOrder: 'asc' | 'desc';
}

export interface ApiRequest {
  page_number: number;
  page_size: number;
  search_filters: SearchFilter[];
  sort_column: SortColumn[];
  bypass_cache?: boolean;
  saved_query_id?: string;
  select_column?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  total_records: number;
}