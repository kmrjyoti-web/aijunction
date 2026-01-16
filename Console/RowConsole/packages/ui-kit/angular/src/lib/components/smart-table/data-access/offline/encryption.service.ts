import { Injectable, inject } from '@angular/core';
import { ConfigService } from '../config.service';
import { Contact } from '../online-data.service';

import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private configService = inject(ConfigService);
  private config = this.configService.config().config;

  private isEnabled(): boolean {
    return this.config.encryptionConfig?.enabled ?? false;
  }

  private getSecretKey(): string {
    return this.config.encryptionConfig?.secretKey || 'default-secret';
  }

  private getEncryptedFields(): string[] {
    return this.config.encryptionConfig?.encryptedFields || [];
  }

  /**
   * Encrypts specified fields in a data record.
   * @param record The data record (e.g., a Contact object).
   * @returns A new record with specified fields encrypted.
   */
  encryptRecord(record: Contact): Contact {
    if (!this.isEnabled()) {
      return record;
    }

    const encryptedRecord = { ...record };
    const fieldsToEncrypt = this.getEncryptedFields();
    const secretKey = this.getSecretKey();

    for (const field of fieldsToEncrypt) {
      if (encryptedRecord[field]) {
        encryptedRecord[field] = CryptoJS.AES.encrypt(encryptedRecord[field], secretKey).toString();
      }
    }
    return encryptedRecord;
  }

  /**
   * Decrypts specified fields in a data record.
   * @param record The data record with encrypted fields.
   * @returns A new record with specified fields decrypted.
   */
  decryptRecord(record: Contact): Contact {
    if (!this.isEnabled()) {
      return record;
    }

    const decryptedRecord = { ...record };
    const fieldsToDecrypt = this.getEncryptedFields();
    const secretKey = this.getSecretKey();

    for (const field of fieldsToDecrypt) {
      if (decryptedRecord[field]) {
        try {
          const bytes = CryptoJS.AES.decrypt(decryptedRecord[field], secretKey);
          decryptedRecord[field] = bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
          console.error(`Failed to decrypt field '${field}' for record ID ${record.organization_id}. It might not be encrypted.`, e);
          // Keep the original value if decryption fails
        }
      }
    }
    return decryptedRecord;
  }
}