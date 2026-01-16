
import { Injectable } from '@angular/core';
import {
    AutoCompleteSearchString,
    AutocompleteFieldConfig,
    AutocompleteSourceConfig,
    AutocompleteWildcardOperator,
    AutocompleteConditionalOperator
} from '../models/autocomplete-config.model';

@Injectable({ providedIn: 'root' })
export class SmartAutocompleteOperatorsService {
    
    parseQuery<TModel = any>(
        queryText: string,
        source: AutocompleteSourceConfig<TModel>
    ): AutoCompleteSearchString[] {
        const trimmed = (queryText || '').trim();
        if (!trimmed) return [];

        const parts = trimmed.split(/\s+/).filter(p => !!p);
        const filters: AutoCompleteSearchString[] = [];

        for (const part of parts) {
            const parsed = this.parsePart(part, source);
            if (parsed) {
                filters.push(parsed);
            }
        }
        return filters;
    }

    private parsePart<TModel>(part: string, source: AutocompleteSourceConfig<TModel>): AutoCompleteSearchString | null {
        const colonIndex = part.indexOf(':');
        if (colonIndex > 0) {
            const code = part.substring(0, colonIndex).toUpperCase();
            const rawValue = part.substring(colonIndex + 1);
            const field = source.fields.find(f => f.code.toUpperCase() === code);
            if (!field) return null;
            return this.buildSearchStringFromField(field, rawValue);
        }

        // Default to first field if no code found
        const firstField = source.fields[0];
        if (!firstField) return null;
        return this.buildSearchStringFromField(firstField, part);
    }

    private buildSearchStringFromField(field: AutocompleteFieldConfig, rawValue: string): AutoCompleteSearchString | null {
        let value = (rawValue || '').trim();
        if (!value) return null;

        let conditionalOperator: AutocompleteConditionalOperator = 'AND';
        if (value.startsWith('!') && field.allowNot) {
            conditionalOperator = 'NOT';
            value = value.substring(1).trim();
        }
        if (!value) return null;

        return {
            parameter_name: field.parameterName,
            parameter_code: field.code,
            conditional_operator: conditionalOperator,
            wildcard_operator: field.defaultWildcard || 'CONTAINS',
            parameter_value: value
        };
    }
}
