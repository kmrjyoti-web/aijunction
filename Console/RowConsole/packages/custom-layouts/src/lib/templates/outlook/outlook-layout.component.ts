import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { OutlookHeaderComponent } from './components/header/header.component';
import { OutlookSidebarComponent } from './components/sidebar/sidebar.component';
import { OutlookFooterComponent } from './components/footer/footer.component';
import { LayoutService } from '../../utils/layout.service';

@Component({
  selector: 'app-outlook-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, OutlookHeaderComponent, OutlookSidebarComponent, OutlookFooterComponent],
  template: `
    <div class="page-wrapper outlook-layout" [ngClass]="layoutService.sidebarType()" id="pageWrapper">
      <app-outlook-header></app-outlook-header>
      <div class="page-body-wrapper">
        <app-outlook-sidebar></app-outlook-sidebar>
        <div class="page-body">
            <router-outlet></router-outlet>
        </div>
        <app-outlook-footer></app-outlook-footer>
      </div>
    </div>
  `,
  styles: [`
    .outlook-layout .page-body { background-color: #faf9f8; }
  `]
})
export class OutlookLayoutComponent {
  layoutService = inject(LayoutService);
}
