
import { Column, RequiredValidation, ValidationStyle } from '../models/table-config.model';
import { checkEmail } from './email-validation.util';
import { checkGeneric } from './generic-validation.util';

export interface ValidationState {
  isValid: boolean;
  style: ValidationStyle | null;
}

/**
 * Checks if a value is valid based on a `RequiredValidation` configuration.
 * @param value The value to check.
 * @param config The validation configuration.
 * @returns A ValidationState object if invalid, otherwise null.
 */
function checkRequired(value: any, config: RequiredValidation): ValidationState | null {
    if (config?.status) {
        const isBlank = value === null || value === undefined || String(value).trim() === '';
        if (isBlank) {
            return {
                isValid: false,
                style: {
                    bgcolor: config.bgcolor,
                    textcolor: config.textcolor,
                    tooltip: config.tooltip,
                },
            };
        }
    }
    return null;
}

/**
 * Gets the validation state for a specific field based on the column's configuration.
 * It checks both column-level and field-specific validation rules.
 * @param value The value of the field to validate.
 * @param column The column configuration object.
 * @param fieldCode The code of the specific field being validated.
 * @returns A ValidationState object.
 */
export function getValidationState(value: any, column: Column, fieldCode: string): ValidationState {
    // Find validation rules specific to this field (from the 'validations' array)
    const fieldValidationConfig = column.validations?.find(v => v.code === fieldCode);
    
    // Find validation rules at the top level of the column config
    const columnLevelIsRequired = (column.code === fieldCode) ? column.isRequired : undefined;
    const columnLevelEmailValidation = (column.code === fieldCode) ? column.emailValidation : undefined;
    const columnLevelGenericValidation = (column.code === fieldCode) ? column.genericValidation : undefined;
    
    // --- Check for Required Validation ---
    const isRequiredConfig = fieldValidationConfig?.isRequired || columnLevelIsRequired;
    if (isRequiredConfig) {
        const result = checkRequired(value, isRequiredConfig);
        if (result) return result;
    }

    // --- Check for Email Validation ---
    const emailValidationConfig = fieldValidationConfig?.emailValidation || columnLevelEmailValidation;
    if (emailValidationConfig) {
        const result = checkEmail(value, emailValidationConfig);
        if (result) return result;
    }

    // --- Check for Generic Validation ---
    const genericValidationConfig = fieldValidationConfig?.genericValidation || columnLevelGenericValidation;
    if (genericValidationConfig) {
        const result = checkGeneric(value, genericValidationConfig);
        if (result) return result;
    }

    // TODO: Add other validation checks like mobile here.

    return { isValid: true, style: null };
}