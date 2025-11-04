/**
 * Frontend Context Types
 */

import { ReactNode } from "react";
import { User } from "../shared/user";
import { Cart, CartItem } from "../shared";
import { Product } from "../shared";

/**
 * Auth context value
 */
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Cart context value
 */
export interface CartContextValue {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
}

/**
 * Wishlist context value
 */
export interface WishlistContextValue {
  items: Product[];
  itemIds: string[];
  isLoading: boolean;
  error: string | null;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clear: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  theme: "light" | "dark" | "system";
  actualTheme: "light" | "dark";
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
  isDark: boolean;
}

/**
 * Currency context value
 */
export interface CurrencyContextValue {
  currency: string;
  symbol: string;
  setCurrency: (currency: string) => void;
  convert: (amount: number, from?: string, to?: string) => number;
  format: (amount: number, currency?: string) => string;
  rates: Record<string, number>;
  isLoading: boolean;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

/**
 * Breadcrumb context value
 */
export interface BreadcrumbContextValue {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
  addItem: (item: BreadcrumbItem) => void;
  removeLastItem: () => void;
  clear: () => void;
}

/**
 * Search context value
 */
export interface SearchContextValue {
  query: string;
  results: Product[];
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
  recentSearches: string[];
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
}

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast context value
 */
export interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

/**
 * Modal context value
 */
export interface ModalContextValue {
  modals: Map<string, {
    isOpen: boolean;
    component: ReactNode;
    props?: any;
  }>;
  openModal: (id: string, component: ReactNode, props?: any) => void;
  closeModal: (id: string) => void;
  closeAll: () => void;
}

/**
 * Provider props
 */
export interface ProviderProps {
  children: ReactNode;
}
