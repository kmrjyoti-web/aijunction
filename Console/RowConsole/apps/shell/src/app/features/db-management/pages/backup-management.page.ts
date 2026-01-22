import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseBackupService, BackupHistory } from '../../../../../../../packages/core/src/index';

@Component({
    selector: 'app-backup-management',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6 bg-white rounded-lg shadow-md border border-gray-100">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Backup & Restore</h2>
          <p class="text-sm text-gray-500">Manage your local database snapshots</p>
        </div>
        <button (click)="createBackup()" 
                [disabled]="isLoading()"
                class="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all font-medium disabled:opacity-50">
          <i class="fa fa-plus-circle"></i> Create New Backup
        </button>
      </div>

      <!-- Backup List Table -->
      <div class="overflow-x-auto border border-gray-100 rounded-xl">
        <table class="w-full text-left bg-white">
          <thead class="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th class="px-6 py-4">Backup Name</th>
              <th class="px-6 py-4">Created At</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Size</th>
              <th class="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let item of backups()" class="hover:bg-blue-50/30 transition-colors">
              <td class="px-6 py-4 font-medium text-gray-800">{{ item.name }}</td>
              <td class="px-6 py-4 text-gray-500 text-sm">
                {{ item.createdAt | date:'MMM d, y, h:mm:ss a' }}
              </td>
              <td class="px-6 py-4">
                <span [class]="item.type === 'AUTO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                      class="px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                  {{ item.type }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ (item.blob.size / 1024 / 1024) | number:'1.2-2' }} MB</td>
              <td class="px-6 py-4">
                <div class="flex justify-center gap-3">
                  <button (click)="restore(item)" 
                          class="p-2 text-green-600 hover:bg-green-100 rounded-lg title='Restore'"
                          [disabled]="isLoading()">
                    <i class="fa fa-history"></i>
                  </button>
                  <button (click)="download(item)" 
                          class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg title='Download'"
                          [disabled]="isLoading()">
                    <i class="fa fa-download"></i>
                  </button>
                  <button (click)="deleteBackup(item)" 
                          class="p-2 text-red-600 hover:bg-red-100 rounded-lg title='Delete'"
                          [disabled]="isLoading()">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="backups().length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-gray-400">
                <div class="flex flex-col items-center gap-2">
                  <i class="fa fa-database text-4xl mb-2 opacity-20"></i>
                  <p>No backups found. Create your first one!</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Import from File -->
      <div class="mt-10 pt-8 border-t border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Restore from external file</h3>
        <div class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center relative group">
          <input type="file" (change)="onFileSelected($event)" 
                 class="absolute inset-0 opacity-0 cursor-pointer" 
                 accept=".json">
          <div class="flex flex-col items-center gap-3">
            <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <i class="fa fa-cloud-upload text-blue-500"></i>
            </div>
            <div>
              <p class="font-medium text-gray-700">Click to upload or drag & drop</p>
              <p class="text-xs text-gray-400 mt-1">Accepts only .json Dexie export files</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div *ngIf="isLoading()" class="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
         <div class="flex flex-col items-center gap-4">
            <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-blue-600 font-bold tracking-widest text-sm uppercase">Processing...</p>
         </div>
      </div>
    </div>
  `
})
export class BackupManagementPage implements OnInit {
    backups = signal<BackupHistory[]>([]);
    isLoading = signal(false);

    constructor(private backupService: DatabaseBackupService) { }

    ngOnInit() {
        this.loadHistory();
    }

    loadHistory() {
        this.backupService.getBackupHistory().subscribe((data: BackupHistory[]) => {
            this.backups.set(data.sort((a: BackupHistory, b: BackupHistory) => b.createdAt.getTime() - a.createdAt.getTime()));
        });
    }

    async createBackup() {
        const name = prompt('Enter a name for this backup:', `Manual Backup ${new Date().toLocaleDateString()}`);
        if (!name) return;

        try {
            this.isLoading.set(true);
            await this.backupService.createBackup(name, 'MANUAL', false);
            this.loadHistory();
        } catch (err) {
            alert('Backup failed');
        } finally {
            this.isLoading.set(false);
        }
    }

    async restore(item: BackupHistory) {
        if (confirm(`ARE YOU ABSOLUTELY SURE? This will overwrite the current database with "${item.name}". All unsaved local data will be lost.`)) {
            try {
                this.isLoading.set(true);
                await this.backupService.restoreFromHistory(item.id!);
                alert('Database restored successfully!');
            } catch (err) {
                alert('Restoration failed: ' + err);
            } finally {
                this.isLoading.set(false);
            }
        }
    }

    async deleteBackup(item: BackupHistory) {
        if (confirm(`Delete backup "${item.name}"?`)) {
            await this.backupService.deleteBackup(item.id!);
            this.loadHistory();
        }
    }

    download(item: BackupHistory) {
        const url = URL.createObjectURL(item.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.name.replace(/[:.]/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            if (confirm('Import external backup? This will overwrite existing data.')) {
                try {
                    this.isLoading.set(true);
                    await this.backupService.importDatabase(file);
                    alert('Import completed successfully!');
                    this.loadHistory();
                } catch (error) {
                    alert('Import failed: ' + error);
                } finally {
                    this.isLoading.set(false);
                }
            }
        }
        event.target.value = '';
    }
}
