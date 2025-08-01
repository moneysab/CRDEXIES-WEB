import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgSelectModule } from '@ng-select/ng-select';
import { CardComponent } from '../../theme/shared/components/card/card.component';

@NgModule({
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    NgSelectModule,
    CardComponent,
    AnalyticsDashboardComponent // Import the standalone component
  ]
})
export class AnalyticsModule { }