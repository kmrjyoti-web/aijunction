import { CryptoService } from './crypto.service';

export class FieldEncryptionUtil {
    static encryptFields(data: any, fields: string[], crypto: CryptoService): any {
        if (!data || !fields || fields.length === 0) return data;
        const clone = { ...data };
        fields.forEach(f => {
            if (clone[f]) {
                clone[f] = crypto.encrypt(clone[f]);
            }
        });
        return clone;
    }

    static decryptFields(data: any, fields: string[], crypto: CryptoService): any {
        if (!data || !fields || fields.length === 0) return data;
        const clone = { ...data };
        fields.forEach(f => {
            if (clone[f]) {
                clone[f] = crypto.decrypt(clone[f]);
            }
        });
        return clone;
    }
}
