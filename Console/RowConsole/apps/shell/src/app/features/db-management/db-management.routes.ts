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
                path: 'sync-logs',
                loadComponent: () => import('./pages/sync-log.page').then(m => m.SyncLogPage)
            },
            {
                path: '',
                redirectTo: 'tables',
                pathMatch: 'full'
            }
        ]
    }
];
