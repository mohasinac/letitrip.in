import { useState, useEffect } from "react";

interface CookieOptions {
  days?: number;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export const useCookie = (
  name: string,
  defaultValue: string = "",
  options: CookieOptions = {},
) => {
  const [value, setValue] = useState<string>(defaultValue);

  // Get cookie value
  const getCookie = (cookieName: string): string | null => {
    if (typeof document === "undefined") return null;
    const cookieValue = `; ${document.cookie}`;
    const parts = cookieValue.split(`; ${cookieName}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  // Set cookie value
  const setCookie = (
    cookieName: string,
    cookieValue: string,
    opts: CookieOptions = {},
  ) => {
    if (typeof document === "undefined") return;

    const {
      days = 30,
      secure = false,
      sameSite = "lax",
    } = { ...options, ...opts };

    let cookieString = `${cookieName}=${cookieValue}`;

    if (days) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      cookieString += `;expires=${expires.toUTCString()}`;
    }

    cookieString += `;path=/`;
    cookieString += `;sameSite=${sameSite}`;

    if (secure) {
      cookieString += `;secure`;
    }

    document.cookie = cookieString;
  };

  // Initialize value from cookie on mount
  useEffect(() => {
    const savedValue = getCookie(name);
    if (savedValue !== null) {
      setValue(savedValue);
    }
  }, [name]);

  // Update cookie when value changes
  const updateValue = (newValue: string) => {
    setValue(newValue);
    setCookie(name, newValue, options);
  };

  return [value, updateValue] as const;
};

export default useCookie;
