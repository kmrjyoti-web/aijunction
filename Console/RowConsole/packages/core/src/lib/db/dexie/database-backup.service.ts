import { Injectable, signal } from '@angular/core';
import { exportDB, importDB } from 'dexie-export-import';
import { AppDb, BackupHistory, BackupProfile } from './app-db';
import { from, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DatabaseBackupService {

    // Active profiles signal for UI
    profiles = signal<BackupProfile[]>([]);

    // Scheduler timers
    private timers: Map<number, any> = new Map();

    constructor(private db: AppDb) {
        this.refreshProfiles();
    }

    // --- Profile & Scheduler Logic ---

    async refreshProfiles() {
        const list = await this.db.BackupProfiles.toArray();
        this.profiles.set(list);
        this.schedulerInit();
    }

    private schedulerInit() {
        this.timers.forEach(t => clearInterval(t));
        this.timers.clear();

        const activeProfiles = this.profiles().filter(p => p.isEnabled);

        activeProfiles.forEach(profile => {
            if (profile.frequency === 'INTERVAL' && profile.intervalValue) {
                console.log(`[Scheduler] Profile '${profile.name}' every ${profile.intervalValue} min.`);
                const ms = profile.intervalValue * 60 * 1000;
                const timerId = setInterval(() => {
                    this.runProfile(profile.id!);
                }, ms);
                this.timers.set(profile.id!, timerId);
            }
            // TODO: DAILY scheduler implementation
        });
    }

    async addProfile(profile: BackupProfile) {
        await this.db.BackupProfiles.add(profile);
        await this.refreshProfiles();
    }

    async updateProfile(id: number, changes: Partial<BackupProfile>) {
        await this.db.BackupProfiles.update(id, changes);
        await this.refreshProfiles();
    }

    async deleteProfile(id: number) {
        await this.db.BackupProfiles.delete(id);
        await this.refreshProfiles();
    }

    async runProfile(profileId: number) {
        const profile = await this.db.BackupProfiles.get(profileId);
        if (!profile) return;

        console.log(`[Backup] Running Profile: ${profile.name} (${profile.backupType})`);

        try {
            let blob: Blob;

            // Strategy: 
            // If FULL and ALL TABLES -> Use standard exportDB (fastest/standard)
            // If DIFFERENTIAL or SPECIFIC TABLES -> Use Custom Export Logic

            const isAllTables = profile.tables.includes('*');
            const isFull = profile.backupType === 'FULL';

            if (isFull && isAllTables) {
                // Use Standard Dexie Export
                blob = await exportDB(this.db, { prettyJson: true });
            } else {
                // Custom Partial/Differential Export
                blob = await this.customExport(profile);
            }

            // Save History
            await this.db.DatabaseBackups.add({
                name: `${profile.name}_${new Date().toISOString()}`,
                type: 'AUTO',
                blob: blob,
                createdAt: new Date()
            });

            // Update Stats
            await this.db.BackupProfiles.update(profileId, {
                lastRunAt: Date.now(),
                lastSuccessAt: Date.now()
            });

            this.refreshProfiles();

        } catch (err) {
            console.error(`[Backup] Failed for ${profile.name}`, err);
        }
    }

    private async customExport(profile: BackupProfile): Promise<Blob> {
        const isDifferential = profile.backupType === 'DIFFERENTIAL';
        const startTime = isDifferential ? (profile.lastSuccessAt || 0) : 0;

        const tablesToBackup = profile.tables.includes('*')
            ? this.db.tables.map(t => t.name)
            : profile.tables;

        const backupData: any = {
            formatName: 'dexie-export-import',
            formatVersion: 1,
            data: {
                databaseName: this.db.name,
                databaseVersion: this.db.verno,
                tables: []
            }
        };

        const tablesData: any[] = [];

        for (const tableName of tablesToBackup) {
            const table = this.db.table(tableName);
            const schema = table.schema;
            let rows = [];

            if (startTime > 0) {
                // Differential Logic
                // 1. Try index scan
                if (schema.indexes.some(idx => idx.name === 'updated_at')) {
                    rows = await table.where('updated_at').above(startTime).toArray();
                } else if (schema.indexes.some(idx => idx.name === 'created_at')) {
                    rows = await table.where('created_at').above(startTime).toArray();
                } else if (schema.indexes.some(idx => idx.name === 'timestamp')) {
                    rows = await table.where('timestamp').above(startTime).toArray();
                } else {
                    // 2. Fallback Filter
                    const all = await table.toArray();
                    rows = all.filter((item: any) => this.extractTimestamp(item) > startTime);
                }
            } else {
                rows = await table.toArray();
            }

            if (rows.length > 0) {
                tablesData.push({
                    name: tableName,
                    schema: JSON.stringify(schema),
                    rowCount: rows.length,
                    rows: rows
                });
            }
        }

        backupData.data.tables = tablesData;
        const json = JSON.stringify(backupData, null, 2);
        return new Blob([json], { type: 'application/json' });
    }

    private extractTimestamp(item: any): number {
        if (item.updated_at) return new Date(item.updated_at).getTime();
        if (item.created_at) return new Date(item.created_at).getTime();
        if (item.timestamp) return new Date(item.timestamp).getTime();
        return 0;
    }


    // --- Existing Methods (Backward Compat) ---

    getBackupHistory(): Observable<BackupHistory[]> {
        return from(this.db.DatabaseBackups.toArray());
    }

    async deleteBackup(id: number) {
        await this.db.DatabaseBackups.delete(id);
    }

    async createBackup(name: string, type: 'MANUAL' | 'AUTO' = 'MANUAL', download: boolean = true) {
        // Default to full backup via standard exportDB
        const blob = await exportDB(this.db, { prettyJson: true });

        await this.db.DatabaseBackups.add({
            name,
            type,
            blob,
            createdAt: new Date()
        });

        if (download) this.downloadBlob(blob, name);
    }

    private downloadBlob(blob: Blob, name: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async restoreFromHistory(id: number) {
        const backup = await this.db.DatabaseBackups.get(id);
        if (!backup) throw new Error('Backup not found');
        await this.importDatabase(backup.blob as File);
    }

    async exportDatabase() {
        const name = `backup_${new Date().toISOString()}`;
        await this.createBackup(name, 'MANUAL', true);
    }

    async importDatabase(file: File | Blob) {
        if (this.db.isOpen()) {
            this.db.close();
        }
        await importDB(file, {
            progressCallback: (progress) => {
                console.log(`[Import] ${progress.completedTables}/${progress.totalTables}`);
                return true;
            }
        });
        await this.db.open();
    }
}
