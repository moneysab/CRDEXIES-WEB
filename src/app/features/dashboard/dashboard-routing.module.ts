import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'main',
        component: MainDashboardComponent
      },
      {
        path: 'default',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }