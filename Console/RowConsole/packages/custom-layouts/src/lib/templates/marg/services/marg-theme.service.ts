import { Injectable, signal, effect } from '@angular/core';
import { LayoutService } from '../../../utils/layout.service'; // Adjust path if needed

export interface MargTheme {
    headerBg: string;
    sidebarBg: string;
    sidebarText: string;
    accent: string;
    iconColor: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string; // 'normal', 'bold', '400', '500', '600'
    zoom: number;
    bgImage: string;
    bgFullPage: boolean;
    bgOpacity: number; // 0 to 1
    themeMode: 'light' | 'dark' | 'system';
    menuPosition: 'vertical' | 'horizontal';
}

@Injectable({
    providedIn: 'root'
})
export class MargThemeService {

    readonly defaultTheme: MargTheme = {
        headerBg: '#1e5f74',
        sidebarBg: '#0d1e25',
        sidebarText: '#b0bec5',
        accent: '#26a69a',
        iconColor: '#90a4ae',
        fontSize: 14,
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        fontWeight: '400',
        zoom: 100,
        bgImage: '',
        bgFullPage: false,
        bgOpacity: 0.9,
        themeMode: 'dark',
        menuPosition: 'vertical'
    };

    // Signal for reactive state
    theme = signal<MargTheme>({ ...this.defaultTheme });

    availableFonts = [
        { label: 'Roboto', value: "'Roboto', sans-serif" },
        { label: 'Open Sans', value: "'Open Sans', sans-serif" },
        { label: 'Lato', value: "'Lato', sans-serif" },
        { label: 'Montserrat', value: "'Montserrat', sans-serif" },
        { label: 'Inter', value: "'Inter', sans-serif" },
        { label: 'Segoe UI', value: "'Segoe UI', sans-serif" },
        { label: 'Helvetica', value: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
    ];

    fontWeights = [
        { label: 'Light', value: '300' },
        { label: 'Normal', value: '400' },
        { label: 'Medium', value: '500' },
        { label: 'Semi Bold', value: '600' },
        { label: 'Bold', value: '700' }
    ];

    backgroundImages = [
        { label: 'None', value: '' },
        { label: 'Space', value: 'url("https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' },
        { label: 'Nebula', value: 'url("https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' },
        { label: 'Abstract', value: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' },
        { label: 'Mountain', value: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' },
        { label: 'Ocean', value: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' },
        { label: 'Forest', value: 'url("https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' },
        { label: 'City', value: 'url("https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' },
        { label: 'Technology', value: 'url("https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' },
        { label: 'Geometric', value: 'url("https://images.unsplash.com/photo-1550684847-75bdda21cc95?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' },
        { label: 'Minimal', value: 'url("https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' },
        { label: 'Dark', value: 'url("https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }
    ];

    constructor(private layoutService: LayoutService) {
        // Effect to apply theme whenever it changes
        effect(() => {
            this.applyTheme(this.theme());
        });
    }

    updateTheme(partial: Partial<MargTheme>) {
        this.theme.update(current => ({ ...current, ...partial }));
    }

    setFontFamily(font: string) {
        this.updateTheme({ fontFamily: font });
    }

    setFontSize(size: number) {
        this.updateTheme({ fontSize: size });
    }

    increaseFontSize() {
        this.theme.update(t => ({ ...t, fontSize: Math.min(t.fontSize + 1, 24) }));
    }

    decreaseFontSize() {
        this.theme.update(t => ({ ...t, fontSize: Math.max(t.fontSize - 1, 10) }));
    }

    increaseZoom() {
        this.theme.update(t => ({ ...t, zoom: Math.min(t.zoom + 5, 200) }));
    }

    decreaseZoom() {
        this.theme.update(t => ({ ...t, zoom: Math.max(t.zoom - 5, 50) }));
    }

    setBgOpacity(opacity: number) {
        this.updateTheme({ bgOpacity: opacity });
    }

    setThemeMode(mode: 'light' | 'dark') {
        let newColors = {};

        if (mode === 'light') {
            newColors = {
                headerBg: '#ffffff',
                sidebarBg: '#f5f5f5',
                sidebarText: '#333333',
                iconColor: '#555555',
                accent: '#006064',
                themeMode: 'light'
            };
        } else if (mode === 'dark') {
            newColors = {
                headerBg: '#1e5f74',
                sidebarBg: '#0d1e25',
                sidebarText: '#b0bec5',
                iconColor: '#90a4ae',
                accent: '#26a69a',
                themeMode: 'dark'
            };
        }
        this.updateTheme(newColors);
    }

    reset() {
        this.theme.set({ ...this.defaultTheme });
    }

    private applyTheme(theme: MargTheme) {
        const root = document.documentElement;

        // Helper to darken color
        const darkenColor = (hex: string, percent: number) => {
            if (!hex || !hex.startsWith('#')) return hex;
            let num = parseInt(hex.replace('#', ''), 16),
                amt = Math.round(2.55 * percent),
                R = (num >> 16) - amt,
                B = (num >> 8 & 0x00FF) - amt,
                G = (num & 0x0000FF) - amt;
            return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
        };

        // Helper to add alpha to hex
        const addAlpha = (hex: string, alpha: number) => {
            if (hex && hex.startsWith('#')) {
                const r = parseInt(hex.substring(1, 3), 16);
                const g = parseInt(hex.substring(3, 5), 16);
                const b = parseInt(hex.substring(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            return hex;
        };

        // Colors
        root.style.setProperty('--marg-header-bg', theme.headerBg);
        root.style.setProperty('--marg-sidebar-bg', theme.sidebarBg);
        root.style.setProperty('--marg-sidebar-text', theme.sidebarText);
        root.style.setProperty('--marg-accent', theme.accent);
        root.style.setProperty('--marg-icon-color', theme.iconColor);

        // Footer Color (Darker shade of header)
        const footerBg = darkenColor(theme.headerBg, 30);
        root.style.setProperty('--marg-footer-bg', footerBg);

        // Font & Zoom
        root.style.setProperty('--marg-base-font-size', theme.fontSize + 'px');
        root.style.setProperty('--marg-font-family', theme.fontFamily);
        root.style.setProperty('--marg-font-stack', theme.fontFamily);
        root.style.setProperty('--marg-font-weight', theme.fontWeight);

        // Usage of transform scale instead of zoom property to avoid layout issues
        const scale = theme.zoom / 100;
        root.style.setProperty('--marg-zoom-scale', scale.toString());
        // (document.body.style as any).zoom = theme.zoom + '%'; // Removed legacy zoom

        // Background Image & Full Page Logic
        const bgUrl = theme.bgImage ? theme.bgImage : 'none';

        if (theme.bgFullPage && theme.bgImage) {
            document.body.style.backgroundImage = bgUrl;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed'; // Initial fix for scrolling

            const content = document.querySelector('.marg-content') as HTMLElement;
            if (content) content.style.backgroundImage = 'none';

            root.style.setProperty('--marg-header-bg', addAlpha(theme.headerBg, theme.bgOpacity));
            root.style.setProperty('--marg-sidebar-bg', addAlpha(theme.sidebarBg, theme.bgOpacity));
            root.style.setProperty('--marg-footer-bg', addAlpha(footerBg, theme.bgOpacity));

        } else {
            document.body.style.backgroundImage = 'none';
            // Restore solid colors
            root.style.setProperty('--marg-header-bg', theme.headerBg);
            root.style.setProperty('--marg-sidebar-bg', theme.sidebarBg);
            root.style.setProperty('--marg-footer-bg', footerBg);

            setTimeout(() => {
                const content = document.querySelector('.marg-content') as HTMLElement;
                if (content && theme.bgImage && !theme.bgFullPage) {
                    content.style.backgroundImage = bgUrl; // Apply to content only
                    content.style.backgroundSize = 'cover';
                    content.style.backgroundPosition = 'center';
                } else if (content) {
                    content.style.backgroundImage = 'none';
                }
            });
        }

        // Menu Position
        if (this.layoutService.menuPosition() !== theme.menuPosition) {
            this.layoutService.setMenuOrientation(theme.menuPosition);
        }

        // --- Smart Drawer Theme Integration ---
        // Header matches sidebar header or a lighter shade
        root.style.setProperty('--drawer-header-bg', addAlpha(theme.headerBg, 0.05));
        root.style.setProperty('--drawer-footer-bg', '#ffffff');

        // Use theme accent for drawer highlights
        root.style.setProperty('--drawer-accent-color', theme.accent);

        // Borders
        root.style.setProperty('--drawer-header-border', 'rgba(0,0,0,0.08)');

        // Text
        root.style.setProperty('--drawer-text-color', theme.headerBg); // Use header color for strong text
    }
}
