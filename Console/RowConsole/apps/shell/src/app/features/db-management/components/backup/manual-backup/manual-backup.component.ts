import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseBackupService } from '@ai-junction/core';

@Component({
    selector: 'app-manual-backup',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="max-w-4xl mx-auto space-y-6">
      
      <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-900">Manual Backup</h2>
            <p class="text-sm text-gray-500 mt-1">Generate a snapshot of your database on demand.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Settings -->
            <div class="space-y-6">
                <div>
                     <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Backup Scope</label>
                     <div class="flex gap-3">
                         <button (click)="scope = 'FULL'" 
                                 [class]="scope === 'FULL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
                                 class="flex-1 py-3 px-4 text-sm font-bold border rounded-xl transition-all flex items-center justify-center gap-2">
                             <i class="fa fa-database"></i> Full Database
                         </button>
                         <button (click)="scope = 'PARTIAL'" 
                                 [class]="scope === 'PARTIAL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
                                 class="flex-1 py-3 px-4 text-sm font-bold border rounded-xl transition-all flex items-center justify-center gap-2 opacity-50 cursor-not-allowed" title="Coming Soon">
                             <i class="fa fa-filter"></i> Custom Range
                         </button>
                     </div>
                </div>

                <div *ngIf="scope === 'PARTIAL'" class="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <p class="text-xs text-orange-700 font-medium"><i class="fa fa-info-circle mr-1"></i> Custom range backup coming in next update.</p>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Metadata</label>
                    <input [(ngModel)]="backupName" type="text" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Pre-Migration Backup">
                </div>
            </div>

            <!-- Summary / Action -->
            <div class="bg-gray-50 rounded-xl p-6 flex flex-col justify-center items-center text-center border border-gray-100">
                <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <i class="fa fa-save text-2xl"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">Ready to Backup</h3>
                <p class="text-sm text-gray-500 mb-6 max-w-xs">This will create a downloadable JSON file and save a copy to your local history.</p>
                
                <button (click)="generateBackup()" [disabled]="isLoading()" 
                        class="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <i *ngIf="isLoading()" class="fa fa-circle-notch fa-spin"></i>
                    {{ isLoading() ? 'Generating...' : 'Start Backup Now' }}
                </button>
            </div>
        </div>
      </div>

    </div>
  `
})
export class ManualBackupComponent {
    backupService = inject(DatabaseBackupService);
    scope: 'FULL' | 'PARTIAL' = 'FULL';
    backupName = '';
    isLoading = signal(false);

    async generateBackup() {
        try {
            this.isLoading.set(true);
            const name = this.backupName || `Manual Backup ${new Date().toLocaleDateString()}`;

            // Use the default createBackup for Full Backup for now
            // TODO: Pass scope/logic for partial if implemented manually here
            await this.backupService.createBackup(name, 'MANUAL', true);

            this.backupName = ''; // Reset
            alert('Backup created successfully!');
        } catch (err) {
            alert('Backup failed: ' + err);
        } finally {
            this.isLoading.set(false);
        }
    }
}
