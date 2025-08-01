import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { EpinService } from '../../../../core/services/epin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MantisConfig } from 'src/app/app-config';
import { AuthenticationService } from 'src/app/theme/shared/service';
import { JobsQueryParams, FileProcessingJob } from '../../../../core/models/epin.models';

@Component({
  selector: 'app-epin-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule,ReactiveFormsModule, FormsModule, SharedModule],
  templateUrl: './epin-jobs.component.html',
  styleUrls: ['./epin-jobs.component.scss']
})
export class EpinJobsComponent implements OnInit {
  jobs: FileProcessingJob[] = [];
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  Math = Math;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  filterForm: FormGroup;
  constructor(
    private epinService: EpinService,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService
  ) { 
    this.filterForm = this.fb.group({
      jobsName: [''],
      status: [''],
      uploadDate: ['']
    });
  }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    this.error = null;
     const params: JobsQueryParams = {
          page: this.currentPage,
          size: this.pageSize,
          ...this.filterForm.value
        };


    this.epinService.getListJobs().subscribe({
      next: (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) &&
          'content' in data && 'totalElements' in data) {
          const paginatedData = data as { content: FileProcessingJob[], totalElements: number, totalPages: number };
          this.totalElements = paginatedData.totalElements;
          this.jobs = paginatedData.content;
          this.totalPages = paginatedData.totalPages;
        } else {
          this.jobs = Array.isArray(data) ? data : [];
          this.totalElements = this.jobs.length;
        }

        if (this.jobs.length === 0 && this.currentPage > 0) {
          this.currentPage--;
          this.loadJobs();
          return;
        }

        this.isLoading = false;
        console.log('Loaded EPIN jobs:', this.jobs);
      },
      error: (error) => {
        console.error('Error loading EPIN jobs:', error);
        this.error = this.translate.instant('ERRORS.LOAD_PROCESSING_JOBS_FAILED');
        this.isLoading = false;
      }
    });
  }

  viewJobDetails(jobId: string): void {
    this.router.navigate(['/epin/jobs', jobId]);
  }

  retryJob(jobId: string, event: Event): void {
    event.stopPropagation();
    this.isLoading = true;

    this.epinService.retryJob(jobId).subscribe({
      next: () => {
        this.successMessage = this.translate.instant('SUCCESS.RETRY_JOB_SUCCESS');
        this.loadJobs();
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (error) => {
        console.error('Error retrying job:', error);
        this.error = this.translate.instant('ERRORS.RETRY_JOB_FAILED');
        this.isLoading = false;
      }
    });
  }

  cancelJob(jobId: string, event: Event): void {
    event.stopPropagation();
    this.isLoading = true;

    this.epinService.cancelJob(jobId).subscribe({
      next: () => {
        this.successMessage = this.translate.instant('SUCCESS.CANCEL_JOB_SUCCESS');
        this.loadJobs();
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (error) => {
        console.error('Error cancelling job:', error);
        this.error = this.translate.instant('ERRORS.CANCEL_JOB_FAILED');
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'badge bg-success';
      case 'processing':
        return 'badge bg-primary';
      case 'pending':
        return 'badge bg-warning';
      case 'failed':
        return 'badge bg-danger';
      case 'cancelled':
        return 'badge bg-secondary';
      default:
        return 'badge bg-info';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '–';
    }
    return new Date(date).toLocaleDateString();
  }

  navigateToUpload(): void {
    this.router.navigate(['/epin/upload']);
  }
  goToPage(page: number): void {
    this.currentPage = page;
    this.loadJobs();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadJobs();
    }
  }

  nextPage(): void {
    if ((this.currentPage + 1) < this.totalPages) {
      this.currentPage++;
      this.loadJobs();
    }
  }
}