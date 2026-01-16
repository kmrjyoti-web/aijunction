import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbManagementFacade } from '../services/db-management.facade';

@Component({
    selector: 'app-api-endpoints-page',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6">
       <h1 class="text-2xl font-bold mb-6">API Management</h1>
       
       <div class="border p-6 bg-white rounded shadow-sm">
            <h2 class="font-bold mb-4 text-lg">API Endpoints Configuration</h2>
            <div *ngIf="facade.endpoints().length === 0" class="text-gray-500 italic">No API nodes configured.</div>
            <ul class="space-y-2">
                <li *ngFor="let a of facade.endpoints()" class="p-3 border rounded hover:bg-gray-50">
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{{ a.API_CODE }}</span>
                        <span class="text-gray-400">→</span>
                        <span class="font-semibold">{{ a.Api_End_point }}</span>
                    </div>
                </li>
            </ul>
             <!-- Placeholder for Add/Edit Form -->
             <div class="mt-4 p-4 bg-gray-50 rounded border border-dashed text-center text-gray-400">
                Form to add API mappings will go here.
             </div>
       </div>
    </div>
  `
})
export class ApiEndpointsPage implements OnInit {
    constructor(public facade: DbManagementFacade) { }

    ngOnInit() {
        this.facade.loadAll();
    }
}
