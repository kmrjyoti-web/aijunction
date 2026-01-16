import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '@ai-junction/platform/layout/layout.service';
import { ThemeService } from '@ai-junction/platform/theming/theme.service';
import { LayoutId } from '@ai-junction/platform/layout/layout.types';
import { ThemeId, ThemeVariant } from '@ai-junction/platform/theming/theme.types';

@Component({
  selector: 'app-appearance-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-page">
      <h2>Appearance Settings</h2>
      
      <section>
        <h3>Layout</h3>
        <div class="button-group">
          <button (click)="setLayout('google')" [class.active]="activeLayout() === 'google'">Google</button>
          <button (click)="setLayout('outlook')" [class.active]="activeLayout() === 'outlook'">Outlook</button>
          <button (click)="setLayout('classic')" [class.active]="activeLayout() === 'classic'">Classic</button>
        </div>
        <h4>Template Layouts</h4>
        <div class="button-group wrap">
          <button (click)="setLayout('modern')" [class.active]="activeLayout() === 'modern'">Modern</button>
          <button (click)="setLayout('dubai')" [class.active]="activeLayout() === 'dubai'">Dubai</button>
          <button (click)="setLayout('london')" [class.active]="activeLayout() === 'london'">London</button>
          <button (click)="setLayout('paris')" [class.active]="activeLayout() === 'paris'">Paris</button>
          <button (click)="setLayout('tokyo')" [class.active]="activeLayout() === 'tokyo'">Tokyo</button>
          <button (click)="setLayout('moscow')" [class.active]="activeLayout() === 'moscow'">Moscow</button>
          <button (click)="setLayout('singapore')" [class.active]="activeLayout() === 'singapore'">Singapore</button>
        </div>
      </section>

      <section>
        <h3>Theme</h3>
        <div class="button-group">
          <button (click)="setTheme('google-blue')" [class.active]="activeTheme() === 'google-blue'">Blue</button>
          <button (click)="setTheme('outlook-navy')" [class.active]="activeTheme() === 'outlook-navy'">Navy</button>
        </div>
      </section>

      <section>
        <h3>Mode</h3>
        <div class="button-group">
          <button (click)="setVariant('light')" [class.active]="activeVariant() === 'light'">Light</button>
          <button (click)="setVariant('dark')" [class.active]="activeVariant() === 'dark'">Dark</button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .settings-page { padding: 2rem; }
    .button-group { display: flex; gap: 1rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .wrap { margin-bottom: 1rem; }
    button { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ccc; background: white; }
    button.active { background: #e0e0e0; font-weight: bold; border-color: #999; }
  `]
})
export class AppearanceSettingsPage {
  private layoutService = inject(LayoutService);
  private themeService = inject(ThemeService);

  activeLayout = this.layoutService.activeLayoutId;
  activeTheme = this.themeService.activeThemeId;
  activeVariant = this.themeService.activeVariant;

  setLayout(id: LayoutId) {
    this.layoutService.setLayout(id);
  }

  setTheme(id: ThemeId) {
    this.themeService.setTheme(id);
  }

  setVariant(v: ThemeVariant) {
    this.themeService.setVariant(v);
  }
}
