import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SchemaValidatorService {

    validateDexieSchema(schema: string): boolean {
        // Basic validation
        return !!schema && schema.includes(',') && !schema.endsWith(',');
    }

    validateFunctionality(allowedOps: string[]): boolean {
        const valid = ['I', 'U', 'D', 'V', 'R'];
        return allowedOps.every(op => valid.includes(op));
    }
}
