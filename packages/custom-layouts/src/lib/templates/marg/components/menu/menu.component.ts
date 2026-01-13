import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as feather from 'feather-icons';

interface MenuItem {
    label: string;
    icon: string;
    active?: boolean;
    hasSub?: boolean;
    subItems?: MenuItem[];
}

@Component({
    selector: 'app-marg-menu',
    standalone: true,
    imports: [CommonModule],
    template: `
    <nav class="marg-horizontal-menu">
        <ul class="menu-list">
            <li *ngFor="let item of menuItems" 
                class="menu-item"
                [class.active]="item.active">
                
                <div class="item-content">
                    <i [attr.data-feather]="item.icon"></i>
                    <span>{{ item.label }}</span>
                    <i *ngIf="item.hasSub" data-feather="chevron-down" class="arrow"></i>
                </div>

                <!-- Submenu -->
                <ul class="submenu" *ngIf="item.hasSub">
                    <li *ngFor="let sub of item.subItems" class="submenu-item">
                        <i [attr.data-feather]="sub.icon"></i>
                        <span>{{ sub.label }}</span>
                    </li>
                </ul>
            </li>
        </ul>
    </nav>
  `,
    styles: [`
    :host {
        display: block;
        background: #0d1e25;
        background: var(--marg-sidebar-bg);
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding: 0 15px;
    }

    .marg-horizontal-menu {
        height: 40px;
        display: flex;
        align-items: center;
        
        .menu-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            gap: 5px;
            height: 100%;
            
            .menu-item {
                position: relative;
                height: 100%;
                display: flex;
                align-items: center;
                cursor: pointer;
                padding: 0 10px;
                color: #b0bec5;
                font-size: 13px;
                font-family: var(--marg-font-stack);
                transition: all 0.2s;
                border-bottom: 2px solid transparent;

                &:hover, &.active {
                    color: white;
                    background: rgba(255,255,255,0.05);
                    border-bottom-color: var(--marg-accent);
                }
                
                .item-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    
                    i { width: 14px; height: 14px; }
                    .arrow { margin-left: 2px; width: 12px; height: 12px; }
                }

                .submenu {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    min-width: 200px;
                    background: #263238;
                    background: var(--marg-sidebar-bg);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    padding: 5px 0;
                    border-radius: 0 0 4px 4px;
                    z-index: 1000;
                    list-style: none;
                }

                &:hover .submenu {
                    display: block;
                }
                
                .submenu-item {
                    padding: 8px 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #b0bec5;
                    transition: background 0.2s;
                    
                     &:hover {
                        background: rgba(255,255,255,0.1);
                        color: white;
                    }
                    
                    i { width: 14px; height: 14px; }
                }
            }
        }
    }
  `]
})
export class MargMenuComponent implements AfterViewInit {
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
        { label: 'Report', icon: 'file-text' },
        { label: 'Utilities', icon: 'tool' }
    ];

    ngAfterViewInit() {
        feather.replace();
    }
}
