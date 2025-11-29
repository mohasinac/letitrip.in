/**
 * Sieve Query Parser
 * Epic: E026 - Sieve-style Pagination
 *
 * Parses URL query parameters into a structured SieveQuery object.
 *
 * Query Format Examples:
 * - ?page=1&pageSize=20
 * - ?sorts=-createdAt,price
 * - ?filters=status==published,price>100
 */

import {
  FilterCondition,
  FilterOperator,
  FilterValue,
  SieveConfig,
  SieveError,
  SieveParseResult,
  SieveQuery,
  SortField,
} from "./types";

// ==================== CONSTANTS ====================

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Operator patterns ordered by length (longest first for proper matching)
 */
const OPERATOR_PATTERNS: { pattern: string; operator: FilterOperator }[] = [
  { pattern: "==null", operator: "==null" },
  { pattern: "!=null", operator: "!=null" },
  { pattern: "!_-=", operator: "!_-=" },
  { pattern: "!@=", operator: "!@=" },
  { pattern: "!_=", operator: "!_=" },
  { pattern: "@=*", operator: "@=*" },
  { pattern: "_=*", operator: "_=*" },
  { pattern: "==*", operator: "==*" },
  { pattern: "_-=", operator: "_-=" },
  { pattern: ">=", operator: ">=" },
  { pattern: "<=", operator: "<=" },
  { pattern: "@=", operator: "@=" },
  { pattern: "_=", operator: "_=" },
  { pattern: "!=", operator: "!=" },
  { pattern: "==", operator: "==" },
  { pattern: ">", operator: ">" },
  { pattern: "<", operator: "<" },
];

// ==================== PARSER FUNCTIONS ====================

/**
 * Parse a sieve query from URL search params
 */
export function parseSieveQuery(
  searchParams: URLSearchParams,
  config?: SieveConfig
): SieveParseResult {
  const errors: SieveError[] = [];
  const warnings: string[] = [];

  // Parse pagination
  const { page, pageSize, paginationErrors } = parsePagination(searchParams, config);
  errors.push(...paginationErrors);

  // Parse sorts
  const { sorts, sortErrors, sortWarnings } = parseSorts(
    searchParams.get("sorts") || "",
    config
  );
  errors.push(...sortErrors);
  warnings.push(...sortWarnings);

  // Parse filters
  const { filters, filterErrors, filterWarnings } = parseFilters(
    searchParams.get("filters") || "",
    config
  );
  errors.push(...filterErrors);
  warnings.push(...filterWarnings);

  const query: SieveQuery = {
    page,
    pageSize,
    sorts: sorts.length > 0 ? sorts : config?.defaultSort ? [config.defaultSort] : [],
    filters,
  };

  return { query, errors, warnings };
}

/**
 * Parse pagination parameters
 */
function parsePagination(
  searchParams: URLSearchParams,
  config?: SieveConfig
): { page: number; pageSize: number; paginationErrors: SieveError[] } {
  const errors: SieveError[] = [];
  const maxSize = config?.maxPageSize ?? MAX_PAGE_SIZE;
  const defaultSize = config?.defaultPageSize ?? DEFAULT_PAGE_SIZE;

  // Parse page
  let page = DEFAULT_PAGE;
  const pageParam = searchParams.get("page");
  if (pageParam) {
    const parsed = parseInt(pageParam, 10);
    if (isNaN(parsed) || parsed < 1) {
      errors.push({
        type: "invalid_pagination",
        field: "page",
        message: `Invalid page number: ${pageParam}. Must be a positive integer.`,
      });
    } else {
      page = parsed;
    }
  }

  // Parse pageSize
  let pageSize = defaultSize;
  const pageSizeParam = searchParams.get("pageSize");
  if (pageSizeParam) {
    const parsed = parseInt(pageSizeParam, 10);
    if (isNaN(parsed) || parsed < 1) {
      errors.push({
        type: "invalid_pagination",
        field: "pageSize",
        message: `Invalid page size: ${pageSizeParam}. Must be a positive integer.`,
      });
    } else {
      pageSize = Math.min(parsed, maxSize);
    }
  }

  return { page, pageSize, paginationErrors: errors };
}

/**
 * Parse sort parameters
 * Format: field1,-field2 (- prefix = descending)
 */
function parseSorts(
  sortsParam: string,
  config?: SieveConfig
): { sorts: SortField[]; sortErrors: SieveError[]; sortWarnings: string[] } {
  const errors: SieveError[] = [];
  const warnings: string[] = [];
  const sorts: SortField[] = [];

  if (!sortsParam.trim()) {
    return { sorts, sortErrors: errors, sortWarnings: warnings };
  }

  const sortFields = sortsParam.split(",").map((s) => s.trim()).filter(Boolean);

  for (const sortField of sortFields) {
    const isDescending = sortField.startsWith("-");
    const field = isDescending ? sortField.slice(1) : sortField;

    // Validate against config if provided
    if (config?.sortableFields && !config.sortableFields.includes(field)) {
      warnings.push(`Field '${field}' is not sortable. Ignored.`);
      continue;
    }

    sorts.push({
      field,
      direction: isDescending ? "desc" : "asc",
    });
  }

  return { sorts, sortErrors: errors, sortWarnings: warnings };
}

/**
 * Parse filter parameters
 * Format: field1==value1,field2>value2
 */
function parseFilters(
  filtersParam: string,
  config?: SieveConfig
): { filters: FilterCondition[]; filterErrors: SieveError[]; filterWarnings: string[] } {
  const errors: SieveError[] = [];
  const warnings: string[] = [];
  const filters: FilterCondition[] = [];

  if (!filtersParam.trim()) {
    return { filters, filterErrors: errors, filterWarnings: warnings };
  }

  // Split by comma, but handle escaped commas
  const filterStrings = splitFilters(filtersParam);

  for (const filterStr of filterStrings) {
    const parsed = parseFilterCondition(filterStr.trim(), config);
    if (parsed.error) {
      if (parsed.isWarning) {
        warnings.push(parsed.error.message);
      } else {
        errors.push(parsed.error);
      }
      continue;
    }
    if (parsed.condition) {
      filters.push(parsed.condition);
    }
  }

  return { filters, filterErrors: errors, filterWarnings: warnings };
}

/**
 * Split filter string by comma, handling escaped commas
 */
function splitFilters(filtersParam: string): string[] {
  const result: string[] = [];
  let current = "";
  let i = 0;

  while (i < filtersParam.length) {
    if (filtersParam[i] === "\\" && i + 1 < filtersParam.length) {
      // Escaped character
      current += filtersParam[i + 1];
      i += 2;
    } else if (filtersParam[i] === ",") {
      if (current.trim()) {
        result.push(current);
      }
      current = "";
      i++;
    } else {
      current += filtersParam[i];
      i++;
    }
  }

  if (current.trim()) {
    result.push(current);
  }

  return result;
}

/**
 * Parse a single filter condition
 */
function parseFilterCondition(
  filterStr: string,
  config?: SieveConfig
): { condition?: FilterCondition; error?: SieveError; isWarning?: boolean } {
  // Find the operator
  for (const { pattern, operator } of OPERATOR_PATTERNS) {
    const index = filterStr.indexOf(pattern);
    if (index > 0) {
      const field = filterStr.slice(0, index).trim();
      const valueStr = filterStr.slice(index + pattern.length).trim();

      // Validate field against config
      if (config?.filterableFields) {
        const fieldConfig = config.filterableFields.find((f) => f.field === field);
        if (!fieldConfig) {
          return {
            error: {
              type: "unknown_field",
              field,
              message: `Field '${field}' is not filterable. Ignored.`,
            },
            isWarning: true,
          };
        }

        // Validate operator for field
        if (!fieldConfig.operators.includes(operator)) {
          return {
            error: {
              type: "invalid_filter",
              field,
              message: `Operator '${operator}' is not allowed for field '${field}'.`,
            },
          };
        }
      }

      // Parse value
      const value = parseFilterValue(valueStr, operator, config, field);

      // Determine case sensitivity
      const isCaseInsensitive = ["@=", "@=*", "_=*", "==*"].includes(operator);
      const isNegated = operator.startsWith("!");

      return {
        condition: {
          field: config?.fieldMappings?.[field] || field,
          operator,
          value,
          isNegated,
          isCaseInsensitive,
        },
      };
    }
  }

  return {
    error: {
      type: "invalid_filter",
      message: `Could not parse filter: '${filterStr}'. No valid operator found.`,
    },
  };
}

/**
 * Parse filter value to appropriate type
 */
function parseFilterValue(
  valueStr: string,
  operator: FilterOperator,
  config?: SieveConfig,
  field?: string
): FilterValue {
  // Null operators
  if (operator === "==null" || operator === "!=null") {
    return null;
  }

  // Get type from config
  const fieldConfig = config?.filterableFields?.find((f) => f.field === field);
  const type = fieldConfig?.type ?? "string";

  // Boolean
  if (type === "boolean") {
    return valueStr.toLowerCase() === "true";
  }

  // Number
  if (type === "number") {
    const num = parseFloat(valueStr);
    return isNaN(num) ? valueStr : num;
  }

  // Date (convert to Firestore timestamp comparison)
  if (type === "date") {
    const date = new Date(valueStr);
    return isNaN(date.getTime()) ? valueStr : valueStr;
  }

  // String (default)
  return valueStr;
}

// ==================== QUERY STRING BUILDING ====================

/**
 * Build query string from SieveQuery object
 */
export function buildSieveQueryString(query: Partial<SieveQuery>): string {
  const params = new URLSearchParams();

  // Pagination
  if (query.page && query.page !== DEFAULT_PAGE) {
    params.set("page", query.page.toString());
  }
  if (query.pageSize && query.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", query.pageSize.toString());
  }

  // Sorts
  if (query.sorts && query.sorts.length > 0) {
    const sortStr = query.sorts
      .map((s) => (s.direction === "desc" ? `-${s.field}` : s.field))
      .join(",");
    params.set("sorts", sortStr);
  }

  // Filters
  if (query.filters && query.filters.length > 0) {
    const filterStr = query.filters
      .map((f) => `${f.field}${f.operator}${f.value ?? ""}`)
      .join(",");
    params.set("filters", filterStr);
  }

  return params.toString();
}

/**
 * Merge current query with new values
 */
export function mergeSieveQuery(
  current: SieveQuery,
  updates: Partial<SieveQuery>
): SieveQuery {
  return {
    page: updates.page ?? current.page,
    pageSize: updates.pageSize ?? current.pageSize,
    sorts: updates.sorts ?? current.sorts,
    filters: updates.filters ?? current.filters,
  };
}

/**
 * Create a default empty query
 */
export function createDefaultSieveQuery(config?: SieveConfig): SieveQuery {
  return {
    page: DEFAULT_PAGE,
    pageSize: config?.defaultPageSize ?? DEFAULT_PAGE_SIZE,
    sorts: config?.defaultSort ? [config.defaultSort] : [],
    filters: [],
  };
}

// ==================== URL HELPERS ====================

/**
 * Parse sieve query from URL string
 */
export function parseSieveFromURL(url: string, config?: SieveConfig): SieveParseResult {
  const urlObj = new URL(url, "http://localhost");
  return parseSieveQuery(urlObj.searchParams, config);
}

/**
 * Update URL with sieve query
 */
export function updateURLWithSieve(
  baseUrl: string,
  query: Partial<SieveQuery>
): string {
  const url = new URL(baseUrl, "http://localhost");
  const queryString = buildSieveQueryString(query);
  
  if (queryString) {
    // Clear existing sieve params
    url.searchParams.delete("page");
    url.searchParams.delete("pageSize");
    url.searchParams.delete("sorts");
    url.searchParams.delete("filters");
    
    // Add new params
    const newParams = new URLSearchParams(queryString);
    newParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.pathname + url.search;
}
