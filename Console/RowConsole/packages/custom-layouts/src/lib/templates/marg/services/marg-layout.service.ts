import { Injectable, inject } from '@angular/core';
import { MargShortcutService } from './marg-shortcut.service';

export interface MenuItem {
    label: string;
    icon: string;
    active?: boolean;
    hasSub?: boolean;
    expanded?: boolean;
    subItems?: MenuItem[];
    link?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MargLayoutService {
    private shortcutService = inject(MargShortcutService);

    menuItems: MenuItem[] = [
        { label: 'Dashboard', icon: 'home', active: true },
        {
            label: 'Master', icon: 'book', hasSub: true,
            subItems: [
                { label: 'Ledger Master', icon: 'circle' },
                { label: 'Inventory Master', icon: 'circle' },
                { label: 'Account Group', icon: 'circle' }
            ]
        },
        {
            label: 'Sale', icon: 'shopping-bag', hasSub: true,
            subItems: [
                { label: 'Sale Bill', icon: 'circle' },
                { label: 'Sale Return', icon: 'circle' },
                { label: 'Challan', icon: 'circle' }
            ]
        },
        {
            label: 'Purchase', icon: 'shopping-cart', hasSub: true,
            subItems: [
                { label: 'Purchase Bill', icon: 'circle' },
                { label: 'Purchase Return', icon: 'circle' }
            ]
        },
        { label: 'Accounting Trans.', icon: 'calculator', hasSub: true, subItems: [{ label: 'Voucher Entry', icon: 'circle' }] },
        { label: 'Stock Management', icon: 'pie-chart', hasSub: true, subItems: [{ label: 'Current Stock', icon: 'circle' }] },
        { label: 'Banking', icon: 'dollar-sign', hasSub: true, subItems: [{ label: 'Bank Reconciliation', icon: 'circle' }] },
        { label: 'Report', icon: 'file-text' },
        {
            label: 'CRM', icon: 'users', hasSub: true, subItems: [
                { label: 'Customer List', icon: 'circle', link: '/customer-details' },
                { label: 'Row Contacts', icon: 'circle', link: '/row-contact' }
            ]
        },
        { label: 'Other Products', icon: 'package' },
        { label: 'Utilities & Tools', icon: 'tool' },
        { label: 'Online Store', icon: 'home' },
        {
            label: 'Development', icon: 'code', hasSub: true,
            subItems: [
                { label: 'UIKit', icon: 'circle', link: '/dev-controls' },
                { label: 'Smart Table', icon: 'circle', link: '/smart-table' },
                { label: 'Smart Drawer', icon: 'circle', link: '/smart-drawer-sample' },
                { label: 'Smart Autocomplete', icon: 'circle', link: '/smart-autocomplete-sample' }

            ]
        },
        {
            label: 'Management', icon: 'database', hasSub: true,
            subItems: [
                { label: 'DB Management', icon: 'database', link: '/management/db' },
                { label: 'API Management', icon: 'server', link: '/management/api' },
                { label: 'Cache Management', icon: 'hard-drive', link: '/management/cache' }
            ]
        }
    ];

    init() {
        this.registerGlobalShortcuts();
    }

    private registerGlobalShortcuts() {
        // Sales
        this.shortcutService.registerGlobal({ key: 'n', alt: true, action: () => alert('Global Event: Sale Bill (Alt+N)'), description: 'Sale Bill' });
        this.shortcutService.registerGlobal({ key: 'm', alt: true, action: () => alert('Global Event: Sale Bill List (Alt+M)'), description: 'Sale Bill List' });
        this.shortcutService.registerGlobal({ key: 'p', alt: true, action: () => alert('Global Event: Purchase Bill (Alt+P)'), description: 'Purchase Bill' });

        // Common Interaction
        this.shortcutService.registerGlobal({ key: 'i', alt: true, action: () => alert('Global Event: Item List (Alt+I)'), description: 'Item List' });
        this.shortcutService.registerGlobal({ key: 'l', alt: true, action: () => alert('Global Event: Ledger List (Alt+L)'), description: 'Ledger List' });

        // Navigation
        this.shortcutService.registerGlobal({ key: 'h', alt: true, action: () => alert('Global Event: Home/Dashboard (Alt+H)'), description: 'Home/Dashboard' });
        this.shortcutService.registerGlobal({ key: 'i', ctrl: true, action: () => alert('Global Event: Settings (Ctrl+I)'), description: 'Settings' });
    }

    getMenuItems() {
        return this.menuItems;
    }
}
