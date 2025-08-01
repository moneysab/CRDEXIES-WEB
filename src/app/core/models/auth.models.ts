export interface UpdateProfileRequestDto {
  username: string;
  email: string;
  phoneNumber?: string;
  timezone?: string;
  locale?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserProfileDto {
  email: string;
  username: string;
  emailVerified: boolean;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  timezone?: string;
  locale?: string;
}

export interface EmailVerificationRequestDto {
  email: string;
  otp: string;
}

export interface AuthenticationResponseDto {
  accessToken: string;
}

export interface RegistrationRequestDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  timezone?: string;
  locale?: string;
  roleId: number;
}

export interface RegistrationResponseDto {
  username: string;
  email: string;
}

export interface AuthenticationRequestDto {
  username: string;
  password: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

export interface ConnexionFollowUpDto {
  username: string;
  email: string;
  attemptDate: string;
  eventType: string;
  description: string;
  arguments: string;
}

export interface UsersListDto {
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
}