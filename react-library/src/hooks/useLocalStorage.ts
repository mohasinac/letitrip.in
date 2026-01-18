
/**
 * useLocalStorage Hook
 *
 * Hook for managing state synchronized with localStorage
 * Provides automatic serialization/deserialization and SSR safety
 *
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 *
 * return (
 *   <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *     Toggle Theme
 *   </button>
 * );
 * ```
 */

import { useCallback, useEffect, useState } from "react";

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  initializeWithValue?: boolean;
  syncData?: boolean; // Sync across tabs/windows
}

const IS_SERVER = typeof window === "undefined";

/**
 * useLocalStorage - Persist state to localStorage
 *
 * @param key - The localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @param options - Configuration options
 * @returns [storedValue, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    initializeWithValue = true,
    syncData = true,
  } = options;

  // Get initial value from localStorage or use initialValue
  const readValue = useCallback((): T => {
    if (IS_SERVER) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, deserializer]);

  // State
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (initializeWithValue) {
      return readValue();
    }
    return initialValue;
  });

  // Return a wrapped version of useState's setter function that persists the value
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (IS_SERVER) {
        console.warn(
          `Tried setting localStorage key "${key}" on server. This is a no-op.`
        );
        return;
      }

      try {
        // Allow value to be a function so we have same API as useState
        const newValue = value instanceof Function ? value(storedValue) : value;

        // Save to localStorage
        window.localStorage.setItem(key, serializer(newValue));

        // Save state
        setStoredValue(newValue);

        // Dispatch custom event for cross-tab sync
        if (syncData) {
          window.dispatchEvent(
            new CustomEvent("local-storage", {
              detail: { key, value: newValue },
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serializer, syncData]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    if (IS_SERVER) {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);

      if (syncData) {
        window.dispatchEvent(
          new CustomEvent("local-storage", {
            detail: { key, value: null },
          })
        );
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, syncData]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    if (!syncData || IS_SERVER) {
      return;
    }

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ("key" in e) {
        // Standard storage event (from other tabs)
        if (e.key === key && e.newValue !== null) {
          try {
            setStoredValue(deserializer(e.newValue));
          } catch (error) {
            console.warn(`Error syncing localStorage key "${key}":`, error);
          }
        } else if (e.key === key && e.newValue === null) {
          setStoredValue(initialValue);
        }
      } else if ("detail" in e) {
        // Custom event (from same tab)
        const detail = e.detail as { key: string; value: T | null };
        if (detail.key === key) {
          if (detail.value !== null) {
            setStoredValue(detail.value);
          } else {
            setStoredValue(initialValue);
          }
        }
      }
    };

    // Listen for standard storage events (cross-tab)
    window.addEventListener("storage", handleStorageChange as EventListener);

    // Listen for custom events (same tab)
    window.addEventListener(
      "local-storage",
      handleStorageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange as EventListener
      );
      window.removeEventListener(
        "local-storage",
        handleStorageChange as EventListener
      );
    };
  }, [key, deserializer, initialValue, syncData]);

  // Re-read from localStorage when key changes
  useEffect(() => {
    if (initializeWithValue) {
      setStoredValue(readValue());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue, removeValue];
}
