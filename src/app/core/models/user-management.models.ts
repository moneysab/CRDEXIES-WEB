export interface PermissionDto {
    id: string;
    name: string;
  }


  export interface RoleDto {
    id: number;
    name: string;
    permissions: PermissionDto[];
  }
  
  export interface GroupDto {
    id: string;
    name: string;
    roles: RoleDto[];
  }
  