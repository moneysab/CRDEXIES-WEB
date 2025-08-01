import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateFn } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService, AuthState } from './auth.service';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  // Implementation as a method that returns a CanActivateFn
  canActivate: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
    // First check if token is valid
    if (!this.tokenService.isTokenValid()) {
      console.log('Token is invalid or expired, redirecting to login');
      
      // User is not authenticated, redirect to login page with the return url
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      
      return false;
    }
    
    // Check if token is about to expire and refresh if needed
    if (this.tokenService.isTokenAboutToExpire()) {
      console.log('Token is about to expire, refreshing...');
      return this.authService.checkAndRefreshToken().pipe(
        map(refreshed => {
          if (refreshed) {
            return true;
          } else {
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: state.url }
            });
            return false;
          }
        })
      );
    }
    
    // Check if the user is authenticated
    if (this.authService.isAuthenticated) {
      return true;
    }

    // User is not authenticated, redirect to login page with the return url
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    
    return false;
  }
}

// Function to use the guard in Angular 19 functional style
export function authGuardFn(
  router: Router,
  authService: AuthService,
  tokenService: TokenService
): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    // First check if token is valid
    if (!tokenService.isTokenValid()) {
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
    
    // Check if token is about to expire and refresh if needed
    if (tokenService.isTokenAboutToExpire()) {
      return authService.checkAndRefreshToken().pipe(
        map(refreshed => {
          if (refreshed) {
            return true;
          } else {
            router.navigate(['/login'], {
              queryParams: { returnUrl: state.url }
            });
            return false;
          }
        })
      );
    }
    
    // Check if the user is authenticated
    if (authService.isAuthenticated) {
      return true;
    }

    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    
    return false;
  };
}