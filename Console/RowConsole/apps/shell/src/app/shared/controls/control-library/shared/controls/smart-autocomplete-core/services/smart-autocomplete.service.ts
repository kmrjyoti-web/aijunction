
import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiResult, AutoCompleteRequest, AutocompleteSourceConfig } from '../models/autocomplete-config.model';
import { SmartAutocompleteOperatorsService } from './smart-autocomplete-operators.service';

@Injectable({ providedIn: 'root' })
export class SmartAutocompleteService {
    private operators = inject(SmartAutocompleteOperatorsService);

    search<TModel = any>(
        source: AutocompleteSourceConfig<TModel>,
        queryText: string,
        baseFilters: Record<string, any> = {}
    ): Observable<ApiResult<TModel[]>> {
        
        // In a real app, this would use HttpClient.post to source.apiUrl
        // For this demo, we generate mock data based on the query.
        
        const filters = this.operators.parseQuery(queryText, source);
        const data = this.generateMockData(source, queryText, filters);

        return of({
            is_success: true,
            data: data as unknown as TModel[]
        }).pipe(delay(400)); // Simulate network latency
    }

    private generateMockData(source: AutocompleteSourceConfig, query: string, filters: any[]): any[] {
        // Generate 15 dummy records for the Pharma context
        const mockDb = Array.from({ length: 50 }).map((_, i) => ({
            organization_name: `Apollo Pharmacy ${i + 1}`,
            contact_person: i % 2 === 0 ? `Rajesh Kumar ${i}` : `Sneha Gupta ${i}`,
            communication_detail: `98765${(10000 + i).toString()}`,
            other_field_d: `store${i}@apollo.com`, // Email
            city: i % 3 === 0 ? 'Mumbai' : 'Delhi',
            state: i % 3 === 0 ? 'Maharashtra' : 'Delhi',
            pin_code: `4000${10 + i}`,
            id: `org_${i}`
        }));

        // Very basic client-side filtering for demo purposes
        if (!query) return mockDb.slice(0, 10);

        const lowerQuery = query.toLowerCase().replace(/\w+:/g, '').trim(); // Remove codes like "ON:" for simple search
        
        return mockDb.filter(item => {
            return item.organization_name.toLowerCase().includes(lowerQuery) ||
                   item.contact_person.toLowerCase().includes(lowerQuery) ||
                   item.city.toLowerCase().includes(lowerQuery);
        }).slice(0, 10);
    }
}
