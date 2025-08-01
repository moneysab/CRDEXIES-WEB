// angular import
import { Component, effect, inject } from '@angular/core';

// project import
import { SharedModule } from '../../shared.module';
import { ThemeService } from '../../service/customs-theme.service';

// icons
import { IconService } from '@ant-design/icons-angular';
import { RiseOutline } from '@ant-design/icons-angular/icons';

// third party
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-user-card-chart',
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './user-card-chart.component.html',
  styleUrl: './user-card-chart.component.scss'
})
export class UserCardChartComponent {
  private themeService = inject(ThemeService);
  private iconService = inject(IconService);

  // public props
  chartOptions!: ApexOptions;

  // constructor
  constructor() {
    this.chartOptions = {
      chart: { type: 'bar', height: 100, sparkline: { enabled: true } },
      colors: ['#1677ff'],
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
    this.iconService.addIcon(...[RiseOutline]);
    effect(() => {
      this.updateThemeColor(this.themeService.customsTheme());
      this.rerenderChartOnContainerResize(this.themeService.isContainerMode());
      this.isDarkTheme(this.themeService.isDarkMode());
    });
  }

  private updateThemeColor(theme: string) {
    switch (theme) {
      case 'preset-1':
      default:
        this.chartOptions.colors = ['#1677ff'];
        break;
      case 'preset-2':
        this.chartOptions.colors = ['#3366FF'];
        break;
      case 'preset-3':
        this.chartOptions.colors = ['#7265E6'];
        break;
      case 'preset-4':
        this.chartOptions.colors = ['#068e44'];
        break;
      case 'preset-5':
        this.chartOptions.colors = ['#3c64d0'];
        break;
      case 'preset-6':
        this.chartOptions.colors = ['#f27013'];
        break;
      case 'preset-7':
        this.chartOptions.colors = ['#2aa1af'];
        break;
      case 'preset-8':
        this.chartOptions.colors = ['#00a854'];
        break;
      case 'preset-9':
        this.chartOptions.colors = ['#009688'];
        break;
    }
  }

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
