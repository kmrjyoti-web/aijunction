import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-google-header',
    standalone: true,
    imports: [CommonModule],
    template: `<header class="stub-header">Google Header Stub</header>`,
    styles: [`:host { display: block; border: 1px dashed blue; padding: 10px; }`]
})
export class GoogleHeaderComponent { }
