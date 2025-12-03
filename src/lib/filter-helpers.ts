/**
 * Filter Utility Functions
 * Helper functions for filter operations and query building
 */
import { logError } from "@/lib/firebase-error-logger";

/**
 * Build a query object from filter values
 * Removes undefined, null, and empty values
 */
export function buildQueryFromFilters<T extends Record<string, any>>(
  filters: T
): Record<string, any> {
  const query: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    // Skip empty arrays
    if (Array.isArray(value) && value.length === 0) {
      return;
    }

    query[key] = value;
  });

  return query;
}

/**
 * Convert filter values to URL search params
 */
export function filtersToSearchParams<T extends Record<string, any>>(
  filters: T
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      // Serialize arrays as JSON
      params.set(key, JSON.stringify(value));
    } else if (typeof value === "object") {
      // Serialize objects as JSON
      params.set(key, JSON.stringify(value));
    } else {
      params.set(key, String(value));
    }
  });

  return params;
}

/**
 * Parse URL search params to filter values
 */
export function searchParamsToFilters<T extends Record<string, any>>(
  searchParams: URLSearchParams,
  initialFilters: T
): T {
  const filters = { ...initialFilters };

  searchParams.forEach((value, key) => {
    if (key in initialFilters) {
      try {
        // Try to parse JSON for arrays/objects
        filters[key as keyof T] = JSON.parse(value);
      } catch {
        // Otherwise use string value
        filters[key as keyof T] = value as T[keyof T];
      }
    }
  });

  return filters;
}

/**
 * Persist filters to localStorage
 */
export function persistFilters<T extends Record<string, any>>(
  key: string,
  filters: T
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(filters));
  } catch (error: any) {
    logError(error, {
      component: "filterHelpers.persistFilters",
      metadata: { key },
    });
  }
}

/**
 * Load filters from localStorage
 */
export function loadPersistedFilters<T extends Record<string, any>>(
  key: string,
  initialFilters: T
): T {
  if (typeof window === "undefined") return initialFilters;

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return { ...initialFilters, ...JSON.parse(stored) };
    }
  } catch (error: any) {
    logError(error, {
      component: "filterHelpers.loadPersistedFilters",
      metadata: { key },
    });
  }

  return initialFilters;
}

/**
 * Clear persisted filters from localStorage
 */
export function clearPersistedFilters(key: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch (error: any) {
    logError(error, {
      component: "filterHelpers.clearPersistedFilters",
      metadata: { key },
    });
  }
}

/**
 * Merge multiple filter objects
 */
export function mergeFilters<T extends Record<string, any>>(
  ...filterObjects: Partial<T>[]
): Partial<T> {
  return filterObjects.reduce(
    (acc, filters) => ({ ...acc, ...filters }),
    {} as Partial<T>
  );
}

/**
 * Get active filter count
 */
export function getActiveFilterCount<T extends Record<string, any>>(
  filters: T
): number {
  return Object.keys(filters).filter((key) => {
    const value = filters[key];
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }).length;
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters<T extends Record<string, any>>(
  filters: T
): boolean {
  return getActiveFilterCount(filters) > 0;
}

/**
 * Convert filters to a human-readable summary
 */
export function filtersToSummary<T extends Record<string, any>>(
  filters: T,
  labels: Record<keyof T, string>
): string[] {
  const summary: string[] = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    const label = labels[key as keyof T] || key;

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      summary.push(`${label}: ${value.join(", ")}`);
    } else if (typeof value === "boolean") {
      if (value) summary.push(label);
    } else {
      summary.push(`${label}: ${value}`);
    }
  });

  return summary;
}

/**
 * Validate filter values against schema
 */
export function validateFilters<T extends Record<string, any>>(
  filters: T,
  schema: {
    [K in keyof T]?: {
      type: "string" | "number" | "boolean" | "array" | "object";
      required?: boolean;
      min?: number;
      max?: number;
      options?: any[];
    };
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  Object.entries(schema).forEach(([key, rules]) => {
    const value = filters[key as keyof T];

    // Check required
    if (rules?.required && (value === undefined || value === null)) {
      errors.push(`${key} is required`);
      return;
    }

    // Skip validation if value is not provided
    if (value === undefined || value === null) return;

    // Check type
    if (rules?.type === "array" && !Array.isArray(value)) {
      errors.push(`${key} must be an array`);
    } else if (rules?.type === "number" && typeof value !== "number") {
      errors.push(`${key} must be a number`);
    } else if (rules?.type === "boolean" && typeof value !== "boolean") {
      errors.push(`${key} must be a boolean`);
    } else if (rules?.type === "string" && typeof value !== "string") {
      errors.push(`${key} must be a string`);
    }

    // Check min/max for numbers
    if (typeof value === "number") {
      if (rules?.min !== undefined && value < rules.min) {
        errors.push(`${key} must be at least ${rules.min}`);
      }
      if (rules?.max !== undefined && value > rules.max) {
        errors.push(`${key} must be at most ${rules.max}`);
      }
    }

    // Check options
    if (rules?.options && !rules.options.includes(value)) {
      errors.push(`${key} must be one of: ${rules.options.join(", ")}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
