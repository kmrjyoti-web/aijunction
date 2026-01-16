import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
    const started = Date.now();
    console.log(`[Http] Request ${req.method} "${req.urlWithParams}"`);

    return next(req).pipe(
        tap({
            next: (event) => {
                // console.log(`[Http] Response`, event);
            },
            finalize: () => {
                const elapsed = Date.now() - started;
                console.log(`[Http] Request "${req.urlWithParams}" took ${elapsed} ms.`);
            }
        })
    );
};
