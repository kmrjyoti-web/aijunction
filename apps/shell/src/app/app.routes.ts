import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/shell.host.component').then(m => m.ShellHostComponent),
    children: [
      {
        path: 'dashboard/default',
        loadComponent: () => import('./features/dashboard/default/default.component').then(m => m.DefaultComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/appearance-settings.page').then(m => m.AppearanceSettingsPage)
      },
      {
        path: '',
        redirectTo: 'dashboard/default',
        pathMatch: 'full'
      }
    ]
  },
];
