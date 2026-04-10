/**
 * Admin Feature Components — Barrel Export
 *
 * Tier 2 business components for admin domain.
 * Consumed only within src/features/admin/components/ view files.
 * Pages import views from src/features/admin/index.ts.
 */

// Products (shared with seller — sourced from Tier 1)
export {
  ProductForm,
  useProductTableColumns,
  PRODUCT_STATUS_OPTIONS,
} from "@/components";
export type {
  AdminProduct,
  ProductStatus,
  ProductDrawerMode,
} from "@/components";

// Orders
export { useOrderTableColumns } from "./OrderTableColumns";
export { OrderStatusForm } from "./OrderStatusForm";
export type { OrderStatusFormState } from "./OrderStatusForm";

// Users
export { useUserTableColumns } from "./UserTableColumns";
export { UserDetailDrawer } from "./UserDetailDrawer";
export type { AdminUser, UserTab } from "./User.types";

// Carousel
export { CarouselSlideForm } from "./CarouselSlideForm";
export { useCarouselTableColumns } from "./CarouselTableColumns";
export type { CarouselSlide, DrawerMode, GridCard } from "./Carousel.types";

// Categories (shared with CategorySelectorCreate — sourced from Tier 1)
export {
  CategoryForm,
  getCategoryTableColumns,
  flattenCategories,
} from "@/components";
export type { Category, CategoryDrawerMode } from "@/components";

// Blog
export { BlogForm } from "./BlogForm";
export { useBlogTableColumns } from "./BlogTableColumns";
export type { BlogFormData } from "./BlogForm";

// Sections
export { SectionForm } from "./SectionForm";
export { useSectionTableColumns } from "./SectionTableColumns";
export { SECTION_TYPES } from "./Section.types";
export type { HomepageSection, SectionDrawerMode } from "./Section.types";

// Reviews
export { getReviewTableColumns, ReviewRowActions } from "./ReviewTableColumns";
export { ReviewDetailView } from "./ReviewDetailView";
export type { Review, ReviewStatus } from "./Review.types";

// FAQs
export { FaqForm } from "./FaqForm";
export { getFaqTableColumns } from "./FaqTableColumns";
export { FAQ_CATEGORIES, VARIABLE_PLACEHOLDERS } from "./Faq.types";
export type { FAQ, FaqDrawerMode } from "./Faq.types";

// Coupons
export {
  CouponForm,
  couponToFormState,
  formStateToCouponPayload,
} from "./CouponForm";
export { getCouponTableColumns } from "./CouponTableColumns";
export type { CouponFormState } from "./CouponForm";

// Bids
export { useBidTableColumns } from "./BidTableColumns";

// Site
export { SiteBasicInfoForm } from "./SiteBasicInfoForm";
export { SiteContactForm } from "./SiteContactForm";
export { SiteSocialLinksForm } from "./SiteSocialLinksForm";
export { SiteCommissionsForm } from "./SiteCommissionsForm";
export { SiteCredentialsForm } from "./SiteCredentialsForm";
export type { CredentialsUpdateValues } from "./SiteCredentialsForm";

// Payouts
export { getPayoutTableColumns } from "./PayoutTableColumns";
export { PayoutStatusForm } from "./PayoutStatusForm";
export type { PayoutStatusFormState } from "./PayoutStatusForm";

// Dashboard
export { QuickActionsGrid } from "./QuickActionsGrid";
export { AdminDashboardView } from "./AdminDashboardView";
export { AdminStatsCards } from "./AdminStatsCards";
export { AdminDashboardSkeleton } from "./AdminDashboardSkeleton";
export { RecentActivityCard } from "./RecentActivityCard";

// Site management
export { default as BackgroundSettings } from "./BackgroundSettings";
export { GridEditor } from "./GridEditor";

// Categories
export { CategoryTreeView } from "./CategoryTreeView";

// Media operations
export { MediaOperationForm } from "./MediaOperationForm";
export { getMediaTableColumns } from "./MediaTableColumns";
export type { MediaOperation } from "./MediaTableColumns";

// Admin UI (sidebar navigation + session management)
export { AdminSidebar } from "./AdminSidebar";
export { AdminTopBar } from "./AdminTopBar";
export { AdminPriorityAlerts } from "./AdminPriorityAlerts";
export { AdminSessionsManager } from "./AdminSessionsManager";
export { SESSION_TABLE_COLUMNS } from "./SessionTableColumns";

// Rich text editing
export { RichTextEditor } from "./RichTextEditor";

// Admin-only filters
export { UserFilters, USER_SORT_OPTIONS } from "./UserFilters";
export type { UserFiltersProps } from "./UserFilters";
export { BidFilters, BID_SORT_OPTIONS } from "./BidFilters";
export type { BidFiltersProps } from "./BidFilters";
export { CouponFilters, COUPON_SORT_OPTIONS } from "./CouponFilters";
export type { CouponFiltersProps } from "./CouponFilters";
export { FaqFilters, FAQ_SORT_OPTIONS } from "./FaqFilters";
export type { FaqFiltersProps } from "./FaqFilters";
export { PayoutFilters, PAYOUT_SORT_OPTIONS } from "./PayoutFilters";
export type { PayoutFiltersProps } from "./PayoutFilters";
export { StoreFilters, STORE_SORT_OPTIONS } from "./StoreFilters";
export type { StoreFiltersProps } from "./StoreFilters";
export { CarouselFilters, CAROUSEL_SORT_OPTIONS } from "./CarouselFilters";
export type { CarouselFiltersProps } from "./CarouselFilters";
export { CategoryFilters, CATEGORY_SORT_OPTIONS } from "./CategoryFilters";
export type { CategoryFiltersProps } from "./CategoryFilters";
export { SessionFilters, SESSION_SORT_OPTIONS } from "./SessionFilters";
export type { SessionFiltersProps } from "./SessionFilters";
export {
  HomepageSectionFilters,
  HOMEPAGE_SECTION_SORT_OPTIONS,
} from "./HomepageSectionFilters";
export type { HomepageSectionFiltersProps } from "./HomepageSectionFilters";
export {
  NewsletterFilters,
  NEWSLETTER_SORT_OPTIONS,
} from "./NewsletterFilters";
export type { NewsletterFiltersProps } from "./NewsletterFilters";
export {
  NotificationFilters,
  NOTIFICATION_SORT_OPTIONS,
} from "./NotificationFilters";
export type { NotificationFiltersProps } from "./NotificationFilters";
export {
  EventEntryFilters,
  EVENT_ENTRY_SORT_OPTIONS,
} from "./EventEntryFilters";
export type { EventEntryFiltersProps } from "./EventEntryFilters";
