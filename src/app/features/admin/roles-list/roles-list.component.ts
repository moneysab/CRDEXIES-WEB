import { Component, OnInit ,inject} from '@angular/core';
import { GroupDto, RoleDto, PermissionDto } from 'src/app/core/models/user-management.models';
import { UserService } from 'src/app/core/services/user.service';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router,RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TokenService } from 'src/app/core/services/token.service';
import { AdminRoles, ManagerRoles, Role } from 'src/app/theme/shared/components/_helpers/role';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule
  ],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss'
})
export class RolesListComponent implements OnInit{
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;
  roles: RoleDto[] = [];
  permissions: PermissionDto[] = [];
  loading = false;
  errorMsg = '';
  
  modalIsOpen = false;
  selectedRole: RoleDto | null = null;
  modalPermissionsOpen = false;
  initialPermissions: Set<string> = new Set(); 
selectedPermissions: Set<string> = new Set(); 
  
  addRoleForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]]
  });
  
  constructor(
    private userService: UserService,
    private router: Router ,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.translate.use(this.mantisConfig.i18n);
    this.loadRoles();
  }

  loadRoles() {
    this.loading = true;
    this.userService.getRoles().subscribe({
      next: res => {
        this.roles = res;
        this.loading = false;
      },
      error: err => {
        this.errorMsg = this.translate.instant('ROLES.LOAD_ERROR');
        this.loading = false;
      }
    });
  }

  openAddRoleModal() {
    this.modalIsOpen = true;
    this.addRoleForm.reset();
  }

  closeModal() {
    this.modalIsOpen = false;
  }

  onAddRoleSubmit() {
    if (this.addRoleForm.invalid) return;
    const newRoleName = this.addRoleForm.value.name;
    this.userService.createRole(newRoleName).subscribe({
      next: (res) => {
        this.roles.push(res);
        this.showSuccess(this.translate.instant('ROLES.ADD_SUCCESS'));
        this.closeModal();
        this.loadRoles();
      }
    });
  }

  deleteRole(role: RoleDto) {
    this.confirmAction(
      this.translate.instant('ROLES.DELETE_CONFIRM', { roleName: role.name })
    ).then(confirmed => {
      if (!confirmed) return;
  
      this.userService.deleteRole(role.id).subscribe({
        next: () => {
          this.roles = this.roles.filter(r => r.id !== role.id);
          this.showSuccess(this.translate.instant('ROLES.DELETE_SUCCESS'));
        },
        error: () => {
          this.showError(this.translate.instant('ROLES.DELETE_ERROR'));
        }
      });
    });
  }
  

  openPermissionsModal(role: RoleDto) {
    this.selectedRole = role;
    this.modalPermissionsOpen = true;
    this.loadPermissions();
  }


  loadPermissions() {
    this.userService.getPermissions().subscribe(p => {
      this.permissions = p;
      if (this.selectedRole) {
        const assigned = this.selectedRole.permissions.map(perm => perm.id);
        this.initialPermissions = new Set(assigned);
        this.selectedPermissions = new Set(assigned); 
      }
    });
  }

  onPermissionCheckboxChange(permissionId: string, checked: boolean) {
    if (checked) {
      this.selectedPermissions.add(permissionId);
    } else {
      this.selectedPermissions.delete(permissionId);
    }
  }
  
  savePermissions() {
    if (!this.selectedRole) return;
  
    const roleId = this.selectedRole.id;
    const toAdd = Array.from(this.selectedPermissions).filter(id => !this.initialPermissions.has(id));
    const toRemove = Array.from(this.initialPermissions).filter(id => !this.selectedPermissions.has(id));
  
    const addCalls = toAdd.map(id => this.userService.assignRolePermission(roleId, id));
    const removeCalls = toRemove.map(id => this.userService.removeRolePermission(roleId, id));
  
    const allCalls = [...addCalls, ...removeCalls];
  
    if (allCalls.length === 0) {
      this.closePermissionsModal();
      return;
    }
  
    this.loading = true;
    Promise.all(allCalls.map(obs => obs.toPromise()))
      .then(() => {
        this.loadRoles(); 
        this.closePermissionsModal();
      })
      .catch(() => {
        this.showError(this.translate.instant('ROLES.PERMISSIONS_SAVE_ERROR'));
        this.loading = false;
      });
  }
  
  closePermissionsModal() {
    this.modalPermissionsOpen = false;
    this.selectedRole = null;
    this.initialPermissions.clear();
    this.selectedPermissions.clear();
  }

  navigateToGroup(): void {
    this.router.navigate(['/admin/groups']);
  }

  private showSuccess(message: string, title: string = 'CARDEXIS') {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonColor: '#198754',
      confirmButtonText: 'OK'
    });
  }
  
  private showError(message: string, title: string = 'CARDEXIS') {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'OK'
    });
  }
  
  private confirmAction(message: string, title: string = 'CARDEXIS'): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('BUTTONS.YES'),
      cancelButtonText:this.translate.instant('BUTTONS.CANCEL'),
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then(result => result.isConfirmed);
  }
}