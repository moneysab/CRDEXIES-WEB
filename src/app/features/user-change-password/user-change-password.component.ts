import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {AuthService  } from '../../core/authentication/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,SharedModule],
  templateUrl: './user-change-password.component.html',
  styleUrl: './user-change-password.component.scss'
})
export class UserChangePasswordComponent implements OnInit {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  resetForm: FormGroup;
  isLoading = false;
  isSuccess = false;
  isError = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
  }
  onSubmit(): void {
    if (this.resetForm.invalid ) {
      return;
    }
    this.isLoading = true;
    this.isSuccess = false;
    this.isError = false;
    this.message = '';
    const newPassword = this.resetForm.value.newPassword;
    const oldPassword = this.resetForm.value.oldPassword;
    this.userService.changePassword(oldPassword, newPassword).subscribe({
      next: (response) => {
        console.log ('success', response);
        this.isLoading = false;
        this.isSuccess = true;
        this.message =this.translate.instant('SUCCESS.CHANGE_PASSWORD.success');
        setTimeout(() => {
          this.logout();
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        if (error.status === 200) {
          this.isLoading = false;
          this.isSuccess = true;
          this.isError = false;
          this.message = this.translate.instant('SUCCESS.CHANGE_PASSWORD.success');
    
          setTimeout(() => {
            this.logout();
          }, 3000);
        }
         else if (error.status === 401) {
          this.message = this.translate.instant('ERRORS.CHANGE_PASSWORD.invalidToken')
        } else {
          this.message = this.translate.instant('ERRORS.generic');
        }
        
        console.error('Password change error:', error);
      }
    });
  
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const oldPassword = formGroup.get('oldPassword')?.value;
    const password = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    if (oldPassword === password) {
      return  { passwordMatch: true };
    }

    if (password === confirmPassword && oldPassword !== password) {
      return null;
    }

    return { passwordMismatch: true };
  }

  logout(): void {
    this.authService.signOut().subscribe({
      next: () => {
        console.log('Successfully signed out');
      },
      error: (err) => {
        console.error('Error signing out:', err);
        this.authService.logout();
      }
    });
  }
}
