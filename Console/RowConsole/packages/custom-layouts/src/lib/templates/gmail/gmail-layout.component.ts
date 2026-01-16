import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GmailHeaderComponent } from './components/header/header.component';
import { GmailSidebarComponent } from './components/sidebar/sidebar.component';
import { GmailFooterComponent } from './components/footer/footer.component';

@Component({
    selector: 'app-gmail-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, GmailHeaderComponent, GmailSidebarComponent, GmailFooterComponent],
    template: `
      <div class="gmail-layout-wrapper">
        <app-gmail-header></app-gmail-header>
        <div class="gmail-body-wrapper" style="display: flex; min-height: 100vh;">
            <app-gmail-sidebar></app-gmail-sidebar>
            <main class="gmail-content" style="flex: 1; padding: 20px;">
                <router-outlet></router-outlet>
            </main>
        </div>
        <app-gmail-footer></app-gmail-footer>
      </div>
    `
})
export class GmailLayoutComponent { }
