import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, map, of } from 'rxjs';

export interface ServiceStatus {
    name: string;
    url: string;
    status: 'ONLINE' | 'OFFLINE' | 'CHECKING';
    latency?: number;
    error?: string;
}

@Injectable({
    providedIn: 'root'
})
export class HealthCheckService {
    private http = inject(HttpClient);

    // Signal to hold status of all services
    services = signal<ServiceStatus[]>([]);

    constructor() {
        this.initializeServices();
    }

    private initializeServices() {
        const envApi = (environment as any).api;
        const list: ServiceStatus[] = Object.keys(envApi).map(key => ({
            name: key,
            url: envApi[key],
            status: 'CHECKING'
        }));
        this.services.set(list);
    }

    checkAll() {
        const current = this.services();
        // Reset status to CHECKING
        this.services.update(list => list.map(s => ({ ...s, status: 'CHECKING', error: undefined, latency: undefined })));

        current.forEach(service => {
            this.checkService(service);
        });
    }

    private checkService(service: ServiceStatus) {
        const start = Date.now();
        // Assuming /health is the standard health endpoint. Adjust if needed.
        // For localhost:7232, it might be /healthz or just pinging root.
        const healthUrl = `${service.url}/health`;

        this.http.get(healthUrl, { responseType: 'text' }).pipe(
            map(() => {
                const latency = Date.now() - start;
                this.updateStatus(service.name, 'ONLINE', latency);
            }),
            catchError((err) => {
                const latency = Date.now() - start;
                this.updateStatus(service.name, 'OFFLINE', latency, err.message || 'Connection failed');
                return of(null);
            })
        ).subscribe();
    }

    private updateStatus(name: string, status: 'ONLINE' | 'OFFLINE', latency: number, error?: string) {
        this.services.update(list => list.map(s =>
            s.name === name ? { ...s, status, latency, error } : s
        ));
    }
}
