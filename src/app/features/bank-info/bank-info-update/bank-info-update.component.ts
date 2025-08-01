import { Component, OnInit,OnDestroy,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterModule,ActivatedRoute } from '@angular/router';
import { BankService } from '../../../core/services/bank.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule ,Validators} from '@angular/forms';
import { BankInfoDetailDto,BankInfoRequestDto } from '../../../core/models/invoice.models';
import { Subscription } from 'rxjs';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-bank-info-update',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,SharedModule],
  templateUrl: './bank-info-update.component.html',
  styleUrl: './bank-info-update.component.scss'
})
export class BankInfoUpdateComponent  implements OnInit, OnDestroy {
    private translate = inject(TranslateService);
    mantisConfig = MantisConfig;
    bankInfoForm: FormGroup;
    bankId: string | null = null;
    bank: BankInfoDetailDto | null = null;
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    private subscriptions: Subscription[] = [];
   
    constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private bankService: BankService
    ) {  this.bankInfoForm = this.fb.group({
            bankName: ['', [Validators.required]],
            billableIca: ['', [Validators.required]],
            currency: ['', [Validators.required]],
            country: ['', [Validators.required]],
          });}
  
    ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.bankId = params.get('id');
        if (this.bankId) {
          this.loadBankDetails(this.bankId);
        } else {
          this.errorMessage = this.translate.instant('ERRORS.BANKS.missing_id');
        }
      });
      this.translate.use(this.mantisConfig.i18n);
    }

    ngOnDestroy(): void {
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }
  
    loadBankDetails(id: string): void {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.bankService.getBankById(id).subscribe({
        next: (data) => {
          this.bank = data;
          this.bankInfoForm.patchValue({
            bankName: this.bank.bankName,
            billableIca: this.bank.billableIca,
            currency: this.bank.currency,
            country: this.bank.country
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading bank details:', error);
          this.errorMessage = this.translate.instant('ERRORS.BANKS.load_details');
          this.isLoading = false;
        }
      });
    }
    onSubmit(): void {
      if (this.bankInfoForm.invalid) {
        return;
      }
      this.bankInfoForm.get('billableIca')?.enable();
      if (this.bankInfoForm.valid) {
        const updatedBankInfo: BankInfoRequestDto = {
          ...this.bankInfoForm.value
        };
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.subscriptions.push(
        this.bankService.updateBank(updatedBankInfo).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.successMessage = this.translate.instant('SUCCESS.BANKS.update');
            this.bankInfoForm.get('billableIca')?.disable();
            setTimeout(() => {
              this.navigateToBanks();
            }, 3000);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating bank information:', error);
            this.errorMessage = this.translate.instant('ERRORS.BANKS.update');
          }
        })
      );
    }
  }
  
    navigateToBanks(): void {
      this.router.navigate(['/bank/list']);
    }
    
    resetFilter(): void {
      this.bankInfoForm.reset();
      this.loadBankDetails(this.bankId);
    }
}
