import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateFn } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService, AuthState } from './auth.service';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
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
      
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
    
    // Check if token is about to expire and refresh if needed
    if (this.tokenService.isTokenAboutToExpire()) {
      console.log('Token is about to expire, refreshing before role check...');
      return this.authService.checkAndRefreshToken().pipe(
        map(refreshed => {
          if (!refreshed) {
            this.router.navigate(['/login'], {
              queryParams: { returnUrl: state.url }
            });
            return false;
          }
          
          return this.checkUserRole(route, state);
        })
      );
    }
    
    // Check if the user is authenticated and has the required role
    return this.checkUserRole(route, state);
  }
  
  // Development mode flag - set to true to bypass strict role checking
  private readonly DEV_MODE = true;

  /**
   * Check if the user has the required role
   * @private
   */
  private checkUserRole(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    // First check if the user is authenticated
    if (!this.authService.isAuthenticated) {
      console.log('User is not authenticated, redirecting to login');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Get the required role from the route data
    const requiredRole = route.data['requiredRole'];
    
    // In development mode, bypass role checking
    if (this.DEV_MODE) {
      console.log(`DEV MODE: Bypassing role check for required role: ${requiredRole}`);
      console.log(`DEV MODE: User role: ${this.authService.currentUserValue?.role}`);
      return true;
    }
    
    // Check if the user has the required role
    if (requiredRole && this.authService.currentUserValue?.role !== requiredRole) {
      console.log(`User role (${this.authService.currentUserValue?.role}) doesn't match required role (${requiredRole})`);
      // User doesn't have the required role, redirect to dashboard
      this.router.navigate(['/dashboard/default']);
      return false;
    }

    // User has the required role
    return true;
  }
}

// Function to use the guard in Angular 19 functional style
export function roleGuardFn(
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
          if (!refreshed) {
            router.navigate(['/login'], {
              queryParams: { returnUrl: state.url }
            });
            return false;
          }
          
          return checkUserRoleFunction(route, state, router, authService);
        })
      );
    }
    
    // Check user role directly
    return checkUserRoleFunction(route, state, router, authService);
  };
}

/**
 * Helper function to check user role
 */
function checkUserRoleFunction(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  router: Router,
  authService: AuthService
): boolean | UrlTree {
  // Development mode flag - set to true to bypass strict role checking
  const DEV_MODE = true;

  // First check if the user is authenticated
  if (!authService.isAuthenticated) {
    console.log('User is not authenticated, redirecting to login');
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Get the required role from the route data
  const requiredRole = route.data['requiredRole'];
  
  // In development mode, bypass role checking
  if (DEV_MODE) {
    console.log(`DEV MODE: Bypassing role check for required role: ${requiredRole}`);
    console.log(`DEV MODE: User role: ${authService.currentUserValue?.role}`);
    return true;
  }
  
  // Check if the user has the required role
  if (requiredRole && authService.currentUserValue?.role !== requiredRole) {
    console.log(`User role (${authService.currentUserValue?.role}) doesn't match required role (${requiredRole})`);
    // User doesn't have the required role, redirect to dashboard
    router.navigate(['/dashboard/default']);
    return false;
  }

  // User has the required role
  return true;
}