import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UsersListDto } from '../../core/models/auth.models';
import { UsersListQueryParams } from '../../core/models/invoice.models';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TokenService } from 'src/app/core/services/token.service';
import { AdminRoles,ManagerRoles,Role } from 'src/app/theme/shared/components/_helpers/role';
import { UserDetail } from 'src/app/core/models/User';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,SharedModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit{
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
    successMessage = '';
    errorMessage = '';
    usersList: UserDetail[] = [];
    isLoading = false;

    allowedRoles = [...AdminRoles.Admin, ...ManagerRoles.Manager];
    canAccess = false; 
  
  
    Math = Math;
    currentPage = 0;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;
    filterForm: FormGroup;
  constructor(
      private userService: UserService,
      private fb: FormBuilder,
      private router: Router,
      private tokenService: TokenService
    ) {
      this.filterForm = this.fb.group({
        userName: [''],
      });
    }
    ngOnInit(): void {
    const currentUserRoles = this.tokenService.decodeToken()?.roles || [];
    this.canAccess = currentUserRoles.map(role => role as Role).some(role => this.allowedRoles.includes(role));
    if (!this.canAccess) {
      this.router.navigate(['/dashboard/main']);
      return;
    }
      this.loadUsersList();
      this.translate.use(this.mantisConfig.i18n);
    }
  
    loadUsersList(): void {
      this.isLoading = true;
      this.errorMessage = '';
       const params: UsersListQueryParams = {
            page: this.currentPage,
            size: this.pageSize,
            ...this.filterForm.value
          };
          
          Object.keys(params).forEach(key => {
            if (params[key] === '') {
              delete params[key];
            }
          });
      const sub = this.userService.getUsersList(params).subscribe({
        next: (data) => {
          if (data && typeof data === 'object' && !Array.isArray(data) &&
          'content' in data && 'totalElements' in data && 'totalPages' in data) {
          const paginatedData = data as { content: UserDetail[], totalElements: number, totalPages: number };
          this.totalElements = paginatedData.totalElements;
          this.usersList = paginatedData.content;
          this.totalPages = paginatedData.totalPages;
          this.isLoading = false;
           } else{
          this.usersList = data;
          this.isLoading = false;
        }},
        error: (error) => {
          console.error('Error loading list of users:', error);
          this.errorMessage = this.translate.instant('ERRORS.Users');
          this.isLoading = false;
        }
      });
    }
    refresh(): void {
      this.loadUsersList();
  
    }
    applyFilter(): void {
      this.currentPage = 0; 
      this.loadUsersList();
    }
  
    resetFilter(): void {
      this.filterForm.reset();
      this.currentPage = 0;
      this.loadUsersList();
    }
  
    goToPage(page: number): void {
      this.currentPage = page;
      this.loadUsersList();
    }
  
    previousPage(): void {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.loadUsersList();
      }
    }
  
    nextPage(): void {
      
      if ((this.currentPage + 1)  < this.totalPages) {
        this.currentPage++;
        this.loadUsersList();
      }
    }
    formatDate(date: string | undefined): string {
      if (!date) {
        return '–';
      }
      return new Date(date).toLocaleDateString();
    }
    navigateToHome(): void {
      this.router.navigate(['/dashboard']);
    }

    navigateToCreate(): void {
      this.router.navigate(['/create-user']);
    }
  }
  