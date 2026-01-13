import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from 'custom-layouts';
import { GoogleLayoutComponent } from 'custom-layouts';
import { OutlookLayoutComponent } from 'custom-layouts';
import { ModernLayoutComponent } from 'custom-layouts';
import { MetaLayoutComponent } from 'custom-layouts';
import { MargLayoutComponent } from 'custom-layouts';
import { BitrixLayoutComponent } from 'custom-layouts';
import { GmailLayoutComponent } from 'custom-layouts';


@Component({
  selector: 'app-shell-host',
  standalone: true,
  imports: [CommonModule, GoogleLayoutComponent, OutlookLayoutComponent, ModernLayoutComponent, MetaLayoutComponent, MargLayoutComponent, BitrixLayoutComponent, GmailLayoutComponent],
  template: `
    @switch (layoutService.activeLayout()) {
      @case ('google') {
        <app-google-layout></app-google-layout>
      }
      @case ('outlook') {
        <app-outlook-layout></app-outlook-layout>
      }
      @case ('meta') {
        <app-meta-layout></app-meta-layout>
      }
      @case ('marg') {
        <app-marg-layout></app-marg-layout>
      }
      @case ('bitrix') {
        <app-bitrix-layout></app-bitrix-layout>
      }
      @case ('gmail') {
        <app-gmail-layout></app-gmail-layout>
      }
      @default {
        <app-modern-layout></app-modern-layout>
      }
    }
  `
})
export class ShellHostComponent {
  protected layoutService = inject(LayoutService);

  // Expose the signal for the template
  // activeLayout = this.layoutService.activeLayoutId;
}
