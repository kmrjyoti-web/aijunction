import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-meta-footer',
    standalone: true,
    imports: [CommonModule],
    template: `<footer class="stub-footer">Meta Footer Stub</footer>`,
    styles: [`:host { display: block; border: 1px dashed green; padding: 10px; }`]
})
export class MetaFooterComponent { }
