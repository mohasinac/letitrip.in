import Cookies from "js-cookie";
import { AUTH_CONSTANTS } from '@/constants/app';

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  httpOnly?: boolean;
}

class AuthCookieManager {
  private readonly AUTH_TOKEN_KEY = AUTH_CONSTANTS.AUTH_TOKEN_COOKIE;
  private readonly REFRESH_TOKEN_KEY = AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE;
  private readonly USER_DATA_KEY = AUTH_CONSTANTS.USER_DATA_COOKIE;
  private readonly SESSION_KEY = AUTH_CONSTANTS.SESSION_COOKIE_NAME;

  // Default cookie options for security
  private readonly defaultOptions: CookieOptions = {
    expires: AUTH_CONSTANTS.SESSION_DURATION_DAYS,
    path: "/",
    secure: process.env.NODE_ENV === "production", // Only HTTPS in production
    sameSite: "lax",
  };

  // Set Firebase ID token
  setAuthToken(token: string, options?: CookieOptions): void {
    const cookieOptions = { ...this.defaultOptions, ...options };
    Cookies.set(this.AUTH_TOKEN_KEY, token, cookieOptions);
  }

  // Get Firebase ID token
  getAuthToken(): string | undefined {
    return Cookies.get(this.AUTH_TOKEN_KEY);
  }

  // Remove auth token
  removeAuthToken(): void {
    Cookies.remove(this.AUTH_TOKEN_KEY, { path: "/" });
  }

  // Set refresh token (for long-term authentication)
  setRefreshToken(token: string, options?: CookieOptions): void {
    const cookieOptions = {
      ...this.defaultOptions,
      expires: AUTH_CONSTANTS.REFRESH_TOKEN_DURATION_DAYS,
      ...options,
    };
    Cookies.set(this.REFRESH_TOKEN_KEY, token, cookieOptions);
  }

  // Get refresh token
  getRefreshToken(): string | undefined {
    return Cookies.get(this.REFRESH_TOKEN_KEY);
  }

  // Remove refresh token
  removeRefreshToken(): void {
    Cookies.remove(this.REFRESH_TOKEN_KEY, { path: "/" });
  }

  // Set user data (non-sensitive information only)
  setUserData(userData: any, options?: CookieOptions): void {
    const cookieOptions = { ...this.defaultOptions, ...options };
    const safeUserData = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isEmailVerified: userData.isEmailVerified,
      isPhoneVerified: userData.isPhoneVerified,
    };
    Cookies.set(
      this.USER_DATA_KEY,
      JSON.stringify(safeUserData),
      cookieOptions,
    );
  }

  // Get user data
  getUserData(): any | null {
    try {
      const userData = Cookies.get(this.USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data from cookie:", error);
      this.removeUserData();
      return null;
    }
  }

  // Remove user data
  removeUserData(): void {
    Cookies.remove(this.USER_DATA_KEY, { path: "/" });
  }

  // Set session ID for tracking
  setSessionId(sessionId: string, options?: CookieOptions): void {
    const cookieOptions = { ...this.defaultOptions, ...options };
    Cookies.set(this.SESSION_KEY, sessionId, cookieOptions);
  }

  // Get session ID
  getSessionId(): string | undefined {
    return Cookies.get(this.SESSION_KEY);
  }

  // Remove session ID
  removeSessionId(): void {
    Cookies.remove(this.SESSION_KEY, { path: "/" });
  }

  // Clear all auth-related cookies
  clearAll(): void {
    this.removeAuthToken();
    this.removeRefreshToken();
    this.removeUserData();
    this.removeSessionId();
  }

  // Check if user is authenticated (has valid token)
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Get user role from stored data
  getUserRole(): string | null {
    const userData = this.getUserData();
    return userData?.role || null;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  // Set cookie consent preferences
  setCookieConsent(preferences: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  }): void {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    Cookies.set("cookie-consent", JSON.stringify(consentData), {
      expires: 365, // 1 year
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // Get cookie consent preferences
  getCookieConsent(): any | null {
    try {
      const consent = Cookies.get("cookie-consent");
      return consent ? JSON.parse(consent) : null;
    } catch (error) {
      console.error("Error parsing cookie consent:", error);
      return null;
    }
  }

  // Check if analytics cookies are allowed
  isAnalyticsAllowed(): boolean {
    const consent = this.getCookieConsent();
    return consent?.analytics === true;
  }

  // Check if marketing cookies are allowed
  isMarketingAllowed(): boolean {
    const consent = this.getCookieConsent();
    return consent?.marketing === true;
  }

  // Check if preference cookies are allowed
  isPreferencesAllowed(): boolean {
    const consent = this.getCookieConsent();
    return consent?.preferences === true;
  }
}

// Export singleton instance
export const authCookies = new AuthCookieManager();

// Server-side cookie utilities for API routes
export class ServerCookieManager {
  constructor(private request: Request) {}

  // Parse cookies from request headers
  private parseCookies(): Record<string, string> {
    const cookieHeader = this.request.headers.get("cookie");
    if (!cookieHeader) return {};

    return Object.fromEntries(
      cookieHeader.split(";").map((cookie) => {
        const [name, ...rest] = cookie.trim().split("=");
        return [name, rest.join("=")];
      }),
    );
  }

  // Get auth token from request cookies
  getAuthToken(): string | undefined {
    const cookies = this.parseCookies();
    return cookies["firebase-token"];
  }

  // Get user data from request cookies
  getUserData(): any | null {
    try {
      const cookies = this.parseCookies();
      const userData = cookies["user-data"];
      return userData ? JSON.parse(decodeURIComponent(userData)) : null;
    } catch (error) {
      console.error("Error parsing user data from request cookies:", error);
      return null;
    }
  }

  // Get session ID from request cookies
  getSessionId(): string | undefined {
    const cookies = this.parseCookies();
    return cookies["session-id"];
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Get user role
  getUserRole(): string | null {
    const userData = this.getUserData();
    return userData?.role || null;
  }
}

export default authCookies;
