import { Route } from '@angular/router';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';

export const appRoutes: Route[] = [
    {
        path: 'customer-details',
        component: CustomerDetailsComponent
    },
    {
        path: 'row-contact',
        loadComponent: () => import('@ai-junction/features').then(m => m.RowContactListComponent)
    }
];
