import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-gmail-footer',
    standalone: true,
    imports: [CommonModule],
    template: `<footer class="gmail-footer">Gmail Footer</footer>`,
    styles: [`:host { display: block; border-top: 1px solid #ddd; padding: 10px; background: #f0f0f0; }`]
})
export class GmailFooterComponent { }
