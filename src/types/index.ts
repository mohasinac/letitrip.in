/**
 * TYPE SYSTEM - CENTRALIZED EXPORTS
 *
 * This file provides centralized access to all types in the new type system.
 *
 * IMPORTANT: This index now ONLY exports from the new FE/BE/shared type system.
 * Old conflicting types have been removed. See index.OLD.ts for backup.
 *
 * Architecture:
 * - Frontend Types (FE): UI-optimized with formatting helpers
 * - Backend Types (BE): API response structures
 * - Transforms: Conversion functions between FE/BE
 * - Shared: Common enums, utilities
 */

// ============================================================================
// SHARED TYPES (Enums, Common Interfaces)
// ============================================================================
export * from "./shared/common.types";

// ============================================================================
// FRONTEND TYPES (UI-Optimized)
// ============================================================================
export type {
  UserFE,
  UserProfileFormFE,
  ChangePasswordFormFE,
  OTPVerificationFormFE,
} from "./frontend/user.types";

export type {
  ProductFE,
  ProductCardFE,
  ProductFormFE,
  ProductFiltersFE,
} from "./frontend/product.types";

export type {
  OrderFE,
  OrderCardFE,
  OrderItemFE,
  CreateOrderFormFE,
  OrderStatsFE,
  ShippingAddressFE,
} from "./frontend/order.types";

export type {
  CartFE,
  CartItemFE,
  AddToCartFormFE,
  CartSummaryFE,
} from "./frontend/cart.types";

export type {
  AuctionFE,
  AuctionCardFE,
  AuctionFormFE,
  BidFE,
  PlaceBidFormFE,
} from "./frontend/auction.types";

export type {
  CategoryFE,
  CategoryCardFE,
  CategoryFormFE,
  CategoryTreeNodeFE,
} from "./frontend/category.types";

export type { ShopFE, ShopCardFE, ShopFormFE } from "./frontend/shop.types";

export type {
  ReviewFE,
  ReviewCardFE,
  ReviewFormFE,
  ReviewStatsFE,
} from "./frontend/review.types";

export type { AddressFE, AddressFormFE } from "./frontend/address.types";

// ============================================================================
// BACKEND TYPES (API Response Structures)
// ============================================================================
export type { UserBE, UpdateUserRequestBE } from "./backend/user.types";

export type {
  ProductBE,
  ProductListItemBE,
  ProductFiltersBE,
  CreateProductRequestBE,
} from "./backend/product.types";

export type {
  OrderBE,
  OrderItemBE,
  CreateOrderRequestBE,
} from "./backend/order.types";

export type {
  CartBE,
  CartItemBE,
  AddToCartRequestBE,
} from "./backend/cart.types";

export type {
  AuctionBE,
  AuctionListItemBE,
  AuctionFiltersBE,
  CreateAuctionRequestBE,
  BidBE,
} from "./backend/auction.types";

export type {
  CategoryBE,
  CategoryTreeNodeBE,
  CreateCategoryRequestBE,
} from "./backend/category.types";

export type { ShopBE, CreateShopRequestBE } from "./backend/shop.types";

export type { ReviewBE, CreateReviewRequestBE } from "./backend/review.types";

export type {
  AddressBE,
  CreateAddressRequestBE,
} from "./backend/address.types";

// ============================================================================
// SHARED PAGINATION & API TYPES
// ============================================================================
export type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "./shared/common.types";

// ============================================================================
// OLD TYPES REMOVED - See index.OLD.ts for backup
// ============================================================================
// The following old types have been removed to avoid conflicts with new FE types:
// - User (use UserFE instead)
// - Product (use ProductFE instead)
// - Order (use OrderFE instead)
// - Cart (use CartFE instead)
// - Auction (use AuctionFE instead)
// - Category (use CategoryFE instead)
// - Shop (use ShopFE instead)
// - Review (use ReviewFE instead)
// - Address (use AddressFE instead)
// - Bid (use BidFE instead)
//
// Migration Guide:
// 1. Replace: import { User } from '@/types'
//    With: import { UserFE } from '@/types'
// 2. Replace: import { Product } from '@/types'
//    With: import { ProductFE } from '@/types'
// 3. For API/Backend code, use BE types:
//    import { UserBE } from '@/types'
