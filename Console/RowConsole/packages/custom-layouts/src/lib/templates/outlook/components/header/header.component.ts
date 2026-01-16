import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-outlook-header',
    standalone: true,
    imports: [CommonModule],
    template: `<header class="stub-header">Outlook Header Stub</header>`,
    styles: [`:host { display: block; border: 1px dashed blue; padding: 10px; }`]
})
export class OutlookHeaderComponent { }
