import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-bitrix-header',
    standalone: true,
    imports: [CommonModule],
    template: `<header class="bitrix-header">Bitrix Header</header>`,
    styles: [`:host { display: block; border-bottom: 1px solid #ddd; padding: 10px; background: #f0f0f0; }`]
})
export class BitrixHeaderComponent { }
