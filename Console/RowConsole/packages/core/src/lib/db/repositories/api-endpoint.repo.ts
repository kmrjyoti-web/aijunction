import { Injectable } from '@angular/core';
import { AppDb, ApiConfiguration } from '../dexie/app-db';
import { from, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiEndpointRepo {
    constructor(public db: AppDb) { }

    getAll(): Observable<ApiConfiguration[]> {
        return from(this.db.ApiConfiguration.toArray());
    }

    async put(config: ApiConfiguration): Promise<string> {
        return this.db.ApiConfiguration.put(config);
    }
}
