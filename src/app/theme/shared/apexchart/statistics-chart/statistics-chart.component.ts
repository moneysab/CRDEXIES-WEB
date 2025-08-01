// angular import
import { Component, OnInit, effect, input, inject } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ThemeService } from 'src/app/theme/shared/service/customs-theme.service';

// apexChart
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-statistics-chart',
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './statistics-chart.component.html',
  styleUrl: './statistics-chart.component.scss'
})
export class StatisticsChartComponent implements OnInit {
  private themeService = inject(ThemeService);

  // public props
  chartOptions!: ApexOptions;
  selectType: string = 'today';
  readonly height = input.required<number>();

  // constructor
  constructor() {
    effect(() => {
      this.updateThemeColor(this.themeService.customsTheme());
      this.isDarkTheme(this.themeService.isDarkMode());
      this.rerenderChartOnContainerResize(this.themeService.isContainerMode());
    });
  }

  // life cycle hook
  ngOnInit() {
    this.chartOptions = {
      chart: {
        type: 'area',
        height: this.height(),
        toolbar: {
          show: false
        }
      },
      colors: ['#faad14', '#1677ff'],
      dataLabels: {
        enabled: false
      },
      legend: {
        show: true,
        position: 'top'
      },
      markers: {
        size: 1,
        colors: ['#fff', '#fff', '#fff'],
        strokeColors: ['#faad14', '#1677ff'],
        strokeWidth: 1,
        shape: 'circle',
        hover: {
          size: 4
        }
      },
      stroke: {
        width: 2,
        curve: 'smooth'
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          type: 'vertical',
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0
        }
      },
      grid: {
        strokeDashArray: 4,
        borderColor: '#f5f5f5'
      },
      series: [
        {
          name: 'Revenue',
          data: [200, 320, 320, 275, 275, 400, 400, 300, 440, 320, 320, 275, 275, 400, 300, 440]
        },
        {
          name: 'Sales',
          data: [200, 250, 240, 300, 340, 320, 320, 400, 350, 250, 240, 300, 340, 320, 400, 350]
        }
      ],
      xaxis: {
        tooltip: {
          enabled: false
        },
        labels: {
          hideOverlappingLabels: true
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      }
    };
  }

  // private method
  private updateThemeColor(theme: string) {
    switch (theme) {
      case 'preset-1':
      default:
        this.chartOptions.colors = ['#faad14', '#1677ff'];
        break;
      case 'preset-2':
        this.chartOptions.colors = ['#faad14', '#3366FF'];
        break;
      case 'preset-3':
        this.chartOptions.colors = ['#faad14', '#7265E6'];
        break;
      case 'preset-4':
        this.chartOptions.colors = ['#faad14', '#068e44'];
        break;
      case 'preset-5':
        this.chartOptions.colors = ['#faad14', '#3c64d0'];
        break;
      case 'preset-6':
        this.chartOptions.colors = ['#faad14', '#f27013'];
        break;
      case 'preset-7':
        this.chartOptions.colors = ['#faad14', '#2aa1af'];
        break;
      case 'preset-8':
        this.chartOptions.colors = ['#faad14', '#00a854'];
        break;
      case 'preset-9':
        this.chartOptions.colors = ['#faad14', '#009688'];
        break;
    }
  }

  private isDarkTheme(isDark: boolean) {
    const tooltipTheme = isDark === true ? 'dark' : 'light';
    const tooltip = { theme: tooltipTheme };
    const grid = { ...this.chartOptions.grid };
    grid.borderColor = isDark === true ? '#fafafa0d' : '#f5f5f5';
    this.chartOptions = { ...this.chartOptions, tooltip, grid };
  }

  private rerenderChartOnContainerResize(isContainer: boolean) {
    const chart = { ...this.chartOptions.chart };
    chart.redrawOnParentResize = !isContainer;
    this.chartOptions = { ...this.chartOptions, chart } as ApexOptions;
  }

  // public methods
  onOptionSelected() {
    switch (this.selectType) {
      case 'today':
        this.chartOptions.series = [
          {
            name: 'Revenue',
            data: [200, 320, 320, 275, 275, 400, 400, 300, 440, 320, 320, 275, 275, 400, 300, 440]
          },
          {
            name: 'Sales',
            data: [200, 250, 240, 300, 340, 320, 320, 400, 350, 250, 240, 300, 340, 320, 400, 350]
          }
        ];
        break;
      case 'week':
        this.chartOptions.series = [
          {
            name: 'Revenue',
            data: [350, 400, 320, 340, 300, 240, 250, 350, 400, 320, 320, 340, 300, 240, 200, 440]
          },
          {
            name: 'Sales',
            data: [440, 300, 400, 275, 275, 320, 320, 440, 300, 400, 275, 275, 320, 320, 200, 300]
          }
        ];
        break;
      case 'month':
        this.chartOptions.series = [
          {
            name: 'Revenue',
            data: [200, 320, 320, 275, 275, 400, 400, 300, 440, 320, 320, 275, 275, 400, 300, 440]
          },
          {
            name: 'Sales',
            data: [200, 250, 240, 300, 340, 320, 320, 400, 350, 250, 240, 300, 340, 320, 400, 350]
          }
        ];
        break;
    }
  }
}
