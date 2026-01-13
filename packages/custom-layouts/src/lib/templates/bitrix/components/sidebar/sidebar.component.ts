import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-bitrix-sidebar',
    standalone: true,
    imports: [CommonModule],
    template: `<aside class="bitrix-sidebar">Bitrix Sidebar (Slider)</aside>`,
    styles: [`:host { display: block; width: 250px; border-right: 1px solid #ddd; padding: 10px; background: #fafafa; }`]
})
export class BitrixSidebarComponent { }
