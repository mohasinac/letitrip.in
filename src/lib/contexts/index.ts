/**
 * Contexts Index
 * Central export point for all React contexts
 */

// Note: Auth context is in @/contexts/SessionAuthContext
// Import it directly: import { useAuth } from "@/contexts/SessionAuthContext";

// Cart Context
export { CartProvider, useCart } from "./CartContext";

// Wishlist Context
export { WishlistProvider, useWishlist } from "./WishlistContext";

// Currency Context
export { CurrencyProvider, useCurrency } from "./CurrencyContext";

// Theme Context
export { ModernThemeProvider, useModernTheme } from "./ModernThemeContext";

// Breadcrumb Context
export { BreadcrumbProvider, useBreadcrumb } from "./BreadcrumbContext";
