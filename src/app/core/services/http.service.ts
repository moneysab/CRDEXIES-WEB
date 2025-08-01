// src/app/core/services/http.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  /**
   * Helper method to add authorization token to request options
   * @private
   */
  private addAuthHeader(options: any = {}): any {
    const token = this.tokenService.getToken();
    if (!token) {
      return options;
    }
    
    const headers = options.headers ? 
      { ...options.headers, 'Authorization': `Bearer ${token}` } : 
      { 'Authorization': `Bearer ${token}` };
    
    return {
      ...options,
      headers: headers
    };
  }

  /**
   * GET request
   * @param endpoint - API endpoint
   * @param params - Optional HTTP parameters
   * @param options - Optional HTTP options
   */
  get<T>(endpoint: string, params?: HttpParams | Record<string, string>, options = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    
    // Handle params
    let httpParams = new HttpParams();
    if (params) {
      if (params instanceof HttpParams) {
        httpParams = params;
      } else {
        Object.keys(params).forEach(key => {
          if (params[key] !== null && params[key] !== undefined) {
            httpParams = httpParams.set(key, params[key]);
          }
        });
      }
    }

    // Add auth header and params
    const authOptions = this.addAuthHeader(options);
    
    return this.http.get<T>(url, {
      ...authOptions,
      params: httpParams
    })
      .pipe(
        retry(2),
        catchError(error => this.handleError(error))) as Observable<T>;
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request payload
   * @param options - Optional HTTP options
   */
  post<T>(endpoint: string, data: any, options = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const authOptions = this.addAuthHeader(options);
    
    return this.http.post<T>(url, data, authOptions)
      .pipe(
        retry(2),
        catchError(error => this.handleError(error))) as Observable<T>;
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request payload
   * @param options - Optional HTTP options
   */
  put<T>(endpoint: string, data: any, options = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const authOptions = this.addAuthHeader(options);
    
    return this.http.put<T>(url, data, authOptions)
      .pipe(
        retry(2),
        catchError(error => this.handleError(error))) as Observable<T>;
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @param options - Optional HTTP options
   */
  delete<T>(endpoint: string, options = {}): Observable<T> {
    const url = this.buildUrl(endpoint);
    const authOptions = this.addAuthHeader(options);
    
    return this.http.delete<T>(url, authOptions)
      .pipe(
        retry(2),
        catchError(error => this.handleError(error))) as Observable<T>;
  }

  /**
   * Build the full URL
   * @private
   */
  private buildUrl(endpoint: string): string {
    // If the endpoint already starts with http, assume it's a full URL
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    // Remove leading slash if present
    const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${this.apiUrl}/${path}`;
  }

  /**
   * Global error handler
   * @private
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Could not connect to the server. Please check your internet connection.';
      }  else if (error.status === 403) {
        errorMessage = 'Access forbidden. You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('API Error:', error);
    
    return throwError(() => new Error(errorMessage));
  }
}