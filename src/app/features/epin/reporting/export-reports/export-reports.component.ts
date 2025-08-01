import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EpinService } from '../../../../core/services/epin.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { MantisConfig } from 'src/app/app-config';

@Component({
  selector: 'app-export-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SharedModule],
  templateUrl: './export-reports.component.html',
  styleUrls: ['./export-reports.component.scss']
})
export class ExportReportsComponent implements OnInit {
  exportForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Country and BIN options (would typically come from an API)
  countries: string[] = ['USA', 'Canada', 'UK', 'France', 'Germany', 'Japan', 'Australia', 'Brazil', 'India', 'China'];
  bins: string[] = ['123456', '234567', '345678', '456789', '567890'];
  
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  constructor(
    private fb: FormBuilder,
    private epinService: EpinService
  ) {
    this.exportForm = this.fb.group({
      format: ['csv', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      country: [''],
      bin: ['']
    });
  }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    
    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.exportForm.patchValue({
      startDate: this.formatDateForInput(thirtyDaysAgo),
      endDate: this.formatDateForInput(today)
    });
  }

  exportReport(): void {
    if (this.exportForm.invalid) {
      this.markFormGroupTouched(this.exportForm);
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;
    
    const formValues = this.exportForm.value;
    const params: any = {
      startDate: formValues.startDate,
      endDate: formValues.endDate
    };
    
    // Add optional filters if provided
    if (formValues.country) {
      params.country = formValues.country;
    }
    
    if (formValues.bin) {
      params.bin = formValues.bin;
    }
    
    this.epinService.exportReport(formValues.format, params).subscribe({
      next: (blob) => {
        this.isLoading = false;
        this.successMessage = `Report successfully exported in ${formValues.format.toUpperCase()} format.`;
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `epin-report-${formValues.startDate}-to-${formValues.endDate}.${formValues.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (error) => {
        console.error('Error exporting report:', error);
        this.isLoading = false;
        this.error = 'Failed to export report. Please try again.';
      }
    });
  }

  resetForm(): void {
    // Reset to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.exportForm.reset({
      format: 'csv',
      startDate: this.formatDateForInput(thirtyDaysAgo),
      endDate: this.formatDateForInput(today),
      country: '',
      bin: ''
    });
    
    this.error = null;
    this.successMessage = null;
  }

  // Helper methods
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      (control as any).markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.exportForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
}