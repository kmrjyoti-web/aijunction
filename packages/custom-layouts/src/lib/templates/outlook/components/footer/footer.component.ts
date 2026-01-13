import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-outlook-footer',
    standalone: true,
    imports: [CommonModule],
    template: `<footer class="stub-footer">Outlook Footer Stub</footer>`,
    styles: [`:host { display: block; border: 1px dashed green; padding: 10px; }`]
})
export class OutlookFooterComponent { }
