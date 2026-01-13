import { Component, inject, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MargHeaderComponent } from './components/header/header.component';
import { MargSidebarComponent } from './components/sidebar/sidebar.component';
import { MargFooterComponent } from './components/footer/footer.component';
import { MargThemeCustomizerComponent } from './components/customizer/theme-customizer.component';
import { MargMenuComponent } from './components/menu/menu.component';
import { MargShortcutModalComponent } from './components/shortcuts/shortcuts.component';
import { LayoutService } from '../../utils/layout.service';
import { MargShortcutService } from './services/marg-shortcut.service';
import { PageLayoutService } from '../../utils/page-layout.service';
import { MargLayoutService } from './services/marg-layout.service';

@Component({
  selector: 'app-marg-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MargHeaderComponent, MargSidebarComponent, MargFooterComponent, MargThemeCustomizerComponent, MargMenuComponent, MargShortcutModalComponent],
  template: `
    <div class="marg-layout-wrapper" [class.horizontal-layout]="layoutService.menuPosition() === 'horizontal'">
      
      <!-- Mobile Sidebar Backdrop -->
      <div class="mobile-sidebar-backdrop" 
           *ngIf="!layoutService.isSidebarClosed() && layoutService.menuPosition() === 'vertical'"
           (click)="layoutService.toggleSidebar()">
      </div>

      <!-- Sidebar (Vertical) -->
      <app-marg-sidebar *ngIf="pageLayoutService.showMainSidebar() && layoutService.menuPosition() === 'vertical'" class="sidebar-area"></app-marg-sidebar>

      <div class="main-content-wrapper">
        <!-- Header -->
        <app-marg-header *ngIf="pageLayoutService.showMainHeader()" (openShortcuts)="showShortcuts.set(true)" class="header-area"></app-marg-header>
        
        <!-- Horizontal Menu -->
        <app-marg-menu *ngIf="layoutService.menuPosition() === 'horizontal'" class="horizontal-menu-area"></app-marg-menu>

        <!-- Main Content -->
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
        
      </div>

      <!-- Footer (Now Full Width) -->
      <app-marg-footer *ngIf="pageLayoutService.showMainFooter()" class="footer-area"></app-marg-footer>

       <!-- Theme Customizer -->
       <app-marg-theme-customizer></app-marg-theme-customizer>
       
       <!-- Shortcut Modal -->
       <app-marg-shortcuts-modal *ngIf="showShortcuts()" (close)="showShortcuts.set(false)"></app-marg-shortcuts-modal>
    </div>
  `,
  styleUrls: ['./marg-layout.component.scss']
})
export class MargLayoutComponent implements OnInit {
  layoutService = inject(LayoutService);
  shortcutService = inject(MargShortcutService);
  pageLayoutService = inject(PageLayoutService);
  margLayoutService = inject(MargLayoutService);

  showShortcuts = signal(false);

  ngOnInit() {
    this.margLayoutService.init();

    // Page specific shortcut demo
    this.shortcutService.registerPage({
      key: 'g',
      ctrl: true,
      action: () => alert('Page Specific Shortcut: Ctrl + G'),
      description: 'Demo Page Shortcut'
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Delegate to service
    this.shortcutService.handleKey(event);
  }
}
