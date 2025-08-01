
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, AbstractControl, ReactiveFormsModule, ValidationErrors, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {UpdateUserRequestDto} from 'src/app/core/models/User';

@Component({
  selector: 'app-user-update',
  templateUrl: './users-update.component.html',
  styleUrls: ['./users-update.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SharedModule],

})
export class UserUpdateComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  availableGroups = [];
  userId: string;

  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
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
    this.translate.use(this.mantisConfig.i18n);
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.loadGroups();
    this.loadUser();
  }

  loadGroups() {
    this.userService.getGroups().subscribe({
      next: (groups) => {
        this.availableGroups = groups;
      },
      error: () => {
        this.errorMessage = this.translate.instant('ERRORS.LOAD_GROUPS');
      }
    });
  }

  loadUser() {
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          timezone: user.timezone,
          locale: user.locale,
          groupIds: user.groups.map(g => g.id)
        });
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = this.translate.instant('ERRORS.LOAD_USER');
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

  onSubmit() {

    if (this.userForm.invalid) {
      this.errorMessage = this.translate.instant('ERRORS.FORM_INVALID');
      return;
    }
    this.isLoading = true;
    const payload : UpdateUserRequestDto = {
      userId: this.userId,
      ...this.userForm.value
    };
  
    this.userService.updateUser(payload).subscribe({
      next: (response) => {
        console.log('Réponse brute:', response);
        this.isLoading = false;
        this.successMessage = this.translate.instant('SUCCESS.USER_UPDATED');
        setTimeout(() => {
        this.router.navigate(['/users-list']);
        }
        , 3000); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || this.translate.instant('ERRORS.UNKNOWN');
      }
    });
  }

  resetForm() {
    this.userForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.loadUser();
  }

  navigateToUserList() {
    this.router.navigate(['/users-list']);
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
