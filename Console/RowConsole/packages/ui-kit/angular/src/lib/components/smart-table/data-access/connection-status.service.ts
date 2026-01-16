import { Injectable, signal } from '@angular/core';

export type ConnectionStatus = 'Online' | 'Connecting' | 'Offline';

@Injectable({
  providedIn: 'root'
})
export class ConnectionStatusService {
  /** The current connection status signal. */
  readonly status = signal<ConnectionStatus>('Connecting');

  /** Sets the status to 'Online'. */
  setOnline(): void {
    this.status.set('Online');
  }

  /** Sets the status to 'Connecting'. */
  setConnecting(): void {
    this.status.set('Connecting');
  }
  
  /** Sets the status to 'Offline'. */
  setOffline(): void {
    this.status.set('Offline');
  }
}
