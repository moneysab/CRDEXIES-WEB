import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgSelectModule } from '@ng-select/ng-select';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { CardComponent } from '../../theme/shared/components/card/card.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    NgSelectModule,
    MainDashboardComponent,
    CardComponent
  ]
})
export class DashboardModule { }