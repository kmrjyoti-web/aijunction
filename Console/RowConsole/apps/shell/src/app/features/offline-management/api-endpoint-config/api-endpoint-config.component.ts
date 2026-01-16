import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiConfigurationService } from '@ai-junction/platform-angular';
import { ApiEndpointConfig } from '@ai-junction/platform-core';

@Component({
    selector: 'app-api-endpoint-config',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div>
      <ul class="space-y-2 mb-4">
        <li *ngFor="let api of apis()" class="p-2 border rounded bg-white flex justify-between items-center">
           <div>
             <span class="font-bold">{{ api.API_CODE }}</span> - {{ api.Api_End_point }}
           </div>
           <span class="text-xs bg-gray-200 px-2 rounded">{{ api.method }}</span>
        </li>
      </ul>

      <button (click)="isEditing.set(!isEditing())" class="bg-blue-500 text-white px-4 py-2 rounded">
        {{ isEditing() ? 'Cancel' : 'Add API' }}
      </button>

      <div *ngIf="isEditing()" class="mt-4 p-4 border rounded bg-gray-50">
         <div class="grid gap-4 mb-4">
            <div>
                <label>API Code</label>
                <input [(ngModel)]="current.API_CODE" class="border p-1 w-full">
            </div>
            <div>
                <label>Endpoint</label>
                <input [(ngModel)]="current.Api_End_point" class="border p-1 w-full" placeholder="/api/v1/products">
            </div>
            <div>
                <label>Method</label>
                 <select [(ngModel)]="current.method" class="border p-1 w-full">
                     <option value="GET">GET</option>
                     <option value="POST">POST</option>
                     <option value="PUT">PUT</option>
                  </select>
            </div>
         </div>
         <button (click)="save()" class="bg-green-600 text-white px-4 py-2 rounded">Save</button>
      </div>
    </div>
  `
})
export class ApiEndpointConfigComponent implements OnInit {
    apis = signal<ApiEndpointConfig[]>([]);
    isEditing = signal(false);

    current: ApiEndpointConfig = this.getEmpty();

    constructor(private apiService: ApiConfigurationService) { }

    ngOnInit() {
        this.load();
    }

    load() {
        this.apiService.getAllConfigs().subscribe(data => this.apis.set(data));
    }

    async save() {
        if (!this.current.API_CODE || !this.current.Api_End_point) return;

        await this.apiService.saveConfig(this.current);
        this.isEditing.set(false);
        this.load();
        this.current = this.getEmpty();
    }

    private getEmpty(): ApiEndpointConfig {
        return {
            API_CODE: '',
            Api_Version: 'v1',
            Api_End_point: '',
            Payload: {},
            method: 'GET',
            Sync_frequency: 0
        };
    }
}
