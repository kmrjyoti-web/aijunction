export type AggregationMethod = 'count' | 'sum' | 'average';

// Represents a configured chip
export interface Chip {
  id: string;
  label: string; // The user-defined label for the chip, e.g., "Web Leads"
  columnCode: string; // The data field to operate on, e.g., 'lead_source'
  aggregation: AggregationMethod;
  // For 'count' on categorical columns, this specifies the value to filter by and count.
  // e.g., for a "Web Leads" chip, columnCode would be 'lead_source' and filterValue would be 'Web'.
  filterValue?: string; 
}

// Represents a chip with its calculated value for display
export interface DisplayChip extends Chip {
    displayValue: string | number;
}
