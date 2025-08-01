// src/app/core/authentication/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError,Subscription, interval } from 'rxjs';
import { map, catchError, tap, switchMap, finalize, filter, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { User,RefreshTokenDto  } from '../models/User';
import {
  AuthenticationRequestDto,
  AuthenticationResponseDto,
  EmailVerificationRequestDto,
  RegistrationRequestDto,
  RegistrationResponseDto,
  ResetPasswordRequestDto,
  UpdateProfileRequestDto,
  UserProfileDto,
  ConnexionFollowUpDto
} from '../models/auth.models';
import { TokenService } from '../services/token.service';

export enum AuthState {
  UNKNOWN = 'UNKNOWN',
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  LOADING = 'LOADING'
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // User state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Authentication state
  private authStateSubject = new BehaviorSubject<AuthState>(AuthState.UNKNOWN);
  public authState$ = this.authStateSubject.asObservable();
  
  // Loading state
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  // Token refresh
  private refreshTokenInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private refreshIntervalSub: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,

  ) {
    this.loadUserFromStorage();
  }

  // Load user from sessionStorage on service initialization
  private loadUserFromStorage(): void {
    const storedUser = sessionStorage.getItem('user');
    
    if (storedUser && this.tokenService.isTokenValid()) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.authStateSubject.next(AuthState.AUTHENTICATED);
      } catch (e) {
        console.error('Error parsing stored user data', e);
        this.logout();
      }
    } else {
      this.authStateSubject.next(AuthState.UNAUTHENTICATED);
    }
  }

  // Check if user is authenticated
  public get isAuthenticated(): boolean {
    return this.authStateSubject.value === AuthState.AUTHENTICATED &&
           !!this.currentUserSubject.value &&
           this.tokenService.isTokenValid();
  }

  // Get current user data
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  // Get current auth state
  public get authState(): AuthState {
    return this.authStateSubject.value;
  }

  /**
   * Login with username and password
   */
  login(username: string, password: string): Observable<UserProfileDto> {
    this.isLoadingSubject.next(true);
    this.authStateSubject.next(AuthState.LOADING);
    
    const authRequest: AuthenticationRequestDto = { username, password };
    
    console.log(`Attempting login for user: ${username}`);
    
    return this.http.post<AuthenticationResponseDto>(`${environment.apiUrl}/api/auth/sign-in`, authRequest)
      .pipe(
        tap(response => {
          console.log('Sign-in successful, received token:', response.accessToken?.substring(0, 10) + '...');
          // Store token using TokenService
          this.tokenService.setToken(response.accessToken);
          this.startAutoRefreshToken();
        }),
        switchMap(() => {
          console.log('Token stored, fetching user profile...');
          return this.getUserProfile(); // Get user profile after successful login
        }),
        catchError(error => {
          console.error('Login failed', error);
          
          // Clean up stored token on error
          if (error.status === 401) {
            console.log('Removing invalid token due to 401 error');
            this.tokenService.removeToken();
            this.authStateSubject.next(AuthState.UNAUTHENTICATED);
          }
          
          throw error;
        }),
        tap(() => this.isLoadingSubject.next(false))
      );
  }

  /**
   * Fetch user profile information
   */
  getUserProfile(): Observable<UserProfileDto> {
    console.log('Fetching user profile');
    
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token available when trying to fetch user profile');
      return throwError(() => new Error('No authentication token available'));
    }
    
    // Manually set the Authorization header to ensure it's included
    return this.http.get<UserProfileDto>(`${environment.apiUrl}/api/user/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .pipe(
        tap(userProfile => {
          console.log('Successfully fetched user profile:', userProfile);
          // Convert the UserProfileDto to User model as needed by the application
          const user: User = {
            username: userProfile.username,
            email: userProfile.email,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            phoneNumber: userProfile.phoneNumber,
            timezone: userProfile.timezone,
            locale: userProfile.locale,
            role: userProfile.role
          };
          
          this.setUserData(user);
          this.authStateSubject.next(AuthState.AUTHENTICATED);
        }),
        catchError(error => {
          console.error('Failed to fetch user profile', error);
          
          if (error.status === 401) {
            console.error('Authentication error (401) when fetching profile. Token might be invalid or expired.');
            // Clear invalid token
            this.tokenService.removeToken();
            this.authStateSubject.next(AuthState.UNAUTHENTICATED);
          }
          
          throw error;
        })
      );
  }

  // Set user data in storage and BehaviorSubject
  private setUserData(user: User): void {
    sessionStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Register new user
   */
  register(userData: RegistrationRequestDto): Observable<RegistrationResponseDto> {
    this.isLoadingSubject.next(true);
    
    return this.http.post<RegistrationResponseDto>(`${environment.apiUrl}/api/auth/sign-up`, userData)
      .pipe(
        tap(() => this.isLoadingSubject.next(false)),
        catchError(error => {
          this.isLoadingSubject.next(false);
          throw error;
        })
      );
  }

  /**
   * Verify email with OTP
   */
  verifyEmail(email: string, otp: string): Observable<AuthenticationResponseDto> {
    const verificationData: EmailVerificationRequestDto = { email, otp };
    return this.http.post<AuthenticationResponseDto>(
      `${environment.apiUrl}/api/auth/verify-email`,
      verificationData
    ).pipe(
      tap(response => {
        if (response.accessToken) {
          this.tokenService.setToken(response.accessToken);
          this.authStateSubject.next(AuthState.AUTHENTICATED);
        }
      })
    );
  }

  /**
   * Request password reset
   */
  requestResetPassword(email: string): Observable<boolean> {
    const params = new HttpParams().set('email', email);
    return this.http.post<boolean>(
      `${environment.apiUrl}/api/auth/request-reset-password`,
      null,
      { params }
    );
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<string> {
    const resetData: ResetPasswordRequestDto = { token, newPassword };
    return this.http.post<string>(
      `${environment.apiUrl}/api/auth/reset-password`,
      resetData,
      {responseType: 'text' as 'json'}
    );
  }

  /**
   * Request email verification resend
   */
  requestVerificationEmail(email: string): Observable<void> {
    const params = new HttpParams().set('email', email);
    return this.http.post<void>(
      `${environment.apiUrl}/api/auth/request-verification-email`,
      null,
      { params }
    );
  }

  /**
   * Update user profile
   */
  updateUserProfile(userData: UpdateProfileRequestDto): Observable<UserProfileDto> {
    return this.http.post<UserProfileDto>(`${environment.apiUrl}/api/user/update`, userData)
      .pipe(
        tap(updatedProfile => {
          // Convert to User model and update stored user data
          const userModel: User = {
            username: updatedProfile.username,
            email: updatedProfile.email,
            firstName: updatedProfile.firstName || '',
            lastName: updatedProfile.lastName || '',
            phoneNumber: updatedProfile.phoneNumber,
            timezone: updatedProfile.timezone,
            locale: updatedProfile.locale,
            role: updatedProfile.role
          };
          
          // Update the stored user data with the new values
          const currentUser = this.currentUserValue;
          if (currentUser) {
            const mergedUser = { ...currentUser, ...userModel };
            this.setUserData(mergedUser);
          }
        })
      );
  }

  /**
   * Get user connection follow-up history
   */
  getConnectionFollowUp(params: {
    userName?: string;
    date?: string;
    action?: string;
    page?: number;
    size?: number;
  } = {}): Observable<ConnexionFollowUpDto[]> {
    const httpParams = new HttpParams({ fromObject: params as any });
    
    return this.http.get<ConnexionFollowUpDto[]>(
      `${environment.apiUrl}/api/user/connexion-follow-up`,
      { params: httpParams }
    );
  }

  // Logout
  logout(): void {
    // Clear all stored data
    this.tokenService.removeToken();
    sessionStorage.removeItem('user');

    if (this.refreshIntervalSub) {
      this.refreshIntervalSub.unsubscribe();
    }
    
    // Clear the user subject and update auth state
    this.currentUserSubject.next(null);
    this.authStateSubject.next(AuthState.UNAUTHENTICATED);
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }

  /**
   * Refresh the access token
   * This method is designed to be called by the token interceptor
   */
  refreshToken(): Observable<string> {
    console.log('Attempting to refresh token');
    
    // Get the current token to include in refresh request
    const currentToken = this.tokenService.getToken();
    
    if (!currentToken) {
      console.error('No token found to refresh');
      return throwError(() => new Error('No token available for refresh'));
    }
    
    // If a refresh is already in progress, wait for it to complete
    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => of(this.tokenService.getToken() || ''))
      );
    }
    
    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);
    return this.http.post<AuthenticationResponseDto>(
      `${environment.apiUrl}/api/auth/refresh`,
      { refreshToken: currentToken } as RefreshTokenDto, 
    ).pipe(
      tap(response => {
        console.log('Token refresh successful');
        this.tokenService.setToken(response.accessToken);
        this.refreshTokenSubject.next(response.accessToken);
      }),
      map(response => response.accessToken),
      catchError(error => {
        console.error('Token refresh failed', error);
        this.logout();
        throw error;
      }),
      finalize(() => {
        this.refreshTokenInProgress = false;
      })
    );
  }

  /**
   * Check if token is about to expire and refresh if needed
   * This can be called periodically to ensure token validity
   */
  checkAndRefreshToken(): Observable<boolean> {
    if (this.tokenService.isTokenAboutToExpire()) {
      return this.refreshToken().pipe(
        map(() => true),
        catchError(() => of(false))
      );
    }
    return of(true);
  }

  /**
   * Sign out and revoke token
   */
  signOut(): Observable<void> {
    const currentToken = this.tokenService.getToken();
    if (!currentToken) {
      console.error('No token available for sign-out');
    }
    return this.http.post<void>(`${environment.apiUrl}/api/auth/sign-out`,  
      { refreshToken: currentToken } as RefreshTokenDto)
      .pipe(
        tap(() => this.logout()),
        catchError(error => {
          console.error('Sign out failed', error);
          // Still perform local logout even if server request fails
          this.logout();
          throw error;
        })
      );
  }
  startAutoRefreshToken() {
    console.log('Starting automatic token refresh every 4 minutes');
    this.refreshIntervalSub = interval(4 * 60 * 1000) 
      .pipe(
        switchMap(() => this.refreshToken()) 
      )
      .subscribe({
        next: (refreshedToken)  => console.log(' Token refreshed automatically'),
        error: err => console.error(' Error during token refresh', err)
      });
  }
}