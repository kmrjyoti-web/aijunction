import { Injectable, signal, WritableSignal } from '@angular/core';
import { ApiConfiguration } from '@ai-junction/core';

@Injectable({
    providedIn: 'root'
})
export class ApiEndpointsStore {
    readonly endpoints: WritableSignal<ApiConfiguration[]> = signal([]);

    setEndpoints(data: ApiConfiguration[]) {
        this.endpoints.set(data);
    }
}
