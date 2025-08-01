import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from 'src/app/core/authentication/auth.service';
import { ContactDto } from '../../../../core/models/User';
import { TranslateService } from '@ngx-translate/core';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';


@Component({
  selector: 'app-contact-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule],
  templateUrl: './contact-modal.component.html',
  styleUrls: ['./contact-modal.component.scss']
})
export class ContactModalComponent implements OnInit {
  mantisConfig = MantisConfig;
  contactForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;
  isAuthenticated = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private userService: UserService,
    private translate: TranslateService,
    private authService: AuthService
  ) {
    this.contactForm = this.fb.group({
      subject: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      description: ['', Validators.required]
    });

    this.translate.use(this.mantisConfig.i18n);
  }
  ngOnInit() {

    this.translate.use(this.mantisConfig.i18n);
    this.isAuthenticated = this.authService.isAuthenticated;
    if (this.isAuthenticated) {
      const userFromStorage = sessionStorage.getItem('user');
      const user = userFromStorage ? JSON.parse(userFromStorage) : null;
      if (user && user.email) {
        this.contactForm.patchValue({
          email: user.email
        });
    }
  }
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const params: ContactDto = {
      email: this.contactForm.value.email,
      subject: this.contactForm.value.subject,
      message: this.contactForm.value.description
    };

    this.userService.sendEmail(params).subscribe({
      next: () => {
        this.successMessage = this.translate.instant('SIGNUP.CONTACT_FORM.SUCCESS_MESSAGE');
        this.contactForm.reset();

        setTimeout(() => {
          this.activeModal.close('sent');
        }, 3000);
      },
      error: () => {
        this.errorMessage = this.translate.instant('SIGNUP.CONTACT_FORM.ERROR_MESSAGE');
        this.isLoading = false;
      }
    });
  }

  onCancel() {
    this.activeModal.dismiss('cancel');
  }
}
