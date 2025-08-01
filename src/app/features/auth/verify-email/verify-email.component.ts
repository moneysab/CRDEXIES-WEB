import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/authentication/auth.service';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,SharedModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  verifyForm: FormGroup;
  email: string = '';
  isLoading = false;
  isSuccess = false;
  isError = false;
  message = '';
  resendRequested = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.verifyForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    // Get email from query params
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
      else {
        this.email = sessionStorage.getItem('email') || '';
      }
    });
  }

  onSubmit(): void {
    if (this.verifyForm.invalid || !this.email) {
      return;
    }

    this.isLoading = true;
    this.isSuccess = false;
    this.isError = false;
    this.message = '';

    const otp = this.verifyForm.value.otp;

    this.authService.verifyEmail(this.email, otp).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = this.translate.instant('SUCCESS.VERIFY_EMAIL.emailVerified');
        sessionStorage.removeItem('email');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        if (error.status === 400) {
          this.message = this.translate.instant('ERRORS.VERIFY_EMAIL.invalidCode');
        } else {
          this.message = this.translate.instant('ERRORS.generic');
        }
        console.error('Email verification error:', error);
      }
    });
  }

  requestNewCode(): void {
    if (!this.email) {
      this.isError = true;
      this.message = this.translate.instant('ERRORS.VERIFY_EMAIL.emailRequired');
      return;
    }

    this.isLoading = true;
    this.isSuccess = false;
    this.isError = false;
    this.message = '';
    this.resendRequested = true;

    this.authService.requestVerificationEmail(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = this.translate.instant('SUCCESS.VERIFY_EMAIL.resendSuccess');
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        this.message = this.translate.instant('ERRORS.VERIFY_EMAIL.resendFailed');
        console.error('Request new verification code error:', error);
      }
    });
  }
}