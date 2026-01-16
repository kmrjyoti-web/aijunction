import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SavedQuery, SavedQueryState } from '../models/saved-query.model';

@Injectable({
  providedIn: 'root'
})
export class SavedQueriesService {
  private readonly STORAGE_KEY = 'smartTableSavedQueries';

  private getQueriesFromStorage(): SavedQuery[] {
    try {
      const queriesStr = localStorage.getItem(this.STORAGE_KEY);
      return queriesStr ? JSON.parse(queriesStr) : [];
    } catch (e) {
      console.error('Error reading saved queries from localStorage', e);
      return [];
    }
  }

  private saveQueriesToStorage(queries: SavedQuery[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queries));
    } catch (e) {
      console.error('Error saving queries to localStorage', e);
    }
  }

  getSavedQueries(): Observable<SavedQuery[]> {
    return of(this.getQueriesFromStorage());
  }

  saveQuery(name: string, state: SavedQueryState): Observable<SavedQuery> {
    const queries = this.getQueriesFromStorage();
    const newQuery: SavedQuery = {
      id: new Date().toISOString(), // Simple unique ID
      name,
      state,
    };
    queries.push(newQuery);
    this.saveQueriesToStorage(queries);
    return of(newQuery);
  }

  deleteQuery(id: string): Observable<void> {
    let queries = this.getQueriesFromStorage();
    queries = queries.filter(q => q.id !== id);
    this.saveQueriesToStorage(queries);
    return of(undefined);
  }
}
