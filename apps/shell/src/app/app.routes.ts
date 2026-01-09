import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/shell.host.component').then(m => m.ShellHostComponent),
    children: [
        {
            path: 'settings',
            loadComponent: () => import('./features/settings/appearance-settings.page').then(m => m.AppearanceSettingsPage)
        },
        {
            path: '',
            redirectTo: 'settings',
            pathMatch: 'full'
        }
    ]
  },
];
