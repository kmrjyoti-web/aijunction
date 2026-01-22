import { Injectable, inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiRequest, ApiResponse } from '@ai-junction/core';
import { Contact } from '../online-data.service';
import { DatabaseService } from './database.service';
import { getValidationState } from '../../utils/validation.util';
import { EncryptionService } from './encryption.service';
import { ConfigService } from '../config.service';

import { SmartTableSearchService } from '../../services/search/smart-table-search.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineDataService {
  private db = inject(DatabaseService);
  private encryptionService = inject(EncryptionService);
  private configService = inject(ConfigService);
  private searchService = inject(SmartTableSearchService);

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
    if (sort_column.length > 0 && sort_column[0].column_name) {
      const { column_name, sortOrder } = sort_column[0];
      collection = this.db.contacts.orderBy(column_name);
      if (sortOrder === 'desc') {
        collection = collection.reverse();
      }
    } else {
      // If no sorting, start with the whole table as a collection.
      collection = this.db.contacts.toCollection();
    }

    // --- Filtering ---
    if (search_filters.length > 0) {
      // Use the Generic Search Service
      // This allows complex logic (Validation, Global, Date) to be handled uniformly.
      const tableConfig = this.configService.config();

      collection = collection.filter(contact => {
        // Value Accessor handles decryption
        const valueAccessor = (row: any, field: string) => {
          // We can decrypt the whole record once if performance is okay,
          // OR decrypt on demand.
          // Currently, OfflineDataService decrypted specific fields or the whole record.
          // Decrypting the whole record once per row is safest for complex logic.
          // But we only have `contact` (encrypted) here.

          // Optimisation: We could cache decrypted record?
          // For now, let's decrypt once per row as before:
          const decrypted = this.encryptionService.decryptRecord(row);
          return decrypted[field];
        };

        // BETTER APPROACH:
        // The SearchContext needs a ValueAccessor.
        // We can decrypt the record ONCE here, and close over it in the accessor.
        const decryptedContact = this.encryptionService.decryptRecord(contact);
        const simpleAccessor = (row: any, field: string) => decryptedContact[field];

        // "row" passed to matches() will be the encrypted 'contact', but accessor ignores it and uses 'decryptedContact'.
        // Or we pass 'decryptedContact' as the row?
        // Strategically, passing 'decryptedContact' as the 'row' is cleaner for strategies.

        return this.searchService.matches(decryptedContact, search_filters, tableConfig, (r, f) => r[f]);
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
