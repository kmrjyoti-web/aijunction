import { Injectable } from '@angular/core';
import { AppDb } from '../dexie/app-db';

@Injectable({
    providedIn: 'root'
})
export class DynamicRowRepo {
    constructor(private db: AppDb) { }

    async getAll(tableName: string): Promise<any[]> {
        return this.db.table(tableName).toArray();
    }

    async add(tableName: string, data: any): Promise<any> {
        return this.db.table(tableName).add(data);
    }

    async update(tableName: string, id: any, data: any): Promise<number> {
        return this.db.table(tableName).update(id, data);
    }

    async delete(tableName: string, id: any): Promise<void> {
        return this.db.table(tableName).delete(id);
    }
}
