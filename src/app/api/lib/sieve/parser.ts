/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/sieve/parser
 * @description This file contains functionality related to parser
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
/**
 * Parses sieve query
 *
 * @param {URLSearchParams} searchParams - The search params
 * @param {SieveConfig} [config] - The config
 *
 * @returns {any} The parsesievequery result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * parseSieveQuery(searchParams, config);
 */

/**
 * Parses sieve query
 *
 * @returns {any} The parsesievequery result
 *
 * @example
 * parseSieveQuery();
 */

export function parseSieveQuery(
  /** Search Params */
  searchParams: URLSearchParams,
  /** Config */
  config?: SieveConfig,
): SieveParseResult {
  const errors: SieveError[] = [];
  const warnings: string[] = [];

  // Parse pagination
  const { page, pageSize, paginationErrors } = parsePagination(
    searchParams,
    config,
  );
  errors.push(...paginationErrors);

  // Parse sorts
  const { sorts, sortErrors, sortWarnings } = parseSorts(
    searchParams.get("sorts") || "",
    config,
  );
  errors.push(...sortErrors);
  warnings.push(...sortWarnings);

  // Parse filters
  const { filters, filterErrors, filterWarnings } = parseFilters(
    searchParams.get("filters") || "",
    config,
  );
  errors.push(...filterErrors);
  warnings.push(...filterWarnings);

  const query: SieveQuery = {
    page,
    pageSize,
    /** Sorts */
    sorts:
      sorts.length > 0
        ? sorts
        : config?.defaultSort
          ? [config.defaultSort]
          : [],
    filters,
  };

  return { query, errors, warnings };
}

/**
 * Parse pagination parameters
 */
/**
 * Parses pagination
 *
 * @param {URLSearchParams} searchParams - The search params
 * @param {SieveConfig} [config] - The config
 *
 * @returns {number} The parsepagination result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Parses pagination
 *
 * @returns {any} The parsepagination result
 */

function parsePagination(
  /** Search Params */
  searchParams: URLSearchParams,
  /** Config */
  config?: SieveConfig,
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
        /** Type */
        type: "invalid_pagination",
        /** Field */
        field: "page",
        /** Message */
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
        /** Type */
        type: "invalid_pagination",
        /** Field */
        field: "pageSize",
        /** Message */
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
/**
 * Parses sorts
 *
 * @param {string} sortsParam - The sorts param
 * @param {SieveConfig} [config] - The config
 *
 * @returns {string} The parsesorts result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Parses sorts
 *
 * @returns {string} The parsesorts result
 */

function parseSorts(
  /** Sorts Param */
  sortsParam: string,
  /** Config */
  config?: SieveConfig,
): { sorts: SortField[]; sortErrors: SieveError[]; sortWarnings: string[] } {
  const errors: SieveError[] = [];
  const warnings: string[] = [];
  const sorts: SortField[] = [];

  if (!sortsParam.trim()) {
    return { sorts, sortErrors: errors, sortWarnings: warnings };
  }

  const sortFields = sortsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

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
      /** Direction */
      direction: isDescending ? "desc" : "asc",
    });
  }

  return { sorts, sortErrors: errors, sortWarnings: warnings };
}

/**
 * Parse filter parameters
 * Format: field1==value1,field2>value2
 */
/**
 * Parses filters
 *
 * @param {string} filtersParam - The filters param
 * @param {SieveConfig} [config] - The config
 *
 * @returns {string} The parsefilters result
 */

/**
 * Parses filters
 *
 * @returns {string} The parsefilters result
 */

function parseFilters(
  /** Filters Param */
  filtersParam: string,
  /** Config */
  config?: SieveConfig,
): {
  /** Filters */
  filters: FilterCondition[];
  /** Filter Errors */
  filterErrors: SieveError[];
  /** Filter Warnings */
  filterWarnings: string[];
} {
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
/**
 * Performs split filters operation
 *
 * @param {string} filtersParam - The filters param
 *
 * @returns {string} The splitfilters result
 */

/**
 * Performs split filters operation
 *
 * @param {string} filtersParam - The filters param
 *
 * @returns {string} The splitfilters result
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
/**
 * Parses filter condition
 *
 * @param {string} filterStr - The filter str
 * @param {SieveConfig} [config] - The config
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Parses filter condition
 *
 * @returns {string} The parsefiltercondition result
 */

function parseFilterCondition(
  /** Filter Str */
  filterStr: string,
  /** Config */
  config?: SieveConfig,
): { condition?: FilterCondition; error?: SieveError; isWarning?: boolean } {
  // Find the operator
  for (const { pattern, operator } of OPERATOR_PATTERNS) {
    const index = filterStr.indexOf(pattern);
    if (index > 0) {
      const field = filterStr.slice(0, index).trim();
      const valueStr = filterStr.slice(index + pattern.length).trim();

      // Validate field against config
      if (config?.filterableFields) {
        const fieldConfig = config.filterableFields.find(
          (f) => f.field === field,
        );
        if (!fieldConfig) {
          return {
            /** Error */
            error: {
              /** Type */
              type: "unknown_field",
              field,
              /** Message */
              message: `Field '${field}' is not filterable. Ignored.`,
            },
            /** Is Warning */
            isWarning: true,
          };
        }

        // Validate operator for field
        if (!fieldConfig.operators.includes(operator)) {
          return {
            /** Error */
            error: {
              /** Type */
              type: "invalid_filter",
              field,
              /** Message */
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
        /** Condition */
        condition: {
          /** Field */
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
    /** Error */
    error: {
      /** Type */
      type: "invalid_filter",
      /** Message */
      message: `Could not parse filter: '${filterStr}'. No valid operator found.`,
    },
  };
}

/**
 * Parse filter value to appropriate type
 */
/**
 * Parses filter value
 *
 * @returns {string} The parsefiltervalue result
 */

/**
 * Parses filter value
 *
 * @returns {string} The parsefiltervalue result
 */

function parseFilterValue(
  /** Value Str */
  valueStr: string,
  /** Operator */
  operator: FilterOperator,
  /** Config */
  config?: SieveConfig,
  /** Field */
  field?: string,
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
/**
 * Performs build sieve query string operation
 *
 * @param {Partial<SieveQuery>} query - The query
 *
 * @returns {string} The buildsievequerystring result
 *
 * @example
 * buildSieveQueryString(query);
 */

/**
 * Performs build sieve query string operation
 *
 * @param {Partial<SieveQuery>} query - The query
 *
 * @returns {string} The buildsievequerystring result
 *
 * @example
 * buildSieveQueryString(query);
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
/**
 * Performs merge sieve query operation
 *
 * @param {SieveQuery} current - The current
 * @param {Partial<SieveQuery>} updates - The updates
 *
 * @returns {any} The mergesievequery result
 *
 * @example
 * mergeSieveQuery(current, updates);
 */

/**
 * Performs merge sieve query operation
 *
 * @returns {any} The mergesievequery result
 *
 * @example
 * mergeSieveQuery();
 */

export function mergeSieveQuery(
  /** Current */
  current: SieveQuery,
  /** Updates */
  updates: Partial<SieveQuery>,
): SieveQuery {
  return {
    /** Page */
    page: updates.page ?? current.page,
    /** Page Size */
    pageSize: updates.pageSize ?? current.pageSize,
    /** Sorts */
    sorts: updates.sorts ?? current.sorts,
    /** Filters */
    filters: updates.filters ?? current.filters,
  };
}

/**
 * Create a default empty query
 */
/**
 * Creates a new default sieve query
 *
 * @param {SieveConfig} [config] - The config
 *
 * @returns {any} The defaultsievequery result
 *
 * @example
 * createDefaultSieveQuery(config);
 */

/**
 * Creates a new default sieve query
 *
 * @param {SieveConfig} [config] - The config
 *
 * @returns {any} The defaultsievequery result
 *
 * @example
 * createDefaultSieveQuery(config);
 */

export function createDefaultSieveQuery(config?: SieveConfig): SieveQuery {
  return {
    /** Page */
    page: DEFAULT_PAGE,
    /** Page Size */
    pageSize: config?.defaultPageSize ?? DEFAULT_PAGE_SIZE,
    /** Sorts */
    sorts: config?.defaultSort ? [config.defaultSort] : [],
    /** Filters */
    filters: [],
  };
}

// ==================== URL HELPERS ====================

/**
 * Parse sieve query from URL string
 */
/**
 * Parses sieve from u r l
 *
 * @param {string} url - The url
 * @param {SieveConfig} [config] - The config
 *
 * @returns {string} The parsesievefromurl result
 *
 * @example
 * parseSieveFromURL("example", config);
 */

/**
 * Parses sieve from u r l
 *
 * @returns {string} The parsesievefromurl result
 *
 * @example
 * parseSieveFromURL();
 */

export function parseSieveFromURL(
  /** Url */
  url: string,
  /** Config */
  config?: SieveConfig,
): SieveParseResult {
  const urlObj = new URL(url, "http://localhost");
  return parseSieveQuery(urlObj.searchParams, config);
}

/**
 * Update URL with sieve query
 */
/**
 * Updates existing u r l with sieve
 *
 * @param {string} baseUrl - The base url
 * @param {Partial<SieveQuery>} query - The query
 *
 * @returns {string} The updateurlwithsieve result
 *
 * @example
 * updateURLWithSieve("example", query);
 */

/**
 * Updates existing u r l with sieve
 *
 * @returns {string} The updateurlwithsieve result
 *
 * @example
 * updateURLWithSieve();
 */

export function updateURLWithSieve(
  /** Base Url */
  baseUrl: string,
  /** Query */
  query: Partial<SieveQuery>,
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
