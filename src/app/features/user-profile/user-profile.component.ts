import { Component, OnInit, OnDestroy,inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/authentication/auth.service';
import { ConnexionFollowUpDto, UserProfileDto, UpdateProfileRequestDto } from '../../core/models/auth.models';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SharedModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  profileForm: FormGroup;
  userProfile: UserProfileDto | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  
  // Connection follow-up data
  connexionHistory: ConnexionFollowUpDto[] = [];
  loadingConnexion = false;
  connexionError = '';

  Math = Math;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  private subscriptions: Subscription[] = [];


  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: [''],
      timezone: [''],
      locale: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadConnectionHistory();
    this.translate.use(this.mantisConfig.i18n);
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());

  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const sub = this.userService.getUserProfile().subscribe({

      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue({
          username: profile.username,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber || '',
          timezone: profile.timezone || '',
          locale: profile.locale || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.errorMessage = this.translate.instant('ERRORS.PROFILE.load');
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }
  
  loadConnectionHistory(): void {
    this.loadingConnexion = true;
    this.connexionError = '';
    
    const sub = this.userService.getConnectionFollowUp().subscribe({
      next: (data) => {
        if (data && typeof data === 'object' && !Array.isArray(data) &&
        'content' in data && 'totalElements' in data && 'totalPages' in data) {
        const paginatedData = data as { content: ConnexionFollowUpDto[], totalElements: number, totalPages: number };
        this.totalElements = paginatedData.totalElements;
        this.connexionHistory = paginatedData.content;
        this.totalPages = paginatedData.totalPages;
        this.loadingConnexion = false;
         } else{
        this.connexionHistory = data;
        this.loadingConnexion = false;
      }},
      error: (error) => {
        console.error('Error loading connection history:', error);
        this.connexionError = this.translate.instant('ERRORS.PROFILE.connexionHistory');
        this.loadingConnexion = false;
      }
    });
    
    this.subscriptions.push(sub);

  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.profileForm.get('username')?.enable();
    this.profileForm.get('email')?.enable();

    const updateData: UpdateProfileRequestDto = {
      username: this.profileForm.value.username,
      email: this.profileForm.value.email,
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      phoneNumber: this.profileForm.value.phoneNumber,
      timezone: this.profileForm.value.timezone,
      locale: this.profileForm.value.locale
    };

    const sub = this.userService.updateUserProfile(updateData).subscribe({

      next: (updatedProfile) => {
        this.userProfile = updatedProfile;
        this.successMessage = this.translate.instant('SUCCESS.PROFILE.update');
        this.isLoading = false;

        // Update the stored user data
        this.authService.getUserProfile().subscribe();
        this.profileForm.get('username')?.disable();
        this.profileForm.get('email')?.disable();
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = this.translate.instant('ERRORS.PROFILE.update');
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }
  
  refreshConnectionHistory(): void {
    this.loadConnectionHistory();

  }
}