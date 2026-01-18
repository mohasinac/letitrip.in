/**
 * Common TypeScript types and interfaces used across the library.
 *
 * @module types/common
 */

/**
 * Size variants for components
 */
export type Size = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Button and component variants
 */
export type Variant = "primary" | "secondary" | "outline" | "ghost" | "link";

/**
 * Status types for badges, indicators, etc.
 */
export type Status =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

/**
 * Color types for components
 */
export type Color =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

/**
 * Auction status types
 */
export type AuctionStatus = "active" | "ending" | "ended";

/**
 * Product status types
 */
export type ProductStatus = "draft" | "active" | "inactive" | "archived" | "pending" | "rejected";

/**
 * RipLimit status types
 */
export type RipLimitStatus = "default" | "blocked" | "available";

/**
 * Common base props for all components
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Component ID */
  id?: string;
  /** Accessibility label */
  "aria-label"?: string;
  /** Data test ID for testing */
  "data-testid"?: string;
}

/**
 * Props for components with children
 */
export interface WithChildren {
  /** React children */
  children?: React.ReactNode;
}

/**
 * Props for components with loading state
 */
export interface WithLoading {
  /** Loading state */
  loading?: boolean;
  /** Loading text to display */
  loadingText?: string;
}

/**
 * Props for components with disabled state
 */
export interface WithDisabled {
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Props for components with error state
 */
export interface WithError {
  /** Error message */
  error?: string | null;
}

/**
 * Common form field props
 */
export interface FormFieldProps
  extends BaseComponentProps,
    WithDisabled,
    WithError {
  /** Field label */
  label?: string;
  /** Field name */
  name?: string;
  /** Required field indicator */
  required?: boolean;
  /** Help text */
  helpText?: string;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Select option type
 */
export interface SelectOption<T = string> {
  /** Option value */
  value: T;
  /** Option label */
  label: string;
  /** Option disabled state */
  disabled?: boolean;
  /** Option group */
  group?: string;
}

/**
 * Date format options
 */
export type DateFormat = "relative" | "short" | "long" | "full" | "custom";

/**
 * Price display options
 */
export interface PriceOptions {
  /** Show currency symbol */
  showCurrency?: boolean;
  /** Compact large numbers (1.2K, 2.5M) */
  compact?: boolean;
  /** Number of decimal places */
  decimals?: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Error message if validation failed */
  message?: string;
}

/**
 * Validator function type
 */
export type Validator<T = any> = (value: T) => boolean | ValidationResult;

/**
 * Formatter function type
 */
export type Formatter<T = any, R = string> = (value: T, options?: any) => R;

/**
 * Sanitizer function type
 */
export type Sanitizer<T = string> = (value: T, options?: any) => T;

/**
 * Event handler types
 */
export type ChangeHandler<T = string> = (value: T) => void;
export type ClickHandler = () => void;
export type SubmitHandler = (data: any) => void | Promise<void>;

/**
 * Breakpoint types for responsive hooks
 */
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Orientation type
 */
export type Orientation = "portrait" | "landscape";

/**
 * Theme type
 */
export type Theme = "light" | "dark" | "system";

/**
 * Loading state type
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Async operation state
 */
export interface AsyncState<T = any, E = Error> {
  /** Loading state */
  loading: boolean;
  /** Data if loaded */
  data: T | null;
  /** Error if failed */
  error: E | null;
  /** Refetch function */
  refetch?: () => void;
}

/**
 * Pagination state
 */
export interface PaginationState {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total items */
  total: number;
  /** Total pages */
  totalPages: number;
  /** Has previous page */
  hasPrevious: boolean;
  /** Has next page */
  hasNext: boolean;
}

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort configuration
 */
export interface SortConfig<T = string> {
  /** Field to sort by */
  field: T;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Filter value types
 */
export type FilterValue = string | number | boolean | Date | null | undefined;

/**
 * Filter configuration
 */
export interface FilterConfig<T = string> {
  /** Field to filter */
  field: T;
  /** Filter operator */
  operator:
    | "eq"
    | "ne"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "contains"
    | "startsWith"
    | "endsWith";
  /** Filter value */
  value: FilterValue;
}
