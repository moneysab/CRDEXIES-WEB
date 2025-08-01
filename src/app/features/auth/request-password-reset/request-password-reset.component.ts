import { Component,OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/authentication/auth.service';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-request-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,SharedModule],
  templateUrl: './request-password-reset.component.html',
  styleUrls: ['./request-password-reset.component.scss']
})
export class RequestPasswordResetComponent implements OnInit {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  resetForm: FormGroup;
  isLoading = false;
  isSuccess = false;
  isError = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
  }
  
  onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.isSuccess = false;
    this.isError = false;
    this.message = '';

    const email = this.resetForm.value.email;

    this.authService.requestResetPassword(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = this.translate.instant('SUCCESS.PASSWORD_RESET.instructionsSent');
        this.resetForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        
        if (error.status === 404) {
          this.message = this.translate.instant('ERRORS.PASSWORD_RESET.emailNotFound');
        } else if (error.status === 400) {
          this.message = this.translate.instant('ERRORS.PASSWORD_RESET.invalidEmail');
        } else {
          this.message = this.translate.instant('ERRORS.PASSWORD_RESET.generic');
        }
        
        console.error('Password reset request error:', error);
      }
    });
  }
}