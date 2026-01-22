import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseBackupService } from '@ai-junction/core';

@Component({
    selector: 'app-restore',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="max-w-2xl mx-auto">
        <div class="text-center mb-10">
            <h2 class="text-2xl font-bold text-gray-900">Restore Database</h2>
            <p class="text-gray-500 mt-2">Upload a previously exported JSON backup file to restore your data.</p>
        </div>

        <div class="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all group relative cursor-pointer">
            <input type="file" (change)="onFileSelected($event)" accept=".json" class="absolute inset-0 opacity-0 cursor-pointer z-10">
            
            <div class="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <i class="fa fa-cloud-upload-alt text-3xl"></i>
            </div>
            
            <h3 class="text-lg font-bold text-gray-900 mb-2">Click to Upload</h3>
            <p class="text-sm text-gray-500 max-w-xs mx-auto">Drag and drop your backup file here, or browse your folders.</p>
            <p class="text-xs text-gray-400 mt-4 uppercase font-bold tracking-wider">Supports .JSON Format</p>
        </div>

        <div class="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-4">
            <div class="text-yellow-600 text-xl"><i class="fa fa-exclamation-triangle"></i></div>
            <div>
                <h4 class="text-sm font-bold text-yellow-800">Warning: Irreversible Action</h4>
                <p class="text-xs text-yellow-700 mt-1 leading-relaxed">Restoring from a backup will completely replace your current local database. Any unsaved data created since the backup will be lost forever.</p>
            </div>
        </div>

         <!-- Loading Overlay -->
        <div *ngIf="isLoading()" class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-lg font-bold text-gray-900">Restoring Data...</p>
            <p class="text-sm text-gray-500">Please do not close the window.</p>
        </div>
    </div>
  `
})
export class RestoreComponent {
    backupService = inject(DatabaseBackupService);
    isLoading = signal(false);

    async onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            if (confirm(`Restore from "${file.name}"? This will Overwrite your current DB.`)) {
                try {
                    this.isLoading.set(true);
                    await this.backupService.importDatabase(file);
                    alert('Restoration Complete!');
                } catch (err) {
                    alert('Restore failed: ' + err);
                } finally {
                    this.isLoading.set(false);
                }
            }
        }
        event.target.value = '';
    }
}
