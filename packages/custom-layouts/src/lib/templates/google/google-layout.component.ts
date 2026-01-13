import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GoogleHeaderComponent } from './components/header/header.component';
import { GoogleSidebarComponent } from './components/sidebar/sidebar.component';
import { GoogleFooterComponent } from './components/footer/footer.component';
import { LayoutService } from '../../utils/layout.service';

@Component({
  selector: 'app-google-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, GoogleHeaderComponent, GoogleSidebarComponent, GoogleFooterComponent],
  template: `
    <div class="page-wrapper google-layout" [ngClass]="layoutService.sidebarType()" id="pageWrapper">
      <app-google-header></app-google-header>
      <div class="page-body-wrapper">
        <app-google-sidebar></app-google-sidebar>
        <div class="page-body">
            <!-- Google layout might skip breadcrumb or handle it differently -->
            <router-outlet></router-outlet>
        </div>
        <app-google-footer></app-google-footer>
      </div>
    </div>
  `,
  styles: [`
    .google-layout .page-body { background-color: #f1f3f4; }
  `]
})
export class GoogleLayoutComponent {
  layoutService = inject(LayoutService);
}
