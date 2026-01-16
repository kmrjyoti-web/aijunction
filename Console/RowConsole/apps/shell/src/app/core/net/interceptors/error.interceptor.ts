import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr'; // Assuming ngx-toastr is available

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    // const toastr = inject(ToastrService); // Inject logging/toast service

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unknown error occurred!';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = `Error: ${error.error.message}`;
            } else {
                // Server-side error
                errorMessage = `Error Code: ${error.status}\\nMessage: ${error.message}`;
            }

            console.error('[ErrorInterceptor]', errorMessage);
            // toastr.error(errorMessage);

            return throwError(() => error);
        })
    );
};
