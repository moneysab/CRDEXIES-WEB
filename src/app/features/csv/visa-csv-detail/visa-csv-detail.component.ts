import { Component, OnInit ,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute,Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BillingService } from '../../../core/services/billing.service';
import { VisaInvoiceDetailDto, VisaInvoiceQueryParams } from '../../../core/models/invoice.models';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-visa-csv-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule,SharedModule],
  templateUrl: './visa-csv-detail.component.html',
  styleUrl: './visa-csv-detail.component.scss'
})
export class VisaCsvDetailComponent implements OnInit{
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  Math = Math;
  invoices: VisaInvoiceDetailDto[] = [];
  isLoading = false;
  errorMessage = '';
  
  csvName: string = '';

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  filterForm: FormGroup;
  showAdvancedFilters = false;
  advancedFilterFields = [
    { name: 'totalMin', label: 'TOTAL_MIN', type: 'number' },
    { name: 'totalMax', label: 'TOTAL_MAX', type: 'number' },
    { name: 'billingLine', label: 'BILLING_LINE', type: 'text' },
    { name: 'entityName', label: 'ENTITY_NAME', type: 'text' },
    { name: 'description', label: 'DESCRIPTION', type: 'text' }
  ];
  constructor(
    private route: ActivatedRoute,
    private billingService: BillingService,
    private fb: FormBuilder,
    private router: Router 
  ) {
    this.filterForm = this.fb.group({
      billingPeriod: [''],
      invoiceId: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const csvName = params.get('csvName');
  
      if ( !csvName) {
        this.errorMessage = 'Missing  CSV name';
        return;
      }
  
      this.csvName = csvName;
      this.loadInvoices();
    });
    this.translate.use(this.mantisConfig.i18n);
  }
loadInvoices(): void {
    this.isLoading = true;
    
    const params: VisaInvoiceQueryParams = {
      csvName: this.csvName,
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
        currency: currency
      }).format(amount);
    } catch (e) {
      
      return amount.toString();
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '–';
    }
    return new Date(date).toLocaleDateString();
  }

  navigateToCsvList(): void {
    this.router.navigate(['/csv-files']);
  }
  navigateToUpload(): void {
    this.router.navigate(['/invoices/visa/upload']);
  }
}
