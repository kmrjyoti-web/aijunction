import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Contact } from '../../../data-access/online-data.service';

@Component({
  selector: 'app-dynamic-item',
  standalone: true,
  template: `<div [innerHTML]="sanitizedHtml()"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicItemComponent {
  template = input.required<string>();
  data = input.required<Contact>();

  // FIX: Explicitly provide the type for DomSanitizer. This resolves a TypeScript
  // type inference issue where `sanitizer` was being inferred as `unknown`.
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  sanitizedHtml = computed<SafeHtml>(() => {
    let renderedHtml = this.template();
    const data = this.data();
    
    if (!renderedHtml || !data) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    // Replace placeholders like {{ organization_name }}
    renderedHtml = renderedHtml.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      const prop = key.trim();
      // Basic nested property access is not supported, just direct properties.
      const value = data[prop as keyof Contact];
      return value !== undefined && value !== null ? String(value) : '';
    });
    
    return this.sanitizer.bypassSecurityTrustHtml(renderedHtml);
  });
}
