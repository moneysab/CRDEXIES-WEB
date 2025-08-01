import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IpmService } from 'src/app/core/services/ipm.service';
import { IpmTransaction, IpmTransactionParams } from 'src/app/core/models/ipm.models';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { MantisConfig } from 'src/app/app-config';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-ipm-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule],
  templateUrl: './ipm-transactions.component.html',
  styleUrl: './ipm-transactions.component.scss'
})
export class IpmTransactionsComponent implements OnInit {
  mantisConfig = MantisConfig;
  private translate = inject(TranslateService);
  filterForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  transactions: IpmTransaction[] = [];
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  //Filter options
  members:string [] = [];
  acceptanceBrands: string[] = [];
  currencies: string[] = [];

  constructor(
    private ipmService: IpmService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      memberId: [''],
      acceptanceBrand: [''],
      businessServiceId: [''],
      clearingCycle: [''],
      transactionType: [''],
      currencyCode: [''],
      isValid: [''],
      startDate: [''],
      endDate: [''],
      sortBy: ['processingDate'],
      sortDir: ['desc']
    });
  }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.loadFilterOptions();
    this.loadTransactions();
  }

  loadFilterOptions() {
   
    this.ipmService.getMembers().subscribe({
      next: (data) => {
        this.members = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des Members', err);
        this.members = [];
      }
    });
  

    this.ipmService.getAcceptanceBrands().subscribe({
      next: (data) => {
        this.acceptanceBrands = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des Acceptance Brands', err);
        this.acceptanceBrands = [];
      }
    });
  
    // Currencies
    this.ipmService.getCurrencies().subscribe({
      next: (data) => {
        this.currencies = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des devises', err);
        this.currencies = [];
      }
    });
  }


  loadTransactions(): void {
    this.isLoading = true;
    const params: IpmTransactionParams = {
      ...this.filterForm.value,
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

  applyFilters(): void {
    this.currentPage = 0;
    this.loadTransactions();
  }

  resetFilters(): void {
    this.filterForm.reset({
      memberId: '',
      acceptanceBrand: '',
      businessServiceId: '',
      clearingCycle: '',
      transactionType: '',
      currencyCode: '',
      startDate: '',
      endDate: '',
      sortBy: 'processingDate',
      sortDir: 'desc'
    });
    this.applyFilters();
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

  formatNumber(value: number | null | undefined): string {
    return value !== undefined && value !== null ? value.toFixed(2) : '';
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '–';
    }
    return new Date(date).toLocaleDateString();
  }

  exportToExcel(): void {
    const params: IpmTransactionParams = {
      ...this.filterForm.value,
      page: 0,
      size: this.totalElements
    };
    Object.keys(params).forEach(key => {
      if (params[key] === '') {
        delete params[key];
      }
    });

    this.ipmService.getIpmTransactions(params).subscribe({
      next: (data) => {
        let allTransactions: IpmTransaction[] = [];
        if (data && typeof data === 'object' && !Array.isArray(data) &&
            'content' in data) {
          allTransactions = data.content;
        } else {
          allTransactions = Array.isArray(data) ? data : [];
        }

        this.generateExcelFile(allTransactions);
      },
      error: (error) => {
        console.error('Error exporting transactions:', error);
      }
    });
  }

  generateExcelFile(transactions: IpmTransaction[]): void {
    const dataToExport = transactions.map((t, index) => ({
      '#': index + 1,
      'Member ID': t.memberId,
      'File ID': t.fileId,
      'Clearing Cycle': t.clearingCycle,
      'Brand': t.acceptanceBrand,
      'Business Service': t.businessServiceId,
      'Service Level': t.businessServiceLevel,
      'Transaction Type': t.transactionType,
      'Process Code': t.processCode,
      'IRD Code': t.irdCode,
      'Transaction Count': t.transactionCount,
      'Recon Amount': t.reconAmount != null ? `${t.reconAmount.toFixed(2)} ${t.reconCrDrIndicator ?? ''}` : '',
      'Fee Amount': t.feeAmount != null ? `${t.feeAmount.toFixed(2)} ${t.feeCrDrIndicator ?? ''}` : '',
      'Currency': t.reconCurrencyCode,
      'Processing Date': this.formatDate(t.processingDate),
      'Run Date': this.formatDate(t.runDate),
      'Valid': t.isValid ? 'Yes' : 'No',
      'Errors': t.validationErrors ?? ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = { Sheets: { 'Transactions': worksheet }, SheetNames: ['Transactions'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const today = new Date();
    const fileName = `transactions_${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.xlsx`;

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, fileName);
  }
}
