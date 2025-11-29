/**
 * Sieve Filter Operators
 * Epic: E026 - Sieve-style Pagination
 *
 * Client-side filter evaluation for operators that Firestore doesn't support.
 */

import { FilterCondition, FilterOperator, FilterValue } from "./types";

// ==================== OPERATOR EVALUATION ====================

/**
 * Evaluate a filter condition against a value
 */
export function evaluateFilter(
  condition: FilterCondition,
  value: unknown
): boolean {
  const { operator } = condition;
  const filterValue = condition.value;

  switch (operator) {
    case "==":
      return equals(value, filterValue, false);
    case "!=":
      return !equals(value, filterValue, false);
    case "==*":
      return equals(value, filterValue, true);
    case ">":
      return greaterThan(value, filterValue);
    case ">=":
      return greaterThanOrEqual(value, filterValue);
    case "<":
      return lessThan(value, filterValue);
    case "<=":
      return lessThanOrEqual(value, filterValue);
    case "@=":
    case "@=*":
      return contains(value, filterValue, true);
    case "_=":
      return startsWith(value, filterValue, false);
    case "_=*":
      return startsWith(value, filterValue, true);
    case "_-=":
      return endsWith(value, filterValue, false);
    case "!@=":
      return !contains(value, filterValue, true);
    case "!_=":
      return !startsWith(value, filterValue, false);
    case "!_-=":
      return !endsWith(value, filterValue, false);
    case "==null":
      return isNull(value);
    case "!=null":
      return !isNull(value);
    default:
      return false;
  }
}

/**
 * Evaluate multiple filters with AND logic
 */
export function evaluateFilters(
  filters: FilterCondition[],
  record: Record<string, unknown>
): boolean {
  return filters.every((filter) => {
    const value = getNestedValue(record, filter.field);
    return evaluateFilter(filter, value);
  });
}

// ==================== COMPARISON OPERATORS ====================

/**
 * Equality comparison
 */
function equals(
  value: unknown,
  filterValue: FilterValue,
  caseInsensitive: boolean
): boolean {
  if (value === null || value === undefined) {
    return filterValue === null;
  }

  if (typeof value === "string" && typeof filterValue === "string") {
    if (caseInsensitive) {
      return value.toLowerCase() === filterValue.toLowerCase();
    }
    return value === filterValue;
  }

  if (typeof value === "number" && typeof filterValue === "number") {
    return value === filterValue;
  }

  if (typeof value === "boolean" && typeof filterValue === "boolean") {
    return value === filterValue;
  }

  // Convert to string for comparison
  return String(value) === String(filterValue);
}

/**
 * Greater than comparison
 */
function greaterThan(value: unknown, filterValue: FilterValue): boolean {
  if (value === null || value === undefined) return false;
  if (filterValue === null) return false;

  // Handle dates
  if (isDateValue(value) && typeof filterValue === "string") {
    const valueDate = toDate(value);
    const filterDate = new Date(filterValue);
    return valueDate > filterDate;
  }

  // Numeric comparison
  const numValue = toNumber(value);
  const numFilter = toNumber(filterValue);
  if (!isNaN(numValue) && !isNaN(numFilter)) {
    return numValue > numFilter;
  }

  // String comparison (lexical)
  return String(value) > String(filterValue);
}

/**
 * Greater than or equal comparison
 */
function greaterThanOrEqual(value: unknown, filterValue: FilterValue): boolean {
  return (
    equals(value, filterValue, false) || greaterThan(value, filterValue)
  );
}

/**
 * Less than comparison
 */
function lessThan(value: unknown, filterValue: FilterValue): boolean {
  if (value === null || value === undefined) return false;
  if (filterValue === null) return false;

  // Handle dates
  if (isDateValue(value) && typeof filterValue === "string") {
    const valueDate = toDate(value);
    const filterDate = new Date(filterValue);
    return valueDate < filterDate;
  }

  // Numeric comparison
  const numValue = toNumber(value);
  const numFilter = toNumber(filterValue);
  if (!isNaN(numValue) && !isNaN(numFilter)) {
    return numValue < numFilter;
  }

  // String comparison (lexical)
  return String(value) < String(filterValue);
}

/**
 * Less than or equal comparison
 */
function lessThanOrEqual(value: unknown, filterValue: FilterValue): boolean {
  return equals(value, filterValue, false) || lessThan(value, filterValue);
}

// ==================== STRING OPERATORS ====================

/**
 * Contains (substring) comparison
 */
function contains(
  value: unknown,
  filterValue: FilterValue,
  caseInsensitive: boolean
): boolean {
  if (value === null || value === undefined) return false;
  if (filterValue === null) return false;

  const strValue = String(value);
  const strFilter = String(filterValue);

  if (caseInsensitive) {
    return strValue.toLowerCase().includes(strFilter.toLowerCase());
  }
  return strValue.includes(strFilter);
}

/**
 * Starts with comparison
 */
function startsWith(
  value: unknown,
  filterValue: FilterValue,
  caseInsensitive: boolean
): boolean {
  if (value === null || value === undefined) return false;
  if (filterValue === null) return false;

  const strValue = String(value);
  const strFilter = String(filterValue);

  if (caseInsensitive) {
    return strValue.toLowerCase().startsWith(strFilter.toLowerCase());
  }
  return strValue.startsWith(strFilter);
}

/**
 * Ends with comparison
 */
function endsWith(
  value: unknown,
  filterValue: FilterValue,
  caseInsensitive: boolean
): boolean {
  if (value === null || value === undefined) return false;
  if (filterValue === null) return false;

  const strValue = String(value);
  const strFilter = String(filterValue);

  if (caseInsensitive) {
    return strValue.toLowerCase().endsWith(strFilter.toLowerCase());
  }
  return strValue.endsWith(strFilter);
}

// ==================== NULL OPERATORS ====================

/**
 * Check if value is null or undefined
 */
function isNull(value: unknown): boolean {
  return value === null || value === undefined;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue({ a: { b: 1 } }, "a.b") => 1
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Check if value is a date-like object
 */
function isDateValue(value: unknown): boolean {
  if (value instanceof Date) return true;
  if (typeof value === "object" && value !== null) {
    // Firebase Timestamp
    if ("_seconds" in value && "_nanoseconds" in value) return true;
    // Firestore Timestamp
    if ("seconds" in value && "nanoseconds" in value) return true;
  }
  return false;
}

/**
 * Convert value to Date
 */
function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") return new Date(value);
  if (typeof value === "number") return new Date(value);
  if (typeof value === "object" && value !== null) {
    // Firebase Timestamp
    if ("_seconds" in value) {
      return new Date((value as { _seconds: number })._seconds * 1000);
    }
    // Firestore Timestamp
    if ("seconds" in value) {
      return new Date((value as { seconds: number }).seconds * 1000);
    }
  }
  return new Date(NaN);
}

/**
 * Convert value to number
 */
function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  return NaN;
}

// ==================== OPERATOR METADATA ====================

/**
 * Get description for an operator
 */
export function getOperatorDescription(operator: FilterOperator): string {
  const descriptions: Record<FilterOperator, string> = {
    "==": "equals",
    "!=": "not equals",
    ">": "greater than",
    ">=": "greater than or equal",
    "<": "less than",
    "<=": "less than or equal",
    "@=": "contains",
    "_=": "starts with",
    "_-=": "ends with",
    "!@=": "does not contain",
    "!_=": "does not start with",
    "!_-=": "does not end with",
    "@=*": "contains (case insensitive)",
    "_=*": "starts with (case insensitive)",
    "==*": "equals (case insensitive)",
    "==null": "is null",
    "!=null": "is not null",
  };
  return descriptions[operator] || operator;
}

/**
 * Check if operator is supported by Firestore
 */
export function isFirestoreSupported(operator: FilterOperator): boolean {
  const supported: FilterOperator[] = [
    "==",
    "!=",
    ">",
    ">=",
    "<",
    "<=",
  ];
  return supported.includes(operator);
}

/**
 * Get all available operators for a field type
 */
export function getOperatorsForType(
  type: "string" | "number" | "boolean" | "date"
): FilterOperator[] {
  switch (type) {
    case "string":
      return [
        "==", "!=", "==*",
        "@=", "@=*", "!@=",
        "_=", "_=*", "!_=",
        "_-=", "!_-=",
        "==null", "!=null",
      ];
    case "number":
      return ["==", "!=", ">", ">=", "<", "<=", "==null", "!=null"];
    case "boolean":
      return ["==", "!=", "==null", "!=null"];
    case "date":
      return ["==", "!=", ">", ">=", "<", "<=", "==null", "!=null"];
    default:
      return ["==", "!="];
  }
}
