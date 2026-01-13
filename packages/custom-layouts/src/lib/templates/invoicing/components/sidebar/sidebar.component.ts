import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as feather from 'feather-icons';
import { LayoutSwitcherComponent } from '../../../common/layout-switcher/layout-switcher.component';
import { LayoutService } from '../../../../utils/layout.service';

@Component({
    selector: 'app-invoicing-sidebar',
    standalone: true,
    imports: [CommonModule, LayoutSwitcherComponent],
    template: `
    <div class="sidebar-wrapper">
        <div class="logo-area">
            <div class="logo-icon">
                <i data-feather="monitor"></i>
            </div>
            <span class="company-name">Untitled Company</span>
            <i data-feather="chevron-down" class="dropdown-icon"></i>
        </div>

        <div class="menu-scroll">
            <div class="menu-group">
                <div class="menu-item" *ngFor="let item of menuItems" [class.active]="item.active">
                    <i [attr.data-feather]="item.icon" class="item-icon"></i>
                    <span class="item-label">{{ item.label }}</span>
                    <i data-feather="plus" class="item-action" *ngIf="item.allowAdd"></i>
                </div>
            </div>
        </div>

        <div class="bottom-actions">
           <div class="menu-item" (click)="showSwitcher = true">
              <i data-feather="settings" class="item-icon"></i>
              <span class="item-label">Settings</span>
           </div>
        </div>
    </div>
    
    <app-layout-switcher *ngIf="showSwitcher" (close)="showSwitcher = false"></app-layout-switcher>
  `,
    styleUrls: ['./sidebar.component.scss']
})
export class InvoicingSidebarComponent implements AfterViewInit {
    layoutService = inject(LayoutService);
    showSwitcher = false;

    menuItems = [
        { label: 'Dashboard', icon: 'home', active: false },
        { label: 'Clients', icon: 'users', allowAdd: true },
        { label: 'Products', icon: 'package', allowAdd: true },
        { label: 'Invoices', icon: 'file-text', allowAdd: true },
        { label: 'Recurring Invoices', icon: 'repeat', allowAdd: true, active: true },
        { label: 'Payments', icon: 'credit-card', allowAdd: true },
        { label: 'Quotes', icon: 'message-square', allowAdd: true },
        { label: 'Credits', icon: 'corner-up-left', allowAdd: true },
        { label: 'Projects', icon: 'briefcase', allowAdd: true },
        { label: 'Tasks', icon: 'check-square', allowAdd: true },
        { label: 'Vendors', icon: 'truck', allowAdd: true },
        { label: 'Purchase Orders', icon: 'shopping-cart', allowAdd: true },
        { label: 'Expenses', icon: 'dollar-sign', allowAdd: true },
        { label: 'Recurring Expenses', icon: 'refresh-cw', allowAdd: true },
        { label: 'Transactions', icon: 'activity', allowAdd: true },
        { label: 'Reports', icon: 'bar-chart-2' },
    ];

    ngAfterViewInit() {
        feather.replace();
    }
}
