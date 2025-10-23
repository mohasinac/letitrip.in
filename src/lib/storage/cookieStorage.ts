/**
 * Cookie Storage Utility
 * Provides a unified interface for storing data in cookies with proper security
 */

import Cookies from 'js-cookie';

export interface CookieOptions {
  expires?: number | Date;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
  path?: string;
}

class CookieStorage {
  private readonly defaultOptions: CookieOptions = {
    expires: 7, // 7 days
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
    sameSite: 'strict',
    path: '/'
  };

  /**
   * Set a cookie with proper security settings
   */
  set(key: string, value: string, options?: CookieOptions): void {
    const finalOptions = { ...this.defaultOptions, ...options };
    Cookies.set(key, value, finalOptions);
  }

  /**
   * Get a cookie value
   */
  get(key: string): string | undefined {
    return Cookies.get(key);
  }

  /**
   * Remove a cookie
   */
  remove(key: string, options?: CookieOptions): void {
    const finalOptions = { ...this.defaultOptions, ...options };
    Cookies.remove(key, finalOptions);
  }

  /**
   * Set JSON data as cookie
   */
  setJson<T>(key: string, value: T, options?: CookieOptions): void {
    this.set(key, JSON.stringify(value), options);
  }

  /**
   * Get JSON data from cookie
   */
  getJson<T>(key: string): T | null {
    const value = this.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  /**
   * Check if a cookie exists
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Clear all application cookies
   */
  clearAll(): void {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(key => {
      if (key.startsWith('auth_') || 
          key.startsWith('user_') || 
          key.startsWith('cart_') ||
          key.startsWith('app_')) {
        this.remove(key);
      }
    });
  }

  // Auth-specific methods
  setAuthToken(token: string): void {
    this.set('auth_token', token, {
      expires: 30, // 30 days for auth token
      secure: true,
      sameSite: 'strict'
    });
  }

  getAuthToken(): string | undefined {
    return this.get('auth_token');
  }

  removeAuthToken(): void {
    this.remove('auth_token');
  }

  // User data methods
  setUserData(userData: any): void {
    this.setJson('user_data', userData, {
      expires: 30,
      secure: true,
      sameSite: 'strict'
    });
  }

  getUserData<T>(): T | null {
    return this.getJson<T>('user_data');
  }

  removeUserData(): void {
    this.remove('user_data');
  }

  // Cart data methods
  setCartData(cartData: any): void {
    this.setJson('cart_data', cartData, {
      expires: 7,
      secure: true,
      sameSite: 'strict'
    });
  }

  getCartData<T>(): T | null {
    return this.getJson<T>('cart_data');
  }

  removeCartData(): void {
    this.remove('cart_data');
  }

  // Preferences methods
  setPreference(key: string, value: any): void {
    this.setJson(`pref_${key}`, value, {
      expires: 365, // 1 year for preferences
      secure: true,
      sameSite: 'strict'
    });
  }

  getPreference<T>(key: string): T | null {
    return this.getJson<T>(`pref_${key}`);
  }

  removePreference(key: string): void {
    this.remove(`pref_${key}`);
  }
}

export const cookieStorage = new CookieStorage();
