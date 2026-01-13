import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-bitrix-footer',
    standalone: true,
    imports: [CommonModule],
    template: `<footer class="bitrix-footer">Bitrix Footer</footer>`,
    styles: [`:host { display: block; border-top: 1px solid #ddd; padding: 10px; background: #f0f0f0; }`]
})
export class BitrixFooterComponent { }
