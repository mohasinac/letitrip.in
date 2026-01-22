/**
 * Cookie Utilities
 *
 * Client-side cookie management for storing UI states like banner dismissals,
 * preferences, etc. For authentication, use server-side session cookies.
 */

export interface CookieOptions {
  expires?: number | Date; // Days or Date object
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

/**
 * Set a cookie
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  if (typeof window === "undefined") return;

  const {
    expires = 365, // Default 1 year
    path = "/",
    domain,
    secure = window.location.protocol === "https:",
    sameSite = "lax",
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // Handle expires
  if (expires) {
    const date =
      typeof expires === "number"
        ? new Date(Date.now() + expires * 24 * 60 * 60 * 1000)
        : expires;
    cookieString += `; expires=${date.toUTCString()}`;
  }

  if (path) cookieString += `; path=${path}`;
  if (domain) cookieString += `; domain=${domain}`;
  if (secure) cookieString += "; secure";
  if (sameSite) cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;

  const nameEQ = encodeURIComponent(name) + "=";
  const cookies = document.cookie.split(";");

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
export function deleteCookie(
  name: string,
  options: Pick<CookieOptions, "path" | "domain"> = {},
): void {
  setCookie(name, "", {
    ...options,
    expires: new Date(0),
  });
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

// Common cookie names
export const COOKIE_NAMES = {
  BANNER_DISMISSED: "banner_dismissed",
  THEME: "theme",
  LANGUAGE: "language",
  CONSENT: "cookie_consent",
} as const;
