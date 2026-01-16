import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ModernHeaderComponent } from './components/header/header.component';
import { ModernSidebarComponent } from './components/sidebar/sidebar.component';
import { ModernFooterComponent } from './components/footer/footer.component';
import { ModernBreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { LayoutService } from '../../utils/layout.service';

@Component({
  selector: 'app-modern-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ModernHeaderComponent, ModernSidebarComponent, ModernFooterComponent, ModernBreadcrumbComponent],
  template: `
    <div class="page-wrapper modern-layout" [ngClass]="layoutService.sidebarType()" id="pageWrapper">
      <app-modern-header></app-modern-header>
      <div class="page-body-wrapper">
        <app-modern-sidebar></app-modern-sidebar>
        <div class="page-body">
          <app-modern-breadcrumb></app-modern-breadcrumb>
          <div class="modern-content">
              <router-outlet></router-outlet>
          </div>
        </div>
        <app-modern-footer></app-modern-footer>
      </div>
    </div>
  `
})
export class ModernLayoutComponent {
  layoutService = inject(LayoutService);
}
