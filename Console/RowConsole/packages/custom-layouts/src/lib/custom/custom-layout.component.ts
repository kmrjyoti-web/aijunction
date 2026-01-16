import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '../utils/layout.service';

@Component({
  selector: 'app-custom-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="custom-layout-wrapper">
      <header class="stub-header">Custom Header</header>
      <div class="page-body-wrapper">
        <aside class="stub-sidebar">Custom Sidebar</aside>
        <div class="page-body">
            <nav class="stub-breadcrumb">Breadcrumb</nav>
            <router-outlet></router-outlet>
        </div>
        <footer class="stub-footer">Custom Footer</footer>
      </div>
    </div>
  `,
  styles: [`
    .stub-header { border: 1px dashed blue; padding: 10px; margin-bottom: 10px; }
    .stub-sidebar { border: 1px dashed red; padding: 10px; width: 200px; float: left; }
    .page-body { margin-left: 220px; padding: 10px; border: 1px solid #ccc; }
    .stub-footer { border: 1px dashed green; padding: 10px; clear: both; margin-top: 10px; }
  `]
})
export class CustomLayoutComponent {
  layoutService = inject(LayoutService);
  sidebarType = computed(() => this.layoutService.config().settings.sidebar_type);
}
