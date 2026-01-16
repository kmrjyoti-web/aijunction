// fix: Corrected import path for Contact model.
import { Contact } from "../data-access/online-data.service";

export interface SearchFilter {
  parameter_name: string | null;
  parameter_code: string | null;
  conditional_operator: string | null;
  wildcard_operator: 'STARTS_WITH' | 'ENDS_WITH' | 'EXACT' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN_OR_EQUAL' | 'NOT_EQUAL' | 'BETWEEN' | 'NOT_BETWEEN' | null;
  parameter_value: string | null;
}

export interface SortColumn {
  coloum_id: string;
  short_type: 'asc' | 'desc';
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

export interface ApiResponse {
  data: Contact[];
  total_records: number;
}