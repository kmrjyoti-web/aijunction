import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PageLayoutService {
    // Visibility Signals
    readonly showMainHeader = signal(true);
    readonly showMainSidebar = signal(true);
    readonly showMainFooter = signal(true);

    // Control Methods
    hideHeader() { this.showMainHeader.set(false); }
    showHeader() { this.showMainHeader.set(true); }

    hideSidebar() { this.showMainSidebar.set(false); }
    showSidebar() { this.showMainSidebar.set(true); }

    hideFooter() { this.showMainFooter.set(false); }
    showFooter() { this.showMainFooter.set(true); }

    // Helper: Hide All (Full Screen Mode)
    enterFullScreen() {
        this.showMainHeader.set(false);
        this.showMainSidebar.set(false);
        this.showMainFooter.set(false);
    }

    // Helper: Reset to Default
    reset() {
        this.showMainHeader.set(true);
        this.showMainSidebar.set(true);
        this.showMainFooter.set(true);
    }
}
