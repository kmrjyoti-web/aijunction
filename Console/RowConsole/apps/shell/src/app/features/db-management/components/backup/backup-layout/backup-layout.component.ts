import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-backup-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="h-full flex flex-col bg-gray-50/50">
      <!-- Header -->
      <div class="px-8 py-6 border-b bg-white">
        <div class="flex items-center gap-4 mb-2">
            <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                <i class="fa fa-database text-lg"></i>
            </div>
            <div>
                <h1 class="text-xl font-bold text-gray-900 tracking-tight">Data Backup & Recovery</h1>
                <p class="text-sm text-gray-500 font-medium">Manage database snapshots, schedules, and restoration points</p>
            </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="px-8 border-b bg-white sticky top-0 z-10">
        <nav class="flex gap-6">
          <a routerLink="profiles" 
             routerLinkActive="text-orange-600 border-orange-600 bg-orange-50/50" 
             class="px-4 py-3 text-sm font-bold text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-all rounded-t-lg flex items-center gap-2">
            <i class="fa fa-clock"></i>
            Schedules & Profiles
          </a>
          <a routerLink="manual" 
             routerLinkActive="text-orange-600 border-orange-600 bg-orange-50/50"
             class="px-4 py-3 text-sm font-bold text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-all rounded-t-lg flex items-center gap-2">
            <i class="fa fa-hand-pointer"></i>
            Manual Backup
          </a>
          <a routerLink="restore" 
             routerLinkActive="text-orange-600 border-orange-600 bg-orange-50/50"
             class="px-4 py-3 text-sm font-bold text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-all rounded-t-lg flex items-center gap-2">
            <i class="fa fa-upload"></i>
            Restore
          </a>
          <a routerLink="history" 
             routerLinkActive="text-orange-600 border-orange-600 bg-orange-50/50"
             class="px-4 py-3 text-sm font-bold text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-all rounded-t-lg flex items-center gap-2">
            <i class="fa fa-history"></i>
            History
          </a>
        </nav>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-auto p-8">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class BackupLayoutComponent { }
