import { Routes } from '@angular/router';
import { DbLayoutComponent } from './components/db-layout/db-layout.component';

export const dbManagementRoutes: Routes = [
    {
        path: '',
        component: DbLayoutComponent,
        children: [
            {
                path: 'tables',
                loadComponent: () => import('./pages/table-master.page').then(m => m.TableMasterPage)
            },
            {
                path: 'api',
                loadComponent: () => import('./pages/api-endpoints.page').then(m => m.ApiEndpointsPage)
            },
            {
                path: 'cache',
                loadComponent: () => import('./pages/cache-management.page').then(m => m.CacheManagementPage)
            },
            {
                path: 'backup',
                loadComponent: () => import('./components/backup/backup-layout/backup-layout.component').then(m => m.BackupLayoutComponent),
                children: [
                    { path: '', redirectTo: 'profiles', pathMatch: 'full' },
                    { path: 'profiles', loadComponent: () => import('./components/backup/backup-profiles/backup-profiles.component').then(m => m.BackupProfilesComponent) },
                    { path: 'manual', loadComponent: () => import('./components/backup/manual-backup/manual-backup.component').then(m => m.ManualBackupComponent) },
                    { path: 'restore', loadComponent: () => import('./components/backup/restore/restore.component').then(m => m.RestoreComponent) },
                    { path: 'history', loadComponent: () => import('./components/backup/backup-history/backup-history.component').then(m => m.BackupHistoryComponent) }
                ]
            },
            {
                path: 'backups', // Legacy Redirect
                redirectTo: 'backup',
                pathMatch: 'full'
            },
            {
                path: '',
                redirectTo: 'tables',
                pathMatch: 'full'
            }
        ]
    }
];
