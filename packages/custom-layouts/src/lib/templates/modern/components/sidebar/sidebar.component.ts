import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-modern-sidebar',
    standalone: true,
    imports: [CommonModule],
    template: `<aside class="stub-sidebar">Modern Sidebar Stub</aside>`,
    styles: [`:host { display: block; border: 1px dashed red; padding: 10px; }`]
})
export class ModernSidebarComponent { }
