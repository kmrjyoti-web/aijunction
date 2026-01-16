import { Injectable, signal } from '@angular/core';
import { ThemeId, ThemeVariant } from './theme.types';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    activeThemeId = signal<ThemeId>('google-blue');
    activeVariant = signal<ThemeVariant>('light');

    setTheme(id: ThemeId) {
        this.activeThemeId.set(id);
    }

    setVariant(variant: ThemeVariant) {
        this.activeVariant.set(variant);
    }
}
