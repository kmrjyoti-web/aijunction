import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiEndpointRepo } from '@ai-junction/core';
import { from, switchMap, map } from 'rxjs';

/**
 * Intercepts requests that start with a known configuration key (e.g. "ITEM/...", "CONTACT/...")
 * and replaces the key with the actual Base URL from DB or Environment.
 */
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    const apiRepo = inject(ApiEndpointRepo);
    const url = req.url;

    // Simple heuristic: If URL starts with uppercase letters followed by /
    // e.g. "ITEM/v1/..."
    const match = url.match(/^([A-Z_]+)\/(.*)$/);

    if (match) {
        const key = match[1];
        const path = match[2];

        // Priority 1: DB (Runtime Config) - We need to convert Promise/Observable to Observable stream
        return from(apiRepo.db.ApiConfiguration.get(key)).pipe(
            switchMap(dbConfig => {
                let baseUrl = '';

                if (dbConfig && dbConfig.Api_End_point) {
                    baseUrl = dbConfig.Api_End_point;
                    // console.log(`[BaseUrlInterceptor] Resolved '${key}' from DB: ${baseUrl}`);
                } else {
                    // Priority 2: Environment (Build Config)
                    const envApi = (environment as any).api;
                    if (envApi && envApi[key]) {
                        baseUrl = envApi[key];
                        // console.log(`[BaseUrlInterceptor] Resolved '${key}' from Env: ${baseUrl}`);
                    }
                }

                if (baseUrl) {
                    // Ensure no double slashes if baseUrl ends with /
                    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                    const newUrl = `${cleanBase}/${path}`;
                    const cloned = req.clone({ url: newUrl });
                    return next(cloned);
                }

                // If no resolution, pass through (might fail, but let it go)
                return next(req);
            })
        );
    }

    return next(req);
};
