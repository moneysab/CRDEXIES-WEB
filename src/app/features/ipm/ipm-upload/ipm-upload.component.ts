import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { IpmService } from '../../../core/services/ipm.service';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { TokenService } from 'src/app/core/services/token.service';
import { Role } from 'src/app/theme/shared/components/_helpers/role';

@Component({
  selector: 'app-ipm-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SharedModule],
  
  templateUrl: './ipm-upload.component.html',
  styleUrl: './ipm-upload.component.scss'
})
export class IpmUploadComponent implements OnInit {
  selectedFiles: File[] = [];
  isUploading = false;
  uploadProgress = 0;
  uploadSuccess = false;
  uploadError = false;
  resultMessage = '';
  uploadMode: 'single' | 'multiple' = 'single';
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  allowedRoles = [Role.AdminMastercard, Role.ManagerMastercard,Role.UserMastercard];
  allowedRolesVisa = [Role.AdminVisa, Role.ManagerVisa, Role.UserVisa];
  currentUserRoles: string[] = [];

  canAccessVisa = false;
  canAccessMastercard = false;

  activeProvider = 'mastercard';
  constructor(
    private ipmService: IpmService,
    private router: Router,
    private tokenService: TokenService
    
  ) {}

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.currentUserRoles = this.tokenService.decodeToken()?.roles || [];

    
    this.canAccessVisa = this.currentUserRoles
    .map(role => role as Role)
    .some(role => this.allowedRolesVisa.includes(role));

  this.canAccessMastercard = this.currentUserRoles
  .map(role => role as Role)
  .some(role =>this.allowedRoles.includes(role) );

  if (!this.canAccessVisa && !this.canAccessMastercard) {
    this.router.navigate(['/dashboard/main']);
    return;
  }

  if (this.canAccessVisa && !this.canAccessMastercard) {
    this.setActiveProvider('visa');
    return;
  }
  
  }

  setActiveProvider(provider: string): void {
    if (provider === 'visa') {
      this.router.navigate(['/epin/upload']);
    } else {
      this.activeProvider = 'mastercard';
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
      this.ipmService.uploadIpmFile(this.selectedFiles[0]).subscribe({
        next: (response) => {
          console.log('IPM file upload response:', response);
          clearInterval(progressInterval);
          this.handleUploadSuccess(this.translate.instant('SUCCESS.UPLOAD.epin.single'));
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.handleUploadError(error);
        }
      });
    } else if (this.uploadMode === 'multiple' && this.selectedFiles.length > 0) {
      this.ipmService.uploadMultipleIpmFiles(this.selectedFiles).subscribe({
        next: (response) => {
          clearInterval(progressInterval);
          this.handleUploadSuccess(this.translate.instant('SUCCESS.UPLOAD.epin.multiple', { count: this.selectedFiles.length }));
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.handleUploadError(error);
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
    
    console.error('IPM file upload error:', error);
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
