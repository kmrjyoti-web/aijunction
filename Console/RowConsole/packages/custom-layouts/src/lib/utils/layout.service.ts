import { Injectable, signal, computed } from '@angular/core';
import { LayoutConfig, DEFAULT_LAYOUT_CONFIG } from '../config/layout-config.model';

@Injectable({
    providedIn: 'root'
})
export class LayoutService {

    // State using Signals
    readonly config = signal<LayoutConfig>(DEFAULT_LAYOUT_CONFIG);

    readonly isSidebarClosed = signal<boolean>(false);
    readonly isSearchOpen = signal<boolean>(false);

    // Computed values if needed
    readonly sidebarType = computed(() => this.config().settings.sidebar_type);
    readonly layoutType = computed(() => this.config().settings.layout_type);
    readonly activeLayout = computed(() => this.config().settings.selected_layout);

    constructor() {
        // Initialize from local storage if available
        const savedConfig = localStorage.getItem('layoutConfig');
        if (savedConfig) {
            this.config.set(JSON.parse(savedConfig));
        }
    }

    updateConfig(newConfig: Partial<LayoutConfig>) {
        this.config.update(current => {
            const updated = { ...current, ...newConfig };
            localStorage.setItem('layoutConfig', JSON.stringify(updated));
            return updated;
        });
    }

    readonly availableLayouts = [
        { id: 'marg', label: 'Marg Layout' },
        { id: 'invoicing', label: 'Invoicing Layout' }
    ];

    switchLayout(layoutId: string) {
        this.config.update(c => ({
            ...c,
            settings: { ...c.settings, selected_layout: layoutId }
        }));
    }

    readonly menuPosition = signal<'vertical' | 'horizontal'>('vertical');

    toggleSidebar() {
        this.isSidebarClosed.update(v => !v);
    }

    setMenuOrientation(position: 'vertical' | 'horizontal') {
        this.menuPosition.set(position);
    }

    setSidebarType(type: string) {
        this.config.update(c => ({
            ...c,
            settings: { ...c.settings, sidebar_type: type }
        }));
    }

    setColor(primary: string, secondary: string) {
        this.config.update(c => ({
            ...c,
            color: { primary_color: primary, secondary_color: secondary }
        }));
        document.documentElement.style.setProperty('--theme-deafult', primary);
        document.documentElement.style.setProperty('--theme-secondary', secondary);
    }
}
