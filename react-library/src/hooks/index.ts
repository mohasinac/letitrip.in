/**
 * React Hooks
 *
 * Reusable custom hooks for common patterns
 */

// Debounce and throttle hooks
export { useDebounce, useDebouncedCallback, useThrottle } from "./useDebounce";

// Filter hooks (Task 18.2)
export { useFilters } from "./useFilters";
export type {
  UseFiltersOptions,
  UseFiltersReturn,
  UseFiltersRouter,
} from "./useFilters";

export { useUrlFilters } from "./useUrlFilters";
export type {
  FilterState,
  SortState,
  UseUrlFiltersOptions,
  UseUrlFiltersReturn,
  UseUrlFiltersRouter,
} from "./useUrlFilters";

// Storage hooks
export { useLocalStorage } from "./useLocalStorage";
export type { UseLocalStorageOptions } from "./useLocalStorage";

// Media query and responsive hooks
export {
  BREAKPOINTS,
  useBreakpoint,
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useIsTouchDevice,
  useMediaQuery,
  useViewport,
} from "./useMediaQuery";

// Utility hooks
export {
  useClipboard,
  useCounter,
  useInterval,
  usePrevious,
  useTimeout,
  useToggle,
} from "./useUtilities";

// Upload hooks (Task 17.2)
export { useMediaUpload } from "./useMediaUpload";
export type { MediaUploadOptions, MediaUploadReturn } from "./useMediaUpload";

// Table and data hooks (Task 18.1)
export { useBulkSelection } from "./useBulkSelection";
export type {
  UseBulkSelectionOptions,
  UseBulkSelectionReturn,
} from "./useBulkSelection";

export { useLoadingState, useMultiLoadingState } from "./useLoadingState";
export type {
  LoadingState,
  UseLoadingStateOptions,
  UseLoadingStateReturn,
} from "./useLoadingState";

export { usePaginationState } from "./usePaginationState";
export type {
  PaginationConfig,
  UsePaginationStateReturn,
} from "./usePaginationState";

export { useResourceList } from "./useResourceList";
export type {
  FilterConfig,
  SievePagination,
  SortField,
  UseResourceListOptions,
  UseResourceListReturn,
} from "./useResourceList";

export { useResourceListState } from "./useResourceListState";
export type {
  ResourceListConfig,
  UseResourceListStateReturn,
} from "./useResourceListState";

export { useFetchResourceList } from "./useFetchResourceList";
export type {
  FetchResourceListConfig,
  UseFetchResourceListReturn,
} from "./useFetchResourceList";

// Pagination hooks (Task 18.3)
export { useUrlPagination } from "./useUrlPagination";
export type {
  UseUrlPaginationOptions,
  UseUrlPaginationReturn,
  UseUrlPaginationRouter,
} from "./useUrlPagination";

export { useInfiniteScroll } from "./useInfiniteScroll";
export type {
  UseInfiniteScrollOptions,
  UseInfiniteScrollReturn,
} from "./useInfiniteScroll";

export { useVirtualGrid, useVirtualList } from "./useVirtualList";
export type {
  UseVirtualListOptions,
  UseVirtualListReturn,
} from "./useVirtualList";

// Form hooks (Task 18.4)
export { useFormState } from "./useFormState";
export type {
  AsyncValidator,
  UseFormStateOptions,
  UseFormStateReturn,
} from "./useFormState";

export { useDialogState, useMultipleDialogs } from "./useDialogState";
export type {
  DialogStateConfig,
  UseDialogStateReturn,
  UseMultipleDialogsReturn,
} from "./useDialogState";

export { usePasswordFieldState } from "./usePasswordFieldState";
export type { UsePasswordFieldStateReturn } from "./usePasswordFieldState";

export { useSlugValidation } from "./useSlugValidation";
export type {
  UseSlugValidationOptions,
  UseSlugValidationReturn,
} from "./useSlugValidation";

export { useWizardFormState } from "./useWizardFormState";
export type {
  StepState,
  UseWizardFormStateConfig,
  UseWizardFormStateReturn,
} from "./useWizardFormState";
