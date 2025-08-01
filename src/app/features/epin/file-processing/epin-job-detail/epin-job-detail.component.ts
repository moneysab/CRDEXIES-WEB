import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { EpinService } from '../../../../core/services/epin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { MantisConfig } from 'src/app/app-config';
import {FileProcessingJob } from '../../../../core/models/epin.models';


@Component({
  selector: 'app-epin-job-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './epin-job-detail.component.html',
  styleUrls: ['./epin-job-detail.component.scss']
})
export class EpinJobDetailComponent implements OnInit {
  jobId: string = '';
  job: FileProcessingJob = null;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  constructor(
    private epinService: EpinService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.route.params.subscribe(params => {
      this.jobId = params['jobId'];
      this.loadJobDetails();
    });
  }

  loadJobDetails(): void {
    this.isLoading = true;
    this.error = null;
    
    this.epinService.getJobStatus(this.jobId).subscribe({
      next: (response) => {
        this.job = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading job details:', error);
        this.error = 'Failed to load job details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  retryJob(): void {
    this.isLoading = true;
    
    this.epinService.retryJob(this.jobId).subscribe({
      next: () => {
        this.successMessage = 'Job retry initiated successfully.';
        this.loadJobDetails();
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (error) => {
        console.error('Error retrying job:', error);
        this.error = 'Failed to retry job. Please try again.';
        this.isLoading = false;
      }
    });
  }

  cancelJob(): void {
    this.isLoading = true;
    
    this.epinService.cancelJob(this.jobId).subscribe({
      next: () => {
        this.successMessage = 'Job cancelled successfully.';
        this.loadJobDetails();
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (error) => {
        console.error('Error cancelling job:', error);
        this.error = 'Failed to cancel job. Please try again.';
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

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  navigateToJobs(): void {
    this.router.navigate(['/epin/jobs']);
  }
}