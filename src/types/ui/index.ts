/**
 * Frontend UI Types Index
 * Types specific to the UI/Frontend layer
 */

// Component types
export * from "./components";

// Hook return types
export * from "./hooks";

// Context value types (with explicit re-exports to avoid ambiguity)
export type {
  AuthContextValue,
  CartContextValue,
  WishlistContextValue,
  ThemeContextValue,
  CurrencyContextValue,
  BreadcrumbContextValue,
  SearchContextValue,
  Toast,
  ToastContextValue,
  ModalContextValue,
  ProviderProps,
} from "./contexts";

// Re-export BreadcrumbItem from contexts (overrides component version)
export type { BreadcrumbItem as ContextBreadcrumbItem } from "./contexts";
