import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { EpinService } from '../../../../core/services/epin.service';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { TokenService } from 'src/app/core/services/token.service';
import { Role } from 'src/app/theme/shared/components/_helpers/role';

@Component({
  selector: 'app-epin-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SharedModule],
  templateUrl: './epin-upload.component.html',
  styleUrls: ['./epin-upload.component.scss']
})
export class EpinUploadComponent implements OnInit {
  selectedFiles: File[] = [];
  isUploading = false;
  uploadProgress = 0;
  uploadSuccess = false;
  uploadError = false;
  resultMessage = '';
  //uploadMode: 'single' | 'multiple' = 'single';
  uploadMode: 'epin' | 'report' = 'epin'
  activeProvider = 'visa'; 
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

    allowedRoles = [Role.AdminVisa, Role.ManagerVisa,Role.UserVisa];
    allowedRolesMastercard = [Role.AdminMastercard, Role.ManagerMastercard, Role.UserMastercard];
    currentUserRoles: string[] = [];
    canAccessVisa = false;
    canAccessMastercard = false;

  constructor(
    private epinService: EpinService,
    private router: Router,
    private tokenService: TokenService
    
  ) {}

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);

    this.currentUserRoles = this.tokenService.decodeToken()?.roles || [];
    
   this.canAccessVisa = this.currentUserRoles
        .map(role => role as Role)
        .some(role => this.allowedRoles.includes(role));
    
  this.canAccessMastercard = this.currentUserRoles
      .map(role => role as Role)
      .some(role =>this.allowedRolesMastercard.includes(role) );
    
   if (!this.canAccessVisa && !this.canAccessMastercard) {
        this.router.navigate(['/dashboard/main']);
        return;
      }
    
      
   if (!this.canAccessVisa && this.canAccessMastercard) {
        this.setActiveProvider('mastercard');
        return;
      }
  }

  setActiveProvider(provider: string): void {
    if (provider === 'mastercard') {
      // Redirect to Visa component
      this.router.navigate(['/ipm/upload']);
    } else {
      this.activeProvider = 'visa';
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
    
    if (this.uploadMode === 'epin' && files.length > 0) {
      this.selectedFiles = [files[0]];
    } else if (this.uploadMode === 'report') {
      this.selectedFiles = [files[0]];
    }
  }

  switchUploadMode(mode: 'epin' | 'report'): void {
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

    // Verify files are in supported format
    /*
    for (const file of this.selectedFiles) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'csv' && extension !== 'xlsx' && extension !== 'xls') {
        this.uploadError = true;
        this.resultMessage = this.translate.instant('ERRORS.UPLOAD.invalidExtension');
        return;
      }
    }*/

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

    if (this.uploadMode === 'epin' && this.selectedFiles.length === 1) {
      this.epinService.uploadEpinFile(this.selectedFiles[0]).subscribe({
        next: (response) => {
          console.log('EPIN file upload response:', response.status);
          if (response.status ==='FAILED') {
            this.uploadError = true;
            this.resultMessage = this.translate.instant('ERRORS.UPLOAD.failed');
            clearInterval(progressInterval);
            console.error('EPIN file upload failed:', response);
            return;
          }
          else {
       
          clearInterval(progressInterval);
          this.handleUploadSuccess(this.translate.instant('SUCCESS.UPLOAD.epin.single'));
          }
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.handleUploadError(error);
        }
      });
    }  else if (this.uploadMode === 'report' && this.selectedFiles.length === 1){
      this.epinService.uploadReportEpinFile(this.selectedFiles[0]).subscribe({
        next: (response) => {
          console.log('EPIN file upload response:', response.status);
          if (response.status ==='FAILED') {
            this.uploadError = true;
            this.resultMessage = this.translate.instant('ERRORS.UPLOAD.failed');
            clearInterval(progressInterval);
            console.error('EPIN file upload failed:', response);
            return;
          }
          else {
       
          clearInterval(progressInterval);
          this.handleUploadSuccess(this.translate.instant('SUCCESS.UPLOAD.epin.single'));
          }
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.handleUploadError(error);
        }
      });
    }
    
    
    /*else if (this.uploadMode === 'multiple' && this.selectedFiles.length > 0) {
      this.epinService.uploadMultipleEpinFiles(this.selectedFiles).subscribe({
        next: (response) => {
          clearInterval(progressInterval);
          this.handleUploadSuccess(this.translate.instant('SUCCESS.UPLOAD.epin.multiple', { count: this.selectedFiles.length }));
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.handleUploadError(error);
        }
      });
    }*/
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
    
    console.error('EPIN file upload error:', error);
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

  navigateToJobs(): void {
    this.router.navigate(['/epin/jobs']);
  }
}