import { ComponentRef, Injectable, Type, WritableSignal, signal, computed } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { SmartDrawerConfig } from '../../smart-drawer/smart-drawer.config';

export class DrawerRef<R = any> {
    private readonly _afterClosed = new Subject<R | undefined>();
    componentInstance: any;

    close(result?: R): void {
        this._afterClosed.next(result);
        this._afterClosed.complete();
    }

    afterClosed(): Observable<R | undefined> {
        return this._afterClosed.asObservable();
    }
}

export interface DrawerState {
    isOpen: boolean;
    component: Type<any> | null;
    config: SmartDrawerConfig;
    inputs?: Record<string, any>;
    title?: string;
    drawerRef?: DrawerRef<any>;
}

@Injectable({
    providedIn: 'root'
})
export class SmartDrawerHelperService {
    activeDrawer = signal<DrawerState>({
        isOpen: false,
        component: null,
        config: {},
        inputs: {},
        title: '',
        drawerRef: undefined
    });

    openDrawer<T, R = any>(
        component: Type<T>,
        title: string,
        inputs: Partial<T> = {},
        config: Partial<SmartDrawerConfig> = {}
    ): DrawerRef<R> {
        const drawerRef = new DrawerRef<R>();

        // Subscribe to close to clean up signal
        drawerRef.afterClosed().subscribe(() => {
            this.close();
        });

        this.activeDrawer.set({
            isOpen: true,
            component,
            title,
            inputs: inputs as Record<string, any>,
            config: {
                width: config.width || '400px',
                mode: config.mode || 'drawer',
                hasBackdrop: config.hasBackdrop ?? true,
                ...config
            },
            drawerRef
        });

        return drawerRef;
    }

    close() {
        // If there's an active ref, ensure we close it properly
        const currentRef = this.activeDrawer().drawerRef;
        if (currentRef) {
            // We don't call currentRef.close() here to avoid infinite loop 
            // if usage was ref.close() -> service.close()
            // But if specific logic requires it, we can check `closed` state
        }

        this.activeDrawer.update(state => ({
            ...state,
            isOpen: false
        }));

        // Allow animation to finish before clearing component?
        // For now, immediate close signal
    }

    // --- Backward Compatibility Layer for RowContactListComponent ---

    // Derived signal for legacy isOpen check
    isOpen = computed(() => this.activeDrawer().isOpen);

    // Derived signal for legacy currentState check
    currentState = computed(() => {
        const state = this.activeDrawer();
        return {
            isOpen: state.isOpen,
            view: state.inputs?.['view'] || null, // Map 'view' from inputs if present
            data: state.inputs?.['data'] || null, // Map 'data' from inputs if present
            title: state.title
        };
    });

    // Legacy open method that maps to the new state structure
    open(view: string, data: any, title: string) {
        this.activeDrawer.update(s => ({
            ...s,
            isOpen: true,
            component: null, // No dynamic component, relying on projected content
            title: title,
            // Store legacy 'view' and 'data' in inputs so the computed signal can retrieve them
            inputs: { view, data },
            config: {
                ...s.config,
                width: s.config.width || '600px', // Default width
                mode: 'drawer'
            }
        }));
    }
}
