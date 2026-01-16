import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BitrixHeaderComponent } from './components/header/header.component';
import { BitrixSidebarComponent } from './components/sidebar/sidebar.component';
import { BitrixFooterComponent } from './components/footer/footer.component';

@Component({
    selector: 'app-bitrix-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, BitrixHeaderComponent, BitrixSidebarComponent, BitrixFooterComponent],
    template: `
      <div class="bitrix-layout-wrapper">
        <app-bitrix-header></app-bitrix-header>
        <div class="bitrix-body-wrapper" style="display: flex; min-height: 100vh;">
            <app-bitrix-sidebar></app-bitrix-sidebar>
            <main class="bitrix-content" style="flex: 1; padding: 20px;">
                <router-outlet></router-outlet>
            </main>
        </div>
        <app-bitrix-footer></app-bitrix-footer>
      </div>
    `
})
export class BitrixLayoutComponent { }
