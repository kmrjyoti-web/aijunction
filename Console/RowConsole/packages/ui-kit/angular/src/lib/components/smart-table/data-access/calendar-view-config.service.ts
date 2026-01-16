import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SavedCalendarView } from '../models/saved-calendar-view.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarViewConfigService {
  private readonly STORAGE_KEY = 'smartTableSavedCalendarViews';

  private getViewsFromStorage(): SavedCalendarView[] {
    try {
      const viewsStr = localStorage.getItem(this.STORAGE_KEY);
      return viewsStr ? JSON.parse(viewsStr) : [];
    } catch (e) {
      console.error('Error reading saved calendar views from localStorage', e);
      return [];
    }
  }

  private saveViewsToStorage(views: SavedCalendarView[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(views));
    } catch (e) {
      console.error('Error saving calendar views to localStorage', e);
    }
  }

  getSavedViews(): Observable<SavedCalendarView[]> {
    return of(this.getViewsFromStorage());
  }

  saveView(name: string, dateFieldCode: string): Observable<SavedCalendarView> {
    const views = this.getViewsFromStorage();
    const newView: SavedCalendarView = {
      id: new Date().toISOString(), // Simple unique ID
      name,
      dateFieldCode,
    };
    views.push(newView);
    this.saveViewsToStorage(views);
    return of(newView);
  }

  deleteView(id: string): Observable<void> {
    let views = this.getViewsFromStorage();
    views = views.filter(v => v.id !== id);
    this.saveViewsToStorage(views);
    return of(undefined);
  }
}
