import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class CryptoService {
    private key = 'default-secret-key'; // TODO: Move to strict configuration

    encrypt(data: any): string {
        if (!data) return '';
        return CryptoJS.AES.encrypt(JSON.stringify(data), this.key).toString();
    }

    decrypt(ciphertext: string): any {
        if (!ciphertext) return null;
        try {
            const bytes = CryptoJS.AES.decrypt(ciphertext, this.key);
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        } catch {
            return null;
        }
    }
}
