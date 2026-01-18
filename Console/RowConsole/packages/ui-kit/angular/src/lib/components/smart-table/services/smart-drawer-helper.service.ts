import { Injectable, signal, WritableSignal } from '@angular/core';

export type DrawerView = 'create' | 'edit' | 'details' | null;

export interface DrawerState<T = any> {
    isOpen: boolean;
    view: DrawerView;
    data: T | null;
    title?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SmartDrawerHelperService<T = any> {
    // Signals for reactive state
    private state: WritableSignal<DrawerState<T>> = signal({
        isOpen: false,
        view: null,
        data: null,
        title: ''
    });

    // Read-only signals for consumers
    isOpen = signal(false); // exposed separately for easier binding if needed, or derived

    constructor() {
        // Sync isOpen signal
    }

    get currentState() {
        return this.state.asReadonly();
    }

    open(view: DrawerView, data: T | null = null, title?: string) {
        this.state.set({
            isOpen: true,
            view,
            data,
            title: title || this.getTitleForView(view)
        });
        this.isOpen.set(true);
    }

    close() {
        this.state.update(s => ({ ...s, isOpen: false }));
        this.isOpen.set(false);
        // Optional: clear data after animation delay?
    }

    private getTitleForView(view: DrawerView): string {
        switch (view) {
            case 'create': return 'Create New';
            case 'edit': return 'Edit Record';
            case 'details': return 'Details';
            default: return 'Drawer';
        }
    }
}
