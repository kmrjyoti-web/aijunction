import { Injectable, inject } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Contact } from '../online-data.service';
import { ConfigService } from '../config.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService extends Dexie {
  contacts!: Table<Contact, number>;

  constructor() {
    // Inject the service inside the constructor to get its value before `super()` is called.
    const configService = inject(ConfigService);
    
    // 1. Database name
    // It's good practice to name the database after the feature or app name.
    const dbName = `${configService.config().feature}_DB`;
    
    // Call super() BEFORE accessing 'this'.
    super(dbName);

    // 2. Define Schema
    // The string defines the schema. 
    // '++organization_id' means it's an auto-incrementing primary key.
    // The other fields are indexes for fast searching/sorting.
    // Dexie's extended where clause can search on un-indexed fields, but it's slower.
    // Indexing fields that are frequently used in filters is crucial for performance.
    // FIX: Cast 'this' to Dexie to resolve a TypeScript type inference issue where
    // methods from the base class are not found on the extended class instance.
    (this as Dexie).version(2).stores({
      contacts: '++organization_id, organization_name, contact_person, communication_detail, email_id, annual_revenue, created_time, lead_source'
    });

    // The 'contacts' property is auto-populated by Dexie from the schema definition above,
    // so explicit assignment with this.table() is not necessary.
  }
}