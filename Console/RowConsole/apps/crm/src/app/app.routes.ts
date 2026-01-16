import { Route } from '@angular/router';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';

export const appRoutes: Route[] = [
    {
        path: 'customer-details',
        component: CustomerDetailsComponent
    }
];
