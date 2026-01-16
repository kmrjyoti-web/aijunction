import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectivityService } from '@ai-junction/platform-angular';
import { ConnectivityMode } from '@ai-junction/platform-core';

@Component({
    selector: 'app-sync-status',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed bottom-4 right-4 z-50 p-2 rounded shadow-lg text-white"
         [ngClass]="{
           'bg-green-600': status().isOnline,
           'bg-red-600': !status().isOnline
         }">
       <div class="flex items-center gap-2">
         <span class="font-bold">{{ status().isOnline ? 'ONLINE' : 'OFFLINE' }}</span>
         <span class="text-xs">({{ status().mode }})</span>
       </div>
    </div>
    
    <!-- Blocking Overlay (Placeholder logic) -->
    <!-- Ideally, this component checks if there is a 'BLOCK' warning active via a SyncService -->
  `
})
export class SyncStatusComponent {
    status = this.connectivity.status;

    constructor(private connectivity: ConnectivityService) { }
}
