import { Component, OnInit ,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BillingService } from '../../../../core/services/billing.service';
import { VisaSumamryQueryParams,SummaryResponseDto } from 'src/app/core/models/invoice.models';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { TokenService } from 'src/app/core/services/token.service';
import { Role } from 'src/app/theme/shared/components/_helpers/role';
import {
  NgApexchartsModule ,
  ApexAxisChartSeries,
  ApexOptions ,

} from 'ng-apexcharts';

@Component({
  selector: 'app-visa-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule,SharedModule,NgApexchartsModule],
  templateUrl: './visa-summary.component.html',
  styleUrls: ['./visa-summary.component.scss'],
  host: {
    '[class.visa-active]': 'activeProvider === "visa"',
    '[class.mastercard-active]': 'activeProvider === "mastercard"'
  }
})
export class VisaSummaryComponent implements OnInit {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  Math = Math;
  invoices: SummaryResponseDto[] = [];
  showChart = false;
  chartOptions: ApexOptions = {};
  chartSeries: ApexAxisChartSeries = [];

  isLoading = false;
  errorMessage = '';

  allowedRoles = [Role.AdminVisa, Role.ManagerVisa];
  allowedRolesMastercard = [Role.AdminMastercard, Role.ManagerMastercard];
  currentUserRoles: string[] = [];
  canAccessVisa = false;
  canAccessMastercard = false;

  activeProvider = 'visa'; // 'visa' or 'mastercard'
     // Pagination properties
      currentPage = 0;
      pageSize = 10;
      totalElements = 0;
      totalPages = 0;
      filterForm: FormGroup;
    
      constructor(
        private billingService: BillingService,
        private fb: FormBuilder,
        private router: Router,
        private tokenService: TokenService
      ) {
        this.filterForm = this.fb.group({
          billingPeriod: [''],
          invoiceId: [''],
          startDate: [''],
          endDate: [''],
          type: [''],
          billingLine: [''],
          entityId: [''],
          billingCurrency: [''],
        });
      }
      // Switch between providers
      setActiveProvider(provider: string): void {
        if (this.activeProvider !== provider) {
          // Navigate to the appropriate provider's summary page
          this.router.navigate([`/invoices/${provider}/summary`]);
        }
      }
    
      ngOnInit(): void {
        this.translate.use(this.mantisConfig.i18n);
        this.currentUserRoles = this.tokenService.decodeToken()?.roles || [];
  
        this.canAccessVisa = this.currentUserRoles
        .map(role => role as Role)
        .some(role => this.allowedRoles.includes(role));
    
      this.canAccessMastercard = this.currentUserRoles
      .map(role => role as Role)
      .some(role =>this.allowedRolesMastercard.includes(role) );
    
      if (!this.canAccessVisa && !this.canAccessMastercard) {
        this.router.navigate(['/dashboard/main']);
        return;
      }
      
      if (!this.canAccessVisa && this.canAccessMastercard) {
        this.setActiveProvider('mastercard');
        return;
      }
        this.loadInvoices();
      }
      
      loadInvoices(): void {
        this.isLoading = true;
        
        const params: any = {
          page: this.currentPage,
          size: this.pageSize,
          ...this.filterForm.value
        };
        
        // Remove empty string values
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key];
          }
        });
        
        // Call the appropriate service based on the active provider
        const service = this.activeProvider === 'visa'
          ? this.billingService.getVisaChargesSummary(params)
          : this.billingService.getMasterCardChargesSummary(params);
        
        service.subscribe({
          next: (data) => {
            if (data && typeof data === 'object' && !Array.isArray(data) &&
                        'content' in data && 'totalElements' in data && 'totalPages' in data) {
                      const paginatedData = data as { content: SummaryResponseDto[], totalElements: number, totalPages: number };
                      this.totalElements = paginatedData.totalElements;
                      this.invoices = paginatedData.content;
                      this.totalPages = paginatedData.totalPages;
                      this.prepareChartData();
                    } else {
                      this.invoices = Array.isArray(data) ? data : [];
                      this.totalElements = this.invoices.length;
                    }
                    
                    if (this.invoices.length === 0 && this.currentPage > 0) {
                      this.currentPage--;
                      this.loadInvoices();
                      return;
                    }
            this.isLoading = false;
          },
          error: (error) => {
            console.error(`Error loading ${this.activeProvider.charAt(0).toUpperCase() + this.activeProvider.slice(1)} charges summary:`, error);
            this.errorMessage = this.translate.instant('ERRORS.Summary');
            this.isLoading = false;
          }
        });
      }
      applyFilter(): void {
        this.currentPage = 0;
        this.loadInvoices();
      }
    
      resetFilter(): void {
        this.filterForm.reset();
        this.currentPage = 0;
        this.loadInvoices();
      }
    
      goToPage(page: number): void {
        this.currentPage = page;
        this.loadInvoices();
      }
    
      previousPage(): void {
        if (this.currentPage > 0) {
          this.currentPage--;
          this.loadInvoices();
        }
      }
    
      nextPage(): void {
        if ((this.currentPage + 1)  < this.totalPages) {
          this.currentPage++;
          this.loadInvoices();
        }
      }
    
      formatCurrency(amount: number | undefined): string {
        if (amount === undefined || amount === null) {
          return '–';
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
      }
    
      formatDate(date: string | undefined): string {
        if (!date) {
          return '–';
        }
        return new Date(date).toLocaleDateString();
      }
     
      navigateToInvoice(): void {
        this.router.navigate([`/invoices/${this.activeProvider}/list`]);
      }
      
      navigateToBreakdown(): void {
        this.router.navigate([`/invoices/${this.activeProvider}/breakdown`]);
      }
      
      navigateToUpload(): void {
        this.router.navigate([`/invoices/${this.activeProvider}/upload`]);
      }
    

    exportSummaryToCsv(): void {
       console.log('Exporting Visa summary to CSV...');
        
          const params = this.getFilterParams(); 
          this.isLoading = true;
          this.errorMessage = '';
        
          this.billingService.getVisaChargesSummary(params).subscribe({
            next: (data) => {
              this.isLoading = false;
              if (
                data && typeof data === 'object' && !Array.isArray(data) &&
                'content' in data && 'totalElements' in data
              ) {
                const allInvoices = (data as { content: SummaryResponseDto[] }).content;
                const csv = this.convertSummaryToCsv(allInvoices);
                this.downloadCsv(csv, 'visa-summary-report.csv');
              } else {
                this.errorMessage = 'Invalid data format for export';
              }
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessage = 'Failed to export summary. Please try again later.';
              console.error('Error exporting:', error);
            }
          });
    }
    
    getFilterParams(): VisaSumamryQueryParams & { page: number; size: number } {
    const params: any = {
      page: 0,
      size: this.totalElements||10,
      startDate: this.filterForm.value.billingDate,
      ...this.filterForm.value
    };
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });
    
      return params;
    }
    
    private convertSummaryToCsv(data: SummaryResponseDto[]): string {
      if (!data || data.length === 0) {
        return '';
      }
    
      const headers = ['Billing Date', 'Total Amount', 'Currency Distribution'];
      const rows = [headers.join(',')];
    
      data.forEach(item => {
        const currencyDist = item.currency_distribution
          ? Object.entries(item.currency_distribution).map(([cur, val]) => `${cur}:${val}`).join('; ')
          : '';
        rows.push([
          item.billing_date || '',
          item.total_charges_USD != null ? item.total_charges_USD.toFixed(2) : '',
          `"${currencyDist}"`
        ].join(','));
      });
    
      return rows.join('\n');
    }
    
    private downloadCsv(csv: string, filename: string): void {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.style.visibility = 'hidden';
    
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toggleView() {
      this.showChart = !this.showChart;
      if (this.showChart) {
        this.prepareChartData();
      }
    }

    prepareChartData(): void {
      if (!this.invoices || this.invoices.length === 0) {
        this.chartSeries = [];
        this.chartOptions = {};
        return;
      }
    

      const currencies = new Set<string>();
      this.invoices.forEach(invoice => {
        if (invoice.currency_distribution) {
          Object.keys(invoice.currency_distribution).forEach(currency => {
            currencies.add(currency);
          });
        }
      });
   
      this.chartSeries = Array.from(currencies).map(currency => ({
        name: currency,
        data: this.invoices.map(invoice => invoice.currency_distribution?.[currency] || 0)
      }));
    
      this.chartOptions = {
        chart: {
          type: 'bar',
          height: 350,
          stacked: false,
          toolbar: {
            show: true
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '75%',
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: this.invoices.map(invoice => invoice.billing_date || ''),
          title: {
            text: this.translate.instant('home.period')
          }
        },
        yaxis: {
          tickAmount: 5,
          title: {
            text: this.translate.instant('home.amount')
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
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: (val: number) => val.toFixed(2) 
          }
        },
        colors: ['#1a1f71', '#F7B600','#00E396', '#FF4560', '#775DD0'],
        legend: {
          show: true,
          position: 'top',
          showForSingleSeries: true, 
          horizontalAlign: 'left',
          
        }
      };
    }
    
 
  
  }
  