import { Routes } from '@angular/router';
import { TableMasterPage } from './features/db-management/pages/table-master.page';
import { ApiEndpointsPage } from './features/db-management/pages/api-endpoints.page';
import { CacheManagementPage } from './features/db-management/pages/cache-management.page';
import { StartupGuardService } from './platform/runtime/startup-guard.service';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/shell.host.component').then(m => m.ShellHostComponent),
    children: [
      {
        path: 'management',
        canActivate: [StartupGuardService],
        children: [
          { path: 'db', component: TableMasterPage },
          { path: 'api', component: ApiEndpointsPage },
          { path: 'cache', component: CacheManagementPage },
          { path: '', redirectTo: 'db', pathMatch: 'full' }
        ]
      },
      {
        path: 'health-check',
        loadComponent: () => import('./features/health-check/pages/health-check.page').then(m => m.HealthCheckPage)
      },
      {
        path: 'dashboard/default',
        loadComponent: () => import('./features/dashboard/default/default.component').then(m => m.DefaultComponent)
      },
      {
        path: 'dev-controls',
        loadComponent: () => import('./shared/controls/control-library/control-library.component').then(m => m.ControlLibraryComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/appearance-settings.page').then(m => m.AppearanceSettingsPage)
      },
      {
        path: 'smart-table',
        loadComponent: () => import('./features/smart-table-page/smart-table-page.component').then(m => m.SmartTablePageComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard/default',
        pathMatch: 'full'
      }
    ]
  },
];
