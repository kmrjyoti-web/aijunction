import { Injectable, signal } from '@angular/core';
import { AppConfig, LayoutId } from './layout.types';

@Injectable({
    providedIn: 'root'
})
export class LayoutService {

    public config = signal<AppConfig>({
        settings: {
            layout_type: 'ltr',
            layout_version: 'light-only',
            sidebar_type: 'compact-wrapper',
            icon: "stroke-svg",
            layout: ''
        },
        color: {
            primary: '#7366ff',
            secondary: '#838383',
        },
    });

    private storageKey = 'aj-layout-id';

    private readStoredLayout(): LayoutId | null {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return null;
            return raw as LayoutId;
        } catch {
            return null;
        }
    }

    private writeStoredLayout(id: LayoutId) {
        try {
            localStorage.setItem(this.storageKey, id);
        } catch {
            // ignore storage failures
        }
    }

    activeLayoutId = signal<LayoutId>(this.readStoredLayout() ?? 'modern');

    constructor() {
        this.applyLayout(this.activeLayoutId());
    }

    // UI State for Template Components
    public margin = 0;
    public scrollMargin = 0;
    public closeSidebar = false;
    public isLanguage = false;
    public isSearchOpen = false;
    public fullScreen = false;

    setLayout(id: LayoutId) {
        this.activeLayoutId.set(id);
        this.writeStoredLayout(id);
        this.applyLayout(id);
    }

    // Map template layout names to config settings
    public applyLayout(layout: string) {
        const currentConfig = this.config();
        const settings = { ...currentConfig.settings };

        switch (layout) {
            case 'google':
                settings.sidebar_type = 'horizontal-wrapper';
                settings.layout = 'google';
                break;
            case 'outlook':
                settings.sidebar_type = 'compact-wrapper';
                settings.layout = 'outlook';
                break;
            case 'classic':
                settings.sidebar_type = 'compact-wrapper box-layout';
                settings.layout = 'classic';
                break;
            case 'modern':
                settings.sidebar_type = 'compact-wrapper modern-type';
                settings.layout = 'modern';
                break;
            case 'dubai':
                settings.sidebar_type = 'compact-wrapper';
                settings.layout = 'dubai';
                break;
            case 'los-angeles':
                settings.sidebar_type = 'horizontal-wrapper material-type';
                break;
            case 'paris':
                settings.sidebar_type = 'compact-wrapper dark-sidebar';
                break;
            case 'tokyo':
                settings.sidebar_type = 'compact-sidebar';
                break;
            case 'moscow':
                settings.sidebar_type = 'compact-sidebar compact-small';
                break;
            case 'singapore':
                settings.sidebar_type = 'horizontal-wrapper enterprice-type';
                break;
            case 'newyork':
                settings.sidebar_type = 'compact-wrapper box-layout';
                break;
            case 'barcelona':
                settings.sidebar_type = 'horizontal-wrapper enterprice-type advance-layout';
                break;
            case 'madrid':
                settings.sidebar_type = 'compact-wrapper color-sidebar';
                break;
            case 'rome':
                settings.sidebar_type = 'compact-sidebar compact-small material-icon';
                break;
            case 'seoul':
                settings.sidebar_type = 'compact-wrapper modern-type';
                break;
            case 'london':
                settings.sidebar_type = 'only-body';
                break;
            default:
                // Keep existing settings for 'google', 'outlook', 'classic' or unknown
                break;
        }

        this.config.set({
            ...currentConfig,
            settings: settings
        });

    }

    public setColor(primary: string, secondary: string) {
        document.documentElement.style.setProperty('--theme-default', primary);
        document.documentElement.style.setProperty('--theme-secondary', secondary);
        localStorage.setItem('--theme-default', primary);
        localStorage.setItem('--theme-secondary', secondary);

        this.config.update((config: AppConfig) => ({
            ...config,
            color: {
                primary: primary,
                secondary: secondary
            }
        }));
    }

    public setMode(mode: string) {
        this.config.update((config: AppConfig) => ({
            ...config,
            settings: {
                ...config.settings,
                layout_version: mode
            }
        }));
        document.body.className = mode;
        localStorage.setItem('layout_version', mode);
    }
}
