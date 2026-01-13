/**
 * TypeScript type exports for @letitrip/react-library
 * 
 * This module exports all TypeScript types, interfaces, and type utilities
 * used across the library for consumer applications.
 * 
 * @module types
 */

// Common types
export type {
  // Size and variant types
  Size,
  Variant,
  Status,
  Color,
  AuctionStatus,
  RipLimitStatus,
  
  // Base component interfaces
  BaseComponentProps,
  WithChildren,
  WithLoading,
  WithDisabled,
  WithError,
  FormFieldProps,
  SelectOption,
  
  // Formatting and display types
  DateFormat,
  PriceOptions,
  
  // Validation types
  ValidationResult,
  Validator,
  
  // Utility function types
  Formatter,
  Sanitizer,
  
  // Event handler types
  ChangeHandler,
  ClickHandler,
  SubmitHandler,
  
  // Responsive types
  Breakpoint,
  Orientation,
  
  // Theme types
  Theme,
  
  // Async state types
  LoadingState,
  AsyncState,
  
  // Pagination and sorting
  PaginationState,
  SortDirection,
  SortConfig,
  FilterValue,
  FilterConfig,
} from './common';

/**
 * Utility type: Extract prop type from component
 * 
 * @example
 * type MyButtonProps = ComponentProps<typeof Button>;
 */
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

/**
 * Utility type: Make specific properties optional
 * 
 * @example
 * type PartialButton = PartialBy<ButtonProps, 'onClick' | 'variant'>;
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type: Make specific properties required
 * 
 * @example
 * type RequiredButton = RequiredBy<ButtonProps, 'onClick'>;
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Utility type: Override specific properties
 * 
 * @example
 * type CustomButton = Override<ButtonProps, { onClick: () => Promise<void> }>;
 */
export type Override<T, U> = Omit<T, keyof U> & U;

/**
 * Utility type: Extract function parameters
 * 
 * @example
 * type FormatPriceParams = FunctionParams<typeof formatPrice>;
 */
export type FunctionParams<T extends (...args: any[]) => any> = Parameters<T>;

/**
 * Utility type: Extract function return type
 * 
 * @example
 * type FormatPriceReturn = FunctionReturn<typeof formatPrice>;
 */
export type FunctionReturn<T extends (...args: any[]) => any> = ReturnType<T>;

/**
 * Utility type: Make all properties deeply optional
 * 
 * @example
 * type DeepPartialButton = DeepPartial<ButtonProps>;
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility type: Make all properties deeply required
 * 
 * @example
 * type DeepRequiredButton = DeepRequired<ButtonProps>;
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Utility type: Make all properties readonly
 * 
 * @example
 * type ReadonlyButton = Immutable<ButtonProps>;
 */
export type Immutable<T> = {
  readonly [P in keyof T]: T[P] extends object ? Immutable<T[P]> : T[P];
};

/**
 * Utility type: Extract keys of a specific type
 * 
 * @example
 * type StringKeys = KeysOfType<ButtonProps, string>;
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Utility type: Require at least one of the specified keys
 * 
 * @example
 * type ButtonWithOneRequired = RequireAtLeastOne<ButtonProps, 'onClick' | 'href'>;
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
    [K in Keys]-?:
      Required<Pick<T, K>>
      & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys];

/**
 * Utility type: Require only one of the specified keys
 * 
 * @example
 * type ButtonWithOnlyOne = RequireOnlyOne<ButtonProps, 'onClick' | 'href'>;
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
    [K in Keys]-?:
      Required<Pick<T, K>>
      & Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys];
