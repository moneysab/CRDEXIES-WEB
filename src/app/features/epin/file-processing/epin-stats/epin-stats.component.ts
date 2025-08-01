import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { EpinService } from '../../../../core/services/epin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { MantisConfig } from 'src/app/app-config';
import {ProcessingStatistics,FileProcessingJob} from '../../../../core/models/epin.models';

@Component({
  selector: 'app-epin-stats',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './epin-stats.component.html',
  styleUrls: ['./epin-stats.component.scss']
})
export class EpinStatsComponent implements OnInit {
  stats: any = null;
  statistics: ProcessingStatistics | null = null;
  recentJobs: FileProcessingJob[] = [];
  isLoading = false;
  error: string | null = null;
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  constructor(
    private epinService: EpinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.error = null;
    
    this.epinService.getProcessingStats().subscribe({
      next: (response :ProcessingStatistics) => {
        this.statistics = response;
        this.recentJobs = response.recentJobs || [];
        console.log ('Loaded EPIN stats:', this.statistics);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading EPIN stats:', error);
        this.error = 'Failed to load processing statistics. Please try again.';
        this.isLoading = false;
      }
    });
  }

  navigateToJobs(): void {
    this.router.navigate(['/epin/jobs']);
  }

  navigateToUpload(): void {
    this.router.navigate(['/epin/upload']);
  }

  // Helper methods for displaying data
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-success';
      case 'processing':
        return 'text-primary';
      case 'pending':
        return 'text-warning';
      case 'failed':
        return 'text-danger';
      case 'cancelled':
        return 'text-secondary';
      default:
        return 'text-info';
    }
  }

  getSuccessRateClass(rate: number): string {
    if (rate >= 90) {
      return 'text-success';
    } else if (rate >= 70) {
      return 'text-warning';
    } else {
      return 'text-danger';
    }
  }

  formatNumber(value: number ): string {
    if (value === null || value === undefined) return '';

    const number = typeof value === 'string' ? parseFloat(value) : value;


    const rounded = Math.round(number); 

    const formatted = rounded.toLocaleString();

    return formatted;
  }

  formatPercentage(value: number): string {
    return value.toFixed(2) + '%';
  }
  formatDate(date: string | undefined): string {
    if (!date) {
      return '–';
    }
    return new Date(date).toLocaleDateString();
  }
}