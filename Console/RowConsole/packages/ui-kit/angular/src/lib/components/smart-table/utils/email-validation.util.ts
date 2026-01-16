
import { EmailValidation } from '../models/table-config.model';
import { ValidationState } from './validation.util';

/**
 * Validates an email address based on a set of rules.
 * @param value The email string to validate.
 * @param config The email validation configuration.
 * @returns A ValidationState object if invalid, otherwise null.
 */
export function checkEmail(value: any, config: EmailValidation): ValidationState | null {
    const email = String(value || '').trim();

    // 1. Required Check
    if (config.required) {
        if (!email) {
            return {
                isValid: false,
                style: {
                    bgcolor: config.bgcolor || 'rgba(255, 235, 238, 0.6)',
                    textcolor: config.textcolor,
                    tooltip: config.tooltip || 'Email is required.',
                },
            };
        }
    }

    // Don't run other checks if the email is empty and not required
    if (!email) {
        return null;
    }

    // 2. Basic Format Check (simple regex for structure)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            style: {
                bgcolor: config.bgcolor || 'rgba(255, 240, 210, 0.6)',
                tooltip: 'Invalid email format.',
            },
        };
    }

    // 3. Blacklist Check
    if (config.blacklist?.includes(email)) {
        return {
            isValid: false,
            style: {
                bgcolor: config.bgcolor || 'rgba(255, 235, 238, 0.6)',
                tooltip: 'This email address is blacklisted.',
            },
        };
    }
    
    const domain = email.split('@')[1];

    // 4. Disallowed Domains Check
    if (config.notAllowedDomains?.includes(domain)) {
        return {
            isValid: false,
            style: {
                bgcolor: config.bgcolor || 'rgba(255, 235, 238, 0.6)',
                tooltip: `Emails from the domain '${domain}' are not allowed.`,
            },
        };
    }

    // 5. Allowed Domains Check (if configured)
    if (config.allowedDomains && config.allowedDomains.length > 0) {
        if (!config.allowedDomains.includes(domain)) {
            return {
                isValid: false,
                style: {
                    bgcolor: config.bgcolor || 'rgba(255, 240, 210, 0.6)',
                    tooltip: `Only emails from allowed domains are accepted.`,
                },
            };
        }
    }

    return null; // Email is valid
}
