import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-gmail-sidebar',
    standalone: true,
    imports: [CommonModule],
    template: `<aside class="gmail-sidebar">Gmail Sidebar</aside>`,
    styles: [`:host { display: block; width: 256px; padding: 10px; background: #f6f8fc; }`]
})
export class GmailSidebarComponent { }
