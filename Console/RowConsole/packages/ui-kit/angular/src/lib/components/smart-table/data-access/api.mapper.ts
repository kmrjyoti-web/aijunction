import { ApiRequest, SearchFilter, SortColumn } from '../models/api.model';
import { ActiveFilter, Column, DateOperator, FilterOperator } from '../models/table-config.model';

function mapOperator(operator: FilterOperator | DateOperator): SearchFilter['wildcard_operator'] {
  switch(operator) {
    case '=': return 'EXACT';
    case '!=': return 'NOT_EQUAL';
    case '>': return 'GREATER_THAN';
    case '>=': return 'GREATER_THAN_OR_EQUAL';
    case '<': return 'LESS_THAN';
    case '<=': return 'LESS_THAN_OR_EQUAL';
    case 'between': return 'BETWEEN';
    case 'not between': return 'NOT_BETWEEN';
    case 'contains': return 'CONTAINS';
    // Date operators can be mapped to a specific format or passed through
    default: return 'CONTAINS'; // Fallback for text-based searches
  }
}

export function mapToApiRequest(
  page: number,
  pageSize: number,
  sortColumn: string | null,
  sortDirection: 'asc' | 'desc',
  globalSearchTerm: string,
  advancedFilters: { [key: string]: ActiveFilter },
  columns: Column[]
): ApiRequest {
  
  const search_filters: SearchFilter[] = [];
  
  // Global Search
  if (globalSearchTerm) {
    search_filters.push({
      parameter_name: 'GLOBAL_SEARCH',
      parameter_code: 'GS',
      parameter_value: globalSearchTerm,
      conditional_operator: 'AND',
      wildcard_operator: 'CONTAINS'
    });
  }

  // Advanced and Column Filters (now merged)
  for (const key in advancedFilters) {
    const filter = advancedFilters[key];
    if (filter && filter.value1 !== undefined && filter.value1 !== '') {
       search_filters.push({
          parameter_name: filter.name,
          parameter_code: filter.code,
          parameter_value: `${filter.value1}${filter.value2 ? ',' + filter.value2 : ''}`,
          conditional_operator: 'AND',
          wildcard_operator: mapOperator(filter.operator)
       });
    }
  }

  const sort_column: SortColumn[] = [];
  if (sortColumn) {
    sort_column.push({
      coloum_id: sortColumn,
      short_type: sortDirection
    });
  }

  return {
    page_number: page,
    page_size: pageSize,
    search_filters,
    sort_column
  };
}