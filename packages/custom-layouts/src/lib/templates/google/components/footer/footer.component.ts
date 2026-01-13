import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-google-footer',
    standalone: true,
    imports: [CommonModule],
    template: `<footer class="stub-footer">Google Footer Stub</footer>`,
    styles: [`:host { display: block; border: 1px dashed green; padding: 10px; }`]
})
export class GoogleFooterComponent { }
