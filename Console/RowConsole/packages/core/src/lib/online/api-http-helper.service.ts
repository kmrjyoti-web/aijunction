import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiResponse } from './models/api.model';

@Injectable({
    providedIn: 'root'
})
export class ApiHttpHelperService {

    unwrapResponse<T>(response: any): T {
        // If response follows standardised ApiResponse<T> format
        if (response && typeof response === 'object' && 'data' in response) {
            return response.data as T;
        }
        // Fallback if direct T is returned
        return response as T;
    }

    handleError(error: HttpErrorResponse): Observable<never> {
        console.error('An error occurred:', error);
        let errorMessage = 'Unknown Error';
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = error.error.message;
        } else {
            // Server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(() => new Error(errorMessage));
    }
}
