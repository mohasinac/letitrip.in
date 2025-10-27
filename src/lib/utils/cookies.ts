/**
 * Cookie Management Utilities
 * For non-authentication purposes only (preferences, consent, etc.)
 * 
 * Note: Authentication is handled via Firebase tokens in headers, NOT cookies
 */

export interface CookieOptions {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Check if user has given cookie consent
 */
export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('cookieConsent') === 'true';
}

/**
 * Set cookie consent status
 */
export function setCookieConsent(consent: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cookieConsent', String(consent));
  localStorage.setItem('cookieConsentDate', new Date().toISOString());
}

/**
 * Set a cookie (only if user has consented or it's essential)
 */
export function setCookie(
  name: string, 
  value: string, 
  options: CookieOptions & { essential?: boolean } = {}
): void {
  if (typeof document === 'undefined') return;
  
  // Only set non-essential cookies if user has consented
  if (!options.essential && !hasCookieConsent()) {
    // Silently skip non-essential cookies without consent
    return;
  }

  const {
    days = 365,
    path = '/',
    domain,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'Lax',
  } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  if (days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    cookie += `; expires=${expires.toUTCString()}`;
  }
  
  cookie += `; path=${path}`;
  
  if (domain) {
    cookie += `; domain=${domain}`;
  }
  
  if (secure) {
    cookie += '; secure';
  }
  
  cookie += `; samesite=${sameSite}`;
  
  document.cookie = cookie;
}

/**
 * Get cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  
  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path: string = '/', domain?: string): void {
  if (typeof document === 'undefined') return;
  
  let cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  
  if (domain) {
    cookie += `; domain=${domain}`;
  }
  
  document.cookie = cookie;
}

/**
 * Preference cookies (only set with consent)
 */
export const preferences = {
  setTheme(theme: 'light' | 'dark'): void {
    setCookie('theme', theme, { days: 365 });
  },
  
  getTheme(): 'light' | 'dark' | null {
    return getCookie('theme') as 'light' | 'dark' | null;
  },
  
  setLanguage(lang: string): void {
    setCookie('language', lang, { days: 365 });
  },
  
  getLanguage(): string | null {
    return getCookie('language');
  },
  
  setCurrency(currency: string): void {
    setCookie('currency', currency, { days: 365 });
  },
  
  getCurrency(): string | null {
    return getCookie('currency');
  },
};

/**
 * Essential cookies (can be set without consent)
 * Used for core functionality like session management (non-auth)
 */
export const essential = {
  setSessionId(sessionId: string): void {
    setCookie('session_id', sessionId, { 
      days: 1, // Short-lived
      essential: true 
    });
  },
  
  getSessionId(): string | null {
    return getCookie('session_id');
  },
  
  clearSession(): void {
    deleteCookie('session_id');
  },
};

/**
 * Analytics opt-in management
 */
export const analytics = {
  isEnabled(): boolean {
    if (!hasCookieConsent()) return false;
    const setting = localStorage.getItem('analyticsEnabled');
    return setting === null ? true : setting === 'true';
  },
  
  setEnabled(enabled: boolean): void {
    localStorage.setItem('analyticsEnabled', String(enabled));
    
    // Update Google Analytics consent if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: enabled ? 'granted' : 'denied'
      });
    }
  },
};

/**
 * Clear all non-essential cookies
 */
export function clearAllCookies(): void {
  if (typeof document === 'undefined') return;
  
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const name = cookie.split('=')[0].trim();
    
    // Don't delete essential cookies
    if (name === 'session_id') continue;
    
    deleteCookie(name);
    deleteCookie(name, '/');
    deleteCookie(name, '/', window.location.hostname);
  }
}

export default {
  hasCookieConsent,
  setCookieConsent,
  setCookie,
  getCookie,
  deleteCookie,
  preferences,
  essential,
  analytics,
  clearAllCookies,
};
