import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-gmail-header',
    standalone: true,
    imports: [CommonModule],
    template: `<header class="gmail-header">Gmail Header</header>`,
    styles: [`:host { display: block; border-bottom: 1px solid #e5e5e5; padding: 10px; background: #fff; }`]
})
export class GmailHeaderComponent { }
