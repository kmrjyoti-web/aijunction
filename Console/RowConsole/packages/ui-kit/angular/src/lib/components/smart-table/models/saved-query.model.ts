import { ActiveFilter } from './table-config.model';

export interface SavedQueryState {
  globalFilterTerm?: string;
  advancedFilters?: { [key: string]: ActiveFilter };
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc';
}

export interface SavedQuery {
  id: string;
  name: string;
  state: SavedQueryState;
}