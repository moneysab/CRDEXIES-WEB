import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BillingService } from '../../../../core/services/billing.service';
import { VisaInvoiceDetailDto } from '../../../../core/models/invoice.models';

@Component({
  selector: 'app-visa-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './visa-invoice-detail.component.html',
  styleUrls: ['./visa-invoice-detail.component.scss']
})
export class VisaInvoiceDetailComponent implements OnInit {
  invoiceId: string = '';
  invoice: VisaInvoiceDetailDto | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.invoiceId = id;
        this.loadInvoiceDetails();
      } else {
        this.errorMessage = 'Invalid invoice ID';
      }
    });
  }

  loadInvoiceDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.billingService.getVisaInvoiceById(this.invoiceId).subscribe({
      next: (data) => {
        this.invoice = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoice details:', error);
        this.isLoading = false;
        
        if (error.status === 404) {
          this.errorMessage = 'Invoice not found. It may have been deleted or the ID is incorrect.';
        } else {
          this.errorMessage = 'Failed to load invoice details. Please try again later.';
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/invoices/visa/list']);
  }

  formatCurrency(amount: number | undefined, currency: string = 'USD'): string {
    if (amount === undefined || amount === null) {
      return '–';
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '–';
    }
    return new Date(date).toLocaleDateString();
  }
}