import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,ActivatedRoute ,Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule ,FormBuilder, FormGroup, Validators} from '@angular/forms';
import { EpinService } from '../../../../core/services/epin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { MantisConfig } from 'src/app/app-config';
import {ChargesDetails,VisaSettlementQueryParams} from '../../../../core/models/epin.models';

@Component({
  selector: 'app-charges-report',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule],
  
  templateUrl: './charges-report.component.html',
  styleUrl: './charges-report.component.scss'
})
export class ChargesReportComponent implements OnInit{
  
    chargesData: ChargesDetails| null = null;
    kpiForm: FormGroup;
    isLoading = false;
    error: string | null = null;
    currency: string = '978'; 
    

   
    
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
      
      this.loadChargesDetail();
    }
  
    loadChargesDetail(): void {
      this.isLoading = true;
      this.error = null;
      
      const params: VisaSettlementQueryParams = {
        startDate: this.kpiForm.value.startDate!,
        endDate: this.kpiForm.value.endDate!,
        currencyCode: this.kpiForm.value.currencyCode!,
        binCode: this.kpiForm.value.binCode!,
      };
      
      this.epinService.getChargesDetails(params).subscribe({
        next: (response) => {
          console.log('Charges detail ', response);
          this.chargesData = response;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading  Charges Data:', error);
          this.error = this.translate.instant('ERRORS.LOAD_CHARGES_FAILED');
          this.isLoading = false;
        }
      });
    }
  
    applyFilters(): void {
      this.currency = this.kpiForm.value.currencyCode ;
      this.loadChargesDetail();
    }
  
    resetFilters(): void {
      this.kpiForm.reset({
        currencyCode: '978'
      });
      
      this.loadChargesDetail();
    }
  
    onPageChange(page: number): void {
      this.loadChargesDetail();
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
  
    navigateToInterchangeReport() {
      this.router.navigate(['/epin/reports/interchange']);
    }
  
    navigateToReimbursementReport() {     
      this.router.navigate(['/epin/reports/reimbursement']); 
    }
    
    navigateToUpload() {
      this.router.navigate(['/epin/upload']);
    }

    navigateToSumamry() {
      this.router.navigate(['/epin/reports/issuer-kpis']);
    }
    
    exportChargesToCsv(): void {
      const rows: string[] = [];
      var data= this.chargesData || {};
      rows.push([
        'BusinessMode',
        'ChargeType',
        'TransactionType',
        'TransactionCycle',
        'Jurisdiction',
        'Routing',
        'Count',
        'InterchangeAmount',
        'VisaChargesCredits',
        'VisaChargesDebits',
        'NetAmount',
        'Sign'
      ].join(','));
    
      data.businessModes?.forEach(bm => {
        bm.chargeTypes?.forEach(ct => {
          ct.transactionTypes?.forEach(tt => {
            tt.cycles?.forEach(cycle => {
              cycle.jurisdictions?.forEach(jur => {
                jur.routings?.forEach(routing => {
                  rows.push([
                    bm.businessMode || '',
                    ct.chargeTypeCode || '',
                    tt.transactionType || '',
                    cycle.transactionCycle || '',
                    jur.jurisdictionCode || '',
                    routing.routing || '',
                    routing.count ?? '',
                    routing.interchangeAmount ?? '',
                    routing.visaChargesCredits ?? '',
                    routing.visaChargesDebits ?? '',
                    routing.netAmount ?? '',
                    routing.amountSign ? `"${routing.amountSign}"` : ''
                  ].join(','));
                });
              });
            });
          });
    
          rows.push([
            `Total ChargeType: ${ct.chargeTypeCode || ''}`,
            '', '', '', '', '',
            ct.totalCount ?? '',
            ct.totalInterchangeAmount ?? '',
            ct.totalVisaChargesCredits ?? '',
            ct.totalVisaChargesDebits ?? '',
            ct.netAmount ?? '',
            ct.amountSign ? `"${ct.amountSign}"` : ''
          ].join(','));
          rows.push('');

        });
    
        rows.push([
          `Total BusinessMode: ${bm.businessMode || ''}`,
          '', '', '', '', '',
          bm.totalCount ?? '',
          bm.totalInterchangeAmount ?? '',
          bm.totalVisaChargesCredits ?? '',
          bm.totalVisaChargesDebits ?? '',
          bm.netAmount ?? '',
          bm.amountSign ? `"${bm.amountSign}"` : ''
        ].join(','));
        rows.push('');
      });
    
      const csvContent = rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'visa-charges-report.csv';
      link.click();
    }
    

}
