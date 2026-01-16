import { Injectable, signal, WritableSignal } from '@angular/core';
import { TableMaster } from '@ai-junction/core';

@Injectable({
    providedIn: 'root'
})
export class TableMasterStore {
    readonly tables: WritableSignal<TableMaster[]> = signal([]);

    setTables(tables: TableMaster[]) {
        this.tables.set(tables);
    }
}
