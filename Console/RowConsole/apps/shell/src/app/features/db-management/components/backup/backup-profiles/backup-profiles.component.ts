import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseBackupService } from '@ai-junction/core';
import { BackupProfile } from '@ai-junction/core';

@Component({
    selector: 'app-backup-profiles',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="max-w-5xl mx-auto">
      
      <!-- Stats / Header Action -->
      <div class="flex items-center justify-between mb-8">
        <div>
             <h2 class="text-lg font-bold text-gray-800">Backup Profiles</h2>
             <p class="text-xs text-gray-500 mt-1">Configure automated backup schedules and retention policies.</p>
        </div>
        <button (click)="openEditor()" 
                class="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg shadow-gray-200 text-xs font-bold uppercase tracking-wide transition-all active:scale-95 flex items-center gap-2">
            <i class="fa fa-plus"></i> New Profile
        </button>
      </div>

      <!-- Grid of Profiles -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let profile of backupService.profiles()" 
             class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            
            <!-- Type Badge/Decor -->
            <div class="absolute top-0 right-0 p-4 opacity-50">
                <i [class]="profile.backupType === 'FULL' ? 'fa fa-hdd text-gray-200 text-4xl' : 'fa fa-clock text-blue-100 text-4xl -mr-2 -mt-2'"></i>
            </div>

            <!-- Header -->
            <div class="relative z-10">
                <div class="flex items-center justify-between mb-4">
                    <span [class]="profile.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                          class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                        {{ profile.isEnabled ? 'Active' : 'Paused' }}
                    </span>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button (click)="openEditor(profile)" class="w-7 h-7 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 flex items-center justify-center">
                             <i class="fa fa-pencil-alt text-xs"></i>
                         </button>
                         <button (click)="deleteProfile(profile)" class="w-7 h-7 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 flex items-center justify-center">
                             <i class="fa fa-trash text-xs"></i>
                         </button>
                    </div>
                </div>

                <h3 class="text-base font-bold text-gray-900 mb-1 truncate">{{ profile.name }}</h3>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                    <i class="fa fa-sync-alt text-[10px]"></i>
                    <span *ngIf="profile.frequency === 'INTERVAL'">Every {{ profile.intervalValue }} min</span>
                    <span *ngIf="profile.frequency === 'DAILY'">Daily at {{ profile.timeOfDay }}</span>
                </div>
            </div>

            <!-- Stats -->
            <div class="relative z-10 mt-6 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                <div>
                    <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Type</div>
                    <div class="text-xs font-semibold text-gray-700 mt-0.5">{{ profile.backupType === 'DIFFERENTIAL' ? 'Differential' : 'Full Backup' }}</div>
                </div>
                <div>
                    <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tables</div>
                    <div class="text-xs font-semibold text-gray-700 mt-0.5">
                        {{ profile.tables.includes('*') ? 'All Tables' : profile.tables.length + ' Selected' }}
                    </div>
                </div>
                <div class="col-span-2">
                    <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Last Run</div>
                    <div class="text-xs font-semibold text-gray-700 mt-0.5 flex items-center gap-1.5">
                        <ng-container *ngIf="profile.lastRunAt; else neverRun">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            {{ profile.lastRunAt | date:'medium' }}
                        </ng-container>
                        <ng-template #neverRun>
                            <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            Never
                        </ng-template>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Button (Empty State) -->
        <button (click)="openEditor()" *ngIf="backupService.profiles().length === 0"
             class="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all min-h-[200px]">
             <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                 <i class="fa fa-plus text-lg"></i>
             </div>
             <span class="text-sm font-bold">Create your first profile</span>
        </button>
      </div>
    </div>

    <!-- Editor Modal (Simple Overlay) -->
    <div *ngIf="isEditing" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" (click)="closeEditor()"></div>
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <!-- Header -->
            <div class="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                <h3 class="font-bold text-gray-900">{{ editForm.id ? 'Edit Profile' : 'New Backup Profile' }}</h3>
                <button (click)="closeEditor()" class="text-gray-400 hover:text-gray-600"><i class="fa fa-times"></i></button>
            </div>

            <!-- Form -->
            <div class="p-6 space-y-5">
                <!-- Name & Enable -->
                <div class="flex gap-4">
                    <div class="flex-1">
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Profile Name</label>
                        <input [(ngModel)]="editForm.name" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Hourly Transactions">
                    </div>
                    <div>
                         <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                         <label class="flex items-center cursor-pointer mt-2">
                            <input [(ngModel)]="editForm.isEnabled" type="checkbox" class="sr-only peer">
                            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                <!-- Frequency -->
                <div>
                     <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Schedule</label>
                     <div class="flex gap-2 mb-3">
                         <button (click)="editForm.frequency = 'INTERVAL'" 
                                 [class]="editForm.frequency === 'INTERVAL' ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
                                 class="flex-1 py-2 text-xs font-bold border rounded-lg transition-all">
                             Interval
                         </button>
                         <button (click)="editForm.frequency = 'DAILY'" 
                                 [class]="editForm.frequency === 'DAILY' ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
                                 class="flex-1 py-2 text-xs font-bold border rounded-lg transition-all">
                             Daily
                         </button>
                     </div>
                     
                     <div *ngIf="editForm.frequency === 'INTERVAL'" class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                         <span class="text-sm text-gray-600">Every</span>
                         <input [(ngModel)]="editForm.intervalValue" type="number" class="w-20 px-2 py-1 border rounded text-center text-sm" min="1">
                         <span class="text-sm text-gray-600">minutes</span>
                     </div>
                     
                     <div *ngIf="editForm.frequency === 'DAILY'" class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                         <span class="text-sm text-gray-600">At</span>
                         <input [(ngModel)]="editForm.timeOfDay" type="time" class="px-2 py-1 border rounded text-sm">
                     </div>
                </div>

                <!-- Type -->
                <div>
                     <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Backup Type</label>
                     <div class="grid grid-cols-2 gap-4">
                        <div (click)="editForm.backupType = 'FULL'" class="cursor-pointer border rounded-xl p-3 flex items-start gap-3 hover:bg-gray-50 transition-all"
                             [class]="editForm.backupType === 'FULL' ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-500' : 'border-gray-200'">
                            <div class="mt-0.5"><div class="w-4 h-4 rounded-full border flex items-center justify-center border-gray-300" [class.border-blue-500]="editForm.backupType === 'FULL'"><div *ngIf="editForm.backupType==='FULL'" class="w-2 h-2 bg-blue-500 rounded-full"></div></div></div>
                            <div>
                                <div class="text-sm font-bold text-gray-900">Full Backup</div>
                                <div class="text-[10px] text-gray-500 leading-tight mt-0.5">Backs up all selected data every time.</div>
                            </div>
                        </div>

                        <div (click)="editForm.backupType = 'DIFFERENTIAL'" class="cursor-pointer border rounded-xl p-3 flex items-start gap-3 hover:bg-gray-50 transition-all"
                             [class]="editForm.backupType === 'DIFFERENTIAL' ? 'bg-purple-50/50 border-purple-200 ring-1 ring-purple-500' : 'border-gray-200'">
                             <div class="mt-0.5"><div class="w-4 h-4 rounded-full border flex items-center justify-center border-gray-300" [class.border-purple-500]="editForm.backupType === 'DIFFERENTIAL'"><div *ngIf="editForm.backupType==='DIFFERENTIAL'" class="w-2 h-2 bg-purple-500 rounded-full"></div></div></div>
                            <div>
                                <div class="text-sm font-bold text-gray-900">Differential</div>
                                <div class="text-[10px] text-gray-500 leading-tight mt-0.5">Only data since last success. (Requires timestamp)</div>
                            </div>
                        </div>
                     </div>
                </div>

                <!-- Tables -->
                <div>
                     <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Tables Scope</label>
                     <!-- Simple Toggle for All vs Custom (Simplification for MVP) -->
                     <div class="flex items-center gap-3">
                        <button (click)="toggleAllTables()" class="text-sm font-bold flex items-center gap-2" [class]="isAllTables() ? 'text-blue-600' : 'text-gray-400'">
                            <i class="fa" [class]="isAllTables() ? 'fa-check-circle' : 'fa-circle'"></i>
                            All Tables
                        </button>
                        <!-- Should add custom selector later -->
                     </div>
                     <p *ngIf="isAllTables()" class="text-xs text-gray-400 mt-1 italic">All tables in the database will be included.</p>
                     <p *ngIf="!isAllTables()" class="text-xs text-orange-500 mt-1 italic">Specific table selection not implemented in MVP UI. Defaulting to All.</p>
                </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t flex justify-end gap-2">
                <button (click)="closeEditor()" class="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button (click)="saveProfile()" class="px-6 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-lg active:scale-95 transition-all">Save Profile</button>
            </div>
        </div>
    </div>
  `
})
export class BackupProfilesComponent {
    backupService = inject(DatabaseBackupService);

    isEditing = false;
    editForm: Partial<BackupProfile> = this.getEmptyForm();

    getEmptyForm(): Partial<BackupProfile> {
        return {
            name: '',
            isEnabled: true,
            frequency: 'INTERVAL',
            intervalValue: 60,
            backupType: 'FULL',
            tables: ['*']
        };
    }

    isAllTables() {
        return this.editForm.tables?.includes('*');
    }

    toggleAllTables() {
        // For MVP, just force All.
        this.editForm.tables = ['*'];
    }

    openEditor(profile?: BackupProfile) {
        if (profile) {
            this.editForm = { ...profile };
        } else {
            this.editForm = this.getEmptyForm();
        }
        this.isEditing = true;
    }

    closeEditor() {
        this.isEditing = false;
    }

    async saveProfile() {
        const form = this.editForm as any;
        if (!form.name) return; // Validation

        const profile = this.editForm as BackupProfile;
        if (profile.id) {
            await this.backupService.updateProfile(profile.id, profile);
        } else {
            await this.backupService.addProfile(profile);
        }
        this.closeEditor();
    }

    async deleteProfile(profile: BackupProfile) {
        if (confirm(`Delete profile "${profile.name}"?`)) {
            await this.backupService.deleteProfile(profile.id!);
        }
    }
}
