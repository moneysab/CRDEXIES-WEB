import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  // Implementation as a method that returns a CanActivateFn
  canActivate: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
    // Check if user is NOT authenticated
    if (!this.authService.isAuthenticated) {
      return true;
    }

    // User is already authenticated, redirect to dashboard
    this.router.navigate(['/dashboard/default']);
    
    return false;
  }
}

// Function to use the guard in Angular functional style
export function noAuthGuardFn(
  router: Router,
  authService: AuthService
): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    if (!authService.isAuthenticated) {
      return true;
    }

    router.navigate(['/dashboard/default']);
    
    return false;
  };
}