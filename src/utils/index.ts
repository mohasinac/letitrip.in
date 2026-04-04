/**
 * Utils Barrel Export
 *
 * App-specific utilities live locally. Generic helpers come from @mohasinac/utils.
 */

// ------- Existing local exports (unchanged) -------
// Validators (pure function validators)
export * from "./validators";
// Formatters (date, number, string)
export * from "./formatters";
// Converters (cookie, type)
export * from "./converters";
// ID Generators — app-specific superset of @mohasinac/utils generators
export * from "./id-generators";
// Event Management
export * from "./events";
// Guest Cart (localStorage storage for unauthenticated users)
export * from "./guest-cart";
// Order Splitter (cart → order group segmentation)
export * from "./order-splitter";
// Business Day (10:00 AM IST day-boundary logic)
export * from "./business-day";
// PII Redaction (sanitize objects before logging)
export { redactPii } from "@mohasinac/security/pii-redact";

// ------- New helpers from @mohasinac/utils (not previously in this barrel) -------
export {
  groupBy,
  unique,
  uniqueBy,
  sortBy,
  chunk,
  paginate,
  deepMerge,
  pick,
  omit,
  isEmptyObject,
  deepClone,
  isEqual,
  cleanObject,
  buildSieveFilters,
  calculatePagination,
  sort,
  formatCustomDate,
} from "@mohasinac/utils";
export type {
  PaginationOptions,
  PaginationResult,
  SortOrder,
} from "@mohasinac/utils";
