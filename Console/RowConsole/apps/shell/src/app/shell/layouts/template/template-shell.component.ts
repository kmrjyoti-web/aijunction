import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '@ai-junction/platform/layout/layout.service';
import { QuickSettingsComponent } from './quick-settings.component';

@Component({
    selector: 'app-template-shell',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        QuickSettingsComponent
    ],
    template: `
    <div class="page-wrapper {{ layoutService.config().settings.sidebar_type }}" id="pageWrapper">
      <header class="stub-header">Shell Header Stub</header>
      <div class="page-body-wrapper">
        <aside class="stub-sidebar">Shell Sidebar Stub</aside>
        <div class="page-body">
          <nav class="stub-breadcrumb">Shell Breadcrumb Stub</nav>
          <router-outlet></router-outlet>
        </div>
        <footer class="stub-footer">Shell Footer Stub</footer>
      </div>
        <app-quick-settings></app-quick-settings>
    </div>
  `,
    styles: [`
    .stub-header { border: 1px dashed blue; padding: 10px; margin-bottom: 10px; }
    .stub-sidebar { border: 1px dashed red; padding: 10px; width: 200px; float: left; }
    .page-body { margin-left: 220px; padding: 10px; border: 1px solid #ccc; }
    .stub-footer { border: 1px dashed green; padding: 10px; clear: both; margin-top: 10px; }
    .page-wrapper {
        &.horizontal-wrapper {
            .page-body-wrapper {
                .page-body {
                    min-height: calc(100vh - 138px);
                    margin-top: 80px; 
                }
            }
        }
        .page-body-wrapper {
            .page-body {
                min-height: calc(100vh - 80px);
                margin-top: 80px;
                padding-bottom: 20px;
            }
        }
    }
  `]
})
export class TemplateShellComponent {
    public layoutService = inject(LayoutService);

    constructor() {
        this.handleResize();
    }

    @HostListener('window:resize', [])
    onResize() {
        this.handleResize();
    }

    private handleResize() {
        if (window.innerWidth < 1200) {
            this.layoutService.closeSidebar = true;
        } else {
            this.layoutService.closeSidebar = false;
        }

        if (window.innerWidth <= 992) {
            const current = this.layoutService.config();
            if (current.settings.sidebar_type !== 'compact-wrapper') {
                this.layoutService.config.set({
                    ...current,
                    settings: { ...current.settings, sidebar_type: 'compact-wrapper' }
                });
            }
        }
    }
}
