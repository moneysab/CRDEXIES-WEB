import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';

import { AuthenticationService } from '../../service/authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardChild implements CanActivateChild {
  private router = inject(Router);
  private authenticationService = inject(AuthenticationService);

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser && this.authenticationService.isLoggedIn()) {
      const { roles } = route.data;
      if (roles && !roles.includes(currentUser.user.role)) {
        // User not authorized, redirect to unauthorized page
        this.router.navigate(['/unauthorized']);
        return false;
      }
      // User is logged in and authorized for child routes
      return true;
    }

    // User not logged in, redirect to login page
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
