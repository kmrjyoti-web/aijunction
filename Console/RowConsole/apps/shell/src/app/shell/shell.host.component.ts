import { Component, inject, computed } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { LayoutService, GoogleLayoutComponent, OutlookLayoutComponent, ModernLayoutComponent, MetaLayoutComponent, MargLayoutComponent, BitrixLayoutComponent, GmailLayoutComponent } from 'custom-layouts';


@Component({
  selector: 'app-shell-host',
  standalone: true,
  imports: [
    CommonModule,
    NgComponentOutlet
  ],
  template: `
    <ng-container *ngComponentOutlet="activeComponent()"></ng-container>
  `
})
export class ShellHostComponent {
  protected layoutService = inject(LayoutService);

  private layoutMap: Record<string, any> = {
    google: GoogleLayoutComponent,
    outlook: OutlookLayoutComponent,
    meta: MetaLayoutComponent,
    marg: MargLayoutComponent,
    bitrix: BitrixLayoutComponent,
    gmail: GmailLayoutComponent,
    modern: ModernLayoutComponent
  };

  activeComponent = computed(() => {
    const key = this.layoutService.activeLayout?.() ?? 'modern';
    return this.layoutMap[key] ?? ModernLayoutComponent;
  });
}
