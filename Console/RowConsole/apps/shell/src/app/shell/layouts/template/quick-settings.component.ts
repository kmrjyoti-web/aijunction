import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { LayoutService } from '@ai-junction/platform/layout/layout.service';
import { LayoutId } from '@ai-junction/platform/layout/layout.types';
import { ThemeService } from '@ai-junction/platform/theming/theme.service';
import { ThemeId, ThemeVariant } from '@ai-junction/platform/theming/theme.types';

@Component({
  selector: 'app-quick-settings',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .qs-toggle {
      position: fixed;
      top: 96px;
      right: 16px;
      z-index: 1050;
    }
    .qs-panel {
      position: fixed;
      top: 140px;
      right: 16px;
      width: 240px;
      background: white;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      z-index: 1050;
      padding: 12px;
    }
    .qs-panel h4 {
      margin: 8px 0 4px;
      font-size: 14px;
      font-weight: 600;
    }
    .qs-panel .chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 10px;
      border-radius: 10px;
      border: 1px solid rgba(0,0,0,0.1);
      font-size: 12px;
      cursor: pointer;
      margin: 4px 4px 0 0;
      transition: all 0.15s ease;
      background: #fff;
    }
    .qs-panel .chip.active {
      border-color: #7366ff;
      background: rgba(115,102,255,0.1);
      color: #2f2f3b;
      font-weight: 600;
    }
  `],
  template: `
    <button class="qs-toggle bg-white shadow-md border rounded-full h-10 w-10 flex items-center justify-center hover:shadow-lg transition"
            (click)="toggleOpen()"
            aria-label="Open quick settings">
      <span class="material-symbols-outlined text-lg">settings</span>
    </button>

    @if (isOpen()) {
      <div class="qs-panel">
        <h4>Layout</h4>
        <div>
          @for (opt of layoutOptions; track opt.id) {
            <span class="chip" [class.active]="opt.id === activeLayout()" (click)="setLayout(opt.id)">
              {{ opt.label }}
            </span>
          }
        </div>

        <h4 class="mt-3">Theme</h4>
        <div>
          @for (opt of themeOptions; track opt.id) {
            <span class="chip" [class.active]="opt.id === activeTheme()" (click)="setTheme(opt.id)">
              {{ opt.label }}
            </span>
          }
        </div>

        <h4 class="mt-3">Mode</h4>
        <div>
          @for (opt of variantOptions; track opt.id) {
            <span class="chip" [class.active]="opt.id === activeVariant()" (click)="setVariant(opt.id)">
              {{ opt.label }}
            </span>
          }
        </div>
      </div>
    }
  `
})
export class QuickSettingsComponent {
  isOpen = signal(false);

  layoutOptions: { id: LayoutId; label: string }[] = [
    { id: 'google', label: 'Google' },
    { id: 'outlook', label: 'Microsoft' },
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'dubai', label: 'Dubai' },
  ];

  themeOptions: { id: ThemeId; label: string }[] = [
    { id: 'google-blue', label: 'Google Blue' },
    { id: 'outlook-navy', label: 'Outlook Navy' },
  ];

  variantOptions: { id: ThemeVariant; label: string }[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
  ];

  constructor(
    private layoutService: LayoutService,
    private themeService: ThemeService
  ) {}

  get activeLayout() {
    return this.layoutService.activeLayoutId;
  }

  get activeTheme() {
    return this.themeService.activeThemeId;
  }

  get activeVariant() {
    return this.themeService.activeVariant;
  }

  toggleOpen() {
    this.isOpen.update((v) => !v);
  }

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
