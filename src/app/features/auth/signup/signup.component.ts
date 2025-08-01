// Angular import
import { Component,OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators,AbstractControl, ValidationErrors } from '@angular/forms';
import { FooterComponent } from '../../../theme/shared/components/footer/footer.component';
import { UserService } from '../../../core/services/user.service';
import { ContactDto } from '../../../core/models/User';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, FooterComponent,SharedModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit{
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  isLoading = false;  
  successMessage = '';
  errorMessage = '';
  contactForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private userService:UserService,

  ) {

    this.contactForm = this.fb.group({
      subject: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
  }

  onContactSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
   
    const params: ContactDto ={
      email: this.contactForm.value.email,
      subject: this.contactForm.value.subject,
      message: this.contactForm.value.description
    }

    this.userService.sendEmail(params).subscribe({
      next: () => {
        this.successMessage = this.translate.instant('SIGNUP.CONTACT_FORM.SUCCESS_MESSAGE');
        this.contactForm.reset();
      },
      error: () => {
        this.errorMessage = this.translate.instant('SIGNUP.CONTACT_FORM.ERROR_MESSAGE');
      }
    });
  }


}
