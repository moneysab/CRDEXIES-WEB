import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EpinService } from '../../../../core/services/epin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { MantisConfig } from 'src/app/app-config';

@Component({
  selector: 'app-country-channel-revenues',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule],
  templateUrl: './country-channel-revenues.component.html',
  styleUrls: ['./country-channel-revenues.component.scss']
})
export class CountryChannelRevenuesComponent implements OnInit {
  revenueData: any[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Filter parameters
  startDate: string = '';
  endDate: string = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  
  // Make Math available to the template
  Math = Math;
  
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  constructor(private epinService: EpinService) {}

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    
    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.endDate = this.formatDateForInput(today);
    this.startDate = this.formatDateForInput(thirtyDaysAgo);
    
    this.loadRevenueData();
  }

  loadRevenueData(): void {
    this.isLoading = true;
    this.error = null;
    
    const params = {
      startDate: this.startDate,
      endDate: this.endDate,
      page: this.currentPage.toString(),
      size: this.pageSize.toString()
    };
    
    this.epinService.getCountryChannelRevenues(params).subscribe({
      next: (response) => {
        this.revenueData = response.content || [];
        this.totalItems = response.totalElements || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading country/channel revenues:', error);
        this.error = 'Failed to load revenue data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when applying filters
    this.loadRevenueData();
  }

  resetFilters(): void {
    // Reset to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.endDate = this.formatDateForInput(today);
    this.startDate = this.formatDateForInput(thirtyDaysAgo);
    
    this.currentPage = 1;
    this.loadRevenueData();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRevenueData();
  }

  exportData(format: 'csv' | 'excel'): void {
    const params = {
      startDate: this.startDate,
      endDate: this.endDate
    };
    
    this.epinService.exportReport(format, params).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `country-channel-revenues-${this.startDate}-to-${this.endDate}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error(`Error exporting ${format}:`, error);
        this.error = `Failed to export ${format}. Please try again.`;
      }
    });
  }

  // Helper methods
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
}