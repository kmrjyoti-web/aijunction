import { Injectable, signal } from '@angular/core';

export interface Menu {
    headTitle1?: string;
    headTitle2?: string;
    path?: string;
    title?: string;
    icon?: string;
    type?: string;
    badgeType?: string;
    badgeValue?: string;
    active?: boolean;
    bookmark?: boolean;
    children?: Menu[];
}

@Injectable({
    providedIn: 'root'
})
export class NavService {

    items = signal<Menu[]>([
        {
            headTitle1: 'General',
        },
        {
            title: 'Dashboard',
            icon: 'home',
            type: 'link',
            badgeType: 'light-primary',
            badgeValue: '2',
            active: true,
            path: '/dashboard/default'
        },
        {
            headTitle1: 'Management',
        },
        {
            title: 'DB Management',
            icon: 'database',
            type: 'link',
            active: false,
            path: '/management/db'
        },
        {
            title: 'API Management',
            icon: 'server',
            type: 'link',
            active: false,
            path: '/management/api'
        },
        {
            title: 'Cache Management',
            icon: 'hard-drive',
            type: 'link',
            active: false,
            path: '/management/cache'
        },
        {
            headTitle1: 'Applications',
        },
        {
            title: 'CRM',
            icon: 'users',
            type: 'sub',
            active: false,
            children: [
                {
                    title: 'Row Contacts',
                    type: 'link',
                    active: false,
                    path: '/row-contact'
                }
            ]
        },
        {
            title: 'Settings',
            icon: 'settings',
            type: 'link',
            active: false,
            path: '/settings'
        },
        {
            headTitle1: 'Components',
        },
        {
            headTitle1: 'Components',
        },
        {
            title: 'Development',
            icon: 'layers',
            type: 'sub',
            active: false,
            children: [
                {
                    title: 'UIKit',
                    type: 'link',
                    active: false,
                    path: '/dev-controls'
                },
                {
                    title: 'Smart Table',
                    type: 'link',
                    active: false,
                    path: '/smart-table'
                }
            ]
        }
    ]);
}
