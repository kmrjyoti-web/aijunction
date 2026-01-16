
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme, Direction, LayoutMode } from '../../../services/theme.service';

@Component({
  selector: 'app-theme-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- A backdrop to handle closing the sidebar when clicking outside of it -->
    @if (isOpen()) {
      <div class="fixed inset-0 bg-black/20 z-40" (click)="close.emit()"></div>
    }
    <div
      class="fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 border-l border-gray-200"
      [class.translate-x-0]="isOpen()"
      [class.translate-x-full]="!isOpen()">
      
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-lg font-semibold text-gray-800">Theme Settings</h2>
        <button (click)="close.emit()" class="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <i class="pi pi-times text-sm"></i>
        </button>
      </div>

      <div class="p-4 space-y-6">
        <!-- Theme Mode -->
        <div>
          <h3 class="font-medium text-gray-700 mb-2">Color Scheme</h3>
          <div class="grid grid-cols-3 gap-2">
            @for(theme of themes; track theme.value) {
              <button
                (click)="themeService.setTheme(theme.value)"
                [class.ring-2]="themeService.theme() === theme.value"
                class="px-3 py-2 text-sm rounded-md flex items-center justify-center gap-2 ring-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                [class]="themeService.theme() === theme.value ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 hover:bg-gray-200'">
                <i [class]="theme.icon"></i>
                <span>{{ theme.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Direction -->
        <div>
          <h3 class="font-medium text-gray-700 mb-2">Direction</h3>
          <div class="grid grid-cols-2 gap-2">
            @for(dir of directions; track dir.value) {
              <button
                (click)="themeService.setDirection(dir.value)"
                [class.ring-2]="themeService.direction() === dir.value"
                class="px-3 py-2 text-sm rounded-md flex items-center justify-center gap-2 ring-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                [class]="themeService.direction() === dir.value ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 hover:bg-gray-200'">
                <i [class]="dir.icon"></i>
                <span>{{ dir.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Layout Mode -->
        <div>
          <h3 class="font-medium text-gray-700 mb-2">Layout Mode</h3>
           <div class="grid grid-cols-2 gap-2">
            @for(layout of layouts; track layout.value) {
              <button
                (click)="themeService.setLayout(layout.value)"
                [class.ring-2]="themeService.layout() === layout.value"
                class="px-3 py-2 text-sm rounded-md flex items-center justify-center gap-2 ring-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                [class]="themeService.layout() === layout.value ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 hover:bg-gray-200'">
                <i [class]="layout.icon"></i>
                <span>{{ layout.label }}</span>
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSettingsComponent {
  isOpen = input.required<boolean>();
  close = output<void>();

  themeService = inject(ThemeService);

  readonly themes: { label: string; value: Theme; icon: string }[] = [
    { label: 'Light', value: 'light', icon: 'pi pi-sun' },
    { label: 'Dark', value: 'dark', icon: 'pi pi-moon' },
    { label: 'System', value: 'system', icon: 'pi pi-desktop' },
  ];

  readonly directions: { label: string; value: Direction; icon: string }[] = [
    { label: 'LTR', value: 'ltr', icon: 'pi pi-align-left' },
    { label: 'RTL', value: 'rtl', icon: 'pi pi-align-right' },
  ];

  readonly layouts: { label: string; value: LayoutMode; icon: string }[] = [
    { label: 'Full', value: 'full', icon: 'pi pi-window-maximize' },
    { label: 'Boxed', value: 'box', icon: 'pi pi-th-large' },
  ];
}
