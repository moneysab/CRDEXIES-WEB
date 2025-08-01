import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IpmService } from 'src/app/core/services/ipm.service';
import { IpmSummary, IpmSumamryParams } from 'src/app/core/models/ipm.models';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { TokenService } from 'src/app/core/services/token.service';
import { Role } from 'src/app/theme/shared/components/_helpers/role';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
@Component({
  selector: 'app-ipm-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule],
  templateUrl: './ipm-summary.component.html',
  styleUrl: './ipm-summary.component.scss',
  host: {
    '[class.visa-active]': 'activeProvider === "visa"',
    '[class.mastercard-active]': 'activeProvider === "mastercard"'
  }
})
export class IpmSummaryComponent implements OnInit {
  private translate = inject(TranslateService);
  filterForm: FormGroup;
  mantisConfig = MantisConfig;

  isLoading = false;
  errorMessage = '';
  allowedRoles = [Role.AdminMastercard, Role.ManagerMastercard, Role.UserMastercard];
  allowedRolesVisa = [Role.AdminVisa, Role.ManagerVisa, Role.UserVisa];

  summaries: IpmSummary[] = [];
  currentUserRoles: string[] = [];
  canAccessVisa = false;
  canAccessMastercard = false;

//Filter options
  members:string [] = [];
  acceptanceBrands: string[] = [];
  currencies: string[] = [];

  activeProvider = 'mastercard';
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private ipmService: IpmService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      memberId: [''],
      acceptanceBrand: [''],
      businessServiceId: [''],
      summaryType: [''],
      currencyCode: [''],
      startDate: [''],
      endDate: [''],
      sortBy: ['processingDate'],
      sortDir: ['desc']
    });
  }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.loadFilterOptions();
    this.loadSummaries();
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

  loadSummaries(): void {
    this.isLoading = true;
    const params: IpmSumamryParams = {
      ...this.filterForm.value,
      page: this.currentPage,
      size: this.pageSize
    };
    Object.keys(params).forEach(key => {
      if (params[key] === '') {
        delete params[key];
      }
    });

    this.ipmService.getIpmSummary(params).subscribe({
      next: (data) => {
        console.log('Received Data:', data);
        if (data && typeof data === 'object' && !Array.isArray(data) &&
          'content' in data && 'totalElements' in data) {
          const paginatedData = data as { content: IpmSummary[], totalElements: number, totalPages: number };

          this.summaries = paginatedData.content;
          this.totalElements = paginatedData.totalElements;
          this.totalPages = paginatedData.totalPages;
          console.log('Paginated Data:', this.summaries);
          console.log('Total Elements:', this.totalElements);
          console.log('Total Pages:', this.totalPages);
        } else {
          this.summaries = Array.isArray(data) ? data : [];
          this.totalElements = this.summaries.length;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading Mastercard summary:', error);
        this.errorMessage = this.translate.instant('ERRORS.Summaries');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadSummaries();
  }

  resetFilters(): void {
    this.filterForm.reset({
      memberId: '',
      acceptanceBrand: '',
      businessServiceId: '',
      summaryType: '',
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
      this.loadSummaries();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadSummaries();
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
    const params: IpmSumamryParams = {
      ...this.filterForm.value,
      page: 0,
      size: this.totalElements,
    };

    Object.keys(params).forEach(key => {
      if (params[key] === '') {
        delete params[key];
      }
    });

    this.ipmService.getIpmSummary(params).subscribe({
      next: (data) => {
        let allSummaries: IpmSummary[] = [];
        if (data && typeof data === 'object' && !Array.isArray(data) &&
          'content' in data) {
          allSummaries = data.content;
        } else {
          allSummaries = Array.isArray(data) ? data : [];
        }

        this.generateExcelFile(allSummaries);
      },
      error: (error) => {
        console.error('Error exporting summaries:', error);
      }
    });
  }

  generateExcelFile(summaries: IpmSummary[]): void {
    const dataToExport = summaries.map((s, index) => ({
      '#': index + 1,
      'Member ID': s.memberId,
      'Brand': s.acceptanceBrand,
      'Business Service': s.businessServiceId,
      'Service Level': s.businessServiceLevel,
      'Summary Type': s.summaryType,
      'Currency': s.currencyCode,
      'Run Date': this.formatDate(s.runDate),
      'Reconciliation': s.reconAmount != null ? `${s.reconAmount.toFixed(2)} ${s.reconCrDrIndicator ?? ''}` : '',
      'Fee': s.feeAmount != null ? `${s.feeAmount.toFixed(2)} ${s.feeCrDrIndicator ?? ''}` : '',

    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = { Sheets: { 'Summaries': worksheet }, SheetNames: ['Summaries'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const today = new Date();
    const fileName = `summaries_${today.getFullYear()}-${(today.getMonth() + 1)
      .toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.xlsx`;

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, fileName);
  }
}
