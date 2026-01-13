import { Component, AfterViewInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as feather from 'feather-icons';
import { LayoutService } from '../../../../utils/layout.service';
import { LayoutSwitcherComponent } from '../../../common/layout-switcher/layout-switcher.component';

@Component({
    selector: 'app-marg-header',
    standalone: true,
    imports: [CommonModule, LayoutSwitcherComponent],
    template: `
    <header class="marg-header">
      <div class="left-section">

        
        <div class="menu-toggle" (click)="layoutService.toggleSidebar()">
            <i data-feather="menu"></i>
        </div>

        <div class="store-info">
            <div class="store-name">
                <i data-feather="folder"></i>
                <span>Demo Departmental Store (DEDEST)</span>
            </div>
            <div class="status-info">
                <i data-feather="wifi" style="color: #aed581;"></i>
                <span>18 Days</span>
                <span style="margin-left: 5px;">V 4.0.106</span>
            </div>
        </div>
      </div>

      <div class="right-section">
        <div class="user-profile">
             <i data-feather="user"></i>
        </div>
        
        <div class="toolbar-actions">
            <!-- Mobile Toggle (3 Dots) -->
            <div class="action-item more-actions-btn" (click)="toggleMobileMenu()">
                <i data-feather="more-vertical" class="icon"></i>
            </div>

            <!-- Collapsible Items (Hidden on mobile unless open) -->
            <div class="collapsible-actions" [class.mobile-open]="isMobileMenuOpen">
                <div class="action-item">
                    <i data-feather="download" class="icon"></i>
                    <span>Pos Import</span>
                </div>
                <div class="action-item">
                    <i data-feather="mail" class="icon"></i>
                    <span>Ticket</span>
                </div>
                <div class="action-item">
                    <i data-feather="help-circle" class="icon"></i>
                    <span>Help</span>
                </div>
                <div class="action-item" (click)="showSwitcher = true">
                    <i data-feather="settings" class="icon"></i>
                    <span>Settings</span>
                </div>
                <div class="action-item" (click)="openShortcuts.emit()">
                    <i data-feather="command" class="icon"></i> <!-- Shortcut -->
                    <span>Shortcut</span>
                </div>
                <div class="action-item">
                    <i data-feather="clock" class="icon"></i>
                    <span>History</span>
                </div>
            </div>

            <!-- Always Visible Items -->
            <div class="always-visible-actions">
                <div class="action-item">
                    <i data-feather="bell" class="icon"></i>
                    <span>Notification</span>
                </div>
            </div>
        </div>
      </div>
    </header>

    <app-layout-switcher *ngIf="showSwitcher" (close)="showSwitcher = false"></app-layout-switcher>
    `,
    styleUrls: ['./header.component.scss']
})
export class MargHeaderComponent implements AfterViewInit {
    public layoutService = inject(LayoutService);
    @Output() openShortcuts = new EventEmitter<void>();

    isMobileMenuOpen = false;
    showSwitcher = false;

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    ngAfterViewInit() {
        feather.replace();
    }
}

