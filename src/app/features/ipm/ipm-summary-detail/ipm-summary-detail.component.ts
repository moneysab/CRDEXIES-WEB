import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IpmService } from '../../../core/services/ipm.service';
import { IpmTransaction,IpmSummary,IpmTransactionParams } from '../../../core/models/ipm.models';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MantisConfig } from 'src/app/app-config';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ipm-summary-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './ipm-summary-detail.component.html',
  styleUrl: './ipm-summary-detail.component.scss'
})
export class IpmSummaryDetailComponent implements OnInit {
  mantisConfig = MantisConfig;
 private translate = inject(TranslateService);
  
  summaryId: string | null = null;
  transactions: IpmTransaction [] | null = null;
  summary: IpmSummary | null = null;
  isLoading = false;
  errorMessage = '';

  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ipmService: IpmService
  ) { }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.route.paramMap.subscribe(params => {
      this.summaryId = params.get('id');
      if (this.summaryId) {
        this.loadsummaryDetails(this.summaryId);
      } else {
        this.errorMessage = 'transaction ID is missing.';
      }
    });
  }

  loadsummaryDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.ipmService.getIpmSummaryById(id).subscribe({
      next: (data) => {
        this.summary= data;
        this.isLoading = false;
       this.loadTransactions(); 
      },
      error: (error) => {
        console.error('Error loading Mastercard summary details:', error);
        this.errorMessage = 'Failed to load transaction details. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  loadTransactions(): void {
    this.isLoading = true;
    const params: IpmTransactionParams = {
      memberId: this.summary?.memberId || '',
      acceptanceBrand: this.summary?.acceptanceBrand || '',
      businessServiceId: this.summary?.businessServiceId || '',
      clearingCycle: this.summary?.clearingCycle || '',
      startDate: this.summary?.runDate || '',
      endDate: this.summary?.runDate || '',
      page: this.currentPage,
      size: this.pageSize
    };
    // Clean empty values
    Object.keys(params).forEach(key => {
      if (params[key] === '') {
        delete params[key];
      }
    });

    this.ipmService.getIpmTransactions(params).subscribe({
      next: (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) &&
            'content' in data && 'totalElements' in data) {
          const paginatedData = data as { content: IpmTransaction[], totalElements: number, totalPages: number };
          this.transactions = paginatedData.content;
          this.totalElements = paginatedData.totalElements;
          this.totalPages = paginatedData.totalPages;
        } else {
          this.transactions = Array.isArray(data) ? data : [];
          this.totalElements = this.transactions.length;
        }
        this.isLoading = false;
   
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.errorMessage = this.translate.instant('ERRORS.Transactions');
        this.isLoading = false;
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadTransactions();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadTransactions();
    }
  }
 

  formatDate(date: string | undefined): string {
    if (!date) {
      return '–';
    }
    return new Date(date).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/ipm/summary']);
  }

}
