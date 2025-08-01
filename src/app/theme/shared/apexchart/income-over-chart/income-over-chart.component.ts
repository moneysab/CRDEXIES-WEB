// angular import
import { Component, OnInit, effect, inject } from '@angular/core';

// project import
import { SharedModule } from '../../shared.module';
import { ThemeService } from '../../service/customs-theme.service';

// third party
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

// icons
import { IconService } from '@ant-design/icons-angular';
import { DownloadOutline } from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-income-over-chart',
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './income-over-chart.component.html',
  styleUrl: './income-over-chart.component.scss'
})
export class IncomeOverChartComponent implements OnInit {
  private themeService = inject(ThemeService);
  private iconService = inject(IconService);

  // public props
  chartOptions!: ApexOptions;
  isDarkThemes!: boolean;

  // chart filter
  selectType: string = 'volume';
  timeOptions!: string;

  // constructor
  constructor() {
    this.iconService.addIcon(...[DownloadOutline]);
    effect(() => {
      this.updateThemeColor(this.themeService.customsTheme());
      this.isDarkTheme(this.themeService.isDarkMode());
      this.rerenderChartOnContainerResize(this.themeService.isContainerMode());
    });
  }

  // life cycle hook
  ngOnInit() {
    document.querySelector('.income-week.week')?.classList.add('active');
    document.querySelector('.income-button')?.classList.add('btn-light');
    this.selectType = 'volume';
    this.chartOptions = {
      chart: {
        height: 355,
        type: 'area',
        toolbar: {
          show: false
        },
        background: 'transparent'
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
      tooltip: {
        theme: 'light',
        y: {
          formatter(val: number) {
            return `$ ${val}`;
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#1677ff', '#0050b3'],
      series: [
        {
          name: 'volume',
          data: [100, 20, 60, 20, 20, 80, 20]
        }
      ],
      stroke: {
        curve: 'straight',
        width: 1
      },
      grid: {
        show: true,
        borderColor: '#f5f5f5',
        strokeDashArray: 0,
        position: 'back',
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: {
          style: {
            colors: [
              '#8C8C8C',
              '#8C8C8C',
              '#8C8C8C',
              '#8C8C8C',
              '#8C8C8C',
              '#8C8C8C',
              '#8C8C8C',
              '#8C8C8C',
              '#8C8C8C',
              '#8C8C8C',
              '#8C8C8C',
              '#8C8C8C'
            ]
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: ['#8C8C8C']
          }
        }
      }
    };
    this.onOptionSelected();
  }

  // private methods
  private isDarkTheme(isDark: boolean) {
    const tooltip = { ...this.chartOptions.tooltip };
    const grid = { ...this.chartOptions.grid };
    tooltip.theme = isDark === true ? 'dark' : 'light';
    grid.borderColor = isDark === true ? '#fafafa0d' : '#f5f5f5';
    this.chartOptions = { ...this.chartOptions, tooltip, grid };
    this.isDarkThemes = isDark;
  }

  private updateThemeColor(theme: string) {
    switch (theme) {
      case 'preset-1':
      default:
        this.chartOptions.colors = ['#1677ff', '#0050b3'];
        break;
      case 'preset-2':
        this.chartOptions.colors = ['#3366FF', '#1939B7'];
        break;
      case 'preset-3':
        this.chartOptions.colors = ['#7265E6', '#5F53DF'];
        break;
      case 'preset-4':
        this.chartOptions.colors = ['#068e44', '#004222'];
        break;
      case 'preset-5':
        this.chartOptions.colors = ['#3c64d0', '#192f85'];
        break;
      case 'preset-6':
        this.chartOptions.colors = ['#f27013', '#a63a00'];
        break;
      case 'preset-7':
        this.chartOptions.colors = ['#2aa1af', '#0e5563'];
        break;
      case 'preset-8':
        this.chartOptions.colors = ['#00a854', '#005c34'];
        break;
      case 'preset-9':
        this.chartOptions.colors = ['#009688', '#004a47'];
        break;
    }
  }

  private rerenderChartOnContainerResize(isContainer: boolean) {
    const chart = { ...this.chartOptions.chart };
    chart.redrawOnParentResize = !isContainer;
    this.chartOptions = { ...this.chartOptions, chart } as ApexOptions;
  }

  // public method
  onOptionSelected() {
    switch (this.selectType) {
      case 'volume':
        this.chartOptions.series = [
          {
            name: 'Income',
            data: this.timeOptions === 'month' ? [100, 40, 60, 40, 40, 40, 80, 40, 40, 50, 40, 40] : [100, 20, 60, 20, 20, 80, 20]
          }
        ];
        break;
      case 'margin':
        this.chartOptions.series = [
          {
            name: 'Income',
            data: this.timeOptions === 'month' ? [120, 85, 101, 98, 87, 105, 91, 114, 94, 86, 115, 35] : [51, 40, 28, 51, 42, 109, 100]
          }
        ];
        break;
      case 'sales':
        this.chartOptions.series = [
          {
            name: 'Income',
            data: this.timeOptions === 'month' ? [90, 85, 101, 98, 87, 105, 91, 114, 94, 86, 115, 35] : [21, 40, 28, 51, 42, 109, 100]
          }
        ];
        break;
    }
  }

  toggleActive(value: string) {
    this.timeOptions = value;
    const xaxis = { ...this.chartOptions.xaxis };
    xaxis.categories =
      value === 'month'
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    xaxis.tickAmount = value === 'month' ? 11 : 7;
    this.chartOptions = { ...this.chartOptions, xaxis };
    if (value === 'month') {
      document.querySelector('.income-month.month')?.classList.add('active');
      document.querySelector('.income-week.week')?.classList.remove('active');
    } else {
      document.querySelector('.income-week.week')?.classList.add('active');
      document.querySelector('.income-month.month')?.classList.remove('active');
    }
    this.onOptionSelected();
  }
}
