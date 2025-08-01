import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface TokenPayload {
  sub: string;
  username: string;
  role: string;
  exp: number;
  iat: number;
  roles?: string[];
  groups?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly jwtHelper = new JwtHelperService();

  constructor() { }

  /**
   * Store the access token in sessionStorage
   */
  setToken(token: string): void {
    if (token) {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Get the access token from sessionStorage
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Remove the access token from sessionStorage
   */
  removeToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  // Development mode flag - set to true to bypass strict token validation
  private readonly DEV_MODE = true;

  /**
   * Check if a token exists and is not expired
   */
  isTokenValid(): boolean {
    const token = this.getToken();

    // In development mode, just check if token exists
    if (this.DEV_MODE) {
      console.log('DEV MODE: Bypassing strict token validation');
      return !!token;
    }

    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Check if the token is expired
   */
  isTokenExpired(token: string): boolean {
    // In development mode, consider token never expired
    if (this.DEV_MODE) {
      console.log('DEV MODE: Bypassing token expiration check');
      return false;
    }

    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token expiration:', error);

      // In development mode, don't consider invalid if we can't parse it
      if (this.DEV_MODE) {
        console.log('DEV MODE: Ignoring token parsing error');
        return false;
      }

      return true; // Consider invalid if we can't parse it
    }
  }

  /**
   * Get the expiration date of the token
   */
  getTokenExpirationDate(token: string): Date | null {
    try {
      return this.jwtHelper.getTokenExpirationDate(token);
    } catch (error) {
      console.error('Error getting token expiration date:', error);
      return null;
    }
  }

  /**
   * Get the time remaining until token expiration in seconds
   */
  getTokenRemainingTime(): number {
    const token = this.getToken();
    if (!token) return 0;

    const expiry = this.getTokenExpirationDate(token);
    if (!expiry) return 0;

    const now = new Date();
    const remainingTime = expiry.getTime() - now.getTime();
    return Math.floor(remainingTime / 1000);
  }

  /**
   * Decode the token payload
   */
  decodeToken(token: string = this.getToken()): TokenPayload | null {
    if (!token) return null;

    try {
      return this.jwtHelper.decodeToken(token) as TokenPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is about to expire (within the next 5 minutes)
   */
  isTokenAboutToExpire(): boolean {
    // In development mode, consider token never about to expire
    if (this.DEV_MODE) {
      console.log('DEV MODE: Bypassing token about-to-expire check');
      return false;
    }

    const remainingTime = this.getTokenRemainingTime();
    // Consider token about to expire if less than 5 minutes remaining
    return remainingTime > 0 && remainingTime < 300;
  }

  /**
* Return the groups array from the decoded token
*/
  getGroups(): string[] {
    const payload = this.decodeToken();
    return payload?.groups || [];
  }

  /**
   * Return the roles array from the decoded token
   */
  getRoles(): string[] {
    const payload = this.decodeToken();
    return payload?.roles || [];
  }

  /**
 * Check if the user belongs to a specific group
 */
  isInGroup(group: string): boolean {
    return this.getGroups().includes(group);
  }
  

  /**
   * Check if the user belongs to any of the provided groups
   */
  isInAnyGroup(groups: string[]): boolean {
    const userGroups = this.getGroups();
    return groups.some(g => userGroups.includes(g));
  }

}