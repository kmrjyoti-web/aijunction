import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CustomLayout } from '../models/custom-layout.model';

@Injectable({
  providedIn: 'root'
})
export class CustomLayoutService {
  private readonly STORAGE_KEY = 'smartTableCustomLayouts';

  private getLayoutsFromStorage(): CustomLayout[] {
    try {
      const layoutsStr = localStorage.getItem(this.STORAGE_KEY);
      return layoutsStr ? JSON.parse(layoutsStr) : [];
    } catch (e) {
      console.error('Error reading custom layouts from localStorage', e);
      return [];
    }
  }

  private saveLayoutsToStorage(layouts: CustomLayout[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layouts));
    } catch (e) {
      console.error('Error saving layouts to localStorage', e);
    }
  }

  getLayouts(): Observable<CustomLayout[]> {
    return of(this.getLayoutsFromStorage());
  }

  saveLayout(layout: Omit<CustomLayout, 'id'>): Observable<CustomLayout> {
    const layouts = this.getLayoutsFromStorage();
    const newLayout: CustomLayout = {
      id: new Date().toISOString(), // Simple unique ID
      ...layout,
    };
    layouts.push(newLayout);
    this.saveLayoutsToStorage(layouts);
    return of(newLayout);
  }
  
  deleteLayout(id: string): Observable<void> {
    let layouts = this.getLayoutsFromStorage();
    layouts = layouts.filter(l => l.id !== id);
    this.saveLayoutsToStorage(layouts);
    return of(undefined);
  }
}
