import { Injectable, signal } from '@angular/core';
import { LayoutId } from './layout.types';

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    activeLayoutId = signal<LayoutId>('google');

    setLayout(id: LayoutId) {
        this.activeLayoutId.set(id);
    }
}
