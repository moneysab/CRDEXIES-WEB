import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { roleGuardFn } from '../../core/authentication/role.guard';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/authentication/auth.service';
import { RbacService } from '../../core/services/rbac.service';
import { TokenService } from '../../core/services/token.service';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsDashboardComponent,
    canActivate: [(route, state) => roleGuardFn(
      inject(Router),
      inject(AuthService),
      inject(TokenService)
    )(route, state)],
    data: {
      requiredRole: 'ROLE_MANAGER',
      resourceId: 'analytics',
      title: 'Executive Analytics Dashboard'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }