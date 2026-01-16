import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as feather from 'feather-icons';

@Component({
    selector: 'app-invoicing-header',
    standalone: true,
    imports: [CommonModule],
    template: `
    <header class="header-wrapper">
        <div class="left-section">
            <h2 class="page-title">Recurring Invoices</h2>
            <button class="add-btn">
                <i data-feather="plus"></i>
            </button>
        </div>

        <div class="center-section">
            <div class="search-bar">
                <i data-feather="search" class="search-icon"></i>
                <input type="text" placeholder="Find invoices, clients, and more">
                <span class="shortcut-hint">Ctrl+K</span>
            </div>
        </div>

        <div class="right-section">
            <div class="icon-btn">
                <i data-feather="bell"></i>
            </div>
            <button class="unlock-btn">Unlock Pro</button>
            <div class="user-avatar">
                <img src="assets/images/dashboard/1.png" alt="User" onerror="this.src='https://dummyimage.com/32x32/cccccc/000000.png&text=U'">
            </div>
        </div>
    </header>
  `,
    styleUrls: ['./header.component.scss']
})
export class InvoicingHeaderComponent implements AfterViewInit {
    ngAfterViewInit() {
        feather.replace();
    }
}
