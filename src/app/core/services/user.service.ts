import { Injectable } from '@angular/core';
import { HttpClient, HttpParams,HttpResponse,HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConnexionFollowUpDto, UpdateProfileRequestDto, UserProfileDto,UsersListDto } from '../models/auth.models';
import { ConnexionFollowUpQueryParams,UsersListQueryParams } from '../models/invoice.models';
import { HttpService } from './http.service';
import { changePasswordRequestDto,CreateUserDto,ContactDto,UserDetail ,UpdateUserRequestDto} from '../models/User';
import{ GroupDto, RoleDto, PermissionDto } from '../models/user-management.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpService: HttpService, private http: HttpClient) { }

    private toHttpParams(params: any): HttpParams {
      let httpParams = new HttpParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
      return httpParams;
    }

  /**
   * Get current user profile
   * Endpoint: GET /api/user/me
   */
  getUserProfile(): Observable<UserProfileDto> {
  
    return this.httpService.get<UserProfileDto>('api/user/me');

  }

  /**
   * Update user profile
   * Endpoint: POST /api/user/update
   */
  updateUserProfile(userData: UpdateProfileRequestDto): Observable<UserProfileDto> {
    return this.http.post<UserProfileDto>(`${environment.apiUrl}/api/user/update`, userData, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
      }
    })
      .pipe(
        tap(response => console.log('Profile updated successfully:', response)),
        catchError(error => {
          console.error('Error updating user profile:', error);
          throw error;
        })
      );

  }

  /**
   * Get connection follow-up history

   * Endpoint: GET /api/user/connexion-follow-up

   */
  getConnectionFollowUp(params: ConnexionFollowUpQueryParams = {}): Observable<ConnexionFollowUpDto[]> {
    return this.httpService.get<ConnexionFollowUpDto[]>(
      'api/user/connexion-follow-up', this.toHttpParams(params));
  }
  
  getUsersList(params: UsersListQueryParams = {}): Observable<UserDetail[]> {
    return this.httpService.get<UserDetail[]>(
      'api/user/list-users', this.toHttpParams(params));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<string> {
      const resetData: changePasswordRequestDto = { oldPassword, newPassword };
      return this.http.post<string>(
        `${environment.apiUrl}/api/user/reset-password`, resetData,{  headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
          },
            responseType: 'text' as 'json'
  }).pipe(
    tap(response => console.log('Password updated successfully:', response)),
    catchError(error => {
      console.error('Error updating user password:', error);
      throw error;
    })
  );
    }

    getGroups(): Observable<any[]> {
      return this.httpService.get<any[]>('api/admin/groups');
    }

    createUser(params: CreateUserDto) {
      return this.httpService.post(`${environment.apiUrl}/api/admin/users/create`, params);
    }
     
    sendEmail(params: ContactDto): Observable<String> {
      console.log('params', params);
      return this.httpService.post<String>(`${environment.apiUrl}/api/auth/contact`, {
        email: params.email,
        subject: params.subject,
        message: params.message
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'text' as 'json'
      });
    }

    getUserById(id: string): Observable<UserDetail>{
      return this.httpService.get<UserDetail>(`/api/admin/users/${id}`);
    }
     
    updateUser(params: UpdateUserRequestDto): Observable<String> {
      console.log('params', params);
      return this.httpService.post<String>(`/api/admin/users/update`, params,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'text' as 'json'
      });
    }

    // User management
     // GROUPS
  getGroup(): Observable<GroupDto[]> {
    return this.httpService.get<GroupDto[]>('/api/admin/groups');
  }

  createGroup(name: string): Observable<GroupDto> {
    const url = `/api/admin/groups?name=${encodeURIComponent(name)}`;
    return this.httpService.post<GroupDto>(url,null); 
  }  

  deleteGroup(id: string): Observable<void> {
    return this.httpService.delete<void>(`/api/admin/groups/${id}`);
  }

  assignGroupRole(groupId: string, roleId: number): Observable<void> {
    return this.httpService.post<void>(`/api/admin/groups/${groupId}/roles/${roleId}`, {});
  }

  removeGroupRole(groupId: string, roleId: number): Observable<void> {
    return this.httpService.delete<void>(`/api/admin/groups/${groupId}/roles/${roleId}`);
  }

  // ROLES
  getRoles(): Observable<RoleDto[]> {
    return this.httpService.get<RoleDto[]>('/api/admin/roles');
  }

  createRole( name: string ): Observable<RoleDto> {
    const url = `/api/admin/roles?name=${encodeURIComponent(name)}`;
    return this.httpService.post<RoleDto>(url,null);
  }

  deleteRole(id: number): Observable<void> {
    return this.httpService.delete<void>(`/api/admin/roles/${id}`);
  }

  assignRolePermission(roleId: number, permissionId: string): Observable<void> {
    return this.httpService.post<void>(`/api/admin/roles/${roleId}/permissions/${permissionId}`, {});
  }

  removeRolePermission(roleId: number, permissionId: string): Observable<void> {
    return this.httpService.delete<void>(`/api/admin/roles/${roleId}/permissions/${permissionId}`);
  }

  // PERMISSIONS
  getPermissions(): Observable<PermissionDto[]> {
    return this.httpService.get<PermissionDto[]>('/api/admin/permissions');
  }

  createPermission(data: { name: string }): Observable<any> {
    return this.httpService.post<any>('/api/admin/permissions', data);
  }

  deletePermission(id: string): Observable<void> {
    return this.httpService.delete<void>(`/api/admin/permissions/${id}`);
  }
  
}
