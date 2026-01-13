import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-marg-footer',
    standalone: true,
    imports: [CommonModule],
    template: `<footer class="marg-footer">
        <span>Marg Books Footer</span>
        <span style="opacity: 0.7; font-size: 11px;">© 2024 Marg ERP Ltd.</span>
    </footer>`,
    styles: [`
        .marg-footer {
            background-color: var(--marg-footer-bg, #0d1e25);
            color: white;
            padding: 8px 15px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
    `]
})
export class MargFooterComponent { }
