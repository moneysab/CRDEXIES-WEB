import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,ActivatedRoute ,Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule ,FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EpinService } from '../../../../core/services/epin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { MantisConfig } from 'src/app/app-config';
import {InterchangeDetails,VisaSettlementQueryParams} from '../../../../core/models/epin.models';

@Component({
  selector: 'app-interchange-repport',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule],
  templateUrl: './interchange-repport.component.html',
  styleUrl: './interchange-repport.component.scss'
})
export class InterchangeRepportComponent implements OnInit {

  interchangeData: InterchangeDetails| null = null;
  kpiForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  currency: string = '978'; 

  
  // Filter parameters
  startDate: string = '';
  endDate: string = '';
 
  
  // Make Math available to the template
  Math = Math;
  
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  constructor(
    private epinService: EpinService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.kpiForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      currencyCode: ['978', [Validators.required]],
      binCode: [''],
    });
  }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.route.queryParams.subscribe(params => {
      if (params['startDate']) {
        this.kpiForm.patchValue({ startDate: params['startDate'] });
      }
      if (params['endDate']) {
        this.kpiForm.patchValue({ endDate: params['endDate'] });
      }
      if (params['currencyCode']) {
        this.kpiForm.patchValue({ currencyCode: params['currencyCode'] });
      }
      if (params['binCode']) {
        this.kpiForm.patchValue({ binCode: params['binCode'] });
      }
    });
    
    this.loadInterchangeDetail();
  }

  loadInterchangeDetail(): void {
    this.isLoading = true;
    this.error = null;
    
    const params: VisaSettlementQueryParams = {
      startDate: this.kpiForm.value.startDate!,
      endDate: this.kpiForm.value.endDate!,
      currencyCode: this.kpiForm.value.currencyCode!,
      binCode: this.kpiForm.value.binCode!,
    };
    
    this.epinService.getInterchangeDetails(params).subscribe({
      next: (response) => {
        console.log('Interchange detail ', response);
        this.interchangeData = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading  interchange Data:', error);
        this.error = this.translate.instant('ERRORS.LOAD_INTERCHANGE_FAILED');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currency= this.kpiForm.value.currencyCode || '978'; 
    this.loadInterchangeDetail();
  }

  resetFilters(): void {
    this.kpiForm.reset({
      currencyCode: '978'
    });
    
    this.loadInterchangeDetail();
  }

  onPageChange(page: number): void {
    this.loadInterchangeDetail();
  }


  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getToday(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getStartOfYear(): string {
    const date = new Date();
    date.setMonth(0); 
    date.setDate(1);  
    return date.toISOString().split('T')[0];
  }
  getCurrencyLabel(code: string): string {
    switch (code) {
      case '978': return 'EUR';
      case '840': return 'USD';
      default: return code;
    }
  }

  formatCurrency(value: number, currencyCode: string): string {
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
      currency: currency
    }).format(value);
  }
  

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  }

  navigateToReimbursementReport() {     
    this.router.navigate(['/epin/reports/reimbursement']); 
  }
  
  navigateToChargesReport() {      
    this.router.navigate(['/epin/reports/charges']);
  }
  
  navigateToUpload() {
    this.router.navigate(['/epin/upload']);
  }

  navigateToSumamry() {
    this.router.navigate(['/epin/reports/issuer-kpis']);
  }

  exportInterchangeToCsv(): void {
    const rows: string[] = [];
    const data = this.interchangeData || {};
  

    rows.push([
      'BusinessMode',
      'TransactionType',
      'TransactionCycle',
      'RateTableId',
      'Count',
      'ClearingAmount',
      'InterchangeCredits',
      'InterchangeDebits',
      'NetAmount',
      'Sign'
    ].join(','));
  
    data.businessModes?.forEach(bm => {
      bm.transactionTypes?.forEach(tt => {
        tt.cycles?.forEach(cycle => {
          rows.push([
            bm.businessMode || '',
            tt.transactionType || '',
            cycle.transactionCycle || '',
            cycle.rateTableId || '',
            cycle.count ?? '',
            cycle.clearingAmount ?? '',
            cycle.interchangeCredits ?? '',
            cycle.interchangeDebits ?? '',
            cycle.netAmount ?? '',
            cycle.amountSign ? `"${cycle.amountSign}"` : ''
          ].join(','));
        });
  
      
        rows.push([
          `Total TransactionType: ${tt.transactionType || ''}`,
          '', '', '',
          tt.totalCount ?? '',
          tt.totalClearingAmount ?? '',
          tt.totalInterchangeCredits ?? '',
          tt.totalInterchangeDebits ?? '',
          tt.netAmount ?? '',
          tt.amountSign ? `"${tt.amountSign}"` : ''
        ].join(','));
        rows.push('');
      });
  
  
      rows.push([
        `Total BusinessMode: ${bm.businessMode || ''}`,
        '', '', '',
        bm.totalCount ?? '',
        bm.totalClearingAmount ?? '',
        bm.totalInterchangeCredits ?? '',
        bm.totalInterchangeDebits ?? '',
        bm.netAmount ?? '',
        bm.amountSign ? `"${bm.amountSign}"` : ''
      ].join(','));
  
      rows.push(''); 
    });
  
  
    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'visa-interchange-report.csv';
    link.click();
  }
  

}
