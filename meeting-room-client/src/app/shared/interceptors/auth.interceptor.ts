import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add withCredentials to send session cookie
    request = request.clone({
      withCredentials: true
    });

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.clearSession();
          this.router.navigate(['/login']);
          this.toastr.error('Session expired. Please login again.', 'Unauthorized');
        } else if (error.status === 403) {
          this.toastr.error('You do not have permission to perform this action.', 'Access Denied');
        } else if (error.status === 409) {
          // Conflict - booking overlap
          const message = error.error?.message || 'This time slot conflicts with an existing booking.';
          this.toastr.error(message, 'Conflict');
        } else if (error.status >= 500) {
          this.toastr.error('An unexpected error occurred. Please try again.', 'Server Error');
        }
        return throwError(() => error);
      })
    );
  }
}
