import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BillingService } from '../../../../core/services/billing.service';
import { MastercardInvoiceDetailDto } from '../../../../core/models/invoice.models';

@Component({
  selector: 'app-mastercard-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mastercard-invoice-detail.component.html',
  styleUrls: ['./mastercard-invoice-detail.component.scss']
})
export class MastercardInvoiceDetailComponent implements OnInit {
  invoiceId: string | null = null;
  invoice: MastercardInvoiceDetailDto | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.invoiceId = params.get('id');
      if (this.invoiceId) {
        this.loadInvoiceDetails(this.invoiceId);
      } else {
        this.errorMessage = 'Invoice ID is missing.';
      }
    });
  }

  loadInvoiceDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.billingService.getMastercardInvoiceById(id).subscribe({
      next: (data) => {
        this.invoice = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading Mastercard invoice details:', error);
        this.errorMessage = 'Failed to load invoice details. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  formatCurrency(amount: number | undefined, currency: string = 'USD'): string {
    if (amount === undefined || amount === null) {
      return '–';
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '–';
    }
    return new Date(date).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/invoices/mastercard/list']);
  }
}