import { Observable } from 'rxjs';
import { ApiRequest, ApiResponse } from '@ai-junction/core';

export interface IDataProvider {
    getData(request: ApiRequest): Observable<ApiResponse>;
}

export const DATA_PROVIDER_TOKEN = 'DATA_PROVIDER_TOKEN';
