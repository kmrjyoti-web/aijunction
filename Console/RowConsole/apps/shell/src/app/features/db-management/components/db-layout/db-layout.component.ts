import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
   selector: 'app-db-layout',
   standalone: true,
   imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
   template: `
    <div class="flex h-full min-h-screen bg-gray-50">
      <!-- Sidebar / Child Menu -->
      <aside class="w-64 bg-white border-r border-gray-200 block">
        <div class="h-16 flex items-center px-6 border-b border-gray-200">
             <span class="font-bold text-lg text-gray-800">DB Admin</span>
        </div>
        <nav class="p-4 space-y-1">
          <a routerLink="tables" routerLinkActive="bg-blue-50 text-blue-700 font-medium" 
             class="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
             File/Table Master
          </a>
          <a routerLink="api" routerLinkActive="bg-blue-50 text-blue-700 font-medium"
             class="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
             API Configuration
          </a>
          <a routerLink="cache" routerLinkActive="bg-blue-50 text-blue-700 font-medium"
             class="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
             Cache Management
          </a>
          <div class="pt-4 pb-2">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monitoring</h3>
          </div>
          <a routerLink="sync-logs" routerLinkActive="bg-blue-50 text-blue-700 font-medium"
             class="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
             Sync Logs
          </a>
          <a routerLink="backups" routerLinkActive="bg-blue-50 text-blue-700 font-medium"
             class="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
             Backups & Restore
          </a>
           <!-- Dashboard overview linking back to main mgmt page if desired, or we keep 'db' as default -->
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
         <!-- Mobile Menu Toggle could go here -->
         <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class DbLayoutComponent { }
