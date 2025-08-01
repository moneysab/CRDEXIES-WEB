// angular import
import { Component, effect, inject } from '@angular/core';

// project import
import { SharedModule } from '../../shared.module';
import { ThemeService } from '../../service/customs-theme.service';

// icons
// icons
import { IconService } from '@ant-design/icons-angular';
import { FallOutline } from '@ant-design/icons-angular/icons';

// third party
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-order-card-chart',
  imports: [NgApexchartsModule, SharedModule],
  templateUrl: './order-card-chart.component.html',
  styleUrl: './order-card-chart.component.scss'
})
export class OrderCardChartComponent {
  private themeService = inject(ThemeService);
  private iconService = inject(IconService);

  // public props
  chartOptions!: ApexOptions;

  // constructor
  constructor() {
    this.chartOptions = {
      chart: { type: 'area', height: 100, sparkline: { enabled: true } },
      colors: ['#ff4d4f'],
      plotOptions: { bar: { columnWidth: '80%' } },
      series: [
        {
          data: [1800, 1500, 1800, 1700, 1400, 1200, 1000, 800, 600, 500, 600, 800, 500, 700, 400, 600, 500, 600]
        }
      ],
      xaxis: { crosshairs: { width: 1 } },
      tooltip: {
        theme: 'light',
        fixed: { enabled: false },
        x: { show: false },
        marker: { show: true }
      }
    };
    this.iconService.addIcon(...[FallOutline]);
    effect(() => {
      this.isDarkTheme(this.themeService.isDarkMode());
      this.rerenderChartOnContainerResize(this.themeService.isContainerMode());
    });
  }

  // private methods
  private isDarkTheme(isDark: boolean) {
    const tooltip = { ...this.chartOptions.tooltip };
    tooltip.theme = isDark === true ? 'dark' : 'light';
    this.chartOptions = { ...this.chartOptions, tooltip };
  }

  private rerenderChartOnContainerResize(isContainer: boolean) {
    const chart = { ...this.chartOptions.chart };
    chart.redrawOnParentResize = !isContainer;
    this.chartOptions = { ...this.chartOptions, chart } as ApexOptions;
  }
}
