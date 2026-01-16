import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
    private isBrowser: boolean;
    private readonly SECRET = 'AVINYA_ERP_2025_SECRET_KEY';

    constructor(@Inject(PLATFORM_ID) platformId: object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    encrypt(value: string): string {
        return CryptoJS.AES.encrypt(value, this.SECRET).toString();
    }

    decrypt(cipher: string): string | null {
        try {
            const bytes = CryptoJS.AES.decrypt(cipher, this.SECRET);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return decrypted || null;
        } catch {
            return null;
        }
    }

    saveData(key: string, value: any): void {
        if (!this.isBrowser) return;

        const str = typeof value === 'string' ? value : JSON.stringify(value);
        const encrypted = this.encrypt(str);
        localStorage.setItem(key, encrypted);
    }

    getData<T = any>(key: string): T | null {
        if (!this.isBrowser) return null;

        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;

        const decrypted = this.decrypt(encrypted);
        if (!decrypted) return null;

        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted as any;
        }
    }

    removeData(key: string): void {
        if (this.isBrowser) localStorage.removeItem(key);
    }

    clearData(): void {
        if (this.isBrowser) localStorage.clear();
    }
}
