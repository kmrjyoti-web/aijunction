
import { GenericValidation } from '../models/table-config.model';
import { ValidationState } from './validation.util';

/**
 * Validates a value based on a generic set of rules.
 * @param value The value to validate.
 * @param config The generic validation configuration.
 * @returns A ValidationState object if invalid, otherwise null.
 */
export function checkGeneric(value: any, config: GenericValidation): ValidationState | null {
    const strValue = String(value || '');

    // If value is empty, don't run generic validations.
    // The 'required' check is handled separately.
    if (!strValue) {
        return null;
    }

    // 1. Min Length Check
    if (config.minLength !== undefined && strValue.length < config.minLength) {
        return {
            isValid: false,
            style: {
                bgcolor: config.bgcolor || 'rgba(255, 240, 210, 0.6)',
                textcolor: config.textcolor,
                tooltip: config.tooltip || `Must be at least ${config.minLength} characters long.`
            }
        };
    }
    
    // 2. Max Length Check
    if (config.maxLength !== undefined && strValue.length > config.maxLength) {
        return {
            isValid: false,
            style: {
                bgcolor: config.bgcolor || 'rgba(255, 240, 210, 0.6)',
                textcolor: config.textcolor,
                tooltip: config.tooltip || `Cannot be more than ${config.maxLength} characters long.`
            }
        };
    }

    // 3. Only Numbers Check
    if (config.onlyNumbers) {
        const numbersOnlyRegex = /^\d+$/;
        if (!numbersOnlyRegex.test(strValue)) {
             return {
                isValid: false,
                style: {
                    bgcolor: config.bgcolor || 'rgba(255, 240, 210, 0.6)',
                    textcolor: config.textcolor,
                    tooltip: config.tooltip || 'Only numbers are allowed.'
                }
            };
        }
    }

    // 4. Regex Pattern Check
    if (config.pattern) {
        try {
            const regex = new RegExp(config.pattern);
            if (!regex.test(strValue)) {
                return {
                    isValid: false,
                    style: {
                        bgcolor: config.bgcolor || 'rgba(255, 240, 210, 0.6)',
                        textcolor: config.textcolor,
                        tooltip: config.tooltip || 'The format is invalid.'
                    }
                };
            }
        } catch (e) {
            console.error('Invalid regex pattern in configuration:', config.pattern, e);
            // Don't block UI for bad config, just log it.
        }
    }

    return null; // Value is valid
}
