import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BillingService } from '../../../../core/services/billing.service';
import { ServiceBreakdownResponseDto, MastercardSummaryQueryParams } from '../../../../core/models/invoice.models';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { TokenService } from 'src/app/core/services/token.service';
import { Role } from 'src/app/theme/shared/components/_helpers/role';
import { end } from '@popperjs/core';
@Component({
  selector: 'app-mastercard-breakdown',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule,SharedModule],
  templateUrl: './mastercard-breakdown.component.html',
  styleUrl: './mastercard-breakdown.component.scss',
  host: {
    '[class.visa-active]': 'activeProvider === "visa"',
    '[class.mastercard-active]': 'activeProvider === "mastercard"'
  }
})
export class MastercardBreakdownComponent implements OnInit{
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  Math = Math;
  invoices: ServiceBreakdownResponseDto[] = [];
  isLoading = false;
  errorMessage = '';
  activeProvider = 'mastercard'; // 'visa' or 'mastercard'

  allowedRoles = [Role.AdminMastercard, Role.ManagerMastercard];
  allowedRolesVisa = [Role.AdminVisa, Role.ManagerVisa];
  currentUserRoles: string[] = [];
  canAccessVisa = false;
  canAccessMastercard = false;
   
  
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
      startDate: [''],
      endDate: [''],
      invoiceNumber: [''],
      feeType: [''],
      activityIca: [''],
      serviceCode: [''],
      currency: [''],
    });
  }
  ngOnInit(): void {
  this.translate.use(this.mantisConfig.i18n);
      
   this.currentUserRoles = this.tokenService.decodeToken()?.roles || [];
        
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
    if (this.activeProvider !== provider) {
      // Navigate to the appropriate provider's breakdown page
      this.router.navigate([`/invoices/${provider}/breakdown`]);
    }
  }
  loadInvoices(): void {
    this.isLoading = true;
    
    const params: MastercardSummaryQueryParams = {
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
    
    this.billingService.getMasterCardServiceBreakdown(params).subscribe({
      next: (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) &&
                      'content' in data && 'totalElements' in data && 'totalPages' in data) {
                    const paginatedData = data as { content: ServiceBreakdownResponseDto[], totalElements: number, totalPages: number };
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
        console.error('Error loading Mastercard services breakdown:', error);
        this.errorMessage = this.translate.instant('ERRORS.Breakdown');
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

  formatCurrency(value: number, currencyCode: string): string {
    if (value === null || value === undefined) return '';

    let locale = 'en-US';
    let currency = 'USD';
  
    if (currencyCode === 'EUR') {
      locale = 'fr-FR';
      currency = 'EUR';
    } else if (currencyCode === 'USD') {
      locale = 'en-US';
      currency = 'USD';
    }
  
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
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

  navigateToSummary(): void {
    this.router.navigate([`/invoices/${this.activeProvider}/summary`]);
  }
  
  navigateToUpload(): void {
    this.router.navigate([`/invoices/${this.activeProvider}/upload`]);
  }

  exportBreakdownToCsv(): void {
    console.log('Exporting Mastercard breakdown to CSV...');
  
    const params = this.getFilterParams(); 
    this.isLoading = true;
    this.errorMessage = '';
  
    this.billingService.getMasterCardServiceBreakdown(params).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (
          data && typeof data === 'object' && !Array.isArray(data) &&
          'content' in data && 'totalElements' in data
        ) {
          const allInvoices = (data as { content: ServiceBreakdownResponseDto[] }).content;
          const csv = this.convertBreakdownToCsv(allInvoices);
          this.downloadCsv(csv, 'mastercard-breakdown-report.csv');
        } else {
          this.errorMessage = 'Invalid data format for export';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to export breakdown. Please try again later.';
        console.error('Error exporting:', error);
      }
    });
  }
  getFilterParams(): MastercardSummaryQueryParams & { page: number; size: number } {
    const params: any = {
      page: 0,
      size: this.totalElements||10,
      ...this.filterForm.value
    };
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });
  
    return params;
  }
  private convertBreakdownToCsv(data: ServiceBreakdownResponseDto[]): string {
    if (!data || data.length === 0) {
      return '';
    }
  
    const headers = ['ServiceCode', 'Description', 'TotalAmount'];
    const rows = [headers.join(',')];
  
    data.forEach(item => {
      rows.push([
        item.serviceCode || '',
        item.description || '',
        item.totalAmount ?? ''
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
  
 
  }
