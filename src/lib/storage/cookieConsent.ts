/**
 * Cookie Consent & Storage Management (Legacy)
 * @deprecated Use cookieStorage.ts instead for new implementations
 * Handles localStorage fallback to cookies with user consent
 */

export interface StorageData {
  [key: string]: string;
}

export interface CookieConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export class StorageManager {
  private static readonly CONSENT_COOKIE = 'cookie_consent';
  private static readonly CONSENT_EXPIRY = 365; // days
  private static consentSettings: CookieConsentSettings | null = null;

  /**
   * Check if localStorage is available
   */
  static isLocalStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current cookie consent settings
   */
  static getCookieConsent(): CookieConsentSettings | null {
    if (this.consentSettings) return this.consentSettings;

    try {
      if (typeof window === 'undefined') return null;
      
      const consent = this.getCookie(this.CONSENT_COOKIE);
      if (!consent) return null;

      this.consentSettings = JSON.parse(consent);
      return this.consentSettings;
    } catch {
      return null;
    }
  }

  /**
   * Set cookie consent settings
   */
  static setCookieConsent(settings: CookieConsentSettings): void {
    this.consentSettings = settings;
    this.setCookie(
      this.CONSENT_COOKIE,
      JSON.stringify(settings),
      this.CONSENT_EXPIRY
    );
  }

  /**
   * Check if cookie consent is required
   */
  static isCookieConsentRequired(): boolean {
    if (this.isLocalStorageAvailable()) return false;
    return this.getCookieConsent() === null;
  }

  /**
   * Check if preferences cookies are allowed
   */
  static arePreferencesCookiesAllowed(): boolean {
    const consent = this.getCookieConsent();
    return consent?.preferences === true;
  }

  /**
   * Store data with fallback strategy
   */
  static setItem(key: string, value: string): boolean {
    try {
      // Try localStorage first
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(key, value);
        return true;
      }

      // Fallback to cookies if preferences are allowed
      if (this.arePreferencesCookiesAllowed()) {
        this.setCookie(`ls_${key}`, value, 7); // 7 days for preference data
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get data with fallback strategy
   */
  static getItem(key: string): string | null {
    try {
      // Try localStorage first
      if (this.isLocalStorageAvailable()) {
        return localStorage.getItem(key);
      }

      // Fallback to cookies
      return this.getCookie(`ls_${key}`);
    } catch {
      return null;
    }
  }

  /**
   * Remove data with fallback strategy
   */
  static removeItem(key: string): void {
    try {
      // Try localStorage first
      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem(key);
      }

      // Also remove from cookies
      this.deleteCookie(`ls_${key}`);
    } catch {
      // Silent fail
    }
  }

  /**
   * Clear all stored data
   */
  static clear(): void {
    try {
      if (this.isLocalStorageAvailable()) {
        // Get all localStorage keys that start with our app prefix
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith('auth_') || 
          key.startsWith('guest_') || 
          key.startsWith('test_') ||
          key.startsWith('app_')
        );
        keys.forEach(key => localStorage.removeItem(key));
      }

      // Clear preference cookies
      this.getAllCookieKeys()
        .filter(key => key.startsWith('ls_'))
        .forEach(key => this.deleteCookie(key));
    } catch {
      // Silent fail
    }
  }

  /**
   * Set a cookie
   */
  private static setCookie(name: string, value: string, days: number): void {
    if (typeof window === 'undefined') return;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict${
      window.location.protocol === 'https:' ? ';Secure' : ''
    }`;
  }

  /**
   * Get a cookie value
   */
  private static getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;

    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    
    return null;
  }

  /**
   * Delete a cookie
   */
  private static deleteCookie(name: string): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  /**
   * Get all cookie keys
   */
  private static getAllCookieKeys(): string[] {
    if (typeof window === 'undefined') return [];
    
    return document.cookie
      .split(';')
      .map(cookie => cookie.trim().split('=')[0])
      .filter(Boolean);
  }

  /**
   * Export all stored data (for debugging/migration)
   */
  static exportData(): StorageData {
    const data: StorageData = {};

    try {
      if (this.isLocalStorageAvailable()) {
        Object.keys(localStorage).forEach(key => {
          data[key] = localStorage.getItem(key) || '';
        });
      }

      // Add preference cookies
      this.getAllCookieKeys()
        .filter(key => key.startsWith('ls_'))
        .forEach(key => {
          const value = this.getCookie(key);
          if (value) {
            data[key.substring(3)] = value; // Remove 'ls_' prefix
          }
        });
    } catch {
      // Silent fail
    }

    return data;
  }
}
