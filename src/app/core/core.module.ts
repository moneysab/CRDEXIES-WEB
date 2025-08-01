import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpService } from './services/http.service';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { AuthService } from './authentication/auth.service';
import { AuthGuard } from './authentication/auth.guard';
import { NoAuthGuard } from './authentication/no-auth.guard';
import { TokenService } from './services/token.service';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';

import { RbacService } from './services/rbac.service';

// Token getter function for JWT module
export function tokenGetter() {
  return sessionStorage.getItem('accessToken');
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [window.location.hostname], // Allow JWT for current domain
        disallowedRoutes: [`${window.location.origin}/api/auth`] // Don't add JWT to auth endpoints
      }
    })
  ],
  providers: [
    HttpService,
    AuthService,
    TokenService,
    JwtHelperService,
    AuthGuard,
    NoAuthGuard,
    RbacService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
})
export class CoreModule { }
