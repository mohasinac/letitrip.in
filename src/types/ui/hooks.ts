/**
 * Frontend Hook Return Types
 */

import {
  User,
  Product,
  Category,
  Order,
  Cart,
  CartItem,
  Review,
  Auction,
} from "../shared";
import { PaginatedResponse } from "../shared/common";

/**
 * Base hook return with loading and error
 */
export interface BaseHookReturn {
  loading: boolean;
  error: string | null;
}

/**
 * Hook return with data
 */
export interface DataHookReturn<T> extends BaseHookReturn {
  data: T | null;
  refetch: () => Promise<void>;
}

/**
 * Hook return with paginated data
 */
export interface PaginatedHookReturn<T> extends BaseHookReturn {
  data: PaginatedResponse<T> | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

/**
 * Mutation hook return
 */
export interface MutationHookReturn<TData = any, TVariables = any> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: string | null;
  data: TData | null;
  reset: () => void;
}

/**
 * Use products hook return
 */
export interface UseProductsReturn extends PaginatedHookReturn<Product> {
  products: Product[];
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
}

/**
 * Use product hook return
 */
export interface UseProductReturn extends DataHookReturn<Product> {
  product: Product | null;
}

/**
 * Use categories hook return
 */
export interface UseCategoriesReturn extends DataHookReturn<Category[]> {
  categories: Category[];
  tree: any;
  findBySlug: (slug: string) => Category | undefined;
}

/**
 * Use category hook return
 */
export interface UseCategoryReturn extends DataHookReturn<Category> {
  category: Category | null;
}

/**
 * Use cart hook return
 */
export interface UseCartReturn {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  loading: boolean;
  error: string | null;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
}

/**
 * Use auth hook return
 */
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Use orders hook return
 */
export interface UseOrdersReturn extends PaginatedHookReturn<Order> {
  orders: Order[];
  filters: any;
  setFilters: (filters: any) => void;
}

/**
 * Use order hook return
 */
export interface UseOrderReturn extends DataHookReturn<Order> {
  order: Order | null;
  cancelOrder: () => Promise<void>;
  trackOrder: () => Promise<any>;
}

/**
 * Use reviews hook return
 */
export interface UseReviewsReturn extends PaginatedHookReturn<Review> {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

/**
 * Use wishlist hook return
 */
export interface UseWishlistReturn {
  items: Product[];
  itemIds: string[];
  loading: boolean;
  error: string | null;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clear: () => Promise<void>;
}

/**
 * Use addresses hook return
 */
export interface UseAddressesReturn extends DataHookReturn<any[]> {
  addresses: any[];
  defaultAddress: any | null;
  addAddress: (data: any) => Promise<void>;
  updateAddress: (id: string, data: any) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

/**
 * Use search hook return
 */
export interface UseSearchReturn {
  query: string;
  results: Product[];
  suggestions: string[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

/**
 * Use theme hook return
 */
export interface UseThemeReturn {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
  isDark: boolean;
}

/**
 * Use currency hook return
 */
export interface UseCurrencyReturn {
  currency: string;
  setCurrency: (currency: string) => void;
  convert: (amount: number, from?: string, to?: string) => number;
  format: (amount: number, currency?: string) => string;
  rates: Record<string, number>;
}

/**
 * Use pagination hook return
 */
export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

/**
 * Use form hook return
 */
export interface UseFormReturn<T = any> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  reset: () => void;
  handleSubmit: (callback: (values: T) => void | Promise<void>) => (e?: any) => Promise<void>;
  validate: () => boolean;
}

/**
 * Use local storage hook return
 */
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  remove: () => void;
}

/**
 * Use debounce hook return
 */
export type UseDebounceReturn<T> = T;

/**
 * Use media query hook return
 */
export interface UseMediaQueryReturn {
  matches: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Use intersection observer hook return
 */
export interface UseIntersectionObserverReturn {
  ref: (node: Element | null) => void;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Use auctions hook return
 */
export interface UseAuctionsReturn extends PaginatedHookReturn<Auction> {
  auctions: Auction[];
  activeAuctions: Auction[];
  upcomingAuctions: Auction[];
  endedAuctions: Auction[];
}

/**
 * Use auction hook return
 */
export interface UseAuctionReturn extends DataHookReturn<Auction> {
  auction: Auction | null;
  placeBid: (amount: number) => Promise<void>;
  currentBid: number;
  timeRemaining: number;
  isActive: boolean;
  hasEnded: boolean;
}
