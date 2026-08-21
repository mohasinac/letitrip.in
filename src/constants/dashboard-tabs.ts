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

// STORE_LISTINGS_TABS (a rename of appkit's SELLER_LISTING_TABS) was removed
// 2026-08-21 — it had zero consumers and only existed as an alias. Import
// SELLER_LISTING_TABS from @mohasinac/appkit/constants directly if a store
// listings tab bar is ever built; it is now derived from the listing-type
// plugin registry, so it can't go stale the way this alias's admin twin did.

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

/** Role-perspective review tabs shown on the store /reviews page. */
export const STORE_REVIEWS_ROLE_TABS = [
  { id: "received", label: "Received" },
  { id: "given_to_buyers", label: "Given to Buyers" },
  { id: "written_as_customer", label: "Written as Customer" },
] as const satisfies readonly DashboardTab[];

export type StoreReviewsRoleTabId = (typeof STORE_REVIEWS_ROLE_TABS)[number]["id"];

// ---------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------

// ADMIN_PRODUCTS_TABS was removed 2026-08-21. It had zero consumers, listed
// only 5 of the 9 listing types (no classified/digital-code/live/art/stickers),
// and still carried a `bundle` entry — a value that stopped being a
// listingType in SB-UNI-D, so filtering products by it matched nothing. The
// live admin type chips are ADMIN_PRODUCT_LISTING_TYPE_TABS in
// `appkit/src/features/admin/constants/filter-tabs.ts`, which is now covered
// by audit-listing-type-tab-coverage and audit-filter-tab-enums.

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

/** Area tabs on the admin user-detail page (/admin/users/[id]). */
export const ADMIN_USER_DETAIL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "store", label: "Store" },
  { id: "reviews", label: "Reviews" },
  { id: "sessions", label: "Sessions" },
  { id: "bids", label: "Bids" },
  { id: "reports", label: "Reports" },
] as const satisfies readonly DashboardTab[];

export type AdminUserDetailTabId = (typeof ADMIN_USER_DETAIL_TABS)[number]["id"];

/** Area tabs on the admin store-detail page (/admin/stores/[id]/view). */
export const ADMIN_STORE_DETAIL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "reviews", label: "Reviews" },
  { id: "payouts", label: "Payouts" },
  { id: "coupons", label: "Coupons" },
] as const satisfies readonly DashboardTab[];

export type AdminStoreDetailTabId = (typeof ADMIN_STORE_DETAIL_TABS)[number]["id"];

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
} from "@mohasinac/appkit/constants";
