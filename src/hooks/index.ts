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
export { useProfileStats } from "./useProfileStats";
export { usePublicProfile } from "./usePublicProfile";
export type {
  PublicUserProfile,
  SellerReviewsData,
  SellerReviewItem,
  ProductsApiResponse,
} from "./usePublicProfile";
export { useSellerStorefront } from "./useSellerStorefront";
export { useMessage } from "./useMessage";

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

export { useAddressForm } from "./useAddressForm";

// Address CRUD hooks (Phase 5)
export {
  useAddresses,
  useAddress,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "./useAddresses";
export type { Address, AddressFormData } from "./useAddresses";

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
export { useRealtimeBids } from "./useRealtimeBids";
export type { RealtimeBidData, UseRealtimeBidsReturn } from "./useRealtimeBids";
export { useRealtimeEvent } from "./useRealtimeEvent";
export type {
  UseRealtimeEventReturn,
  UseRealtimeEventConfig,
  RealtimeEventMessages,
  RTDBEventPayload,
} from "./useRealtimeEvent";
export { RealtimeEventType, RealtimeEventStatus } from "./useRealtimeEvent";
export { useAuthEvent } from "./useAuthEvent";
export type { UseAuthEventReturn, AuthEventStatus } from "./useAuthEvent";

// Bottom Actions — register mobile page-level / bulk actions
export { useBottomActions } from "./useBottomActions";
export type { UseBottomActionsOptions } from "./useBottomActions";

export { useGuestCart } from "./useGuestCart";
export { useGuestCartMerge } from "./useGuestCartMerge";
export { useCartCount } from "./useCartCount";
export { usePaymentEvent } from "./usePaymentEvent";
export type {
  UsePaymentEventReturn,
  PaymentEventStatus,
} from "./usePaymentEvent";

// Phase 2: URL-driven list/table state
export { useUrlTable } from "./useUrlTable";
export type { UseUrlTableOptions } from "./useUrlTable";

// Phase 10: Appkit gestures - import directly from @mohasinac/appkit/react
// useLongPress, usePullToRefresh

// Phase 37: Service layer — homepage hooks now live in @mohasinac/appkit/features/homepage
export { useHomepageReviews } from "./useHomepageReviews";
export { useBrands } from "./useBrands";
export { useSiteSettings } from "./useSiteSettings";
export { useHomepageSections } from "./useHomepageSections";

// Phase 37: Service layer — product hooks
// useProductReviews, useCreateReview now import directly from @mohasinac/appkit/features/reviews
export { useRelatedProducts } from "./useRelatedProducts";
export { useAddToCart } from "./useAddToCart";

// Phase 37: Service layer — shared UI hooks
export { useWishlistToggle } from "./useWishlistToggle";
export { useNotifications } from "./useNotifications";
export { useCategorySelector } from "./useCategorySelector";
// useCountdown now import directly from @mohasinac/appkit/react
// usePendingFilters, usePendingTable now import directly from @mohasinac/appkit/react

// Phase 58.7: Shared component hooks
export { useContactSubmit } from "./useContactSubmit";
export { useCheckout } from "./useCheckout";
export type {
  AddressListResponse,
  CartApiResponse,
  PlaceOrderResponse,
  CreateRazorpayOrderResponse,
  UnavailableItem,
  PreflightResponse,
} from "./useCheckout";
export { useCouponValidate } from "./useCouponValidate";
export { useMediaUpload, useMediaCrop, useMediaTrim } from "./useMediaUpload";
// useCamera now import directly from @mohasinac/appkit/react

// Phase 59: Rule 20 completion — shared Tier 1 component hooks
export { useFaqVote } from "./useFaqVote";
export { useNewsletter } from "./useNewsletter";
export { useAuctionDetail } from "./useAuctionDetail";
export type { PublicBid } from "./useAuctionDetail";
export { usePlaceBid } from "./usePlaceBid";
export type { BidResult } from "./usePlaceBid";
export { useLogout } from "./useLogout";
export { useCategories, useCreateCategory } from "./useCategorySelector";
export { useAddressSelector } from "./useAddressSelector";
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
export { useBecomeSeller } from "./useBecomeSeller";
export type { BecomeSellerResult } from "./useBecomeSeller";

// Phase 1 part 4: deferred filter state
// usePendingFilters, usePendingTable now import directly from @mohasinac/appkit/react

// Search: navigation suggestions
export { useNavSuggestions } from "./useNavSuggestions";
export type { AlgoliaNavRecord } from "./useNavSuggestions";

// Bulk action hooks
// useBulkSelection, useBulkAction now import directly from @mohasinac/appkit/react
export type {
  UseBulkActionOptions,
  UseBulkActionReturn,
} from "@mohasinac/appkit/react";
export { useBulkEvent } from "./useBulkEvent";
export type { UseBulkEventReturn, BulkEventStatus } from "./useBulkEvent";
