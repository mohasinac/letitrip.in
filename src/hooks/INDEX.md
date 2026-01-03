/\*\*

- Hooks Index
- All reusable hooks with their purposes
  \*/

/\*\*

- FORM MANAGEMENT
- ===============
  \*/

// useFormState - Manages form field state, validation, and touched status
export { useFormState } from "./useFormState";

// usePasswordFieldState - Password visibility and strength validation
export { usePasswordFieldState } from "./usePasswordFieldState";

/\*\*

- UI STATE MANAGEMENT
- ==================
  \*/

// useDialogState - Single dialog visibility state
// useMultipleDialogs - Multiple dialogs visibility state
export { useDialogState, useMultipleDialogs } from "./useDialogState";

/\*\*

- LIST & PAGINATION
- ================
  \*/

// usePaginationState - Pagination with cursor or offset support
export { usePaginationState } from "./usePaginationState";

// useResourceListState - Complete list state (items, filters, selection, pagination)
export { useResourceListState } from "./useResourceListState";

// useFetchResourceList - List state combined with async data fetching
export { useFetchResourceList } from "./useFetchResourceList";

/\*\*

- MULTI-STEP FORMS
- ================
  \*/

// useCheckoutState - Multi-step checkout form state
export { useCheckoutState } from "./useCheckoutState";

// useWizardFormState - Multi-step wizard form state with validation
export { useWizardFormState } from "./useWizardFormState";

/\*\*

- EXISTING HOOKS (DO NOT MODIFY)
- ==============================
  \*/

// useLoadingState - Loading/error/data state management (EXISTING)
export { useLoadingState, useMultiLoadingState } from "./useLoadingState";

// useDebounce / useDebouncedCallback - Debouncing (EXISTING)
export { useDebounce, useDebouncedCallback, useThrottle } from "./useDebounce";

// useCart - Cart management (EXISTING)
export { useCart } from "./useCart";

// useMobile / useWindowResize - Responsive utilities (EXISTING)
export { useIsMobile, useMobile, useWindowResize } from "./useMobile";

// useFilters - URL filter management (EXISTING)
export { useFilters } from "./useFilters";

// useUrlFilters / useUrlPagination - URL state sync (EXISTING)
export { useUrlFilters } from "./useUrlFilters";
export { useUrlPagination } from "./useUrlPagination";

// useBulkSelection - Bulk selection state (EXISTING)
export { useBulkSelection } from "./useBulkSelection";

// Other utilities (EXISTING)
export { useHeaderStats } from "./useHeaderStats";
export { useLoadingState } from "./useLoadingState";
export { useMediaUpload, useMediaUploadWithCleanup } from "./useMediaUpload";
export { useNavigationGuard } from "./useNavigationGuard";
export { useSafeLoad } from "./useSafeLoad";
export { useSlugValidation } from "./useSlugValidation";
