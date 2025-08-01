import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgClass, DatePipe } from '@angular/common';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { UserService } from '../../../core/services/user.service';
import { EpinService } from '../../../core/services/epin.service';
import { VisaSettlementStatsRecord, VisaSettlementQueryParams, VisaStatLine,Vss120AvailableFilters } from '../../../core/models/epin.models';
import { ConnexionFollowUpQueryParams, SummaryStatsDto, CsvFileParams } from '../../../core/models/invoice.models';
import { ConnexionFollowUpDto, UserProfileDto } from '../../../core/models/auth.models';
import { CsvUploadService } from '../../../core/services/csv-upload.service';
import { Subject, of, Observable ,forkJoin} from 'rxjs';
import { Role } from 'src/app/theme/shared/components/_helpers/role';
import { TokenService } from 'src/app/core/services/token.service';
import { takeUntil, finalize, map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend,
  ApexFill,
  ApexTooltip,
  ChartComponent,
  NgApexchartsModule
} from 'ng-apexcharts';
import { NgSelectModule } from '@ng-select/ng-select';
import { CardComponent } from '../../../theme/shared/components/card/card.component';
import { BillingService } from '../../../core/services/billing.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

export type ChartOptions = {
  series: ApexAxisChartSeries | number[];
  chart: ApexChart;
  xaxis?: ApexXAxis;
  stroke?: ApexStroke;
  dataLabels?: ApexDataLabels;
  markers?: ApexMarkers;
  colors?: string[];
  yaxis?: ApexYAxis;
  grid?: ApexGrid;
  legend?: ApexLegend;
  title?: ApexTitleSubtitle;
  fill?: ApexFill;
  tooltip?: ApexTooltip;
  labels?: string[];
  plotOptions?: any;
  responsive?: any;
  states?: any;
};

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  dataLabels: {
    enabled: boolean;

  }
  plotOptions: {
    bar: {
      columnWidth: string;
      distributed: boolean;
    };
  }
  colors: string[];
  legend: {
    position: string;
  };
};

@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass,
    NgSelectModule,
    NgApexchartsModule,
    CardComponent,
    SharedModule,
  ],
  providers: [DatePipe]
})
export class MainDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("activityChart") activityChart: ChartComponent;
  private translate = inject(TranslateService);
  // Chart options
  public visaSummaryOptions: Partial<ChartOptions>;
  public mastercardSummaryOptions: Partial<ChartOptions>;
  public networkDistributionOptions: Partial<ChartOptions>;
  public barChart: Partial<BarChartOptions> = {};
  public totalPieChart: Partial<ChartOptions>;

  mantisConfig = MantisConfig;

  //User 
  allowedRolesVisa = [ Role.ManagerVisa,Role.AdminVisa];
  allowedRolesMastercard = [ Role.ManagerMastercard, Role.AdminMastercard];
  managers= [Role.ManagerVisa, Role.ManagerMastercard];
  canAccessVisa = false;
  canAccessMastercard = false;
  isManager: boolean = false;


  // Data
  uploadVisa: string | null = null;
  uploadMastercard: string | null = null;
  showVisaAlert = false;
  showMasterAlert = false;

  visaStats: SummaryStatsDto | null = null;
  mastercardStats: SummaryStatsDto | null = null;
  visaInvoiceCount: number = 0;
  mastercardInvoiceCount: number = 0;
  acquiring: number = 0;
  issuing: number = 0;
  both: number = 0;
  visaAcquiring: number = 0;
  visaIssuing: number = 0;
  visaBoth: number = 0;
  totalAmount: number = 0;
  recentActivity: any[] = [];
  kpiMetrics: any = {
    avgProcessingTime: 2.4,
    errorRate: 0.5,
    pendingInvoices: 12,
    completionRate: 98.2
  };
  monthlyTrends: any[] = [];
  kpis: VisaSettlementStatsRecord | null = null;
  kpiByCurrency: { [currencyCode: string]: VisaSettlementStatsRecord } = {};
  availableFilters: Vss120AvailableFilters | null = null;
  selectedCurrencyCode: string | null = null;
  selectedCurrencyLabel: string | null = null;

  // UI state
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  //Connexion History
  currentPage = 0;
  pageSize = 5;
  pageSizeCsv = 1;
  connexionHistory: ConnexionFollowUpDto[] = [];
  loadingConnexion = false;
  connexionError = '';

  // For cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private csvUploadService: CsvUploadService,
    private billingService: BillingService,
    private analyticsService: AnalyticsService,
    private router: Router,
    private datePipe: DatePipe,
    private userService: UserService,
    private epinService: EpinService,
    private tokenService: TokenService
  ) {

  }

  ngOnInit(): void {
    const userRoles = this.tokenService.decodeToken()?.roles || [];
    this.canAccessVisa = userRoles.some(role => this.allowedRolesVisa.includes(role as Role));
    this.canAccessMastercard = userRoles.some(role => this.allowedRolesMastercard.includes(role as Role));
    this.isManager = userRoles.some(role => this.managers.includes(role as Role));
    this.loadStatsData();
    this.loadAvailableFiltersAndKpis();
    this.initCharts();


    this.translate.use(this.mantisConfig.i18n);
    console.log('Current language:', this.translate.currentLang);
    forkJoin({
      visa: this.loadLatestCsvFile('visa'),
      mastercard: this.loadLatestCsvFile('mastercard')
    }).subscribe(({ visa, mastercard }) => {
      this.uploadVisa = visa;
      this.uploadMastercard = mastercard;
      console.log('Date VISA :', visa);
      console.log('Date MASTERCARD :', mastercard);
      this.checkInvoiceAlerts(); 
    });
  }

  ngAfterViewInit(): void {
    // Additional initialization if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAvailableFiltersAndKpis(): void {
    this.isLoading = true;
    this.epinService.getVisaAvailableFilters().subscribe({
      next: (filters) => {
        this.availableFilters = filters;
  
        const currencyList = this.availableFilters?.settlementCurrencyCodes || [];
        if (currencyList.length === 0) {
          this.isLoading = false;
          return;
        }
  
        const today = new Date();
        const currentYearStart = new Date(today.getFullYear(), 0, 1);
        const startDate = currentYearStart.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
  
        const requests = currencyList.map(currency =>
          this.epinService.getKpis({
            startDate,
            endDate,
            currencyCode: currency.code,
          }).pipe(map(response => ({ code: currency.code, label: currency.label, response })))
        );
  
        forkJoin(requests).subscribe({
          next: (results) => {
            results.forEach(({ code, label, response }) => {
              this.kpiByCurrency[code] = response;
            });
            const defaultCurrency = results[0];
            this.selectedCurrencyCode = defaultCurrency.code;
            this.selectedCurrencyLabel = defaultCurrency.label;
            this.kpis = defaultCurrency.response;
  
            this.initBarChart(); 
  
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading KPI per currency:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading filters:', error);
        this.isLoading = false;
      }
    });
  }

  selectCurrency(code: string, event?: Event): void {
    if (event) {
      event.preventDefault(); 
    }
  
    const label = this.availableFilters?.settlementCurrencyCodes.find(c => c.code === code)?.label;
  
    if (!this.kpiByCurrency[code]) return;
  
    this.selectedCurrencyCode = code;
    this.selectedCurrencyLabel = label || code;
    this.kpis = this.kpiByCurrency[code];
  
    this.initBarChart();
  }


  loadKpiData(): void {
    this.isLoading = true;


    const today = new Date();
    const currentYearStart = new Date(today.getFullYear(), 0, 1);

    const params: VisaSettlementQueryParams = {
      startDate: currentYearStart.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],

    };
    console.log('Loading KPIs with params:', params);

    this.epinService.getKpis(params).subscribe({
      next: (response) => {
        console.log('Homepage KPIs:', response);
        this.kpis = response;
        this.isLoading = false;
        this.initBarChart();

      },
      error: (error) => {
        console.error('Error loading homepage KPIs:', error);

        this.isLoading = false;
      }
    });
  }

  loadStatsData(): void {
    this.isLoading = true;
    this.hasError = false;
 
    // Load Visa invoices count
    if (this.canAccessVisa) {
    this.billingService.getVisaStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respone) => {
          this.visaStats = respone;
          this.visaInvoiceCount = this.visaStats.total || 0;
          console.log('Visa stats:', this.visaStats);
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }
    // Load Mastercard invoices count
    if (this.canAccessMastercard) {
    this.billingService.getMasterCardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respone) => {
          this.mastercardStats = respone;
          this.mastercardInvoiceCount = this.mastercardStats.total || 0;
          console.log('mastercard stats:', this.mastercardStats);
        },
        error: (error) => {
          this.handleError(error);
        }

      });
    }
    this.isLoading = false;

    // Generate sample data for demonstration
    this.generateSampleData();
  }



  loadLatestCsvFile(network: string): Observable<string | null> {
    const params: CsvFileParams = {
      page: this.currentPage,
      size: this.pageSizeCsv,
      network: network,
    };

    return this.csvUploadService.getCsvFiles(params).pipe(
      map((data: any) => {
        const content = data?.content ?? [];
        const latestFile = content.length > 0 ? content[0] : null;
        return latestFile?.uploadDate ?? null;
      }),
      catchError((error) => {
        console.error('Erreur lors du chargement du fichier CSV:', error);
        return of(null);
      })
    );
  }

  calculateTotalAmount(invoices: any[], type: string): void {
    if (invoices && invoices.length > 0) {
      const sum = invoices.reduce((total, invoice) => {
        return total + (invoice.totalAmount || 0);
      }, 0);
      this.totalAmount += sum;
    }
  }

  handleError(error: any): void {
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = error.message || 'Failed to load summary data';
    console.error('Error loading sumary data:', error);
  }

  generateSampleData(): void {
    // Generate sample recent activity
    this.recentActivity = [
      { id: 'INV-2023-001', type: 'VISA', date: new Date(2025, 3, 2), amount: 12450.75, status: 'Processed' },
      { id: 'INV-2023-002', type: 'MASTERCARD', date: new Date(2025, 3, 1), amount: 8320.50, status: 'Pending' },
      { id: 'INV-2023-003', type: 'VISA', date: new Date(2025, 2, 28), amount: 5670.25, status: 'Processed' },
      { id: 'INV-2023-004', type: 'MASTERCARD', date: new Date(2025, 2, 27), amount: 9840.00, status: 'Processed' },
      { id: 'INV-2023-005', type: 'VISA', date: new Date(2025, 2, 26), amount: 3210.80, status: 'Error' }
    ];


    // Update charts with the sample data
    this.updateCharts();
  }

  initCharts(): void {
    this.visaSummaryOptions = {
      series: [this.visaAcquiring, this.visaIssuing, this.visaBoth],
      chart: {
        type: 'pie',
        height: 300
      },
      labels: ['Acquiring', 'Issuing', 'both'],
      colors: ['#4680ff', '#ffba57', '#0e9e4a'],
      legend: {
        position: 'bottom'
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return (typeof val === 'number' ? val.toFixed(1) : val) + "%";
        }
      },
      tooltip: {
        y: {
          formatter: (val) => {
            return this.formatNumber(val) + " $";
          }
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true
              },
              value: {
                show: true,
                formatter: (val) => {
                  return this.formatNumber(val) + " $";
                }
              },

            }
          }
        }
      }
    };

    this.mastercardSummaryOptions = {
      series: [this.acquiring, this.issuing, this.both],
      chart: {
        type: 'pie',
        height: 300
      },
      labels: ['Acquiring', 'Issuing', 'both'],
      colors: ['#4680ff', '#ffba57', '#0e9e4a'],
      legend: {
        position: 'bottom'
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return (typeof val === 'number' ? val.toFixed(1) : val) + "%";
        }
      },
      tooltip: {
        y: {
          formatter: (val) => {
            return this.formatNumber(val) + " $";
          }
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true
              },
              value: {
                show: true,
                formatter: (val) => {
                  return this.formatNumber(val) + " $";
                }
              },

            }
          }
        }
      }
    };
    // Initialize network distribution chart
    this.networkDistributionOptions = {
      series: [this.visaInvoiceCount, this.mastercardInvoiceCount],
      chart: {
        type: 'donut',
        height: 300
      },
      labels: ['Visa', 'Mastercard'],
      colors: ['#2563eb', '#F79E1B'],
      legend: {
        position: 'bottom'
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return (typeof val === 'number' ? val.toFixed(1) : val) + "%";
        }
      },
      tooltip: {
        y: {
          formatter: (val) => {
            return this.formatNumber(val) + " $";
          }
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true
              },
              value: {
                show: true,
                formatter: (val) => {
                  return this.formatNumber(val) + " $";
                }
              },
              total: {
                show: true,
                label: 'Total',
                formatter: (w) => {
                  const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                  const totalNumber = Number(total);
                  return this.formatNumber(totalNumber) + " $";
                }
              }
            }
          }
        }
      }
    };

  }

  initBarChart(): void {
    const credit = Math.abs(this.kpis.total.total?.creditAmount ?? 0);
    const debit = Math.abs(this.kpis.total.total?.debitAmount ?? 0);
    const totalValue = Math.abs(this.kpis.total.total?.totalAmount ?? 0);
    const totalSign = (this.kpis.total.total?.totalAmountSign ?? '').toUpperCase();
    const total = totalSign === 'CR' ? totalValue : -totalValue;
    

    const values = [credit, -debit, total]; 
    const yMin = Math.min(...values);
    const yMax = Math.max(...values);

    this.barChart = {
      series: [
        {
          name: 'Credit',
          data: [credit],
        },
        {
          name: 'Debit',
          data: [-debit],
        },
        {
          name: 'Total',
          data: [total],
        },
      ],
      chart: {
        type: 'bar',
        height: 300,
        stacked: false,
      },
      xaxis: {
        categories: [`Total - ${new Date().getFullYear()}`],
      },
      yaxis: {
      
        tickAmount: 7,
        labels: {
          formatter: (val: number) => {
            if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(1) + 'B';
            if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(2) + 'M';
            if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(1) + 'K';
            return val.toFixed(2);
          },
        },
        title: {
          text: `Amount - ${new Date().getFullYear()}`,
        },

      },
      tooltip: {
        y: {
          formatter: (val: number) => {
            const sign = val >= 0 ? 'CR' : 'DB';
            return `${Math.abs(val).toFixed(2)} ${sign}`;
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ['#1a73e8', '#fbbc04', '#34a853'],
      legend: {
        position: 'bottom',
      },
    };


   
    const acquirer = this.kpis.total.acquirer;
    const issuer = this.kpis.total.issuer;
    const other = this.kpis.total.other;
   

    const getValue = (line?: VisaStatLine): number => {
      if (!line?.totalAmount) return 0;
      return (line.totalAmountSign ?? '').toUpperCase() === 'DB'
        ? -line.totalAmount
        : line.totalAmount;
    };

    const valuesPie = [getValue(acquirer), getValue(issuer), getValue(other)]; 
    const yMinPie = Math.min(...valuesPie);
    const yMaxPie = Math.max(...valuesPie);

    const getSign = (line?: VisaStatLine): string =>
      (line?.totalAmountSign ?? '').toUpperCase();

    this.totalPieChart = {
      series: [
        {
          name: 'Acquirer',
          data: [getValue(acquirer)],
        },
        {
          name: 'Issuer',
          data: [getValue(issuer)],
        },
        {
          name: 'Other',
          data: [getValue(other)],
        },
      ],
      chart: {
        type: 'bar',
        height: 300,
        stacked: false,
      },
      xaxis: {
        categories: [`Total - ${new Date().getFullYear()}`],
      },
      yaxis: {
        tickAmount: 7,
        title: {
          text: `Amount - ${new Date().getFullYear()}`,
        },
        labels: {
          formatter: (val: number) => {
            if (Math.abs(val) >= 1e9) return (val / 1e9).toFixed(2) + 'B';
            if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(2) + 'M';
            if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(1) + 'K';
            return val.toFixed(2);
          },
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => {
            const sign = val >= 0 ? 'CR' : 'DB';
            return `${Math.abs(val).toFixed(2)} ${sign}`;
          },
        },
      },
      colors: ['#4680ff', '#ffba57', '#0e9e4a'],
      dataLabels: {
        enabled: false
      },
      legend: {
        position: 'bottom',
      },
    };

    this.initCharts();
  }





  updateCharts(): void {

    // Update network distribution chart
    this.networkDistributionOptions = {
      ...this.networkDistributionOptions,
      series: [this.visaInvoiceCount, this.mastercardInvoiceCount]
    };
  }

  navigateToInvoices(type: string): void {
    if (type === 'visa') {
      this.router.navigate(['/invoices/visa/list']);
    } else if (type === 'mastercard') {
      this.router.navigate(['/invoices/mastercard/list']);
    }
  }
  navigateToUpload(type: string): void {
    if (type === 'visa') {
      this.router.navigate(['/invoices/visa/upload']);
    } else if (type === 'mastercard') {
      this.router.navigate(['/invoices/mastercard/upload']);
    }
  }
  navigateToSummary(): void {
    this.router.navigate(['/epin/reports/issuer-kpis']);
  }
  navigateToEpin(): void {
    this.router.navigate(['/epin/upload']);
  }
  navigateToAnalytics(): void {
    this.router.navigate(['/analytics']);
  }
  navigateToFollowUp(): void {
    this.router.navigate(['/follow-up']);
  }
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
  navigateToCsv(): void {
    this.router.navigate(['/csv-files']);
  }

 
  formatCurrency(value: number, currencyCode: string): string {
    if (value === null || value === undefined) return '';

    const number = typeof value === 'string' ? parseFloat(value) : value;


    const rounded = Math.round(number);
    let locale = 'en-US';
    let currency = 'USD';
  
    if (currencyCode === '978') {
      locale = 'fr-FR';
      currency = 'EUR';
    } else if (currencyCode === '840') {
      locale = 'en-US';
      currency = 'USD';
    }
  
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(rounded);
  }
  

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'MMM dd, yyyy') || '';
  }

  formatDateTime(date: Date): string {
    return this.datePipe.transform(date, 'MMM dd, yyyy HH:mm') || '';
  }

  formatDateCsv(date: string | undefined): string {
    if (!date) {
      return '–';
    }
    return new Date(date).toLocaleDateString();
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'processed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'error':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
  formatNumber(value: number): string {
    if (value === null || value === undefined) return '';

    const number = typeof value === 'string' ? parseFloat(value) : value;


    const rounded = Math.round(number);

    const formatted = rounded.toLocaleString();

    return formatted;
  }

  checkInvoiceAlerts(): void {
    const now = new Date();
  
    // VISA : < 30 jours
    if (this.uploadVisa) {
      const visaDate = new Date(this.uploadVisa);
      const diffMsVisa = now.getTime() - visaDate.getTime();
      const diffDaysVisa = diffMsVisa / (1000 * 60 * 60 * 24);
      this.showVisaAlert = diffDaysVisa > 30;
    } else {
      this.showVisaAlert = true;
    }
  
    // MASTERCARD :< 7 jours
    if (this.uploadMastercard) {
      const masterDate = new Date(this.uploadMastercard);
      const diffMs = now.getTime() - masterDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      this.showMasterAlert = diffDays > 7;
    } else {
      this.showMasterAlert = true;
    }
  if (this.showVisaAlert || this.showMasterAlert) {
    const visaMsg = this.showVisaAlert ? this.translate.instant('ALERTS.VISA_MISSING') : "";
    const masterMsg = this.showMasterAlert ? this.translate.instant('ALERTS.MASTER_MISSING') : "";
    
    Swal.fire({
      icon: 'warning',
      title: this.translate.instant('ALERTS.TITLE'),
      html: `<p>${visaMsg}</p><p>${masterMsg}</p>`,
      confirmButtonText: 'OK',
      confirmButtonColor: '#f59e0b',
    });
  }
  } 
  
  getInvoiceAlertTooltip(): string {
    let tooltip = '';
    if (this.showVisaAlert) {
      tooltip += this.translate.instant('ALERTS.VISA_MISSING') + '\n';
    }
    if (this.showMasterAlert) {
      tooltip += this.translate.instant('ALERTS.MASTER_MISSING');
    }
    return tooltip.trim();
  }

  get totalTitle(): string {
    return `${this.translate.instant('home.cflow_total')} - ${this.translate.instant('BANK.CURRENCY')}: ${this.selectedCurrencyLabel}`;
  }

  get totalCategoryTitle(): string {
    return `${this.translate.instant('home.cflow_category')} - ${this.translate.instant('BANK.CURRENCY')}: ${this.selectedCurrencyLabel}`;
  }

}