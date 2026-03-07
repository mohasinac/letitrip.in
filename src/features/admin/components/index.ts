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
export { ReviewStars } from "./ReviewStars";
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

// Payouts
export { getPayoutTableColumns } from "./PayoutTableColumns";
export { PayoutStatusForm } from "./PayoutStatusForm";
export type { PayoutStatusFormState } from "./PayoutStatusForm";

// Dashboard
export { QuickActionsGrid } from "./QuickActionsGrid";

// Admin UI (shared tab navigation + session management)
export { default as AdminTabs } from "./AdminTabs";
export { AdminSessionsManager } from "./AdminSessionsManager";
export { SESSION_TABLE_COLUMNS } from "./SessionTableColumns";
