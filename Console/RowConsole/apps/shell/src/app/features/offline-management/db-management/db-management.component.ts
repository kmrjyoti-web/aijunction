import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableMasterConfigComponent } from '../table-master-config/table-master-config.component';
import { ApiEndpointConfigComponent } from '../api-endpoint-config/api-endpoint-config.component';

@Component({
    selector: 'app-db-management',
    standalone: true,
    imports: [CommonModule, TableMasterConfigComponent, ApiEndpointConfigComponent],
    template: `
    <div class="p-6 bg-gray-100 min-h-screen">
      <h1 class="text-3xl font-bold mb-6 text-gray-800">Database & Sync Management</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Table Master Section -->
        <div class="bg-white rounded-lg shadow p-4">
          <h2 class="text-xl font-semibold mb-4 border-b pb-2">Table Master Configuration</h2>
          <app-table-master-config></app-table-master-config>
        </div>

        <!-- API Endpoint Section -->
        <div class="bg-white rounded-lg shadow p-4">
          <h2 class="text-xl font-semibold mb-4 border-b pb-2">API Endpoint Configuration</h2>
          <app-api-endpoint-config></app-api-endpoint-config>
        </div>
      </div>
      
      <!-- TODO: Data Viewer Section -->
    </div>
  `
})
export class DbManagementComponent { }
