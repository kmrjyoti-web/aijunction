import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MetaHeaderComponent } from './components/header/header.component';
import { MetaSidebarComponent } from './components/sidebar/sidebar.component';
import { MetaFooterComponent } from './components/footer/footer.component';
import { LayoutService } from '../../utils/layout.service';

@Component({
  selector: 'app-meta-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MetaHeaderComponent, MetaSidebarComponent, MetaFooterComponent],
  template: `
    <div class="page-wrapper meta-layout" [ngClass]="layoutService.sidebarType()" id="pageWrapper">
      <app-meta-header></app-meta-header>
      <div class="page-body-wrapper">
        <app-meta-sidebar></app-meta-sidebar>
        <div class="page-body">
            <router-outlet></router-outlet>
        </div>
        <app-meta-footer></app-meta-footer>
      </div>
    </div>
  `,
  styles: [`
    .meta-layout .page-body { background-color: #f0f2f5; }
  `]
})
export class MetaLayoutComponent {
  layoutService = inject(LayoutService);
}
