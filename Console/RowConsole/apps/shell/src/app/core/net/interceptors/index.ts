import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';
import { loggingInterceptor } from './logging.interceptor';
import { baseUrlInterceptor } from './base-url.interceptor';

export const coreInterceptors = [
    baseUrlInterceptor, // Run first to resolve URL
    authInterceptor,
    loggingInterceptor,
    errorInterceptor
];
