import { Component ,inject,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule,Router } from '@angular/router';
import { BillingService } from '../../../../core/services/billing.service';
import { CsvUploadService } from '../../../../core/services/csv-upload.service';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-mastercard-invoice-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,SharedModule],
  templateUrl: './mastercard-invoice-upload.component.html',
  styleUrls: ['./mastercard-invoice-upload.component.scss'],
  host: {
    '[class.visa-active]': 'activeProvider === "visa"',
    '[class.mastercard-active]': 'activeProvider === "mastercard"'
  }
})
export class MastercardInvoiceUploadComponent implements OnInit {
  selectedFiles: File[] = [];
  isUploading = false;
  uploadProgress = 0;
  uploadSuccess = false;
  uploadError = false;
  resultMessage = '';
  uploadMode: 'single' | 'multiple' = 'single';
  activeProvider = 'mastercard'; // 'visa' or 'mastercard'
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  constructor(
    private billingService: BillingService,
    private csvUploadService: CsvUploadService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
  }

  // Switch between providers
  setActiveProvider(provider: string): void {
    if (this.activeProvider !== provider) {
      // Navigate to the appropriate provider's upload page
      this.router.navigate([`/invoices/${provider}/upload`]);
    }
  }
  onFileSelected(event: any): void {
    // Only prevent default for drag and drop events
    if (event.type === 'drop' || event.type === 'dragover' || event.type === 'dragenter') {
      event.preventDefault();
      event.stopPropagation();
    }
    
    let files: FileList | File[] = [];
    
    if (event.type === 'drop') {
      files = event.dataTransfer.files;
    } else if (event.target && event.target.files) {
      files = event.target.files;
    } else {
      return;
    }
    
    if (this.uploadMode === 'single' && files.length > 0) {
      this.selectedFiles = [files[0]];
    } else if (this.uploadMode === 'multiple') {
      this.selectedFiles = Array.from(files);
    }
  }

  switchUploadMode(mode: 'single' | 'multiple'): void {
    this.uploadMode = mode;
    this.selectedFiles = [];
    this.resetStatus();
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.resetStatus();
  }

  clearSelectedFiles(): void {
    this.selectedFiles = [];
    this.resetStatus();
  }

  resetStatus(): void {
    this.uploadProgress = 0;
    this.uploadSuccess = false;
    this.uploadError = false;
    this.resultMessage = '';
  }

  uploadFiles(): void {
    if (this.selectedFiles.length === 0) {
      this.uploadError = true;
      this.resultMessage = this.translate.instant('ERRORS.UPLOAD.noFile');
      return;
    }

    // Verify files are CSV format
    for (const file of this.selectedFiles) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'csv') {
        this.uploadError = true;
        this.resultMessage =  this.translate.instant('ERRORS.UPLOAD.invalidExtension');
        return;
      }
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadSuccess = false;
    this.uploadError = false;
    this.resultMessage = '';

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 300);

    if (this.uploadMode === 'single' && this.selectedFiles.length === 1) {
      // Use csvUploadService as the primary service
      this.csvUploadService.uploadMastercardFile(this.selectedFiles[0]).subscribe({
        next: (response) => {
          clearInterval(progressInterval);
          this.handleUploadSuccess(this.translate.instant('SUCCESS.UPLOAD.single'));
        },
        error: (error) => {
          console.error('CSV upload service error:', error);
          // Fallback to billing service if CSV upload service fails
          this.billingService.uploadMastercardInvoice(this.selectedFiles[0]).subscribe({
            next: (response) => {
              clearInterval(progressInterval);
              this.handleUploadSuccess(this.translate.instant('SUCCESS.UPLOAD.single'));
            },
            error: (fallbackError) => {
              console.error('Billing service error:', fallbackError);
              clearInterval(progressInterval);
              this.handleUploadError(fallbackError);
            }
          });
        }
      });
    } else if (this.uploadMode === 'multiple' && this.selectedFiles.length > 0) {
      // Use csvUploadService as the primary service
      this.csvUploadService.uploadMultipleMastercardFiles(this.selectedFiles).subscribe({
        next: (response) => {
          clearInterval(progressInterval);
          this.handleUploadSuccess(  this.translate.instant('SUCCESS.UPLOAD.multiple', { count: this.selectedFiles.length }));
        },
        error: (error) => {
          console.error('CSV upload service error:', error);
          // Fallback to billing service if CSV upload service fails
          this.billingService.uploadMultipleMastercardInvoices(this.selectedFiles).subscribe({
            next: (response) => {
              clearInterval(progressInterval);
              this.handleUploadSuccess(   this.translate.instant('SUCCESS.UPLOAD.multiple', { count: this.selectedFiles.length }));
            },
            error: (fallbackError) => {
              console.error('Billing service error:', fallbackError);
              clearInterval(progressInterval);
              this.handleUploadError(fallbackError);
            }
          });
        }
      });
    }
  }

  private handleUploadSuccess(message: string): void {
    this.uploadProgress = 100;
    this.isUploading = false;
    this.uploadSuccess = true;
    this.resultMessage = message;
    this.selectedFiles = [];
    
    // Stay on the current page instead of navigating elsewhere
    setTimeout(() => {
      this.uploadSuccess = false;
      this.resultMessage = '';
    }, 3000);

  }

  private handleUploadError(error: any): void {
    this.uploadProgress = 0;
    this.isUploading = false;
    this.uploadError = true;
    
    if (error.status === 400) {
      this.resultMessage = this.translate.instant('ERRORS.UPLOAD.invalidFormat');
    } else if (error.status === 413) {
      this.resultMessage = this.translate.instant('ERRORS.UPLOAD.fileTooLarge');
    } else if (error.status === 401) {
      this.resultMessage = this.translate.instant('ERRORS.UPLOAD.unauthorized');
    } else if (error.status === 403) {
      this.resultMessage = this.translate.instant('ERRORS.UPLOAD.forbidden');
    } else if (error.status === 404) {
      this.resultMessage = this.translate.instant('ERRORS.UPLOAD.notFound');
    } else if (error.status === 500) {
      this.resultMessage = this.translate.instant('ERRORS.UPLOAD.serverError');
    } else if (error.error && error.error.message) {
      this.resultMessage = this.translate.instant('ERRORS.UPLOAD.fallback', {
        message: error.error.message
      });
    } else {
      this.resultMessage = this.translate.instant('ERRORS.UPLOAD.fallback', {
        message: error.message || 'Unknown error'
      });
    }
    
    console.error('Mastercard file upload error:', error);
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'csv':
        return 'ti ti-file-spreadsheet';
      case 'xlsx':
      case 'xls':
        return 'ti ti-file-spreadsheet';
      case 'pdf':
        return 'ti ti-file-text';
      case 'txt':
        return 'ti ti-file-text';
      default:
        return 'ti ti-file';
    }
  }

  formatFileSize(size: number): string {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  navigateToList(): void {
    this.router.navigate(['/invoices/mastercard/list']);
  }
}