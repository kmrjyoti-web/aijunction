import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-bitrix-blank-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    template: `
    <div class="bitrix-blank-layout">
      <!-- Blank layout for pages like Login/Register that don't need header/sidebar -->
      <router-outlet></router-outlet>
    </div>
  `
})
export class BitrixBlankLayoutComponent { }
