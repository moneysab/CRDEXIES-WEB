import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule,AbstractControl, ReactiveFormsModule,ValidationErrors , FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import  {CreateUserDto} from 'src/app/core/models/User';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TokenService } from 'src/app/core/services/token.service';
import { AdminRoles,ManagerRoles,Role } from 'src/app/theme/shared/components/_helpers/role';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SharedModule],

  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss'
})
export class UserCreateComponent implements OnInit {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  allowedRoles = [...AdminRoles.Admin, ...ManagerRoles.Manager];
  canAccess = false; 
  

  userForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  availableGroups = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private tokenService: TokenService

  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [''],
      timezone: [''],
      locale: [''],
      groupIds: [[], this.minLengthArray(1)], 
    });
  }

  ngOnInit(): void {
    const currentUserRoles = this.tokenService.decodeToken()?.roles || [];
    this.canAccess = currentUserRoles.map(role => role as Role).some(role => this.allowedRoles.includes(role));
    console.log('Current user roles:', this.canAccess, currentUserRoles);
    if (!this.canAccess) {
      this.router.navigate(['/dashboard/main']);
      return;
    }
    this.translate.use(this.mantisConfig.i18n);
    this.loadGroups();
  }

  loadGroups() {
    this.isLoading = true;
    this.userService.getGroups().subscribe({
      next: (groups) => {
        this.availableGroups = groups;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = this.translate.instant('ERRORS.LOAD_GROUPS');
        this.isLoading = false;
      },
    });
    this.isLoading = false;
  }

  resetForm() {
    this.userForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }

  navigateToUserList() {
    this.router.navigate(['/users-list']);}

  onSubmit() {
    this.successMessage = '';
  this.errorMessage = '';

  if (this.userForm.invalid) {

    if (this.userForm.controls['groupIds'].errors?.['minLengthArray']) {
      this.errorMessage = this.translate.instant('ERRORS.GROUPS_REQUIRED');
    } else {
      this.errorMessage = this.translate.instant('ERRORS.FORM_INVALID');
    }
    return;
  }

  this.isLoading = true;
  const payload: CreateUserDto = this.userForm.value;

  this.userService.createUser(payload).subscribe({
    next: (response) => {
      console.log('Réponse brute:', response);
      this.isLoading = false;
      this.resetForm();
      this.successMessage = this.translate.instant('SUCCESS.USER_CREATED');
    },
    error: (err: HttpErrorResponse) => {
      this.isLoading = false;
      console.error('Erreur HTTP complète:', err);
   

      if (err.status === 409 ) {
        if (err.error.error.toLowerCase().includes('username')) {
          this.errorMessage = this.translate.instant('ERRORS.USERNAME_EXISTS');
        } else if (err.error.error.toLowerCase().includes('email')) {
          this.errorMessage = this.translate.instant('ERRORS.EMAIL_EXISTS');
        } else {
          this.errorMessage = err.error.error;
        }
      } else if (err.status === 400 && err.error?.error) {
        if (err.error.error.toLowerCase().includes('email')) {
          this.errorMessage = this.translate.instant('ERRORS.EMAIL_INVALID');
        } else {
          this.errorMessage = err.error.error;
        }
      } else if (err.status === 500) {
        this.errorMessage = this.translate.instant('ERRORS.SERVER_ERROR');
      } else {
        this.errorMessage = this.translate.instant('ERRORS.UNKNOWN');
      }
    }
  });
  }

  onGroupCheckboxChange(event: any) {
    const selectedGroupIds = this.userForm.controls['groupIds'].value || [];
    if (event.target.checked) {
      selectedGroupIds.push(event.target.value);
    } else {
      const index = selectedGroupIds.indexOf(event.target.value);
      if (index !== -1) {
        selectedGroupIds.splice(index, 1);
      }
    }
    this.userForm.controls['groupIds'].setValue(selectedGroupIds);
    this.userForm.controls['groupIds'].markAsTouched();
  this.userForm.controls['groupIds'].updateValueAndValidity();
  }

   minLengthArray(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && control.value.length >= min) {
        return null;
      }
      return { minLengthArray: { requiredLength: min, actualLength: control.value?.length || 0 } };
    };
  }

}
