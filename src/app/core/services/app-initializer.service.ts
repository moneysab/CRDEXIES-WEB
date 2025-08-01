import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { TokenService } from './token.service';
import { AuthState } from '../authentication/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  /**
   * Initialize the application, checking auth state
   * This will be used as an APP_INITIALIZER factory
   */
  initializeApp(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // First check if we have a token and if it's valid
      if (this.tokenService.getToken()) {
        console.log('Found token at startup, checking validity...');
        
        // Check if token is expired
        if (this.tokenService.isTokenExpired(this.tokenService.getToken()!)) {
          console.log('Token is expired, attempting to refresh...');
          
          // Try to refresh the token
          this.authService.refreshToken().subscribe({
            next: () => {
              console.log('Token refreshed successfully, fetching user profile');
              this.loadUserProfile(resolve);
            },
            error: (error) => {
              console.error('Token refresh failed at startup', error);
              this.authService.logout();
              resolve(false);
            }
          });
        } else {
          console.log('Token is valid, fetching user profile');
          this.loadUserProfile(resolve);
        }
      } else {
        console.log('No token found at startup');
        resolve(false);
      }
    });
  }
  
  /**
   * Load user profile and resolve the promise
   * @private
   */
  private loadUserProfile(resolve: (value: boolean) => void): void {
    this.authService.getUserProfile().subscribe({
      next: (userProfile) => {
        console.log('User profile loaded successfully at startup');
        resolve(true);
      },
      error: (error) => {
        console.error('Failed to load user profile at startup', error);
        this.authService.logout();
        resolve(false);
      }
    });
  }
}