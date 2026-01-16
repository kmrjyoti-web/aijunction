import {
    HttpClient,
    HttpContext,
    HttpHeaders,
    HttpParams,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { LocalStorageService } from '../caching/local-storage.service';
import { ApiHttpHelperService } from './api-http-helper.service';
import { ApiResponse } from './models/api.model';
import { API_CONFIG, ApiConfigurationConfig } from './models/api-config.token';

// 🔑 All supported module keys
export type HttpModuleKey =
    | 'CUSTOMER'
    | 'INVENTORY'
    | 'CONTACT'
    | 'TRAVEL'
    | 'MASTERDATA'
    | string; // fallback literal URL if needed

@Injectable({ providedIn: 'root' })
export class HttpModuleService {
    private http = inject(HttpClient);
    private localStorageService = inject(LocalStorageService);
    private apiHelper = inject(ApiHttpHelperService);
    private apiConfig = inject<ApiConfigurationConfig>(API_CONFIG);

    constructor() { }

    // ========== BASE URL RESOLVER BY KEY ==========

    /** Map logical keys → actual base URLs from environment config */
    resolveBaseUrl(key: HttpModuleKey): string {
        const envApi = this.apiConfig;

        switch (key) {
            case 'CUSTOMER':
                return envApi.CUSTOMER_SERVICE || key;
            case 'INVENTORY':
                return envApi.INVENTORY || key;
            case 'CONTACT':
                return envApi.CONTACT || key;
            case 'TRAVEL':
                return envApi.TRAVEL || key;
            case 'MASTERDATA':
                return envApi.MASTERDATA || key;
            default:
                if (envApi[key]) {
                    return envApi[key]!;
                }
                return key || '';
        }
    }

    // ========== COMMON HEADERS ==========

    private buildHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            session_id: this.localStorageService.getData('sessionId') ?? '',
            company_id: this.localStorageService.getData('companyId') ?? '',
            work_mode: 'Demo',
        });
    }

    private buildOptions(
        params?: HttpParams | Record<string, any>,
        body?: any,
    ) {
        let httpParams: HttpParams | undefined;

        if (params instanceof HttpParams) {
            httpParams = params;
        } else if (params && typeof params === 'object') {
            httpParams = new HttpParams({ fromObject: params as any });
        }

        return {
            headers: this.buildHeaders(),
            params: httpParams,
            body,
            context: new HttpContext(),
        };
    }

    // ========== CENTRAL REQUEST ==========

    private request<T>(
        moduleKey: HttpModuleKey,
        method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
        apiUrl: string, // e.g. "/v1/Inventory/Brand/GetAll"
        options?: { params?: HttpParams | Record<string, any>; body?: any },
    ): Observable<T> {
        const baseUrl = this.resolveBaseUrl(moduleKey);
        const url = `${baseUrl}${apiUrl}`;
        const httpOptions = this.buildOptions(options?.params, options?.body);

        return this.http
            .request<ApiResponse | T>(method, url, httpOptions)
            .pipe(
                map(res => this.apiHelper.unwrapResponse<T>(res)),
                catchError(err => this.apiHelper.handleError(err)),
            );
    }

    // ========== PUBLIC GENERIC HELPERS ==========

    getAll<T>(
        moduleKey: HttpModuleKey,
        query: Record<string, any>,
        apiUrl: string,
    ): Observable<T> {
        return this.request<T>(moduleKey, 'GET', apiUrl, { params: query });
    }

    create<T>(
        moduleKey: HttpModuleKey,
        data: any,
        apiUrl: string,
    ): Observable<T> {
        return this.request<T>(moduleKey, 'POST', apiUrl, { body: data });
    }

    updatePost<T>(
        moduleKey: HttpModuleKey,
        data: any,
        apiUrl: string,
    ): Observable<T> {
        return this.request<T>(moduleKey, 'POST', apiUrl, { body: data });
    }

    update<T>(
        moduleKey: HttpModuleKey,
        data: any,
        apiUrl: string,
    ): Observable<T> {
        return this.request<T>(moduleKey, 'PATCH', apiUrl, { body: data });
    }

    delete<T>(
        moduleKey: HttpModuleKey,
        data: any,
        apiUrl: string,
    ): Observable<T> {
        return this.request<T>(moduleKey, 'DELETE', apiUrl, { body: data });
    }
}
