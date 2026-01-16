import { Injectable, signal, effect, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';
export type Direction = 'ltr' | 'rtl';
export type LayoutMode = 'full' | 'box';

@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY_THEME = 'smart-table-theme';
  private readonly STORAGE_KEY_DIR = 'smart-table-dir';
  private readonly STORAGE_KEY_LAYOUT = 'smart-table-layout';
  
  theme = signal<Theme>('system');
  direction = signal<Direction>('ltr');
  layout = signal<LayoutMode>('full');

  private mediaQuery: MediaQueryList | undefined;
  private mediaQueryListener: ((e: MediaQueryListEvent) => void) | undefined;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // 1. Initialize from storage
      this.theme.set(this.getInitialState(this.STORAGE_KEY_THEME, 'system') as Theme);
      this.direction.set(this.getInitialState(this.STORAGE_KEY_DIR, 'ltr') as Direction);
      this.layout.set(this.getInitialState(this.STORAGE_KEY_LAYOUT, 'full') as LayoutMode);
      
      // 2. Apply immediately
      this.applyTheme(this.theme());
      this.applyDirection(this.direction());

      // 3. Set up effects to sync signal changes to DOM and LocalStorage
      effect(() => {
        const currentTheme = this.theme();
        localStorage.setItem(this.STORAGE_KEY_THEME, currentTheme);
        this.applyTheme(currentTheme);
      });

      effect(() => {
        const currentDir = this.direction();
        localStorage.setItem(this.STORAGE_KEY_DIR, currentDir);
        this.applyDirection(currentDir);
      });

      effect(() => {
        const currentLayout = this.layout();
        localStorage.setItem(this.STORAGE_KEY_LAYOUT, currentLayout);
      });

      // 4. Listen for system preference changes
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryListener = (e: MediaQueryListEvent) => {
        if (this.theme() === 'system') {
          this.applySystemTheme();
        }
      };
      this.mediaQuery.addEventListener('change', this.mediaQueryListener);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  setDirection(dir: Direction): void {
    this.direction.set(dir);
  }

  setLayout(mode: LayoutMode): void {
    this.layout.set(mode);
  }

  private getInitialState(key: string, fallback: string): string {
    try {
      const saved = localStorage.getItem(key);
      return saved ? saved : fallback;
    } catch (e) {
      return fallback;
    }
  }

  private applyTheme(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const html = document.documentElement;
    // Remove conflicting class first to ensure clean state
    html.classList.remove('dark');

    if (theme === 'system') {
      this.applySystemTheme();
    } else if (theme === 'dark') {
      html.classList.add('dark');
    } 
  }

  private applyDirection(dir: Direction): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.documentElement.setAttribute('dir', dir);
  }

  private applySystemTheme(): void {
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const html = document.documentElement;
    
    if (isSystemDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}