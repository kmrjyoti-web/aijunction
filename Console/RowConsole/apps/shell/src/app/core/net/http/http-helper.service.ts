import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { ApiEndpointRepo } from '@ai-junction/core';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HttpHelperService {
    private http = inject(HttpClient);
    private apiRepo = inject(ApiEndpointRepo);

    /**
     * Dynamic GET request.
     * Resolves base URL by key:
     * 1. Checks Local DB (Runtime Config)
     * 2. Checks Environment (Build Config)
     */
    async get<T>(key: string, path: string, params?: any): Promise<T> {
        const baseUrl = await this.resolveBaseUrl(key);
        const url = `${baseUrl}${path}`;
        return firstValueFrom(this.http.get<T>(url, { params }));
    }

    async post<T>(key: string, path: string, body: any): Promise<T> {
        const baseUrl = await this.resolveBaseUrl(key);
        const url = `${baseUrl}${path}`;
        return firstValueFrom(this.http.post<T>(url, body));
    }

    async put<T>(key: string, path: string, body: any): Promise<T> {
        const baseUrl = await this.resolveBaseUrl(key);
        const url = `${baseUrl}${path}`;
        return firstValueFrom(this.http.put<T>(url, body));
    }

    async delete<T>(key: string, path: string): Promise<T> {
        const baseUrl = await this.resolveBaseUrl(key);
        const url = `${baseUrl}${path}`;
        return firstValueFrom(this.http.delete<T>(url));
    }

    private async resolveBaseUrl(key: string): Promise<string> {
        // 1. Try DB (Repo)
        try {
            const config = await this.apiRepo.db.table('ApiConfiguration').get(key);
            if (config && config.Api_End_point) {
                console.log(`[HttpHelper] Resolved '${key}' from DB: ${config.Api_End_point}`);
                return config.Api_End_point;
            }
        } catch (e) {
            console.warn(`[HttpHelper] DB lookup failed for '${key}', falling back to env.`);
        }

        // 2. Try Environment
        const envApi = (environment as any).api;
        if (envApi && envApi[key]) {
            console.log(`[HttpHelper] Resolved '${key}' from Env: ${envApi[key]}`);
            return envApi[key];
        }

        throw new Error(`[HttpHelper] Could not resolve base URL for key: ${key}`);
    }
}
