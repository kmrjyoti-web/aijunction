import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { ApiConfig, Option } from '../models/form-schema.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  // In a real app, this would make actual HTTP calls.
  // For this demo environment, we simulate responses based on endpoints to ensure the app runs without a backend.
  fetchOptions(config: ApiConfig, dependencyValue?: any): Observable<any[]> {
    console.log(`[API Mock] Fetching ${config.endpoint} with param: ${dependencyValue}`);

    // Simulation logic for Countries
    if (config.endpoint.includes('countries')) {
      return of([
        { id: 'us', name: 'United States' },
        { id: 'ca', name: 'Canada' },
        { id: 'in', name: 'India' }
      ]).pipe(delay(400));
    }

    // Simulation logic for States (Depends on Country)
    if (config.endpoint.includes('states')) {
      const states: Record<string, any[]> = {
        'us': [{ code: 'NY', name: 'New York' }, { code: 'CA', name: 'California' }, { code: 'TX', name: 'Texas' }],
        'ca': [{ code: 'ON', name: 'Ontario' }, { code: 'QC', name: 'Quebec' }],
        'in': [{ code: 'DL', name: 'Delhi' }, { code: 'MH', name: 'Maharashtra' }, { code: 'KA', name: 'Karnataka' }]
      };
      const result = states[dependencyValue] || [];
      return of(result).pipe(delay(400));
    }

    // Simulation logic for Cities (Depends on State)
    if (config.endpoint.includes('cities')) {
      const cities: Record<string, any[]> = {
        'NY': [{ id: 'NYC', name: 'New York City' }, { id: 'BUF', name: 'Buffalo' }],
        'CA': [{ id: 'LA', name: 'Los Angeles' }, { id: 'SF', name: 'San Francisco' }],
        'TX': [{ id: 'HOU', name: 'Houston' }, { id: 'AUS', name: 'Austin' }],
        'ON': [{ id: 'TOR', name: 'Toronto' }, { id: 'OTT', name: 'Ottawa' }],
        'QC': [{ id: 'MTL', name: 'Montreal' }, { id: 'QUE', name: 'Quebec City' }],
        'DL': [{ id: 'ND', name: 'New Delhi' }, { id: 'SD', name: 'South Delhi' }],
        'MH': [{ id: 'MUM', name: 'Mumbai' }, { id: 'PUN', name: 'Pune' }],
        'KA': [{ id: 'BLR', name: 'Bangalore' }, { id: 'MYS', name: 'Mysore' }]
      };
      const result = cities[dependencyValue] || [];
      return of(result).pipe(delay(400));
    }

    // Default fallback if real URL provided
    // return this.http.get<any[]>(config.endpoint);
    return of([]);
  }
}