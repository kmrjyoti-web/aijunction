import { Injectable } from '@angular/core';
import { AppDb, TableMaster } from '../dexie/app-db';
import { from, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TableMasterRepo {
    constructor(private db: AppDb) { }

    getAll(): Observable<TableMaster[]> {
        return from(this.db.TableMaster.toArray());
    }

    async addOrUpdate(config: TableMaster): Promise<void> {
        await this.db.TableMaster.put(config);
        // Trigger schema update
        await this.db.ensureDynamicTables();
    }

    async delete(code: string): Promise<void> {
        await this.db.TableMaster.delete(code);
    }
}
