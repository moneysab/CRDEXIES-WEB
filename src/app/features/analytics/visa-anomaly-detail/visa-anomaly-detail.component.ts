import { Component, OnInit ,inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnomalyDto } from 'src/app/core/services/analytics.service';
import { VisaInvoiceDetailDto } from 'src/app/core/models/invoice.models';
import { BillingService } from 'src/app/core/services/billing.service';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-visa-anomaly-detail',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './visa-anomaly-detail.component.html',
  styleUrls: ['./visa-anomaly-detail.component.scss']
})
export class VisaAnomalyDetailComponent implements OnInit {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  anomaly: AnomalyDto | null = null;
  invoice: VisaInvoiceDetailDto | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService
  ) {}

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    const anomalyState = history.state.anomaly;
    if (anomalyState) {
      this.anomaly = anomalyState;
      this.loadInvoice(anomalyState.anomalyId);
    } else {
      this.errorMessage = 'Anomaly data is missing.';
    }
  }

  loadInvoice(invoiceId: string): void {
    this.isLoading = true;
    this.billingService.getVisaInvoiceById(invoiceId).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load invoice details.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/analytics'], { fragment: 'anomaliesTable' });
  }

  formatCurrency(amount: number | undefined, currency: string = 'USD'): string {
    if (amount === undefined || amount === null) return '–';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '–';
    return new Date(date).toLocaleDateString();
  }

  getGrowthIcon(value: number): string {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'flat';
  }
  
    getGrowthClass(value: number): string {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-danger';
    return 'text-neutral';
  }
}
