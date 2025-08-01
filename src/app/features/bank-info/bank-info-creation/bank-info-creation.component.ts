import { Component, OnInit, OnDestroy ,inject} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankService } from '../../../core/services/bank.service';
import { BankInfoRequestDto } from '../../../core/models/invoice.models';
import { RouterModule ,Router} from '@angular/router';
import { Subscription } from 'rxjs';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-bank-info-creation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,SharedModule],
  templateUrl: './bank-info-creation.component.html',
  styleUrl: './bank-info-creation.component.scss'
})
export class BankInfoCreationComponent implements OnInit,OnDestroy {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  bankInfoForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  private subscriptions: Subscription[] = [];
  constructor(
      private fb: FormBuilder,
      private bankService: BankService,
      private router: Router,
  
    ) {
      this.bankInfoForm = this.fb.group({
        bankName: ['', [Validators.required]],
        billableIca: ['', [Validators.required]],
        currency: ['USD', [Validators.required]],
        country: ['', [Validators.required]],
      });
    }
    ngOnDestroy(): void {
      // Clean up subscriptions to prevent memory leaks
      this.subscriptions.forEach(sub => sub.unsubscribe());
  
    }
  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
  }
  onSubmit(): void {
  this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const bankInfoData: BankInfoRequestDto = this.bankInfoForm.value;

    this.subscriptions.push(
      this.bankService.createBankInfo(bankInfoData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = this.translate.instant('SUCCESS.BANKS.create');
          setTimeout(() => {
            this.successMessage = '';
            this.navigateToBanks();
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error creating bank information:', error);
          this.errorMessage = this.translate.instant('ERRORS.BANKS.create');
        }
      })
    );
  }
  navigateToBanks(): void {
    this.router.navigate(['/bank/list']);
  }

  resetFilter(): void {
    this.bankInfoForm.reset({
      currency: 'USD'
    });
  }

}
