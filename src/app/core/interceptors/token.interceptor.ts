import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token for authentication endpoints
    if (this.isAuthRequest(request)) {
      return next.handle(request);
    }

    // Add token to request if available and needed
    const token = this.tokenService.getToken();
    if (token && this.needsAuthToken(request)) {
      console.log(`Adding token to request: ${request.url}`);
      request = this.addToken(request, token);
    }

    // Log the request headers for debugging
    console.log(`Request headers for ${request.url}:`,
      request.headers.has('Authorization') ?
      'Authorization: Bearer ' + request.headers.get('Authorization')?.substring(0, 10) + '...' :
      'No Authorization header');

    // Handle the request with error handling for token expiration
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            console.log(`Received 401 for ${request.url}, attempting to handle`);
            // Try to refresh token if unauthorized
            return this.handle401Error(request, next);
          } else if (error.status === 403) {
            // Forbidden - user doesn't have permission
            console.error(`Forbidden access to ${request.url}`);
            // You could redirect to an access denied page here
          }
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Adds authentication token to the request
   * @private
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    // Clone the request and add the Authorization header
    const clonedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Log the headers to verify the token is being added
    console.log(`Added token to ${request.url}, headers:`,
      clonedRequest.headers.has('Authorization') ?
      'Authorization: Bearer ' + clonedRequest.headers.get('Authorization')?.substring(0, 10) + '...' :
      'No Authorization header');
    
    return clonedRequest;
  }

  /**
   * Checks if the request is an authentication request that doesn't need a token
   * Only authentication endpoints that don't require a token should be listed here
   * @private
   */
  private isAuthRequest(request: HttpRequest<any>): boolean {
    // These are the only endpoints that should NOT have a token attached
    const noTokenEndpoints = [
      '/api/auth/sign-in',
      '/api/auth/sign-up',
      '/api/auth/request-reset-password',
      '/api/auth/reset-password',
      '/api/auth/verify-email',
      '/api/auth/request-verification-email'
    ];
    
    // Check if the URL contains any of the no-token endpoints
    return noTokenEndpoints.some(endpoint => request.url.includes(endpoint));
  }

  /**
   * Check if we need to attach the token for specific requests
   * This helps troubleshoot issues with endpoints that may require special treatment
   */
  private needsAuthToken(request: HttpRequest<any>): boolean {
    // Always return true for now, which means always attach token when available
    return true;
  }

  /**
   * Handles 401 error (unauthorized) by trying to refresh the token
   * @private
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if we have a token to refresh
    const currentToken = this.tokenService.getToken();
    if (!currentToken) {
      console.error('No access token available for refresh');
      this.authService.logout();
      this.router.navigate(['/login']);
      return throwError(() => new Error('No access token available'));
    }

    console.log('Attempting to refresh token due to 401 error');
    
    // Try to refresh the token
    return this.authService.refreshToken().pipe(
      switchMap(token => {
        console.log('Token refresh successful, retrying request with new token');
        
        // Log the new token (first few characters)
        console.log('New token received:', token.substring(0, 10) + '...');
        
        // Create a new request with the new token
        const newRequest = this.addToken(request, token);
        
        // Retry the request with the new token
        return next.handle(newRequest);
      }),
      catchError(error => {
        console.error('Token refresh failed, logging out', error);
        
        // If refresh fails, log out and redirect to login
        this.authService.logout();
        this.router.navigate(['/login']);
        
        return throwError(() => error);
      })
    );
  }
}