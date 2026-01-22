import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseBackupService, BackupHistory } from '@ai-junction/core';

@Component({
    selector: 'app-backup-history',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-800">Backup History</h2>
            <button (click)="loadHistory()" class="text-gray-400 hover:text-blue-600 transition-colors">
                <i class="fa fa-sync-alt" [class.fa-spin]="isLoading()"></i>
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead class="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                        <th class="px-8 py-4">Name</th>
                        <th class="px-8 py-4">Date</th>
                        <th class="px-8 py-4">Type</th>
                        <th class="px-8 py-4">Size</th>
                        <th class="px-8 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 text-sm">
                    <tr *ngFor="let item of backups()" class="hover:bg-blue-50/20 transition-colors group">
                        <td class="px-8 py-4 font-semibold text-gray-900">{{ item.name }}</td>
                        <td class="px-8 py-4 text-gray-500">{{ item.createdAt | date:'medium' }}</td>
                        <td class="px-8 py-4">
                            <span [class]="item.type === 'AUTO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                                  class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                                {{ item.type }}
                            </span>
                        </td>
                        <td class="px-8 py-4 text-gray-500 font-mono text-xs">{{ (item.blob.size / 1024 / 1024) | number:'1.2-2' }} MB</td>
                        <td class="px-8 py-4 text-right">
                            <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button (click)="restore(item)" class="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Restore">
                                    <i class="fa fa-history"></i>
                                </button>
                                <button (click)="download(item)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Download">
                                    <i class="fa fa-download"></i>
                                </button>
                                <button (click)="deleteItem(item)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="backups().length === 0">
                        <td colspan="5" class="px-8 py-12 text-center text-gray-400">
                            No history found.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  `
})
export class BackupHistoryComponent implements OnInit {
    backupService = inject(DatabaseBackupService);
    backups = signal<BackupHistory[]>([]);
    isLoading = signal(false);

    ngOnInit() {
        this.loadHistory();
    }

    loadHistory() {
        this.isLoading.set(true);
        this.backupService.getBackupHistory().subscribe({
            next: (data: BackupHistory[]) => {
                this.backups.set(data.sort((a: BackupHistory, b: BackupHistory) => b.createdAt.getTime() - a.createdAt.getTime()));
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    download(item: BackupHistory) {
        const url = URL.createObjectURL(item.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.name.replace(/[:.]/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async restore(item: BackupHistory) {
        if (confirm('Restore this backup? Current data will be overwritten.')) {
            await this.backupService.restoreFromHistory(item.id!);
            alert('Restored!');
        }
    }

    async deleteItem(item: BackupHistory) {
        if (confirm('Delete this backup record?')) {
            await this.backupService.deleteBackup(item.id!);
            this.loadHistory();
        }
    }
}
