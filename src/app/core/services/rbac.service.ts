import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../authentication/auth.service';

export interface UserPermission {
  resource: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'upload';
}

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private userPermissions$ = new BehaviorSubject<UserPermission[]>([]);
  
  constructor(private authService: AuthService) {
    // Fetch user permissions when authenticated
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.fetchUserPermissions();
      } else {
        this.userPermissions$.next([]);
      }
    });
  }

  /**
   * Fetch user permissions from the server
   * This would typically call an API endpoint to get the user's permissions
   */
  private fetchUserPermissions(): void {
    // Mock permissions for demonstration - in a real app, these would come from an API
    const permissions: UserPermission[] = [
      { resource: 'visa-invoices', action: 'view' },
      { resource: 'visa-invoices', action: 'create' },
      { resource: 'visa-invoices', action: 'edit' },
      { resource: 'visa-invoices', action: 'upload' },
      { resource: 'mastercard-invoices', action: 'view' },
      { resource: 'mastercard-invoices', action: 'create' },
      { resource: 'mastercard-invoices', action: 'upload' },
      { resource: 'csv-files', action: 'view' },
      { resource: 'csv-files', action: 'upload' }
    ];
    
    // Add analytics permission only for users with ROLE_MANAGER role
    if (this.authService.currentUserValue?.role === 'ROLE_MANAGER') {
      permissions.push({ resource: 'analytics', action: 'view' });
      permissions.push({ resource: 'actions-follow-up', action: 'view' });
      permissions.push({ resource: 'users-list', action: 'view' });
      permissions.push({ resource: 'bank-list', action: 'view' });
      permissions.push({ resource: 'bank-list', action: 'create' });
      permissions.push({ resource: 'bank-list', action: 'edit' });
      permissions.push({ resource: 'settings', action: 'view' });
    }
    
    this.userPermissions$.next(permissions);
  }

  /**
   * Check if the user has a specific permission
   * @param resource The resource to check
   * @param action The action to check
   * @returns Observable<boolean> True if the user has the permission
   */
  hasPermission(resource: string, action: 'view' | 'create' | 'edit' | 'delete' | 'upload'): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.userPermissions$.subscribe(permissions => {
        const hasPermission = permissions.some(p => 
          p.resource === resource && p.action === action
        );
        observer.next(hasPermission);
        observer.complete();
      });
    });
  }

  /**
   * Check if the user has any of the given permissions
   * @param permissions Array of permissions to check (if any match, returns true)
   * @returns Observable<boolean> True if the user has any of the permissions
   */
  hasAnyPermission(permissions: {resource: string, action: 'view' | 'create' | 'edit' | 'delete' | 'upload'}[]): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.userPermissions$.subscribe(userPermissions => {
        const hasAnyPermission = permissions.some(requiredPermission => 
          userPermissions.some(p => 
            p.resource === requiredPermission.resource && p.action === requiredPermission.action
          )
        );
        observer.next(hasAnyPermission);
        observer.complete();
      });
    });
  }
}