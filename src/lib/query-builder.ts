/**
 * @fileoverview Sieve Query Builder Helper
 * @module src/lib/query-builder
 * @description Utilities for building Sieve filter queries
 * 
 * @created 2025-12-06
 * @pattern Helper Utility
 */

/**
 * Sieve filter operators
 */
export const SIEVE_OPERATORS = {
  EQUALS: "==",
  NOT_EQUALS: "!=",
  GREATER_THAN: ">",
  GREATER_THAN_OR_EQUAL: ">=",
  LESS_THAN: "<",
  LESS_THAN_OR_EQUAL: "<=",
  CONTAINS: "@=",
  STARTS_WITH: "_=",
  ENDS_WITH: "!_=",
  CONTAINS_ANY: "@=*", // Array contains any of the values
  NOT_CONTAINS: "!@=",
} as const;

/**
 * Sieve sort directions
 */
export const SIEVE_SORT = {
  ASC: "",
  DESC: "-",
} as const;

/**
 * Build Sieve filter string
 * @example 
 * buildFilter({ IsActive: true, Status: "published" })
 * => "IsActive==true,Status==published"
 */
export function buildFilter(filters: Record<string, any>): string {
  return Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}==${value}`;
      }
      if (typeof value === "number" || typeof value === "boolean") {
        return `${key}==${value}`;
      }
      if (Array.isArray(value)) {
        // Multiple values with OR operator
        return `(${value.map((v) => `${key}==${v}`).join("|")})`;
      }
      return `${key}==${value}`;
    })
    .join(",");
}

/**
 * Build Sieve filter with custom operator
 * @example
 * buildFilterWithOperator("Name", "@=", "laptop")
 * => "Name@=laptop"
 */
export function buildFilterWithOperator(
  field: string,
  operator: string,
  value: any
): string {
  return `${field}${operator}${value}`;
}

/**
 * Build OR filter (multiple values for same field)
 * @example
 * buildOrFilter("Status", ["active", "pending"])
 * => "(Status==active|Status==pending)"
 */
export function buildOrFilter(field: string, values: any[]): string {
  if (values.length === 0) return "";
  if (values.length === 1) return `${field}==${values[0]}`;
  return `(${values.map((v) => `${field}==${v}`).join("|")})`;
}

/**
 * Build AND filter (multiple conditions)
 * @example
 * buildAndFilter([
 *   "IsActive==true",
 *   "Status==published",
 *   "Views>100"
 * ])
 * => "IsActive==true,Status==published,Views>100"
 */
export function buildAndFilter(conditions: string[]): string {
  return conditions.filter(Boolean).join(",");
}

/**
 * Build complex filter with OR and AND
 * @example
 * buildComplexFilter({
 *   and: ["IsActive==true", "Views>100"],
 *   or: ["Status==active", "Status==pending"]
 * })
 * => "IsActive==true,Views>100,(Status==active|Status==pending)"
 */
export function buildComplexFilter(options: {
  and?: string[];
  or?: string[];
}): string {
  const parts: string[] = [];
  
  if (options.and && options.and.length > 0) {
    parts.push(...options.and.filter(Boolean));
  }
  
  if (options.or && options.or.length > 0) {
    const orPart = `(${options.or.filter(Boolean).join("|")})`;
    parts.push(orPart);
  }
  
  return parts.join(",");
}

/**
 * Build search filter (contains search term in multiple fields)
 * @example
 * buildSearchFilter(["Name", "Description"], "laptop")
 * => "(Name@=*laptop|Description@=*laptop)"
 */
export function buildSearchFilter(fields: string[], searchTerm: string): string {
  if (!searchTerm || fields.length === 0) return "";
  
  const conditions = fields.map((field) => `${field}@=*${searchTerm}`);
  return `(${conditions.join("|")})`;
}

/**
 * Build sort string
 * @example
 * buildSort([{ field: "CreatedAt", desc: true }, { field: "Name" }])
 * => "-CreatedAt,Name"
 */
export function buildSort(
  sorts: Array<{ field: string; desc?: boolean }>
): string {
  return sorts
    .map((sort) => `${sort.desc ? "-" : ""}${sort.field}`)
    .join(",");
}

/**
 * Build date range filter
 * @example
 * buildDateRangeFilter("CreatedAt", new Date("2025-01-01"), new Date("2025-12-31"))
 * => "CreatedAt>=2025-01-01,CreatedAt<=2025-12-31"
 */
export function buildDateRangeFilter(
  field: string,
  startDate: Date | string,
  endDate: Date | string
): string {
  const start = startDate instanceof Date ? startDate.toISOString().split("T")[0] : startDate;
  const end = endDate instanceof Date ? endDate.toISOString().split("T")[0] : endDate;
  
  return `${field}>=${start},${field}<=${end}`;
}

/**
 * Build numeric range filter
 * @example
 * buildNumericRangeFilter("Price", 100, 500)
 * => "Price>=100,Price<=500"
 */
export function buildNumericRangeFilter(
  field: string,
  min: number,
  max: number
): string {
  const conditions: string[] = [];
  
  if (min !== undefined) conditions.push(`${field}>=${min}`);
  if (max !== undefined) conditions.push(`${field}<=${max}`);
  
  return conditions.join(",");
}

/**
 * Build array contains filter
 * @example
 * buildArrayContainsFilter("Tags", "electronics")
 * => "Tags@=*electronics"
 */
export function buildArrayContainsFilter(field: string, value: string): string {
  return `${field}@=*${value}`;
}

/**
 * Build NOT filter
 * @example
 * buildNotFilter("Status", "deleted")
 * => "Status!=deleted"
 */
export function buildNotFilter(field: string, value: any): string {
  return `${field}!=${value}`;
}

/**
 * Combine multiple filters
 * @example
 * combineFilters([
 *   "IsActive==true",
 *   buildOrFilter("Status", ["active", "pending"]),
 *   buildSearchFilter(["Name"], "laptop")
 * ])
 * => "IsActive==true,(Status==active|Status==pending),(Name@=*laptop)"
 */
export function combineFilters(filters: (string | undefined | null)[]): string {
  return filters.filter(Boolean).join(",");
}

/**
 * Build full Sieve query params
 * @example
 * buildSieveParams({
 *   filters: { IsActive: true, Status: "published" },
 *   sorts: [{ field: "CreatedAt", desc: true }],
 *   page: 1,
 *   pageSize: 20
 * })
 * => { filters: "IsActive==true,Status==published", sorts: "-CreatedAt", page: 1, pageSize: 20 }
 */
export function buildSieveParams(options: {
  filters?: Record<string, any>;
  sorts?: Array<{ field: string; desc?: boolean }>;
  page?: number;
  pageSize?: number;
}): {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
} {
  const params: any = {};
  
  if (options.filters) {
    const filterString = buildFilter(options.filters);
    if (filterString) params.filters = filterString;
  }
  
  if (options.sorts && options.sorts.length > 0) {
    params.sorts = buildSort(options.sorts);
  }
  
  if (options.page !== undefined) {
    params.page = options.page;
  }
  
  if (options.pageSize !== undefined) {
    params.pageSize = options.pageSize;
  }
  
  return params;
}
