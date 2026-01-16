import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbManagementFacade } from '../services/db-management.facade';

@Component({
    selector: 'app-cache-management-page',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6">
       <h1 class="text-2xl font-bold mb-6">Cache Management</h1>
       
       <div class="grid gap-6">
           <div class="border p-6 bg-white rounded shadow-sm">
                <h2 class="font-bold mb-4 text-lg">Cache Statistics</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="p-4 bg-gray-50 rounded text-center">
                        <div class="text-2xl font-bold text-blue-600">0</div>
                        <div class="text-sm text-gray-500">Cached Items</div>
                    </div>
                    <div class="p-4 bg-gray-50 rounded text-center">
                        <div class="text-2xl font-bold text-green-600">0 KB</div>
                        <div class="text-sm text-gray-500">Size</div>
                    </div>
                </div>
           </div>

           <div class="border p-6 bg-white rounded shadow-sm">
                <h2 class="font-bold mb-4 text-lg">Actions</h2>
                <div class="flex gap-4">
                    <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Clear All Cache</button>
                    <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">Refresh Stats</button>
                </div>
           </div>
       </div>
    </div>
  `
})
export class CacheManagementPage {
    constructor(public facade: DbManagementFacade) { }
}
