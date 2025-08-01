export interface User {
  id?: string | number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  timezone?: string;
  locale?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface changePasswordRequestDto {
  oldPassword: string;
  newPassword: string;
}


export interface RefreshTokenDto {
  refreshToken: string;
}

export interface CreateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  timezone?: string;
  locale?: string;
  groupIds?: number[]; 
}


export interface ContactDto{
  email: string;
  subject: string;
  message: string;
}

export interface SimpleIdName {
  id: string;
  name: string;
}

export interface UserDetail {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  locale?: string;
  timezone?: string;
  emailVerified?: boolean;
  groups: SimpleIdName[];
  roles: SimpleIdName[];
}
 export interface UpdateUserRequestDto {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  locale?: string;
  timezone?: string;
  groupIds: string[];
}

