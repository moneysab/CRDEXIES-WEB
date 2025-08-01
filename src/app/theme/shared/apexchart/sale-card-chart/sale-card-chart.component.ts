// angular import
import { Component, effect, inject } from '@angular/core';

// project import
import { SharedModule } from '../../shared.module';
import { ThemeService } from '../../service/customs-theme.service';

// icons
import { IconService } from '@ant-design/icons-angular';
import { FallOutline } from '@ant-design/icons-angular/icons';

// third party
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-sale-card-chart',
  imports: [NgApexchartsModule, SharedModule],
  templateUrl: './sale-card-chart.component.html',
  styleUrl: './sale-card-chart.component.scss'
})
export class SaleCardChartComponent {
  private themeService = inject(ThemeService);
  private iconService = inject(IconService);

  // public props
  chartOptions!: ApexOptions;

  // constructor
  constructor() {
    this.chartOptions = {
      chart: { type: 'bar', height: 100, sparkline: { enabled: true } },
      colors: ['#faad14'],
      plotOptions: { bar: { columnWidth: '80%' } },
      series: [
        {
          data: [
            220, 230, 240, 220, 225, 215, 205, 195, 185, 150, 185, 195, 80, 205, 215, 225, 240, 225, 215, 205, 80, 215, 225, 240, 215, 210,
            190
          ]
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
