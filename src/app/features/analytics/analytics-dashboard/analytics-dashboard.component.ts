import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy,inject } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule,FormsModule } from '@angular/forms';
import { CommonModule, NgClass, DatePipe } from '@angular/common';
import { AnalyticsService, TrendsRequestDto, TrendsResponseDto, AnomalyDto,IgnoreAnomalyRequest } from '../../../core/services/analytics.service';
import { Subject ,forkJoin} from 'rxjs';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil, finalize } from 'rxjs/operators';
import { Role } from 'src/app/theme/shared/components/_helpers/role';
import { TokenService } from 'src/app/core/services/token.service';
import { Router ,RouterModule, ActivatedRoute } from '@angular/router';
import { UserDetail } from 'src/app/core/models/User';
import {UsersListQueryParams} from 'src/app/core/models/invoice.models';
import { UserService } from 'src/app/core/services/user.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
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
import { FooterComponent } from '../../../theme/shared/components/footer/footer.component';

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

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass,
    NgSelectModule,
    NgApexchartsModule,
    CardComponent,
    FooterComponent,
    SharedModule,
    RouterModule,
    FormsModule
  ],
  providers: [DatePipe]
})
export class AnalyticsDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("trendsChart") trendsChart: ChartComponent;
  @ViewChild("categoryChart") categoryChart: ChartComponent;
  private translate = inject(TranslateService);
  // Chart options
  public trendsChartOptions: Partial<ChartOptions>;
  public categoryChartOptions: Partial<ChartOptions> = {};
  public sparklineOptions: any = {};
  
  mantisConfig = MantisConfig;
  // Forms
  filterForm: FormGroup;
  
  // Data
  trendsData: TrendsResponseDto | null = null;
  anomalies: AnomalyDto[] = [];
 //Ignore anomaly
  ignoreModalIsOpen: boolean = false;
  selectedAnomaly!: AnomalyDto;
  ignoreComment: string = '';
  
  sendModalIsOpen = false;
  sendComment: string = '';
  selectedUserIds: string[] = [];
  usersList: UserDetail[] = [];
  userSearchTerm: string = '';
  filteredUsersList: UserDetail[] = []; 
  

  sparklineData: { [key: string]: number[] } = {
    totalCharges: [0, 0, 0, 0, 0, 0, 0],
    transactions: [0, 0, 0, 0, 0, 0, 0],
    avgTransaction: [0, 0, 0, 0, 0, 0, 0],
    anomalies: [0, 0, 0, 0, 0, 0, 0]
  };

  //Roles
  allowedRolesVisa = [ Role.ManagerVisa];
  allowedRolesMastercard = [ Role.ManagerMastercard ];
  canAccessVisa = false;
  canAccessMastercard = false;
  
  // UI state
  isLoading = false;
  hasError = false;
  errorMessage = '';
  isLoadingAnomalies = false;
  activeDatePreset: string = '90d'; // '30d', '90d', 'ytd', 'custom'
  expandedAnomalyId: string | null = null;
  selectedChartType: 'area' | 'line' | 'bar' = 'area';
  
  // Filter options
  cardTypeOptions = [
    { id: 'VISA', name: 'Visa' },
    { id: 'MASTERCARD', name: 'Mastercard' }
  ];
  
  groupByOptions = [
   // { id: 'DAILY', name: 'Daily' },
  //  { id: 'WEEKLY', name: 'Weekly' },
    { id: 'MONTHLY', name: 'Monthly' },
  
  ];
  
  comparisonOptions = [
    { id: 'SAME_PERIOD_LAST_YEAR', name: 'Same Period Last Year' },
    { id: 'PREVIOUS_PERIOD', name: 'Previous Period' },
  ];
  
  // For cleanup
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private datePipe: DatePipe,
    private tokenService: TokenService,
    private router: Router,
    private userService: UserService
    ,private route: ActivatedRoute
  ) {
    this.initCharts();
    this.initSparklines();
  }
  
  initSparklines(): void {
    // Initialize sparkline options for metric cards
    this.sparklineOptions = {
      chart: {
        type: 'line',
        height: 40,
        sparkline: {
          enabled: true
        },
        animations: {
          enabled: true,
          easing: 'linear',
          speed: 500
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['rgba(255, 255, 255, 0.5)'],
      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: () => ''
          }
        },
        marker: {
          show: false
        }
      }
    };
    
    // Generate some sample data for sparklines
    // This will be replaced with real data when trends are loaded
    this.generateSampleSparklineData();
  }
  
  generateSampleSparklineData(): void {
    // Generate random data for sparklines until real data is loaded
    const generateRandomData = () => {
      return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100));
    };
    
    this.sparklineData = {
      totalCharges: generateRandomData(),
      transactions: generateRandomData(),
      avgTransaction: generateRandomData(),
      anomalies: generateRandomData()
    };
  }
  
  ngOnInit(): void {
    const userRoles = this.tokenService.decodeToken()?.roles || [];

  this.canAccessVisa = userRoles.some(role => this.allowedRolesVisa.includes(role as Role));
  this.canAccessMastercard = userRoles.some(role => this.allowedRolesMastercard.includes(role as Role));

  if (!this.canAccessVisa && !this.canAccessMastercard) {
    this.router.navigate(['/dashboard/main']);
    return;
  }

  // Filtrer cardTypeOptions selon les accès
  this.cardTypeOptions = this.cardTypeOptions.filter(option => {
    if (option.id === 'VISA') return this.canAccessVisa;
    if (option.id === 'MASTERCARD') return this.canAccessMastercard;
    return false;
  });

    this.initFilterForm();
    this.loadAnomalies();
    this.translate.use(this.mantisConfig.i18n);
  }
  
  ngAfterViewInit(): void {
    this.loadTrendsData();
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const tryScroll = () => {
          const el = document.getElementById(fragment);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            setTimeout(tryScroll, 300);
          }
        };
        tryScroll();
      }
    });

  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Filter methods
  setDateRange(preset: string): void {
    this.activeDatePreset = preset;
    const today = new Date();
    let startDate: Date;
    
    switch (preset) {
      case '30d':
        startDate = new Date();
        startDate.setDate(today.getDate() - 30);
        break;
      case '90d':
        startDate = new Date();
        startDate.setDate(today.getDate() - 90);
        break;
      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
        break;
      case 'custom':
        // Don't change dates, just set the preset
        return;
      default:
        return;
    }
    
    this.filterForm.patchValue({
      startDate: this.formatDateForInput(startDate),
      endDate: this.formatDateForInput(today)
    });
  }
  
  formatDateForInput(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }
  
  toggleCardType(cardType: string): void {
    const currentCardTypes = [...(this.filterForm.get('cardTypes')?.value || [])];
    const index = currentCardTypes.indexOf(cardType);
    
    if (index > -1) {
      // Remove if already selected
      currentCardTypes.splice(index, 1);
    } else {
      // Add if not selected
      currentCardTypes.push(cardType);
    }
    
    this.filterForm.patchValue({ cardTypes: currentCardTypes });
  }
  
  isCardTypeSelected(cardType: string): boolean {
    const currentCardTypes = this.filterForm.get('cardTypes')?.value || [];
    return currentCardTypes.includes(cardType);
  }
  
  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return (
      (formValue.cardTypes?.length < this.cardTypeOptions.length) ||
      this.activeDatePreset !== '90d' || // Not using default date range
      formValue.groupBy !== 'MONTHLY' ||
      formValue.comparisonPeriod !== 'PREVIOUS_PERIOD'
    );
  }
  
  getSelectedCardTypesLabel(): string {
    const selectedTypes = this.filterForm.get('cardTypes')?.value || [];
    return selectedTypes
      .map(id => this.cardTypeOptions.find(opt => opt.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  }
  
  getActiveDatePresetLabel(): string {
    switch (this.activeDatePreset) {
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case 'ytd': return 'Year to Date';
      case 'custom': return 'Custom Range';
      default: return '';
    }
  }
  
  resetCardTypes(): void {
    this.filterForm.patchValue({
      cardTypes: this.cardTypeOptions.map(opt => opt.id)
    });
  }
  
  resetDateRange(): void {
    this.setDateRange('90d'); // Reset to default
  }
  
  resetAllFilters(): void {
    this.activeDatePreset = '90d';
    this.initFilterForm(); // Re-initialize with defaults
  }
  
  toggleAnomalyDetails(anomalyId: string): void {
    if (this.expandedAnomalyId === anomalyId) {
      this.expandedAnomalyId = null;
    } else {
      this.expandedAnomalyId = anomalyId;
    }
  }
  
  setChartType(type: 'area' | 'line' | 'bar'): void {
    this.selectedChartType = type;
    if (this.trendsChartOptions && this.trendsChartOptions.chart) {
      this.trendsChartOptions = {
        ...this.trendsChartOptions,
        chart: {
          ...this.trendsChartOptions.chart,
          type: type
        }
      };
      this.updateCharts();
    }
  }
  
  initFilterForm(): void {
    // Get the current date
    const today = new Date();
    
    // Calculate 90 days ago (default)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    const initialCardTypes = this.cardTypeOptions.map(option => option.id);

    
    this.filterForm = this.fb.group({
      startDate: [this.formatDateForInput(ninetyDaysAgo)],
      endDate: [this.formatDateForInput(today)],
      cardTypes: [initialCardTypes],
      groupBy: ['MONTHLY'],
      includeBreakdown: [true],
      comparisonPeriod: ['PREVIOUS_PERIOD']
    });
    
    // Subscribe to form changes to reload data
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // If dates are changed manually, set preset to custom
        if (this.activeDatePreset !== 'custom') {
          const startDate = this.filterForm.get('startDate')?.value;
          const endDate = this.filterForm.get('endDate')?.value;
          
          // Check if dates match any preset
          const matchesPreset = this.checkIfDatesMatchPreset(startDate, endDate);
          if (matchesPreset) {
            this.activeDatePreset = matchesPreset;
          } else {
            this.activeDatePreset = 'custom';
          }
        }
        
        this.loadTrendsData();
        
        // Also reload anomalies when card types change
        const previousCardTypes = this.filterForm.get('cardTypes')?.value;
        if (previousCardTypes) {
          this.loadAnomalies();
        }
      });
  }
  
  checkIfDatesMatchPreset(startDate: string, endDate: string): string | null {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if end date is today
    if (end.getTime() !== today.getTime()) {
      return null;
    }
    
    // Check for 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    if (start.getTime() === thirtyDaysAgo.getTime()) {
      return '30d';
    }
    
    // Check for 90 days
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 90);
    if (start.getTime() === ninetyDaysAgo.getTime()) {
      return '90d';
    }
    
    // Check for YTD
    const ytdStart = new Date(today.getFullYear(), 0, 1);
    if (start.getTime() === ytdStart.getTime()) {
      return 'ytd';
    }
    
    return null;
  }
  
  loadTrendsData(): void {
    if (!this.filterForm.valid) return;
    
    this.isLoading = true;
    this.hasError = false;
    
    const request: TrendsRequestDto = this.filterForm.value;
    
    this.analyticsService.getTrendsAnalysis(request)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('Trends data response:', response);
          console.log('Service category trends:', response.serviceCategoryTrends);
          this.trendsData = response;
          this.updateCharts();
        },
        error: (error) => {
          this.hasError = true;
          this.errorMessage = this.translate.instant('ERRORS.analytics');
          console.error('Error loading trends data:', error);
        }
      });
  }
  
  loadAnomalies(): void {
    // Get selected card types from the filter form
    const selectedCardTypes = this.filterForm?.get('cardTypes')?.value || ['MASTERCARD'];
    
    // Reset anomalies array
    this.anomalies = [];
    
    // If no card types selected, return empty array
    if (selectedCardTypes.length === 0) {
      return;
    }
    
    // Set loading state
    this.isLoadingAnomalies = true;
    
    // Track completed requests
    let completedRequests = 0;
    const totalRequests = selectedCardTypes.length;
    const formValues = this.filterForm.value;
    
    // For each selected card type, fetch anomalies
    selectedCardTypes.forEach((cardType) => {
      this.analyticsService.getAnomalies(cardType ,formValues.startDate, formValues.endDate)
        .pipe(finalize(() => {
          // Check if all requests are completed
          completedRequests++;
          if (completedRequests === totalRequests) {
            this.isLoadingAnomalies = false;
          }
        }))
        .subscribe({
          next: (anomalies) => {
            // Add anomalies to the array
            this.anomalies = [...this.anomalies, ...anomalies];
            console.log(`Loaded ${anomalies.length} anomalies for ${cardType}`);
          },
          error: (error) => {
            console.error(`Error loading anomalies for ${cardType}:`, error);
          }
        });
    });
  }
  
  initCharts(): void {
    // Initialize trends chart with empty data
    this.trendsChartOptions = {
      series: [],
      chart: {
        height: 350,
        type: 'area',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          },
          // Offset to avoid overlap with the legend
          offsetX: 0,
          offsetY: 0
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      xaxis: {
        type: 'category',
        categories: []
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm'
        }
      },
      colors: ['#4680ff', '#0e9e4a', '#ffba57', '#ffba57'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 90, 100]
        }
      },
      markers: {
        size: 4,
        colors: ['#fff'],
        strokeColors: ['#4680ff', '#0e9e4a', '#ffba57', '#ffba57'],
        strokeWidth: 2,
        hover: {
          size: 7
        }
      },
      yaxis: {
        title: {
          text: 'Amount'
        }
      },
      legend: {
        // Move legend to the top-left to avoid overlap with toolbar
        position: 'top',
        horizontalAlign: 'left'
      }
    };
    
    // Initialize category chart with empty data
    this.categoryChartOptions = {
      series: [100],
      chart: {
        type: 'donut',
        height: 320,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      labels: ['No Data'],
      colors: ['#4680ff', '#0e9e4a', '#ffba57', '#ffba57', '#7759de', '#2196f3'],
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        floating: false,
        fontSize: '14px',
        fontFamily: 'Helvetica, Arial',
        fontWeight: 400,
      },
      dataLabels: {
        enabled: true,
        formatter: function(val: any, opts: any) {
          const value = typeof val === 'number' ? val.toFixed(1) : val;
          return opts.w.globals.labels[opts.seriesIndex] + ': ' + value + '%';
        },
        style: {
          fontSize: '14px',
          fontFamily: 'Helvetica, Arial',
          fontWeight: 'bold',
          colors: ['#fff']
        },
        dropShadow: {
          enabled: false
        }
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function(val: any) {
            return typeof val === 'number' ? '$' + val.toFixed(2) : '$' + val;
          }
        }
      },
      stroke: {
        width: 2,
        colors: ['#fff']
      },
      fill: {
        type: 'solid',
        opacity: 1
      }
    };
    
    console.log('Category chart initialized:', this.categoryChartOptions);
  }
  
  updateCharts(): void {
    if (!this.trendsData) return;
    
    // Update trends chart
    const periods = this.trendsData.periodData.map(item => item.period);
    const totalSeries = {
      name: 'Total',
      data: this.trendsData.periodData.map(item => item.totalAmount)
    };
    
    const cardTypeSeries = this.trendsData.cardTypes.map(cardType => {
      return {
        name: cardType,
        data: this.trendsData.periodData.map(item => item.cardTypeAmounts[cardType] || 0)
      };
    });
    
    this.trendsChartOptions = {
      ...this.trendsChartOptions,
      series: [totalSeries, ...cardTypeSeries],
      xaxis: {
        ...this.trendsChartOptions.xaxis,
        categories: periods
      }
    };
    
    // Update category chart
    if (this.trendsData.serviceCategoryTrends && this.trendsData.serviceCategoryTrends.length > 0) {
      const categoryAmounts = this.trendsData.serviceCategoryTrends.map(item => item.totalAmount);
      const categoryLabels = this.trendsData.serviceCategoryTrends.map(item => item.serviceCategory);
      
      // Calculate total for percentage calculation
      const total = categoryAmounts.reduce((sum, val) => sum + val, 0);
      
      // Update the chart with the new data
      this.categoryChartOptions = {
        series: categoryAmounts,
        labels: categoryLabels,
        chart: {
          type: 'pie',
          height: 320,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150
            },
            dynamicAnimation: {
              enabled: true,
              speed: 350
            }
          }
        },
        colors: ['#4680ff', '#0e9e4a', '#ffba57', '#ffba57', '#7759de', '#2196f3'],
        legend: {
          show: true,
          position: 'bottom',
          horizontalAlign: 'center',
          fontSize: '14px',
          fontFamily: 'Helvetica, Arial',
          fontWeight: 400,
        },
        dataLabels: {
          enabled: true,
          formatter: function(val: any, opts: any) {
            const value = typeof val === 'number' ? val.toFixed(1) : val;
            return  value + '%';
          },
          style: {
            fontSize: '14px',
            fontFamily: 'Helvetica, Arial',
            fontWeight: 'bold',
            colors: ['#fff']
          },
          dropShadow: {
            enabled: false
          }
        },
        tooltip: {
          enabled: true,
          y: {
            formatter: function(val: any) {
              return typeof val === 'number' ? '$' + val.toFixed(2) : '$' + val;
            }
          }
        },
        stroke: {
          width: 2,
          colors: ['#fff']
        },
        fill: {
          type: 'solid',
          opacity: 1
        }
      };
      
      // Force chart update by creating a new reference
      this.categoryChartOptions = { ...this.categoryChartOptions };
      
      console.log('Category chart data updated:', this.categoryChartOptions);
      console.log('Category amounts:', categoryAmounts);
      console.log('Category labels:', categoryLabels);
    } else {
      console.log('No service category trends data available');
      if (this.trendsData) {
        console.log('Trends data:', this.trendsData);
      }
    }
  }
  
  /**
   * Calculate the total amount from all period data
   */
  getTotalAmount(): number {
    if (!this.trendsData || !this.trendsData.periodData) return 0;
    return this.trendsData.periodData.reduce((sum, item) => sum + item.totalAmount, 0);
  }
  
  /**
   * Calculate the total number of transactions
   */
  getTotalTransactions(): number {
    if (!this.trendsData || !this.trendsData.periodData) return 0;
    return this.trendsData.periodData.reduce((sum, item) => sum + item.transactionCount, 0);
  }
  
  /**
   * Calculate the average transaction amount
   */
  getAverageTransactionAmount(): number {
    if (!this.trendsData || !this.trendsData.periodData) return 0;
    const totalAmount = this.getTotalAmount();
    const totalTransactions = this.getTotalTransactions();
    return totalTransactions > 0 ? totalAmount / totalTransactions : 0;
  }
  
  getGrowthClass(value: number): string {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-danger';
    return 'text-neutral';
  }
  
  getGrowthIcon(value: number): string {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'flat';
  }
  
  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'HIGH': return 'bg-light-danger text-danger';
      case 'MEDIUM': return 'bg-light-warning text-warning';
      case 'LOW': return 'bg-light-info text-info';
      default: return 'bg-light-secondary text-secondary';
    }
  }
  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }
  
  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  }
  formatNumber(value: number ): string {
    if (value === null || value === undefined) return null;

    const number = typeof value === 'string' ? parseFloat(value) : value;


    const rounded = Math.round(number); 

    const formatted = rounded.toLocaleString();

    return formatted;
  }
  getTotalByCardType(type: string): number {
    if (!this.trendsData?.periodData) return 0;
  
    return this.trendsData.periodData.reduce((sum, item) => {
      const amount = item.cardTypeAmounts?.[type] || 0;
      return sum + amount;
    }, 0);
  }

  getPercentageByCardType(type: string): number {
    const total = this.getTotalAmount();
    if (total === 0) return 0;
  
    const cardTotal = this.getTotalByCardType(type);
    return (cardTotal / total) * 100;
  }

  getDetailAnomalies(cardType: string, anomalyId: string): void {
    const anomaly = this.anomalies.find(a => a.anomalyId === anomalyId);
    if (!anomaly) {
      console.error('Anomaly not found');
      return;
    }

    this.router.navigate([`/anomalies/${cardType}/detail`, anomalyId], {
      state: { anomaly }
    });
   
  }
 

  openIgnoreModal(anomaly: AnomalyDto) {
    this.selectedAnomaly = anomaly;
    this.ignoreComment = '';
    this.ignoreModalIsOpen = true;
  }

  closeIgnoreModal() {
    this.ignoreModalIsOpen = false;
    this.selectedAnomaly = {} as AnomalyDto;
    this.ignoreComment = '';
  }

  submitIgnore() {
    const request: IgnoreAnomalyRequest = {
      anomaly: this.selectedAnomaly,
      comment: this.ignoreComment,
    };

    this.analyticsService.ignoreAnomaly(request).subscribe({
      next: (message: string) => {
        // Supprimer l’anomalie de la liste
        this.anomalies = this.anomalies.filter(
          (a) => a.anomalyId !== this.selectedAnomaly.anomalyId
        );

        this.closeIgnoreModal();

        Swal.fire(
          this.translate.instant('SUCCESS.SUCCESS'),
           this.translate.instant('SUCCESS.IGNORE_SUCCESS'),
          'success'
        );
      },
      error: (err) => {
        this.closeIgnoreModal();
        Swal.fire(
          this.translate.instant('ERRORS.ERROR'),
          this.translate.instant('ERRORS.IGNORE_FAILURE'),
          'error'
        );
        console.error(err);
      },
    });
  }

  openSendModal(anomaly: AnomalyDto) {
    this.selectedAnomaly = anomaly;
    this.sendComment = '';
    this.userSearchTerm= '';
    this.selectedUserIds = [];
    this.sendModalIsOpen = true;

    const params: UsersListQueryParams = {
      page: 0,
      size: 1000
    };
  
    this.userService.getUsersList(params).subscribe({
      next: (data) => {
        if (
          data &&
          typeof data === 'object' &&
          !Array.isArray(data) &&
          'content' in data &&
          'totalElements' in data &&
          'totalPages' in data
        ) {
          const paginatedData = data as { content: UserDetail[], totalElements: number, totalPages: number };
          this.usersList = paginatedData.content;
          this.filteredUsersList = [...this.usersList];
        } else {
          this.usersList = [];
          this.filteredUsersList = [];
        }
      },
      error: (err) => {
        Swal.fire(
          this.translate.instant('ERRORS.ERROR'),
          this.translate.instant('ERRORS.LOAD_USERS_FAILURE'),
          'error'
        );
        console.error('Erreur chargement utilisateurs :', err);
      }
    });
  }
  
  
  closeSendModal() {
    this.sendModalIsOpen = false;
    this.sendComment = '';
    this.userSearchTerm= '';
    this.selectedUserIds = [];
    this.selectedAnomaly = {} as AnomalyDto;
  }
  
  submitSend() {
    const requests = this.selectedUserIds.map(userId => ({
      anomaly: this.selectedAnomaly,
      comment: this.sendComment,
      assignedTo: userId
    }));
  
    const observables = requests.map(req => this.analyticsService.sendAnomaly(req));
  
    forkJoin(observables).subscribe({
      next: () => {
        this.sendModalIsOpen = false;
        Swal.fire(
          this.translate.instant('SUCCESS.SUCCESS'),
          this.translate.instant('SUCCESS.SEND_SUCCESS'),
          'success'
        );
      },
      error: (err) => {
        Swal.fire(
          this.translate.instant('ERRORS.ERROR'),
          this.translate.instant('ERRORS.SEND_FAILURE'),
          'error'
        );
        console.error(err);
      }
    });
  }


  filterUsers() {
    if (!this.userSearchTerm) {
      this.filteredUsersList = [...this.usersList];
      return;
    }
    
    const searchTerm = this.userSearchTerm.toLowerCase();
    this.filteredUsersList = this.usersList.filter(user => 
      (user.username && user.username.toLowerCase().includes(searchTerm)) || 
      (user.email && user.email.toLowerCase().includes(searchTerm))
    );
  }
  toggleUserSelection(userId: string) {
    if (!this.selectedUserIds.includes(userId)) {
      this.selectedUserIds = [...this.selectedUserIds, userId];
    } else {
      this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId); 
    }
  }
  
 
selectedUsers(): UserDetail[] {
  return this.usersList.filter(user => this.selectedUserIds.includes(user.id));
}


removeUser(userId: string) {
  this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
}

scrollToAnomalies(): void {
  const el = document.getElementById('anomaliesTable');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

ExportAnomaliesToExcel(): void {
  if (!this.anomalies || this.anomalies.length === 0) {
    Swal.fire('Info',   this.translate.instant('ANOMALIES.NO_ANOMALIES'), 'info');
    return;
  }

  const exportData = this.anomalies.map(a => ({
    'ID Anomalie': a.anomalyId,
    'Type de Carte': a.cardType,
    'Facture': a.invoiceId,
    'Date de Détection': a.detectionDate,
    'Description': a.description,
    'Catégorie': a.category,
    'Valeur Attendue (€)': a.expectedValue,
    'Valeur Réelle (€)': a.actualValue,
    'Écart (%)': a.deviationPercentage,
    'Code Service': a.serviceCode,
    'Entité': a.entityName,
    'Sévérité': a.severity
  }));

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  const workbook: XLSX.WorkBook = { Sheets: { 'Anomalies': worksheet }, SheetNames: ['Anomalies'] };

  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const date = new Date();
  const fileName = `anomalies_${date.toISOString().slice(0, 10)}.xlsx`;

  const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  FileSaver.saveAs(data, fileName);
}

  
}
