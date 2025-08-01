import { Component, OnInit ,inject} from '@angular/core';
import { GroupDto, RoleDto, PermissionDto } from 'src/app/core/models/user-management.models';
import { UserService } from 'src/app/core/services/user.service';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MantisConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Router,RouterModule } from '@angular/router';

import { TokenService } from 'src/app/core/services/token.service';
import { AdminRoles, ManagerRoles, Role } from 'src/app/theme/shared/components/_helpers/role';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule
  ],
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.scss']
})
export class GroupsListComponent implements OnInit {
  private translate = inject(TranslateService);
  mantisConfig = MantisConfig;

  groups: GroupDto[] = [];
  loading = false;
  errorMsg = '';

  addGroupForm!: FormGroup;
  modalIsOpen = false;

  allRoles: RoleDto[] = [];
  roleModalIsOpen = false;
  selectedGroup: GroupDto | null = null;
  selectedRoles = new Set<number>();
  initialRoles = new Set<number>();
  permissionModalIsOpen = false;
  selectedPermissions: PermissionDto[] = [];



  constructor(
    private userService: UserService,
    private router: Router ,

    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.translate.use(this.mantisConfig.i18n);
    this.loadGroups();
    this.addGroupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  loadGroups(): void {
    this.loading = true;
    this.userService.getGroup().subscribe({
      next: (data) => {
        this.groups = data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = this.translate.instant('GROUPS.LOAD_ERROR');
        this.loading = false;
      }
    });
  }

  openAddGroupModal() {
    this.addGroupForm.reset();
    this.modalIsOpen = true;
  }

  closeModal() {
    this.modalIsOpen = false;
  }

  onAddGroupSubmit() {
    if (this.addGroupForm.invalid) {
      return;
    }
    const newGroupName = this.addGroupForm.value.name;
    this.userService.createGroup(newGroupName).subscribe({
      next: (group) => {
        this.groups.push(group);
        this.showSuccess(this.translate.instant('GROUPS.ADD_SUCCESS'));
        this.closeModal();
      },
      error: () => this.showError(this.translate.instant('GROUPS.ADD_ERROR'))
    });
  }

  deleteGroup(group: GroupDto) {
    this.confirmAction(this.translate.instant('GROUPS.DELETE_CONFIRM', { name: group.name }))
      .then(confirmed => {
        if (!confirmed) return;
  
        this.userService.deleteGroup(group.id).subscribe({
          next: () => {
            this.groups = this.groups.filter(g => g.id !== group.id);
            this.showSuccess(this.translate.instant('GROUPS.DELETE_SUCCESS'));
          },
          error: () => {
            this.showError(this.translate.instant('GROUPS.DELETE_ERROR'));
          }
        });
      });
  }
  

  openRolesModal(group: GroupDto) {
    this.selectedGroup = group;
    this.selectedRoles = new Set(group.roles?.map(r => r.id) || []);
    this.initialRoles = new Set(this.selectedRoles);

    this.userService.getRoles().subscribe({
      next: roles => {
        this.allRoles = roles;
        this.roleModalIsOpen = true;
      },
      error: () => this.showError(this.translate.instant('GROUPS.ROLES_LOAD_ERROR'))
    });
  }

  closeRoleModal() {
    this.roleModalIsOpen = false;
    this.selectedGroup = null;
    this.selectedRoles.clear();
    this.initialRoles.clear();
  }

  isRoleSelected(roleId: number): boolean {
    return this.selectedRoles.has(roleId);
  }


  onRoleCheckboxChange(roleId: number, checked: boolean) {
    if (checked) {
      this.selectedRoles.add(roleId);
    } else {
      this.selectedRoles.delete(roleId);
    }
  }

  saveRoles() {
    if (!this.selectedGroup) return;

    const groupId = this.selectedGroup.id;
    const toAdd = Array.from(this.selectedRoles).filter(id => !this.initialRoles.has(id));
    const toRemove = Array.from(this.initialRoles).filter(id => !this.selectedRoles.has(id));

    const addCalls = toAdd.map(roleId => this.userService.assignGroupRole(groupId, roleId));
    const removeCalls = toRemove.map(roleId => this.userService.removeGroupRole(groupId, roleId));


    const allCalls = [...addCalls, ...removeCalls];
    if (allCalls.length === 0) {
      this.closeRoleModal();
      return;
    }

    this.loading = true;
    Promise.all(allCalls.map(obs => obs.toPromise()))
      .then(() => {

        this.loadGroups();
        this.closeRoleModal();
      })
      .catch(() => {
        this.showError(this.translate.instant('GROUPS.ROLES_SAVE_ERROR'));
        this.loading = false;
      });
  }

  openPermissionsModal(group: GroupDto) {
    const permissionsMap = new Map<string, PermissionDto>();

    group.roles?.forEach(role => {
      role.permissions?.forEach(permission => {
        permissionsMap.set(permission.id, permission);
      });
    });

    this.selectedPermissions = Array.from(permissionsMap.values());
    this.selectedGroup = group;
    this.permissionModalIsOpen = true;
  }

  closePermissionModal() {
    this.permissionModalIsOpen = false;
    this.selectedPermissions = [];
    this.selectedGroup = null;
  }

  navigateToRoles(): void {
    this.router.navigate(['/admin/roles']);
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
