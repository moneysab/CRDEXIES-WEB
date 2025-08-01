import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IpmService } from '../../../core/services/ipm.service';
import { IpmTransaction } from '../../../core/models/ipm.models';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MantisConfig } from 'src/app/app-config';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ipm-transactions-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './ipm-transactions-detail.component.html',
  styleUrl: './ipm-transactions-detail.component.scss'
})
export class IpmTransactionsDetailComponent implements OnInit {
  mantisConfig = MantisConfig;
 private translate = inject(TranslateService);
  
  transactionId: string | null = null;
  transaction: IpmTransaction | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ipmService: IpmService
  ) { }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.route.paramMap.subscribe(params => {
      this.transactionId = params.get('id');
      if (this.transactionId) {
        this.loadtransactionDetails(this.transactionId);
      } else {
        this.errorMessage = 'transaction ID is missing.';
      }
    });
    console.log('ippm', this.transaction);
  }

  loadtransactionDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.ipmService.getIpmTransactionById(id).subscribe({
      next: (data) => {
        this.transaction= data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading Mastercard transaction details:', error);
        this.errorMessage = 'Failed to load transaction details. Please try again later.';
        this.isLoading = false;
      }
    });
  }

 

  formatDate(date: string | undefined): string {
    if (!date) {
      return '–';
    }
    return new Date(date).toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/ipm/transactions']);
  }
}
