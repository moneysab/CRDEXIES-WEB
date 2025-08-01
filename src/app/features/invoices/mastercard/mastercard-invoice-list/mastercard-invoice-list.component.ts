import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BillingService } from '../../../../core/services/billing.service';
import { MastercardInvoiceDetailDto, MastercardInvoiceQueryParams } from '../../../../core/models/invoice.models';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { TokenService } from 'src/app/core/services/token.service';
import { Role } from 'src/app/theme/shared/components/_helpers/role';
import { end } from '@popperjs/core';
@Component({
  selector: 'app-mastercard-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule,SharedModule],
  templateUrl: './mastercard-invoice-list.component.html',
  styleUrls: ['./mastercard-invoice-list.component.scss'],
  host: {
    '[class.visa-active]': 'activeProvider === "visa"',
    '[class.mastercard-active]': 'activeProvider === "mastercard"'
  }
})
export class MastercardInvoiceListComponent implements OnInit {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  Math = Math;
  invoices: MastercardInvoiceDetailDto[] = [];
  isLoading = false;
  errorMessage = '';

  allowedButtons = [Role.AdminMastercard, Role.ManagerMastercard];
  allowedRoles = [Role.AdminMastercard, Role.ManagerMastercard,Role.UserMastercard];
  allowedRolesVisa = [Role.AdminVisa, Role.ManagerVisa, Role.UserVisa];
  currentUserRoles: string[] = [];
  canUseButtons = false;
  canAccessVisa = false;
  canAccessMastercard = false;

  
  // Provider tab state
  activeProvider = 'mastercard'; // 'visa' or 'mastercard'
  
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  showAdvancedFilters = false;

  private readonly exportColumns: string[] = [
    'invoiceNumber',
    'billingCycleDate',
    'activityIca',
    'eventId',
    'eventDescription',
    'totalCharge',
    'currency'
  ];

  advancedFilterFields = [
    {name:'endDate', label: 'END_DATE', type: 'date'},
    { name: 'totalMin', label: 'TOTAL_MIN', type: 'number' },
    { name: 'totalMax', label: 'TOTAL_MAX', type: 'number' },
    { name: 'activityIca', label: 'ACTIVITY_ICA', type: 'text' },
    { name: 'billableIca', label: 'BILLABLE_ICA', type: 'text' },
    { name: 'eventId', label: 'EVENT_ID', type: 'text' },
    { name: 'eventDescription', label: 'EVENT_DESCRIPTION', type: 'text' },
    { name: 'serviceCode', label: 'SERVICE_CODE', type: 'text' },
    { name: 'serviceCodeDescription', label: 'SERVICE_CODE_DESCRIPTION', type: 'text' },
    { name: 'category', label: 'CATEGORY', type: 'text' },
    { name: 'subcategory', label: 'SUBCATEGORY', type: 'text' }
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
      invoiceNumber: [''],
      currency: [''],
      totalMin: [null],
      totalMax: [null],
      feeType: [''],
      activityIca: [''],
      billableIca: [''],
      eventId: [''],
      eventDescription: [''],
      serviceCode: [''],
      serviceCodeDescription: [''],
      category: [''],
      subcategory: ['']
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
    .some(role => this.allowedRolesVisa.includes(role));

  this.canAccessMastercard = this.currentUserRoles
  .map(role => role as Role)
  .some(role =>this.allowedRoles.includes(role) );

  if (!this.canAccessVisa && !this.canAccessMastercard) {
    this.router.navigate(['/dashboard/main']);
    return;
  }

  
  if (this.canAccessVisa && !this.canAccessMastercard) {
    this.setActiveProvider('visa');
    return;
  }
    this.loadInvoices();
  }

  // Switch between providers
  setActiveProvider(provider: string): void {
    if (provider === 'visa') {
      // Redirect to Visa component
      this.router.navigate(['/invoices/visa/list']);
    } else {
      this.activeProvider = 'mastercard';
      this.currentPage = 0;
      this.loadInvoices();
    }
  }

  loadInvoices(): void {
    this.isLoading = true;
    
    const params: MastercardInvoiceQueryParams = {
      page: this.currentPage,
      size: this.pageSize,
      ...this.filterForm.value
    };
    
    Object.keys(params).forEach(key => {
      if (params[key] === '') {
        delete params[key];
      }
    });
    
    this.billingService.getMastercardInvoices(params).subscribe({
      next: (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) &&
            'content' in data && 'totalElements' in data) {
          const paginatedData = data as { content: MastercardInvoiceDetailDto[], totalElements: number, totalPages: number };
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
        console.error('Error loading Mastercard invoices:', error);
        this.errorMessage = this.translate.instant('ERRORS.Invoices');;
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

  formatCurrency(amount: number | undefined, currency: string | undefined): string {
    if (amount === undefined || amount === null) {
      return '–';
    }
    try {
      return new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'code'
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
  navigateToSummary(): void {
    this.router.navigate(['/invoices/mastercard/summary']);
  }

  navigateToBreakdown(): void {
    this.router.navigate(['/invoices/mastercard/breakdown']);
  }

  navigateToUpload(): void {
    this.router.navigate(['/invoices/mastercard/upload']);
  }
 
  exportToCsv(): void {
    console.log('Exporting Mastercard invoices to CSV...');
    
    const params = this.getFilterParams();
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.billingService.getMastercardInvoices(params).subscribe({
      next: (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) &&
        'content' in data && 'totalElements' in data) {
        const paginatedData = data as { content: MastercardInvoiceDetailDto[], totalElements: number, totalPages: number };
        // Convert data to CSV
        const csv = this.convertToCsv(paginatedData .content);
        console.log('CSV data:', csv);
        this.downloadCsv(csv, 'mastercard-invoices.csv');
      }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to export Mastercard invoices. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  private convertToCsv(data: MastercardInvoiceDetailDto[]): string {
    if (!data || data.length === 0) {
      return '';
    }
    
    const headers = this.exportColumns;
    
    const headerRow = headers.map(header => `"${this.getColumnDisplayName(header)}"`).join(',');
    
    const dataRows = data.map(item => {
      return headers.map(header => {
        const value = item[header as keyof MastercardInvoiceDetailDto];
          return `"${value || ''}"`;
       
      }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
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

  getFilterParams(): MastercardInvoiceQueryParams & { page: number, size: number } {
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
      invoiceNumber: 'Invoice Number',
      billingCycleDate: 'Billing Cycle Date',
      activityIca: 'Activity ICA',
      eventId: 'Event ID',
      eventDescription: 'Event Description',
      totalCharge: 'Total Charge',
      currency: 'Currency'
    };
    return columnMappings[column] || column;
  }
}