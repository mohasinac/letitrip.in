/**
 * Dashboard tab configuration constants (SB10-B / Tier TC2).
 *
 * Single source of truth for the tabs shown across store-, admin-, and
 * user-dashboard surfaces. Listing-type tabs come from appkit's
 * `listing-tabs.ts` (SB10-A); this file covers domain-status tab bars
 * (orders, reviews, payouts, etc.) that are app-specific.
 *
 * Each entry is a typed `{ id, label }` row so views can render with a
 * uniform component and stay in sync when statuses are added.
 */

export interface DashboardTab {
  id: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Store dashboard
// ---------------------------------------------------------------------------

export {
  SELLER_LISTING_TABS as STORE_LISTINGS_TABS,
  type SellerListingTabId as StoreListingsTabId,
} from "@mohasinac/appkit";

export const STORE_ORDERS_TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "return_requested", label: "Returns" },
  { id: "refunded", label: "Refunded" },
] as const satisfies readonly DashboardTab[];

export type StoreOrdersTabId = (typeof STORE_ORDERS_TABS)[number]["id"];

export const STORE_REVIEWS_TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "replied", label: "Replied" },
  { id: "flagged", label: "Flagged" },
] as const satisfies readonly DashboardTab[];

export type StoreReviewsTabId = (typeof STORE_REVIEWS_TABS)[number]["id"];

// ---------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------

export const ADMIN_PRODUCTS_TABS = [
  { id: "all", label: "All" },
  { id: "standard", label: "Products" },
  { id: "auction", label: "Auctions" },
  { id: "pre-order", label: "Pre-Orders" },
  { id: "prize-draw", label: "Prize Draws" },
  { id: "bundle", label: "Bundles" },
] as const satisfies readonly DashboardTab[];

export type AdminProductsTabId = (typeof ADMIN_PRODUCTS_TABS)[number]["id"];

export const ADMIN_ORDERS_TABS = STORE_ORDERS_TABS;
export type AdminOrdersTabId = StoreOrdersTabId;

export const ADMIN_USERS_TABS = [
  { id: "all", label: "All" },
  { id: "admin", label: "Admins" },
  { id: "seller", label: "Sellers" },
  { id: "buyer", label: "Buyers" },
  { id: "banned", label: "Banned" },
] as const satisfies readonly DashboardTab[];

export type AdminUsersTabId = (typeof ADMIN_USERS_TABS)[number]["id"];

export const ADMIN_STORES_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "suspended", label: "Suspended" },
  { id: "verified", label: "Verified" },
] as const satisfies readonly DashboardTab[];

export type AdminStoresTabId = (typeof ADMIN_STORES_TABS)[number]["id"];

export const ADMIN_EVENTS_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Draft" },
  { id: "ended", label: "Ended" },
  { id: "raffle", label: "Raffles" },
  { id: "spin_wheel", label: "Spin Wheel" },
] as const satisfies readonly DashboardTab[];

export type AdminEventsTabId = (typeof ADMIN_EVENTS_TABS)[number]["id"];

export const ADMIN_BLOG_TABS = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "featured", label: "Featured" },
] as const satisfies readonly DashboardTab[];

export type AdminBlogTabId = (typeof ADMIN_BLOG_TABS)[number]["id"];

export const ADMIN_PAYOUTS_TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "paid", label: "Paid" },
  { id: "failed", label: "Failed" },
] as const satisfies readonly DashboardTab[];

export type AdminPayoutsTabId = (typeof ADMIN_PAYOUTS_TABS)[number]["id"];

// ---------------------------------------------------------------------------
// User dashboard
// ---------------------------------------------------------------------------

export const USER_ORDERS_TABS = STORE_ORDERS_TABS;
export type UserOrdersTabId = StoreOrdersTabId;

export const USER_PROFILE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "wishlist", label: "Wishlist" },
  { id: "reviews", label: "Reviews" },
  { id: "addresses", label: "Addresses" },
  { id: "sessions", label: "Sessions" },
] as const satisfies readonly DashboardTab[];

export type UserProfileTabId = (typeof USER_PROFILE_TABS)[number]["id"];

// Admin filter-chip tab sets — exported from appkit
// (`@mohasinac/appkit/admin/filter-tabs`) so admin views consume the same
// shape. Re-exported here for consumer code that also imports from
// `@/constants`. Keep the import path stable.
export {
  ALL_TAB,
  EMPTY_TAB,
  ADMIN_PRODUCT_STATUS_TABS,
  ADMIN_PRODUCT_LISTING_TYPE_TABS,
  ADMIN_BLOG_STATUS_TABS,
  ADMIN_USER_STATUS_TABS,
  ADMIN_USER_ROLE_TABS,
  ADMIN_STORE_STATUS_TABS,
  ADMIN_PAYOUT_STATUS_TABS,
  ADMIN_ORDER_STATUS_TABS,
  ADMIN_REVIEW_STATUS_TABS,
  ADMIN_REVIEW_RATING_TABS,
  ADMIN_BID_STATUS_TABS,
  ADMIN_CONTACT_STATUS_TABS,
  ADMIN_NEWSLETTER_STATUS_TABS,
  ADMIN_EVENT_ENTRY_STATUS_TABS,
  ADMIN_EVENT_STATUS_TABS,
  ADMIN_CART_OWNERSHIP_TABS,
  ADMIN_COUPON_TYPE_TABS,
  SELLER_PRODUCT_STATUS_TABS,
  SELLER_AUCTION_STATUS_TABS,
  SELLER_ORDER_STATUS_TABS,
  SELLER_OFFER_STATUS_TABS,
  SELLER_BID_STATUS_TABS,
} from "@mohasinac/appkit";
