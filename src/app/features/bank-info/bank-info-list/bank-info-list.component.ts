import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterModule } from '@angular/router';
import { BankService } from '../../../core/services/bank.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BankInfoDetailDto,BankInfoQueryParams } from '../../../core/models/invoice.models';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-bank-info-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SharedModule],
  templateUrl: './bank-info-list.component.html',
  styleUrl: './bank-info-list.component.scss'
})
export class BankInfoListComponent implements OnInit{
private translate = inject(TranslateService);
 mantisConfig = MantisConfig;
 successMessage = '';
  errorMessage = '';
  
  
  bankInfoDetail: BankInfoDetailDto[] = [];
  isLoading = false;
  bankListError = '';

  Math = Math;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  filterForm: FormGroup;
constructor(
    private bankService: BankService,
    private fb: FormBuilder,
    private router: Router 
  ) {
    this.filterForm = this.fb.group({
      bankName: [''],
      billableIca:[''],
      startDate: [''],
      endDate: [''],
      createdBy: ['']
    });
  }
  ngOnInit(): void {
    this.loadBankList();
    this.translate.use(this.mantisConfig.i18n);
  }

  loadBankList(): void {
    this.isLoading = true;
    this.bankListError = '';
     const params: BankInfoQueryParams = {
          page: this.currentPage,
          size: this.pageSize,
          ...this.filterForm.value
        };
        
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key];
          }
        });
    const sub = this.bankService.getBankList(params).subscribe({
      next: (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) &&
        'content' in data && 'totalElements' in data && 'totalPages' in data) {
        const paginatedData = data as { content: BankInfoDetailDto[], totalElements: number, totalPages: number };
        this.totalElements = paginatedData.totalElements;
        this.bankInfoDetail = paginatedData.content;
        this.totalPages = paginatedData.totalPages;
        this.isLoading = false;
         } else{
        this.bankInfoDetail = data;
        this.isLoading = false;
      }},
      error: (error) => {
        console.error('Error loading list of banks:', error);
        this.bankListError =  this.translate.instant('ERRORS.BANKS.list');
        this.isLoading = false;
      }
    });
  }
  refreshBankList(): void {
    this.loadBankList();

  }
  applyFilter(): void {
    this.currentPage = 0; 
    this.loadBankList();
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadBankList();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadBankList();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadBankList();
    }
  }

  nextPage(): void {
    
    if ((this.currentPage + 1)  < this.totalPages) {
      this.currentPage++;
      this.loadBankList();
    }
  }
  formatDate(date: string | undefined): string {
    if (!date) {
      return '–';
    }
    return new Date(date).toLocaleDateString();
  }

  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToBankCreation(): void {
    this.router.navigate(['/bank/create']);
  }

}
