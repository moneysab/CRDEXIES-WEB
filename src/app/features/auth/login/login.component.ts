import { Component, OnInit,inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/authentication/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../../../theme/shared/components/footer/footer.component';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, FooterComponent,SharedModule],
  providers: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  returnUrl: string = '/dashboard/default';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    // Get return url from route parameters or default to '/dashboard/default'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard/default';
    
    // Auto-navigate if already logged in
    if (this.authService.isAuthenticated) {
      this.router.navigate([this.returnUrl]);
    }
  }


  onLogin(): void {
    this.errorMessage = '';
    
    // Validate form inputs
    if (!this.username || !this.password) {
      this.errorMessage = this.translate.instant('ERRORS.LOGIN.missingFields');
      return;
    }
    
    this.isLoading = true;
    
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
       if (error.status === 500) {
          this.errorMessage = this.translate.instant('ERRORS.generic');
        } else {
          this.errorMessage = this.translate.instant('ERRORS.LOGIN.invalidCredentials');
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}