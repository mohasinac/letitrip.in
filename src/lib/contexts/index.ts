/**
 * Contexts Index
 * Central export point for all React contexts
 */

// Auth Context
export { AuthProvider, useAuth } from "./AuthContext";

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
