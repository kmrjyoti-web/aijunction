import { Injectable } from '@angular/core';
import { AppDb } from '../../../db/dexie/app-db';
import { RowContactEntity } from '../models/row-contact.entity';
import { liveQuery } from 'dexie';

@Injectable({
    providedIn: 'root'
})
export class RowContactOfflineRepository {
    constructor(private db: AppDb) { }

    getAll() {
        return liveQuery(() => this.db.RowContact.toArray());
    }

    async getById(id: string): Promise<RowContactEntity | undefined> {
        return this.db.RowContact.get(id);
    }

    async add(contact: RowContactEntity): Promise<string> {
        await this.db.RowContact.add(contact);
        return contact.rowContactUniqueId;
    }

    async update(id: string, changes: Partial<RowContactEntity>): Promise<number> {
        return this.db.RowContact.update(id, changes);
    }

    async delete(id: string): Promise<void> {
        return this.db.RowContact.delete(id);
    }

    async count(): Promise<number> {
        return this.db.RowContact.count();
    }
}
