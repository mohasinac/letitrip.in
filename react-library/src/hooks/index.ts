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
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsTouchDevice,
  useViewport,
  useBreakpoint,
  BREAKPOINTS,
} from "./useMediaQuery";

// Utility hooks
export {
  useToggle,
  usePrevious,
  useClipboard,
  useCounter,
  useInterval,
  useTimeout,
} from "./useUtilities";

