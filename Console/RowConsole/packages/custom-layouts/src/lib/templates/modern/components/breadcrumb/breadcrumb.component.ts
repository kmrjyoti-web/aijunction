import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-modern-breadcrumb',
    standalone: true,
    imports: [CommonModule],
    template: `<nav class="stub-breadcrumb">Modern Breadcrumb Stub</nav>`,
    styles: [`:host { display: block; border: 1px dashed orange; padding: 10px; }`]
})
export class ModernBreadcrumbComponent { }
