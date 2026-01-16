import { Injectable, inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiRequest, ApiResponse } from '../../models/api.model';
import { Contact } from '../online-data.service';
import { DatabaseService } from './database.service';
import { EncryptionService } from './encryption.service';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineDataService {
  private db = inject(DatabaseService);
  private encryptionService = inject(EncryptionService);
  private configService = inject(ConfigService);

  /**
   * Saves a bulk of contacts to the local IndexedDB, encrypting them first if needed.
   * @param contacts The array of contacts to save.
   * @returns An observable that completes when the operation is done.
   */
  bulkUpsert(contacts: Contact[]): Observable<void> {
    const encryptedContacts = contacts.map(contact => this.encryptionService.encryptRecord(contact));
    return from(this.db.contacts.bulkPut(encryptedContacts)).pipe(map(() => void 0));
  }

  /**
   * Retrieves data from IndexedDB based on the API request, performing all
   * filtering, sorting, and pagination on the client side.
   * @param request The data request object.
   * @returns An observable of the ApiResponse.
   */
  getData(request: ApiRequest): Observable<ApiResponse> {
    const { page_number, page_size, sort_column, search_filters } = request;
    const globalFilterFields = this.configService.config().config.globalFilterFields;
    
    let collection;

    // --- Sorting ---
    // Start with sorting if a sort column is provided, as orderBy must be called on a Table.
    if (sort_column.length > 0 && sort_column[0].coloum_id) {
      const { coloum_id, short_type } = sort_column[0];
      collection = this.db.contacts.orderBy(coloum_id);
      if (short_type === 'desc') {
        collection = collection.reverse();
      }
    } else {
      // If no sorting, start with the whole table as a collection.
      collection = this.db.contacts.toCollection();
    }

    // --- Filtering ---
    if (search_filters.length > 0) {
      // This `filter` approach is powerful but can be slower on very large datasets
      // as it doesn't use IndexedDB indexes for filtering.
      collection = collection.filter(contact => {
        // Decrypt once per record for filtering efficiency.
        const decryptedContact = this.encryptionService.decryptRecord(contact);

        return search_filters.every(filter => {
          if (!filter.parameter_code || !filter.parameter_value) return true;
          
          const filterValue = filter.parameter_value.toLowerCase();

          // Handle Global Search
          if (filter.parameter_code === 'GS') {
            const dateColumns = this.configService.config().columns
              .filter(c => c.columnType === 'DATE')
              .map(c => c.code);

            const range = filterValue.split(' to ');
            let isDateRange = false;
            let fromDate: Date | null = null;
            let toDate: Date | null = null;
            
            if (range.length === 2) {
                const from = new Date(range[0].trim());
                const to = new Date(range[1].trim());
                if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
                    isDateRange = true;
                    fromDate = from;
                    toDate = to;
                    toDate.setHours(23, 59, 59, 999);
                }
            }

            if (globalFilterFields && globalFilterFields.length > 0) {
              return globalFilterFields.some(field => {
                const fieldValue = decryptedContact[field];
                if (!fieldValue) return false;

                // Date field logic
                if (dateColumns.includes(field)) {
                  const contactDate = new Date(fieldValue as string);
                  if (isNaN(contactDate.getTime())) return false;
                  
                  if (isDateRange) {
                    return contactDate >= fromDate! && contactDate <= toDate!;
                  } else {
                    return String(fieldValue).toLowerCase().includes(filterValue);
                  }
                }
                
                // Non-date field logic
                return String(fieldValue).toLowerCase().includes(filterValue);
              });
            }
            // Fallback to old behavior
            return (
              String(decryptedContact.organization_name || '').toLowerCase().includes(filterValue) ||
              String(decryptedContact.contact_person || '').toLowerCase().includes(filterValue) ||
              String(decryptedContact.communication_detail || '').toLowerCase().includes(filterValue) ||
              String(decryptedContact.email_id || '').toLowerCase().includes(filterValue) ||
              String(decryptedContact.created_time || '').toLowerCase().includes(filterValue)
            );
          }
          
          const columnDef = this.configService.config().columns.find(c => c.code === filter.parameter_code);
          if (columnDef?.columnType === 'DATE') {
              const contactDateVal = decryptedContact[filter.parameter_code];
              if (!contactDateVal) return false;
              const contactDate = new Date(contactDateVal as string);
              if (isNaN(contactDate.getTime())) return false;
              contactDate.setUTCHours(0, 0, 0, 0);

              if (filter.wildcard_operator === 'BETWEEN') {
                  if (!filter.parameter_value.includes(',')) return false;
                  const [startStr, endStr] = filter.parameter_value.split(',');
                  const startDate = new Date(startStr + 'T00:00:00Z');
                  const endDate = new Date(endStr + 'T00:00:00Z');
                  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
                  endDate.setUTCHours(23, 59, 59, 999);
                  return contactDate >= startDate && contactDate <= endDate;
              } else if (filter.wildcard_operator === 'EXACT') {
                  const filterDate = new Date(filter.parameter_value + 'T00:00:00Z');
                  if (isNaN(filterDate.getTime())) return false;
                  return contactDate.getTime() === filterDate.getTime();
              }
              return false; // Fail safe
          }
          
          const contactValue = String(decryptedContact[filter.parameter_code] || '').toLowerCase();
          // Handle multi-select from Excel-like filter (comma-separated values)
          if (filterValue.includes(',')) {
            const filterValues = filterValue.split(',');
            return filterValues.includes(contactValue);
          }
          // Handle Column/Advanced Filters
          return contactValue.includes(filterValue);
        });
      });
    }

    // Get the total count *after* filtering but *before* pagination.
    const totalRecordsPromise = collection.count();

    // --- Pagination ---
    const pageNum = Number(page_number);
    const pageSizeNum = Number(page_size);
    const startIndex = (pageNum - 1) * pageSizeNum;
    const pagedDataPromise = collection.offset(startIndex).limit(pageSizeNum).toArray();

    // --- Combine promises and decrypt data ---
    const resultPromise = Promise.all([totalRecordsPromise, pagedDataPromise]).then(
      ([totalRecords, pagedData]) => {
        // Decrypt the paged data before sending it to the UI.
        // This is necessary because the collection holds the original encrypted data.
        const decryptedData = pagedData.map(contact => this.encryptionService.decryptRecord(contact));
        return {
          data: decryptedData,
          total_records: totalRecords
        };
      }
    );

    return from(resultPromise);
  }
}
