import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiRequest, ApiResponse } from '../../models/api.model';
import { HttpModuleService } from "../../http-module.service";

import { RowContactMapper } from '../../../offline/row-contact/models/row-contact.mapper';

@Injectable({
    providedIn: 'root'
})
export class RowContactOnlineRepository {
    private http = inject(HttpModuleService);

    // Corrected path derived from RowContactSyncService
    private readonly MODULE_KEY = 'CONTACT';
    private readonly API_PATH = '/v1/Master/RowContact/GetAll';

    getData(request: ApiRequest): Observable<ApiResponse> {
        const params: any = {
            page_number: request.page_number,
            page_size: request.page_size
        };

        if (request.search_filters && request.search_filters.length > 0) {
            params.search_filters = JSON.stringify(request.search_filters);
        }

        if (request.sort_column && request.sort_column.length > 0) {
            params.sort_column = JSON.stringify(request.sort_column);
        }

        return this.http.getRaw<any>(
            this.MODULE_KEY,
            params,
            this.API_PATH
        ).pipe(
            map(response => ({
                data: (response.data || []).map((item: any) => RowContactMapper.toEntity(item)),
                total_records: response.pagination_info?.total_records ?? 0
            }))
        );
    }
}
