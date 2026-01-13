/**
 * React Hooks
 *
 * Reusable custom hooks for common patterns
 */

// Debounce and throttle hooks
export { useDebounce, useDebouncedCallback, useThrottle } from "./useDebounce";

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
