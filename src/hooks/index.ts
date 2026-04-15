/**
 * Hooks Index
 *
 * Central export point for all custom hooks.
 * Import hooks from here for consistency across the application.
 *
 * Appkit React hooks (useSwipe, useGesture, etc.) are imported directly from @mohasinac/appkit/react
 *
 * @example
 * ```tsx
 * import { useSwipe, useGesture } from '@mohasinac/appkit/react';
 * import { useAuth, useMessage } from '@/hooks';
 * ```
 */

// Appkit hooks are now imported directly - see @mohasinac/appkit/react for:
// useSwipe, useGesture, useClickOutside, useKeyPress, useMediaQuery, useBreakpoint,
// useLongPress, usePullToRefresh, useCamera, useCountdown, usePendingFilters, usePendingTable

export { useProfile } from "./useProfile";
export { useProfileStats } from "@mohasinac/appkit/features/account";
export { usePublicProfile } from "./usePublicProfile";
export type {
  PublicUserProfile,
  SellerReviewsData,
  SellerReviewItem,
  ProductsApiResponse,
} from "./usePublicProfile";
export { useSellerStorefront } from "./useSellerStorefront";
export { useMessage } from "@mohasinac/appkit/react";

// Appkit hooks - import directly from @mohasinac/appkit/react

export {
  useLogin,
  useGoogleLogin,
  useRegister,
  useVerifyEmail,
  useResendVerification,
  useForgotPassword,
  useResetPassword,
  useChangePassword,
} from "./useAuth";

// Session hooks from SessionContext
export { useSession, useAuth } from "@/contexts/SessionContext";

export { useAddressForm } from "@mohasinac/appkit/features/account";

// Address CRUD hooks (Phase 5)
export {
  useAddresses,
  useAddress,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@mohasinac/appkit/features/account";
export type { Address, AddressFormData } from "@mohasinac/appkit/features/account";

export { useUnsavedChanges, UNSAVED_CHANGES_EVENT } from "./useUnsavedChanges";
export type {
  UseUnsavedChangesOptions,
  UseUnsavedChangesReturn,
} from "./useUnsavedChanges";

export {
  useHasRole,
  useIsAdmin,
  useIsModerator,
  useIsSeller,
  useCanAccess,
  useRoleChecks,
  useIsOwner,
  useRequireAuth,
  useRequireRole,
} from "./useRBAC";

// Appkit hooks - import directly from @mohasinac/appkit/react
// useMediaQuery, useBreakpoint

export { useRazorpay } from "./useRazorpay";
export { useRealtimeEvent } from "@mohasinac/appkit/react";
export type {
  UseRealtimeEventReturn,
  UseRealtimeEventConfig,
  RealtimeEventMessages,
  RTDBEventPayload,
} from "@mohasinac/appkit/react";
export { RealtimeEventType, RealtimeEventStatus } from "@mohasinac/appkit/react";
export { useAuthEvent } from "@mohasinac/appkit/features/auth";
export type { UseAuthEventReturn, AuthEventStatus } from "@mohasinac/appkit/features/auth";

// Bottom Actions — register mobile page-level / bulk actions
export { useBottomActions } from "@mohasinac/appkit/features/layout";
export type { UseBottomActionsOptions } from "@mohasinac/appkit/features/layout";

export { useGuestCart } from "@mohasinac/appkit/features/cart";
export { useGuestCartMerge } from "@mohasinac/appkit/features/cart";
export { useCartCount } from "@mohasinac/appkit/features/cart";
export { usePaymentEvent } from "@mohasinac/appkit/features/payments";
export type {
  UsePaymentEventReturn,
  PaymentEventStatus,
} from "@mohasinac/appkit/features/payments";

// Phase 2: URL-driven list/table state
export { useUrlTable } from "./useUrlTable";
export type { UseUrlTableOptions } from "./useUrlTable";

// Phase 10: Appkit gestures - import directly from @mohasinac/appkit/react
// useLongPress, usePullToRefresh

// Phase 37: Service layer — homepage hooks now live in @mohasinac/appkit/features/homepage
export { useHomepageReviews } from "@mohasinac/appkit/features/homepage";
export { useBrands } from "@mohasinac/appkit/features/products";
export { useSiteSettings } from "@mohasinac/appkit/core";
export { useHomepageSections } from "./useHomepageSections";

// Phase 37: Service layer — product hooks
// useProductReviews, useCreateReview now import directly from @mohasinac/appkit/features/reviews
export { useRelatedProducts } from "./useRelatedProducts";
export { useAddToCart } from "@mohasinac/appkit/features/cart";

// Phase 37: Service layer — shared UI hooks
export { useWishlistToggle } from "./useWishlistToggle";
export { useNotifications } from "@mohasinac/appkit/features/account";
export { useCategorySelector } from "@mohasinac/appkit/features/categories";
// useCountdown now import directly from @mohasinac/appkit/react
// usePendingFilters, usePendingTable now import directly from @mohasinac/appkit/react

// Phase 58.7: Shared component hooks
export { useContactSubmit } from "./useContactSubmit";
export { useCheckoutApi as useCheckout } from "@mohasinac/appkit/features/checkout";
export type {
  AddressListResponse,
  CartApiResponse,
  PlaceOrderResponse,
  CreateRazorpayOrderResponse,
  UnavailableItem,
  PreflightResponse,
} from "@mohasinac/appkit/features/checkout";
export { useCouponValidate } from "@mohasinac/appkit/features/promotions";
export { useMediaAbort, useMediaCrop, useMediaTrim } from "@mohasinac/appkit/features/media";
// useCamera now import directly from @mohasinac/appkit/react

// Phase 59: Rule 20 completion — shared Tier 1 component hooks
export { useFaqVote } from "@mohasinac/appkit/features/faq";
export { useNewsletter } from "@mohasinac/appkit/features/homepage";
export { useLogout } from "@mohasinac/appkit/features/auth";
export { useCategories, useCreateCategory } from "@mohasinac/appkit/features/categories";
export { useAddressSelector } from "@mohasinac/appkit/features/account";
export { useStoreAddressSelector } from "./useStoreAddressSelector";

// Chat hooks
export {
  useChat,
  useChatRooms,
  useCreateChatRoom,
  useDeleteChatRoom,
} from "./useChat";
export type { ChatMessage, UseChatReturn } from "./useChat";

// Seller application
export { useBecomeSeller } from "@mohasinac/appkit/features/seller";
export type { BecomeSellerResult } from "@mohasinac/appkit/features/seller";

// Phase 1 part 4: deferred filter state
// usePendingFilters, usePendingTable now import directly from @mohasinac/appkit/react

// Search: navigation suggestions
export { useNavSuggestions } from "@mohasinac/appkit/features/search";
export type { NavSuggestionRecord } from "@mohasinac/appkit/features/search";

// Bulk action hooks
// useBulkSelection, useBulkAction now import directly from @mohasinac/appkit/react
export type {
  UseBulkActionOptions,
  UseBulkActionReturn,
} from "@mohasinac/appkit/react";
export { useBulkEvent } from "./useBulkEvent";
export type { UseBulkEventReturn, BulkEventStatus } from "./useBulkEvent";

