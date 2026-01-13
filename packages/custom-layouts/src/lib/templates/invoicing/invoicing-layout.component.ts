import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '../../../utils/layout.service';
import { InvoicingSidebarComponent } from './components/sidebar/sidebar.component';
import { InvoicingHeaderComponent } from './components/header/header.component';
import { PageLayoutService } from '../../../utils/page-layout.service';

@Component({
   selector: 'app-invoicing-layout',
   standalone: true,
   imports: [CommonModule, RouterOutlet, InvoicingSidebarComponent, InvoicingHeaderComponent],
   template: `
    <div class="invoicing-layout-wrapper">
       <app-invoicing-sidebar *ngIf="pageLayoutService.showMainSidebar()" class="sidebar-area"></app-invoicing-sidebar>
       <div class="main-area">
          <app-invoicing-header *ngIf="pageLayoutService.showMainHeader()"></app-invoicing-header>
          <main class="content-area">
             <router-outlet></router-outlet>
          </main>
       </div>
    </div>
  `,
   styleUrls: ['./invoicing-layout.component.scss']
})
export class InvoicingLayoutComponent {
   layoutService = inject(LayoutService);
   pageLayoutService = inject(PageLayoutService);
}
