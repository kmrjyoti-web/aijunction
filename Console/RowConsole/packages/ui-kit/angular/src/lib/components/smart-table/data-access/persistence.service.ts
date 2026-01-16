import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PersistenceService {

  saveState(key: string, state: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }

  loadState<T>(key: string): T | null {
    try {
      const stateStr = localStorage.getItem(key);
      return stateStr ? JSON.parse(stateStr) : null;
    } catch (e) {
      console.error('Error loading state from localStorage', e);
      // If parsing fails, clear the invalid state
      this.clearState(key);
      return null;
    }
  }

  clearState(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error clearing state from localStorage', e);
    }
  }
}
