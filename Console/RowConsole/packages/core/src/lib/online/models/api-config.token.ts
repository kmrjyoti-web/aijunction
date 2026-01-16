import { InjectionToken } from '@angular/core';

export interface ApiConfigurationConfig {
    API_GATEWAY?: string;
    CUSTOMER_SERVICE?: string;
    ACCOUNT_SERVICE?: string;
    SMART_TABLE?: string;
    ITEM?: string;
    CONTACT?: string;
    TRAVEL?: string;
    INVENTORY?: string;
    MASTERDATA?: string;
    [key: string]: string | undefined;
}

export const API_CONFIG = new InjectionToken<ApiConfigurationConfig>('API_CONFIG');
