import { Injectable, signal, NgZone } from '@angular/core';

export enum ConnectivityMode {
    ONLINE_FIRST = 'ONLINE_FIRST',
    OFFLINE_FIRST = 'OFFLINE_FIRST',
    HYBRID = 'HYBRID',
    SYNC = 'SYNC'
}

export interface AppState {
    mode: ConnectivityMode;
    isOnline: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AppModeService {
    private _state = signal<AppState>({
        mode: ConnectivityMode.ONLINE_FIRST,
        isOnline: navigator.onLine
    });

    readonly state = this._state.asReadonly();

    constructor(private ngZone: NgZone) {
        window.addEventListener('online', () => this.updateOnline(true));
        window.addEventListener('offline', () => this.updateOnline(false));
    }

    setMode(mode: ConnectivityMode) {
        this.ngZone.run(() => {
            this._state.update(s => ({ ...s, mode }));
        });
    }

    private updateOnline(isOnline: boolean) {
        this.ngZone.run(() => {
            this._state.update(s => ({ ...s, isOnline }));
        });
    }
}
