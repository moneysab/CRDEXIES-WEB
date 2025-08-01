// angular import
import { Component, effect, inject } from '@angular/core';

// project import
import { SharedModule } from '../../shared.module';
import { ThemeService } from '../../service/customs-theme.service';

// third party
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-acquisition-chart',
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './acquisition-chart.component.html',
  styleUrl: './acquisition-chart.component.scss'
})
export class AcquisitionChartComponent {
  private themeService = inject(ThemeService);

  // public props
  chartOptions!: ApexOptions;

  // constructor
  constructor() {
    this.chartOptions = {
      chart: {
        type: 'bar',
        height: 250,
        stacked: true,
        toolbar: {
          show: false
        }
      },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'left',
        offsetX: 10
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        show: false
      },
      stroke: {
        colors: ['transparent'],
        width: 1
      },
      colors: ['#141414', '#1677ff', '#91caff'],
      series: [
        {
          name: 'Direct',
          data: [21, 17, 15, 13, 15, 13, 16, 13, 8, 14, 11, 9, 7, 5, 3, 3, 7]
        },
        {
          name: 'Referral',
          data: [28, 30, 20, 26, 18, 27, 22, 28, 20, 21, 15, 14, 12, 10, 8, 18, 16]
        },
        {
          name: 'Social',
          data: [50, 51, 60, 54, 53, 48, 55, 40, 44, 42, 44, 44, 42, 40, 42, 32, 16]
        }
      ],
      xaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          show: false
        }
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          show: false
        }
      },
      tooltip: {
        theme: 'light',
        x: {
          show: false
        }
      }
    };
    effect(() => {
      this.updateThemeColor(this.themeService.customsTheme());
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

  private updateThemeColor(theme: string) {
    switch (theme) {
      case 'preset-1':
      default:
        this.chartOptions.colors = ['#141414', '#1677ff', '#91caff'];
        break;
      case 'preset-2':
        this.chartOptions.colors = ['#141414', '#3366FF', '#ADC8FF'];
        break;
      case 'preset-3':
        this.chartOptions.colors = ['#141414', '#7265E6', '#B9B2F3'];
        break;
      case 'preset-4':
        this.chartOptions.colors = ['#141414', '#068e44', '#5eb57d'];
        break;
      case 'preset-5':
        this.chartOptions.colors = ['#141414', '#3c64d0', '#bed3f7'];
        break;
      case 'preset-6':
        this.chartOptions.colors = ['#141414', '#f27013', '#ffc98f'];
        break;
      case 'preset-7':
        this.chartOptions.colors = ['#141414', '#2aa1af', '#9ad6d6'];
        break;
      case 'preset-8':
        this.chartOptions.colors = ['#141414', '#00a854', '#63cf8e'];
        break;
      case 'preset-9':
        this.chartOptions.colors = ['#141414', '#009688', '#5bbda9'];
        break;
    }
  }

  // public methods
  channels = [
    {
      title: 'Top Channels',
      icon: 'ti ti-device-analytics',
      background: 'text-secondary bg-light-secondary',
      time: 'Today, 2:00 AM',
      amount: '+ $1,430',
      percentage: '35%'
    },
    {
      title: 'Top Pages',
      icon: 'ti ti-file-text',
      background: 'text-primary bg-light-primary',
      time: 'Today, 6:00 AM',
      amount: '- $1430',
      percentage: '35%'
    }
  ];
}
