import { Injectable } from '@angular/core';

export interface ShortcutConfig {
    key: string;           // e.g., 'n', 'f1', 'escape'
    alt?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;        // Command key on Mac
    action: () => void;
    description: string;   // For debugging or UI
}

@Injectable({
    providedIn: 'root'
})
export class MargShortcutService {
    private globalShortcuts: ShortcutConfig[] = [];
    private pageShortcuts: ShortcutConfig[] = [];

    constructor() { }

    /**
     * Register a shortcut that is always active in the layout.
     */
    registerGlobal(config: ShortcutConfig) {
        this.globalShortcuts.push(config);
    }

    /**
     * Register a shortcut specific to the current page.
     * These should be cleared when navigating away.
     */
    registerPage(config: ShortcutConfig) {
        this.pageShortcuts.push(config);
    }

    /**
     * Clear all page-specific shortcuts.
     * Call this on router navigation or component destruction.
     */
    clearPageShortcuts() {
        this.pageShortcuts = [];
    }

    /**
     * Main handler to be called from the Layout's HostListener.
     * Returns true if handled, false otherwise.
     */
    handleKey(event: KeyboardEvent): boolean {
        const key = event.key.toLowerCase();
        const alt = event.altKey;
        const ctrl = event.ctrlKey;
        const shift = event.shiftKey;
        const meta = event.metaKey;

        // 1. Check Page Specific Shortcuts first (Priority)
        const pageMatch = this.pageShortcuts.find(s =>
            s.key.toLowerCase() === key &&
            !!s.alt === alt &&
            !!s.ctrl === ctrl &&
            !!s.shift === shift &&
            !!s.meta === meta
        );

        if (pageMatch) {
            console.log(`[MargShortcut] Page Shortcut Triggered: ${pageMatch.description}`);
            pageMatch.action();
            event.preventDefault();
            event.stopPropagation();
            return true;
        }

        // 2. Check Global Shortcuts
        const globalMatch = this.globalShortcuts.find(s =>
            s.key.toLowerCase() === key &&
            !!s.alt === alt &&
            !!s.ctrl === ctrl &&
            !!s.shift === shift &&
            !!s.meta === meta
        );

        if (globalMatch) {
            console.log(`[MargShortcut] Global Shortcut Triggered: ${globalMatch.description}`);
            globalMatch.action();
            event.preventDefault();
            event.stopPropagation();
            return true;
        }

        return false;
    }
}
