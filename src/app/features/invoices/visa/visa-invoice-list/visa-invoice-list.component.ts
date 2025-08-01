import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BillingService } from '../../../../core/services/billing.service';
import { VisaInvoiceDetailDto, VisaInvoiceQueryParams } from '../../../../core/models/invoice.models';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { TokenService } from 'src/app/core/services/token.service';
import { Role } from 'src/app/theme/shared/components/_helpers/role';
import { start } from 'repl';

@Component({
  selector: 'app-visa-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule,SharedModule],
  templateUrl: './visa-invoice-list.component.html',
  styleUrls: ['./visa-invoice-list.component.scss'],
  host: {
    '[class.visa-active]': 'activeProvider === "visa"',
    '[class.mastercard-active]': 'activeProvider === "mastercard"'
  }
})
export class VisaInvoiceListComponent implements OnInit {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  Math = Math;
  invoices: VisaInvoiceDetailDto[] = [];
  isLoading = false;
  errorMessage = '';

  allowedButtons = [Role.AdminVisa, Role.ManagerVisa];
  allowedRoles = [Role.AdminVisa, Role.ManagerVisa,Role.UserVisa];
  allowedRolesMastercard = [Role.AdminMastercard, Role.ManagerMastercard, Role.UserMastercard];
  currentUserRoles: string[] = [];
  canUseButtons = false;
  canAccessVisa = false;
  canAccessMastercard = false;


  // Provider tab state
  activeProvider = 'visa'; // 'visa' or 'mastercard'

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  showAdvancedFilters = false;
  
  private readonly exportColumns: string[] = [
    'invoiceId',
    'billingPeriod',
    'invoiceDate',
    'entityName',
    'description',
    'total',
    'billingCurrency'
  ];
  
  advancedFilterFields = [
    {name:'startDate', label: 'START_DATE', type: 'date'},
    {name:'endDate', label: 'END_DATE', type: 'date'},
    { name: 'totalMin', label: 'TOTAL_MIN', type: 'number' },
    { name: 'totalMax', label: 'TOTAL_MAX', type: 'number' },
    { name: 'billingLine', label: 'BILLING_LINE', type: 'text' },
    { name: 'entityName', label: 'ENTITY_NAME', type: 'text' },
    { name: 'description', label: 'DESCRIPTION', type: 'text' }
  ];

  filterForm: FormGroup;

  constructor(
    private billingService: BillingService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService

  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      billingPeriod: [''],
      invoiceId: [''],
      billingLine: [''],
      entityName: [''],
      description: [''],
      totalMin: [null],
      totalMax: [null],
      type: [''],
      billingCurrency: ['']
    });
  }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.currentUserRoles = this.tokenService.decodeToken()?.roles || [];

    this.canUseButtons = this.currentUserRoles
    .map(role => role as Role)
    .some(role => this.allowedButtons.includes(role));

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
    // Check for query params to set active provider
    /*
    this.route.queryParams.subscribe(params => {
      if (params['provider'] && params['provider'] === 'mastercard') {
        // Redirect to dedicated MasterCard component
        this.router.navigate(['/invoices/mastercard/list']);
        return;
      }
      this.activeProvider = 'visa';
    });
    */
    
  }

  // Switch between providers
  setActiveProvider(provider: string): void {
    if (provider === 'mastercard') {
      // Redirect to dedicated MasterCard component
      this.router.navigate(['/invoices/mastercard/list']);
    } else {
      this.activeProvider = 'visa';
      this.currentPage = 0;
      this.loadInvoices();
    }
  }

  loadInvoices(): void {
    this.isLoading = true;

    const params: VisaInvoiceQueryParams = {
      page: this.currentPage,
      size: this.pageSize,
      ...this.filterForm.value
    };

    Object.keys(params).forEach(key => {
      if (params[key] === '') {
        delete params[key];
      }
    });

    this.billingService.getVisaInvoices(params).subscribe({
      next: (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) &&
            'content' in data && 'totalElements' in data) {
          const paginatedData = data as { content: VisaInvoiceDetailDto[], totalElements: number, totalPages: number };
          this.totalElements = paginatedData.totalElements;
          this.invoices = paginatedData.content;
          this.totalPages = paginatedData.totalPages;
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
        console.error('Error loading Visa invoices:', error);
        this.errorMessage = this.translate.instant('ERRORS.Invoices');
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
    if ((this.currentPage + 1) < this.totalPages) {
      this.currentPage++;
      this.loadInvoices();
    }
  }

  formatCurrency(amount: number | undefined, currency: string | undefined): string {
    if (amount === undefined || amount === null) {
      return '–';
    }
    try {
      return new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (e) {
      
      return amount.toString();
    }
  }

  formatNumber(amount: number | undefined): string {
    if (amount === undefined || amount === null) {
      return '–';
    }
    try {
      return new Intl.NumberFormat(navigator.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (e) {
      return amount.toFixed(2);
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '–';
    }
    return new Date(date).toLocaleDateString();
  }

  navigateToUpload(): void {
    this.router.navigate(['/invoices/visa/upload']);
  }
  
  navigateToSummary(): void {
    this.router.navigate(['/invoices/visa/summary']);
  }

  navigateToBreakdown(): void {
    this.router.navigate(['/invoices/visa/breakdown']);
  }

  exportToCsv(): void {
    console.log('Exporting Visa invoices to CSV...');
    
    const params = this.getFilterParams(); 
  
    this.isLoading = true;
    this.errorMessage = '';
  
    this.billingService.getVisaInvoices(params).subscribe({
      next: (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) &&
          'content' in data && 'totalElements' in data) {
          const paginatedData = data as { content: VisaInvoiceDetailDto[], totalElements: number, totalPages: number };
          const csv = this.convertToCsv(paginatedData.content);
          console.log('CSV data:', csv);
          this.downloadCsv(csv, 'visa-invoices.csv');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to export Visa invoices. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  private downloadCsv(csv: string, filename: string): void {
    if (!csv) {
      this.errorMessage = 'No data to export';
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } 

  private convertToCsv(data: VisaInvoiceDetailDto[]): string {
    if (!data || data.length === 0) {
      return '';
    }
  
    const headers = this.exportColumns;
    const headerRow = headers.map(header => `"${this.getColumnDisplayName(header)}"`).join(',');
  
    const dataRows = data.map(item => {
      return headers.map(header => {
        const value = item[header as keyof VisaInvoiceDetailDto];
          return `"${value || ''}"`;
      }).join(',');
    });
  
    return [headerRow, ...dataRows].join('\n');
  }

  getFilterParams(): VisaInvoiceQueryParams & { page: number, size: number } {
    const params: any = {
      page: 0,
      size: this.totalElements,
      ...this.filterForm.value
    };

    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    return params;
  }

  getColumnDisplayName(column: string): string {
    const columnMappings: Record<string, string> = {
      invoiceId: 'Invoice ID',
      billingPeriod: 'Billing Period',
      invoiceDate: 'Invoice Date',
      entityName: 'Entity Name',
      description: 'Description',
      total: 'Total Amount',
      billingCurrency: 'Currency'
    };
    return columnMappings[column] || column;
  }
}
