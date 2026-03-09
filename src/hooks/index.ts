/**
 * Hooks Index
 *
 * Central export point for all custom hooks.
 * Import hooks from here for consistency across the application.
 *
 * @example
 * ```tsx
 * import { useSwipe, useGesture } from '@/hooks';
 * ```
 */

export { useSwipe } from "./useSwipe";
export type { UseSwipeOptions, SwipeDirection } from "./useSwipe";

export { useGesture } from "./useGesture";
export type { UseGestureOptions, GestureType } from "./useGesture";

export { useApiQuery, invalidateQueries } from "./useApiQuery";
export { useApiMutation } from "./useApiMutation";
export { useProfile } from "./useProfile";
export { useProfileStats } from "./useProfileStats";
export { usePublicProfile } from "./usePublicProfile";
export type {
  SellerReviewsData,
  SellerReviewItem,
  ProductsApiResponse,
} from "./usePublicProfile";
export { useSellerStorefront } from "./useSellerStorefront";
export { useForm } from "react-hook-form";
export { useAdminStats } from "./useAdminStats";
export { useAlgoliaSyncProducts, useAlgoliaSyncPages } from "./useAlgoliaSync";
export type { AlgoliaSyncResult } from "./useAlgoliaSync";
export { useMessage } from "./useMessage";
export {
  useAdminSessions,
  useRevokeSession,
  useRevokeUserSessions,
} from "./useSessions";

export { useClickOutside } from "./useClickOutside";
export type { UseClickOutsideOptions } from "./useClickOutside";

export { useKeyPress } from "./useKeyPress";
export type { UseKeyPressOptions, KeyModifiers } from "./useKeyPress";

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

// Responsive hooks (Phase 3)
export { useMediaQuery } from "./useMediaQuery";

// Payment hooks
export { useRazorpay } from "./useRazorpay";
export type { RazorpayOptions, RazorpayPaymentResponse } from "./useRazorpay";
export { useBreakpoint } from "./useBreakpoint";
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

// Phase 10: Gestures + Accessibility
export { useLongPress } from "./useLongPress";
export { usePullToRefresh } from "./usePullToRefresh";
export type {
  UsePullToRefreshOptions,
  UsePullToRefreshReturn,
} from "./usePullToRefresh";

// Phase 37: Service layer — homepage hooks
export { useHeroCarousel } from "./useHeroCarousel";
export { useFeaturedProducts } from "./useFeaturedProducts";
export { useFeaturedAuctions } from "./useFeaturedAuctions";
export { useFeaturedPreOrders } from "./useFeaturedPreOrders";
export { useFeaturedStores } from "./useFeaturedStores";
export { useFeaturedEvents } from "./useFeaturedEvents";
export { useHomepageReviews } from "./useHomepageReviews";
export { useTopCategories } from "./useTopCategories";
export { useTopBrands } from "./useTopBrands";
export { useBrands } from "./useBrands";
export { useSiteSettings } from "./useSiteSettings";
export { useHomepageSections } from "./useHomepageSections";

// Phase 37: Service layer — product hooks
export { useProductReviews, useCreateReview } from "./useProductReviews";
export { useRelatedProducts } from "./useRelatedProducts";
export { useAddToCart } from "./useAddToCart";

// Phase 37: Service layer — shared UI hooks
export { useWishlistToggle } from "./useWishlistToggle";
export { useNotifications } from "./useNotifications";
export { useCategorySelector } from "./useCategorySelector";
export { usePublicEvents } from "./usePublicEvents";
export { useCountdown } from "./useCountdown";
export type { CountdownRemaining } from "./useCountdown";

// Phase 58.1: Public page hooks
export { useBlogPosts } from "./useBlogPosts";
export { usePromotions } from "./usePromotions";

// Phase 58.7: Shared component hooks
export { useContactSubmit } from "./useContactSubmit";
export { useCheckout } from "./useCheckout";
export type {
  AddressListResponse,
  CartApiResponse,
  PlaceOrderResponse,
  CreateRazorpayOrderResponse,
} from "./useCheckout";
export { useCouponValidate } from "./useCouponValidate";
export { useMediaUpload, useMediaCrop, useMediaTrim } from "./useMediaUpload";
export { useCamera } from "./useCamera";
export type { UseCameraOptions, UseCameraReturn } from "./useCamera";

// Phase 59: Rule 20 completion — shared Tier 1 component hooks
export { useFaqVote } from "./useFaqVote";
export { useNewsletter } from "./useNewsletter";
export { useAuctionDetail } from "./useAuctionDetail";
export { usePlaceBid } from "./usePlaceBid";
export { useLogout } from "./useLogout";
export { useCategories, useCreateCategory } from "./useCategorySelector";
export { useAddressSelector } from "./useAddressSelector";

// RipCoins hooks
export {
  useRipCoinBalance,
  usePurchaseRipCoins,
  useVerifyRipCoinPurchase,
  useRefundRipCoinPurchase,
  useRipCoinHistory,
} from "./useRipCoins";

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
export { usePendingFilters } from "./usePendingFilters";
export type {
  UsePendingFiltersOptions,
  UsePendingFiltersReturn,
} from "./usePendingFilters";
export { usePendingTable } from "./usePendingTable";
export type { PendingTable, UsePendingTableReturn } from "./usePendingTable";

// Search: navigation suggestions
export { useNavSuggestions } from "./useNavSuggestions";
export type { AlgoliaNavRecord } from "./useNavSuggestions";

// Bulk action hooks
export { useBulkSelection } from "./useBulkSelection";
export type {
  UseBulkSelectionOptions,
  UseBulkSelectionReturn,
} from "./useBulkSelection";
export { useBulkAction } from "./useBulkAction";
export type {
  UseBulkActionOptions,
  UseBulkActionReturn,
} from "./useBulkAction";
export { useBulkEvent } from "./useBulkEvent";
export type { UseBulkEventReturn, BulkEventStatus } from "./useBulkEvent";
