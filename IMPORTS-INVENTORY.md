# Application Imports Inventory

> **Last Updated:** December 5, 2025  
> **Purpose:** Central registry of all importable modules, functions, components, and types in the application

## ⚠️ Recent Breaking Changes (December 2025)

**Removed Deprecated Functions:**
- ❌ `formatCurrency` from `@/lib/formatters` - Use `formatPrice` from `@/lib/price.utils` instead
- ❌ Re-exports from `media-validator.ts` - Import directly from `@/lib/formatters`
- ❌ Re-exports from `location/pincode.ts` and `constants/location.ts`

**New Utilities:**
- ✅ `@/lib/validators.ts` - Centralized validation functions (email, phone, GST, PAN, etc.)
- ✅ `@/lib/price.utils.ts` - Enhanced price formatting with null safety

**Migration Guide:**
```typescript
// ❌ Old (removed)
import { formatCurrency } from "@/lib/formatters";
const price = formatCurrency(1000);

// ✅ New (recommended)
import { formatPrice } from "@/lib/price.utils";
const price = formatPrice(1000); // Handles nulls safely
```

## 📋 Table of Contents

- [Services](#services)
- [Components](#components)
  - [UI Components](#ui-components)
  - [Admin Components](#admin-components)
  - [Form Components](#form-components)
  - [Value Display Components](#value-display-components)
  - [Card Components](#card-components)
  - [Homepage Sections](#homepage-sections)
  - [Filter Components](#filter-components)
  - [Media Components](#media-components)
  - [Mobile Components](#mobile-components)
  - [Wizard Components](#wizard-components)
- [Hooks](#hooks)
- [Contexts](#contexts)
- [Types](#types)
  - [Frontend Types](#frontend-types)
  - [Backend Types](#backend-types)
  - [Shared Types](#shared-types)
  - [Transform Functions](#transform-functions)
- [Constants](#constants)
- [Configuration](#configuration)
- [Utilities](#utilities)
- [API Utilities](#api-utilities)
- [Validation Schemas](#validation-schemas)

---

## Services

Client-side API wrapper services for interacting with backend APIs.

```typescript
// Authentication
import { authService } from "@/services/auth.service";

// Products
import { productsService } from "@/services/products.service";

// Shops
import { shopsService } from "@/services/shops.service";

// Orders
import { ordersService } from "@/services/orders.service";

// Auctions
import { auctionsService } from "@/services/auctions.service";

// Categories
import { categoriesService } from "@/services/categories.service";

// Reviews
import { reviewsService } from "@/services/reviews.service";

// Favorites
import { favoritesService } from "@/services/favorites.service";

// Cart
import { cartService } from "@/services/cart.service";

// Checkout
import { checkoutService } from "@/services/checkout.service";

// Coupons
import { couponsService } from "@/services/coupons.service";

// Media
import { mediaService } from "@/services/media.service";

// Returns
import { returnsService } from "@/services/returns.service";

// Support Tickets
import { supportService } from "@/services/support.service";

// Users
import { usersService } from "@/services/users.service";

// Payments
import { paymentService } from "@/services/payment.service";

// Payouts
import { payoutsService } from "@/services/payouts.service";

// Homepage
import { homepageService } from "@/services/homepage.service";

// Blog
import { blogService } from "@/services/blog.service";

// Notifications
import { notificationsService } from "@/services/notifications.service";

// RipLimit
import { ripLimitService } from "@/services/riplimit.service";

// Base API Service
import { apiService } from "@/services/api.service";
```

---

## Components

### UI Components

```typescript
// Buttons
import { Button } from "@/components/ui/Button";

// Cards
import { Card } from "@/components/ui/Card";
import { BaseCard } from "@/components/ui/BaseCard";

// Form Layouts
import { FormActions } from "@/components/ui/FormActions";
import { FormLayout } from "@/components/ui/FormLayout";

// Checkbox
import { Checkbox } from "@/components/ui/Checkbox";

// Tables
import { BaseTable } from "@/components/ui/BaseTable";

// Typography
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
```

### Admin Components

```typescript
// Page Headers
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

// UI Elements
import { ToggleSwitch } from "@/components/admin/ToggleSwitch";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";

// Toast Notifications
import { toast, ToastContainer } from "@/components/admin/Toast";
import type { ToastType } from "@/components/admin/Toast";

// Dashboard Components
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { PendingActionCard } from "@/components/admin/dashboard/PendingActionCard";
import { ActivityItem } from "@/components/admin/dashboard/ActivityItem";
import { QuickLink } from "@/components/admin/dashboard/QuickLink";

// Category Form
import { CategoryForm } from "@/components/admin/CategoryForm";

// Homepage Management
import { BannerEditor } from "@/components/admin/homepage/BannerEditor";
import { SectionCard } from "@/components/admin/homepage/SectionCard";
import { SliderControl } from "@/components/admin/homepage/SliderControl";

// RipLimit Management
import { AdjustBalanceModal } from "@/components/admin/riplimit/AdjustBalanceModal";
import { RipLimitStats } from "@/components/admin/riplimit/RipLimitStats";

// Template Selector
import { TemplateSelectorWithCreate } from "@/components/admin/TemplateSelectorWithCreate";
```

### Form Components

```typescript
// Labels & Fields
import { FormLabel } from "@/components/forms/FormLabel";
import type { FormLabelProps } from "@/components/forms/FormLabel";

import { FormField } from "@/components/forms/FormField";
import type { FormFieldProps } from "@/components/forms/FormField";

import { FormFieldset } from "@/components/forms/FormFieldset";
import type { FormFieldsetProps } from "@/components/forms/FormFieldset";

// Basic Inputs
import { FormInput } from "@/components/forms/FormInput";
import type { FormInputProps } from "@/components/forms/FormInput";

import { FormNumberInput } from "@/components/forms/FormNumberInput";
import type { FormNumberInputProps } from "@/components/forms/FormNumberInput";

import { FormTextarea } from "@/components/forms/FormTextarea";
import type { FormTextareaProps } from "@/components/forms/FormTextarea";

import { FormSelect } from "@/components/forms/FormSelect";
import type {
  FormSelectProps,
  FormSelectOption,
} from "@/components/forms/FormSelect";

import { FormCheckbox } from "@/components/forms/FormCheckbox";
import type { FormCheckboxProps } from "@/components/forms/FormCheckbox";

import { FormRadio, FormRadioGroup } from "@/components/forms/FormRadio";
import type {
  FormRadioProps,
  FormRadioGroupProps,
} from "@/components/forms/FormRadio";

// Complex Inputs
import { FormListInput } from "@/components/forms/FormListInput";
import type { FormListInputProps } from "@/components/forms/FormListInput";

import { FormKeyValueInput } from "@/components/forms/FormKeyValueInput";
import type { FormKeyValueInputProps } from "@/components/forms/FormKeyValueInput";

// Layout Components
import {
  FormSection,
  FormRow,
  FormActions,
} from "@/components/forms/FormSection";
import type {
  FormSectionProps,
  FormRowProps,
  FormActionsProps,
} from "@/components/forms/FormSection";

// Wizard Components
import { WizardSteps } from "@/components/forms/WizardSteps";
import type {
  WizardStepsProps,
  WizardStep,
  StepState,
} from "@/components/forms/WizardSteps";
```

### Value Display Components

```typescript
// Price & Currency
import { Price, CompactPrice } from "@/components/common/values/Price";
import { Currency } from "@/components/common/values/Currency";

// Dates & Time
import {
  DateDisplay,
  RelativeDate,
  DateRange,
} from "@/components/common/values/DateDisplay";
import { TimeRemaining } from "@/components/common/values/TimeRemaining";

// Contact Info
import { PhoneNumber } from "@/components/common/values/PhoneNumber";
import { Email } from "@/components/common/values/Email";
import { Address } from "@/components/common/values/Address";

// Order & Status
import { OrderId } from "@/components/common/values/OrderId";
import { ShippingStatus } from "@/components/common/values/ShippingStatus";
import { PaymentStatus } from "@/components/common/values/PaymentStatus";

// Product Info
import { Rating } from "@/components/common/values/Rating";
import { StockStatus } from "@/components/common/values/StockStatus";
import { SKU } from "@/components/common/values/SKU";
import { Weight } from "@/components/common/values/Weight";
import { Dimensions } from "@/components/common/values/Dimensions";
import { Quantity } from "@/components/common/values/Quantity";

// Auction Info
import { BidCount } from "@/components/common/values/BidCount";
import { AuctionStatus } from "@/components/common/values/AuctionStatus";

// Text & Numbers
import { Percentage } from "@/components/common/values/Percentage";
import { TruncatedText } from "@/components/common/values/TruncatedText";
```

### Card Components

```typescript
// Product Cards
import { ProductCard } from "@/components/cards/ProductCard";
import type { ProductCardProps } from "@/components/cards/ProductCard";

import { ProductCardSkeleton } from "@/components/cards/ProductCardSkeleton";
import type { ProductCardSkeletonProps } from "@/components/cards/ProductCardSkeleton";

// Shop Cards
import { ShopCard } from "@/components/cards/ShopCard";
import type { ShopCardProps } from "@/components/cards/ShopCard";

import { ShopCardSkeleton } from "@/components/cards/ShopCardSkeleton";
import type { ShopCardSkeletonProps } from "@/components/cards/ShopCardSkeleton";

// Category Cards
import { CategoryCard } from "@/components/cards/CategoryCard";
import type { CategoryCardProps } from "@/components/cards/CategoryCard";

import { CategoryCardSkeleton } from "@/components/cards/CategoryCardSkeleton";
import type { CategoryCardSkeletonProps } from "@/components/cards/CategoryCardSkeleton";

// Blog Cards
import { BlogCard } from "@/components/cards/BlogCard";
import type { BlogCardProps } from "@/components/cards/BlogCard";

// Review Cards
import { ReviewCard } from "@/components/cards/ReviewCard";
import type { ReviewCardProps } from "@/components/cards/ReviewCard";

// Grid & Layout
import { CardGrid } from "@/components/cards/CardGrid";
import type { CardGridProps } from "@/components/cards/CardGrid";

// Quick View
import { ProductQuickView } from "@/components/cards/ProductQuickView";
import type { ProductQuickViewProps } from "@/components/cards/ProductQuickView";
```

### Homepage Sections

```typescript
// Hero & Welcome
import { WelcomeHero } from "@/components/homepage/WelcomeHero";
import { ValueProposition } from "@/components/homepage/ValueProposition";
import { HeroSection } from "@/components/homepage/HeroSection";

// Product Sections
import { LatestProductsSection } from "@/components/homepage/LatestProductsSection";
import { FeaturedProductsSection } from "@/components/homepage/FeaturedProductsSection";
import { ProductsSection } from "@/components/homepage/ProductsSection";

// Auction Sections
import { HotAuctionsSection } from "@/components/homepage/HotAuctionsSection";
import { FeaturedAuctionsSection } from "@/components/homepage/FeaturedAuctionsSection";
import { AuctionsSection } from "@/components/homepage/AuctionsSection";

// Category & Shop Sections
import { FeaturedCategoriesSection } from "@/components/homepage/FeaturedCategoriesSection";
import { FeaturedShopsSection } from "@/components/homepage/FeaturedShopsSection";

// Content Sections
import { RecentReviewsSection } from "@/components/homepage/RecentReviewsSection";
import { FeaturedBlogsSection } from "@/components/homepage/FeaturedBlogsSection";
```

### Filter Components

```typescript
import {
  ProductFilters,
  type ProductFilterValues,
} from "@/components/filters/ProductFilters";
import {
  ShopFilters,
  type ShopFilterValues,
} from "@/components/filters/ShopFilters";
import {
  OrderFilters,
  type OrderFilterValues,
} from "@/components/filters/OrderFilters";
import {
  ReturnFilters,
  type ReturnFilterValues,
} from "@/components/filters/ReturnFilters";
import {
  CouponFilters,
  type CouponFilterValues,
} from "@/components/filters/CouponFilters";
import {
  UserFilters,
  type UserFilterValues,
} from "@/components/filters/UserFilters";
import {
  CategoryFilters,
  type CategoryFilterValues,
} from "@/components/filters/CategoryFilters";
import {
  ReviewFilters,
  type ReviewFilterValues,
} from "@/components/filters/ReviewFilters";
import {
  AuctionFilters,
  type AuctionFilterValues,
} from "@/components/filters/AuctionFilters";
```

### Media Components

```typescript
import MediaUploader from "@/components/media/MediaUploader";
import MediaPreviewCard from "@/components/media/MediaPreviewCard";
import CameraCapture from "@/components/media/CameraCapture";
import VideoRecorder from "@/components/media/VideoRecorder";
import ImageEditor from "@/components/media/ImageEditor";
import VideoThumbnailGenerator from "@/components/media/VideoThumbnailGenerator";
import MediaEditorModal from "@/components/media/MediaEditorModal";
import MediaGallery from "@/components/media/MediaGallery";
import MediaMetadataForm from "@/components/media/MediaMetadataForm";
```

### Mobile Components

```typescript
import { MobileBottomSheet } from "@/components/mobile/MobileBottomSheet";
import { MobileActionSheet } from "@/components/mobile/MobileActionSheet";
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";

import {
  MobileSwipeActions,
  createDeleteAction,
  createEditAction,
  createMoreAction,
} from "@/components/mobile/MobileSwipeActions";

import {
  MobileSkeleton,
  ProductCardSkeleton,
  OrderCardSkeleton,
  UserCardSkeleton,
  AddressCardSkeleton,
  DashboardStatSkeleton,
  TableRowSkeleton,
  ListSkeleton,
} from "@/components/mobile/MobileSkeleton";

import { MobileAdminSidebar } from "@/components/mobile/MobileAdminSidebar";
import { MobileSellerSidebar } from "@/components/mobile/MobileSellerSidebar";
import { MobileInstallPrompt } from "@/components/mobile/MobileInstallPrompt";
import { MobileOfflineIndicator } from "@/components/mobile/MobileOfflineIndicator";
import { MobileQuickActions } from "@/components/mobile/MobileQuickActions";
import { MobileDataTable } from "@/components/mobile/MobileDataTable";
```

### Wizard Components

```typescript
// Product Wizard
import { RequiredInfoStep } from "@/components/seller/product-wizard/RequiredInfoStep";
import { OptionalDetailsStep } from "@/components/seller/product-wizard/OptionalDetailsStep";
import type {
  ProductFormData,
  StepProps,
  RequiredStepProps,
  OptionalStepProps,
} from "@/components/seller/product-wizard/types";

// Product Edit Wizard
import { BasicInfoStep } from "@/components/seller/product-edit-wizard/BasicInfoStep";
import { DetailsStep } from "@/components/seller/product-edit-wizard/DetailsStep";
import { InventoryStep } from "@/components/seller/product-edit-wizard/InventoryStep";
import { ReviewStep } from "@/components/seller/product-edit-wizard/ReviewStep";
import type {
  ProductEditFormData,
  StepProps,
} from "@/components/seller/product-edit-wizard/types";

// Auction Wizard
import { RequiredInfoStep } from "@/components/seller/auction-wizard/RequiredInfoStep";
import { OptionalDetailsStep } from "@/components/seller/auction-wizard/OptionalDetailsStep";
import type {
  AuctionFormData,
  StepProps,
  RequiredStepProps,
  OptionalStepProps,
} from "@/components/seller/auction-wizard/types";

// Shop Wizard
import BrandingStep from "@/components/seller/shop-wizard/BrandingStep";
import ContactLegalStep from "@/components/seller/shop-wizard/ContactLegalStep";
import PoliciesStep from "@/components/seller/shop-wizard/PoliciesStep";
import SettingsStep from "@/components/seller/shop-wizard/SettingsStep";
import BasicInfoStep from "@/components/seller/shop-wizard/BasicInfoStep";
import BankingStep from "@/components/seller/shop-wizard/BankingStep";
import type * as ShopWizardTypes from "@/components/seller/shop-wizard/types";

// Category Wizard
import BasicInfoStep from "@/components/admin/category-wizard/BasicInfoStep";
import MediaStep from "@/components/admin/category-wizard/MediaStep";
import SeoStep from "@/components/admin/category-wizard/SeoStep";
import DisplayStep from "@/components/admin/category-wizard/DisplayStep";
import type * as CategoryWizardTypes from "@/components/admin/category-wizard/types";

// Blog Wizard
import { BasicInfoStep } from "@/components/admin/blog-wizard/BasicInfoStep";
import { MediaStep } from "@/components/admin/blog-wizard/MediaStep";
import { ContentStep } from "@/components/admin/blog-wizard/ContentStep";
import { CategoryTagsStep } from "@/components/admin/blog-wizard/CategoryTagsStep";
import type {
  BlogFormData,
  OnBlogChange,
} from "@/components/admin/blog-wizard/types";

// Common Wizard Steps
import { ContactInfoStep } from "@/components/wizards/ContactInfoStep";
import { BusinessAddressStep } from "@/components/wizards/BusinessAddressStep";
```

### Other Components

```typescript
// Navigation
import { TabNav } from "@/components/navigation/TabNav";
import { TabbedLayout } from "@/components/navigation/TabbedLayout";

// Seller Components
import { ShopForm } from "@/components/seller/ShopForm";
import { AuctionForm } from "@/components/seller/AuctionForm";
import { CategorySelectorWithCreate } from "@/components/seller/CategorySelectorWithCreate";
import { BankAccountSelectorWithCreate } from "@/components/seller/BankAccountSelectorWithCreate";
import { InlineCategorySelectorWithCreate } from "@/components/seller/InlineCategorySelectorWithCreate";
import { CouponInlineForm } from "@/components/seller/CouponInlineForm";

// Product Components
import { ProductInfo } from "@/components/product/ProductInfo";
import { ReviewForm } from "@/components/product/ReviewForm";
import { ReviewList } from "@/components/product/ReviewList";

// Shop Components
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopProducts } from "@/components/shop/ShopProducts";

// Checkout Components
import { ShopOrderSummary } from "@/components/checkout/ShopOrderSummary";
import { ShippingMethodSelector } from "@/components/checkout/ShippingMethodSelector";
import { PaymentMethodSelectorWithCreate } from "@/components/checkout/PaymentMethodSelectorWithCreate";
import { CouponSelector } from "@/components/checkout/CouponSelector";

// Cart Components
import { CartSummary } from "@/components/cart/CartSummary";

// Demo Components
import { DemoStepCard } from "@/components/admin/demo/components/DemoStepCard";
import { DemoStats } from "@/components/admin/demo/components/DemoStats";
import { DemoCredentials } from "@/components/admin/demo/components/DemoCredentials";
import { DemoScaleControl } from "@/components/admin/demo/components/DemoScaleControl";
import { DemoActionButtons } from "@/components/admin/demo/components/DemoActionButtons";
import { DemoDeletionResult } from "@/components/admin/demo/components/DemoDeletionResult";
import { DemoProgressBar } from "@/components/admin/demo/components/DemoProgressBar";
import type * as DemoTypes from "@/components/admin/demo/components/types";
import * as DemoConfig from "@/components/admin/demo/components/config";
```

---

## Hooks

```typescript
// Authentication
import { useAuth } from "@/hooks/useAuth";

// Cart
import { useCart } from "@/hooks/useCart";

// Theme
import { useTheme } from "@/hooks/useTheme";

// Media Query
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Local Storage
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Debounce
import { useDebounce } from "@/hooks/useDebounce";

// Previous Value
import { usePrevious } from "@/hooks/usePrevious";

// Click Outside
import { useClickOutside } from "@/hooks/useClickOutside";
```

---

## Contexts

```typescript
// Auth Context
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";

// Cart Context
import { CartProvider, useCartContext } from "@/contexts/CartContext";

// Theme Context
import { ThemeProvider, useThemeContext } from "@/contexts/ThemeContext";
```

---

## Types

### Frontend Types

```typescript
// User Types
import type {
  UserFE,
  UserProfileFormFE,
  UserCardFE,
  ChangePasswordFormFE,
  OTPVerificationFormFE,
} from "@/types/frontend/user.types";

// Product Types
import type {
  ProductFE,
  ProductCardFE,
  ProductFormFE,
  ProductFiltersFE,
} from "@/types/frontend/product.types";

// Order Types
import type {
  OrderFE,
  OrderCardFE,
  OrderItemFE,
  CreateOrderFormFE,
  OrderStatsFE,
  ShippingAddressFE,
} from "@/types/frontend/order.types";

// Cart Types
import type {
  CartFE,
  CartItemFE,
  AddToCartFormFE,
  CartSummaryFE,
} from "@/types/frontend/cart.types";

// Auction Types
import type {
  AuctionFE,
  AuctionCardFE,
  AuctionFormFE,
  BidFE,
  PlaceBidFormFE,
} from "@/types/frontend/auction.types";

// Shop Types
import type {
  ShopFE,
  ShopCardFE,
  ShopFormFE,
  ShopStatsFE,
} from "@/types/frontend/shop.types";

// Category Types
import type {
  CategoryFE,
  CategoryTreeNodeFE,
  CategoryBreadcrumbFE,
  CategoryFormFE,
} from "@/types/frontend/category.types";

// Review Types
import type {
  ReviewFE,
  ReviewFormFE,
  ReviewStatsFE,
} from "@/types/frontend/review.types";

// Coupon Types
import type {
  CouponFE,
  CouponCardFE,
  CouponFormFE,
} from "@/types/frontend/coupon.types";

// Address Types
import type { AddressFE, AddressFormFE } from "@/types/frontend/address.types";

// Return Types
import type {
  ReturnFE,
  ReturnCardFE,
  ReturnFormFE,
} from "@/types/frontend/return.types";

// Support Ticket Types
import type {
  SupportTicketFE,
  SupportTicketCardFE,
  SupportTicketMessageFE,
  CreateSupportTicketFormFE,
} from "@/types/frontend/support-ticket.types";

// RipLimit Types
import type {
  RipLimitBalanceFE,
  RipLimitTransactionFE,
  PurchaseRipLimitFormFE,
} from "@/types/frontend/riplimit.types";

// Blog Types
import type {
  BlogPostFE,
  BlogPostCardFE,
  BlogCategoryFE,
  BlogTagFE,
} from "@/types/frontend/blog.types";

// Notification Types
import type {
  NotificationFE,
  NotificationPreferencesFE,
} from "@/types/frontend/notification.types";

// Payment Types
import type {
  PaymentMethodFE,
  PaymentFormFE,
} from "@/types/frontend/payment.types";
```

### Backend Types

```typescript
// User Backend Types
import type {
  UserBE,
  UserListItemBE,
  CreateUserRequestBE,
  UpdateUserRequestBE,
} from "@/types/backend/user.types";

// Product Backend Types
import type {
  ProductBE,
  ProductListItemBE,
  CreateProductRequestBE,
  UpdateProductRequestBE,
} from "@/types/backend/product.types";

// Order Backend Types
import type {
  OrderBE,
  OrderListItemBE,
  CreateOrderRequestBE,
  UpdateOrderRequestBE,
} from "@/types/backend/order.types";

// Cart Backend Types
import type {
  CartBE,
  CartItemBE,
  AddToCartRequestBE,
} from "@/types/backend/cart.types";

// Auction Backend Types
import type {
  AuctionBE,
  AuctionListItemBE,
  BidBE,
  CreateAuctionRequestBE,
  PlaceBidRequestBE,
} from "@/types/backend/auction.types";

// Shop Backend Types
import type {
  ShopBE,
  CreateShopRequestBE,
  UpdateShopRequestBE,
} from "@/types/backend/shop.types";

// Category Backend Types
import type {
  CategoryBE,
  CreateCategoryRequestBE,
  UpdateCategoryRequestBE,
} from "@/types/backend/category.types";

// Review Backend Types
import type {
  ReviewBE,
  ReviewStatsResponseBE,
  CreateReviewRequestBE,
} from "@/types/backend/review.types";

// Coupon Backend Types
import type {
  CouponBE,
  CreateCouponRequestBE,
  UpdateCouponRequestBE,
} from "@/types/backend/coupon.types";

// Address Backend Types
import type {
  AddressBE,
  CreateAddressRequestBE,
} from "@/types/backend/address.types";

// Return Backend Types
import type {
  ReturnBE,
  CreateReturnRequestBE,
} from "@/types/backend/return.types";

// Support Ticket Backend Types
import type {
  SupportTicketBE,
  SupportTicketMessageBE,
  CreateSupportTicketRequestBE,
} from "@/types/backend/support-ticket.types";
```

### Shared Types

```typescript
// Common Types & Enums
import type {
  FirebaseTimestamp,
  ISOTimestamp,
  BaseEntity,
  CategoryReference,
  ShopReference,
  ValidationError,
  SortOrder,
  SortField,
} from "@/types/shared/common.types";

import {
  UserRole,
  UserStatus,
  Status,
  ProductStatus,
  ProductCondition,
  ShippingClass,
  AuctionType,
  AuctionStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingMethod,
  TicketStatus,
  TicketCategory,
  TicketPriority,
  NotificationType,
  MediaType,
  CouponType,
  CouponStatus,
  CouponApplicability,
  ReturnStatus,
  ReturnReason,
} from "@/types/shared/common.types";

// Pagination Types
import type {
  PaginationParams,
  PaginationMeta,
  CursorPaginationMeta,
  OffsetPaginationMeta,
  PaginatedResponse,
  PaginatedResponseBE,
  PaginatedResponseFE,
  SortParams,
  FilterOperator,
  Filter,
  FilterGroup,
  SearchParams,
} from "@/types/shared/pagination.types";

// API Types
import type {
  APIResponse,
  APIErrorResponse,
  APIResult,
  CreateRequest,
  UpdateRequest,
  DeleteRequest,
  BulkOperationRequest,
  HTTPMethod,
  RequestConfig,
  APIClientConfig,
} from "@/types/shared/api.types";

import {
  APIError,
  NetworkError,
  ValidationErrorClass,
  isSuccessResponse,
  isErrorResponse,
  isPaginatedResponse,
} from "@/types/shared/api.types";

// Location Types
import type {
  PincodeData,
  PincodeArea,
  PincodeLookupResult,
  GeoCoordinates,
  ReverseGeocodeResult,
  SmartAddressBE,
  SmartAddressFE,
  SmartAddressFormData,
} from "@/types/shared/location.types";

// Media Types
import type {
  MediaType,
  MediaSource,
  UploadStatus,
  MediaFile,
  MediaMetadata,
  UploadedMedia,
  EditorState,
  CropArea,
  VideoThumbnail,
  MediaValidationResult,
  MediaUploadOptions,
} from "@/types/media";

// Homepage Types
import type { SectionConfig, HomepageSettings } from "@/types/homepage";

// Inline Edit Types
import type {
  FieldType,
  SelectOption,
  InlineField,
  BulkAction,
  InlineEditConfig,
} from "@/types/inline-edit";
```

### Transform Functions

```typescript
// User Transforms
import {
  toFEUser,
  toFEUserCard,
  toFEUsers,
  toFEUserCards,
  toBEUserProfileUpdate,
  toBEUpdateUserRequest,
} from "@/types/transforms/user.transforms";

// Product Transforms
import {
  toFEProduct,
  toFEProductCard,
  toFEProducts,
  toFEProductCards,
  toBEProductCreate,
  toBEProductUpdate,
} from "@/types/transforms/product.transforms";

// Order Transforms
import {
  toFEOrder,
  toFEOrderCard,
  toFEOrders,
  toFEOrderCards,
  toBECreateOrderRequest,
  toBEUpdateOrderStatusRequest,
} from "@/types/transforms/order.transforms";

// Cart Transforms
import {
  toFECart,
  toFECartSummary,
  toBEAddToCartRequest,
  createEmptyCart,
} from "@/types/transforms/cart.transforms";

// Auction Transforms
import {
  toFEAuction,
  toFEAuctionCard,
  toFEAuctions,
  toFEAuctionCards,
  toFEBid,
  toBECreateAuctionRequest,
  toBEPlaceBidRequest,
} from "@/types/transforms/auction.transforms";

// Shop Transforms
import {
  toFEShop,
  toFEShopCard,
  toFEShops,
  toFEShopCards,
  toBECreateShopRequest,
} from "@/types/transforms/shop.transforms";

// Category Transforms
import {
  toFECategory,
  toFECategories,
  toFECategoryTreeNode,
  toFECategoryBreadcrumb,
  toBECreateCategoryRequest,
} from "@/types/transforms/category.transforms";

// Review Transforms
import {
  toFEReview,
  toFEReviews,
  toFEReviewStats,
  toBECreateReviewRequest,
} from "@/types/transforms/review.transforms";

// Coupon Transforms
import {
  toFECoupon,
  toFECoupons,
  toFECouponCard,
  toFECouponCards,
  toBECreateCouponRequest,
  toBEUpdateCouponRequest,
} from "@/types/transforms/coupon.transforms";

// Address Transforms
import {
  toFEAddress,
  toFEAddresses,
  toBECreateAddressRequest,
} from "@/types/transforms/address.transforms";

// Return Transforms
import {
  returnBEtoFE,
  returnFEtoBE,
  returnBEtoCard,
  returnFormFEtoRequestBE,
} from "@/types/transforms/return.transforms";

// Support Ticket Transforms
import {
  toFESupportTicket,
  toFESupportTickets,
  toFESupportTicketCard,
  toFESupportTicketMessage,
  toBECreateSupportTicketRequest,
} from "@/types/transforms/support-ticket.transforms";

// RipLimit Transforms
import {
  toFERipLimitBalance,
  toFERipLimitTransaction,
  toFERipLimitTransactionHistory,
  createEmptyBalance,
} from "@/types/transforms/riplimit.transforms";
```

---

## Constants

```typescript
// App Constants
import {
  APP_NAME,
  APP_DESCRIPTION,
  APP_VERSION,
  CONTACT_EMAIL,
  CONTACT_PHONE,
} from "@/constants/app";

// Route Constants
import {
  ROUTES,
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  ADMIN_ROUTES,
  SELLER_ROUTES,
} from "@/constants/routes";

// API Constants
import { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS } from "@/constants/api";

// Validation Constants
import {
  MIN_PASSWORD_LENGTH,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from "@/constants/validation";

// Status Constants
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  SHIPPING_STATUSES,
  AUCTION_STATUSES,
} from "@/constants/statuses";
```

---

## Configuration

```typescript
// Firebase Config
import { firebaseConfig } from "@/config/firebase";

// Theme Config
import { themeConfig } from "@/config/theme";

// SEO Config
import { seoConfig } from "@/config/seo";
```

---

## Utilities

```typescript
// Format Utilities
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatFileSize,
  formatDuration,
  formatPhoneNumber,
  formatPincode,
  formatCompactCurrency,
} from "@/lib/formatters";

// Price Formatting (Recommended)
import {
  formatPrice,        // Null-safe price formatting
  formatPriceRange,   // Min-Max range
  formatDiscount,     // Discount percentage
  formatINR,         // Indian Rupee formatting
  parsePrice,        // Parse string to number
} from "@/lib/price.utils";

// Validation Utilities
import {
  validateEmail,
  validatePhone,
  validateUrl,
  validatePincode,
  validatePassword,
  validateSKU,
  validateSlug,
  validateGST,
  validatePAN,
} from "@/lib/validators";

// String Utilities
import { slugify, capitalize, truncate, pluralize } from "@/lib/string";

// Array Utilities
import { chunk, unique, groupBy, sortBy } from "@/lib/array";

// Object Utilities
import { pick, omit, merge, clone } from "@/lib/object";

// Date Utilities
import {
  isToday,
  isYesterday,
  isFuture,
  isPast,
  addDays,
  subDays,
  differenceInDays,
} from "@/lib/date";
```

---

## API Utilities

```typescript
// Sieve Pagination & Filtering
import {
  parseSieveQuery,
  buildSieveQueryString,
  getSieveConfig,
} from "@/app/api/lib/sieve/parser";

import type {
  SieveQuery,
  SieveConfig,
  SievePaginatedResponse,
  FilterCondition,
  SortField,
} from "@/app/api/lib/sieve/types";

// Firestore Adapter
import {
  applyFiltersToQuery,
  applySortsToQuery,
  applyPaginationToQuery,
} from "@/app/api/lib/sieve/firestore-adapter";

// RipLimit Operations
import {
  getBalanceDetails,
  creditBalance,
  debitBalance,
  getTransactionHistory,
} from "@/app/api/lib/riplimit/account";

import {
  createTransaction,
  updateTransaction,
  getTransaction,
} from "@/app/api/lib/riplimit/transactions";

import {
  createBidHold,
  releaseBidHold,
  completeBidPurchase,
} from "@/app/api/lib/riplimit/bids";

import {
  getAdminStats,
  getUserBalances,
  adminAdjustBalance,
  adminClearUnpaidAuction,
} from "@/app/api/lib/riplimit/admin";

// Location Services
import {
  fetchPincodeData,
  validatePincode,
} from "@/app/api/lib/location/pincode";

// Email Templates
import { generateVerificationEmail } from "@/app/api/lib/email/templates/verification.template";

import { generatePasswordResetEmail } from "@/app/api/lib/email/templates/password-reset.template";

import { generateWelcomeEmail } from "@/app/api/lib/email/templates/welcome.template";

import {
  generateOrderConfirmationEmail,
  generateOrderShippedEmail,
  generateOrderDeliveredEmail,
} from "@/app/api/lib/email/templates/order.templates";

import {
  generateAuctionWonEmail,
  generateAuctionOutbidEmail,
} from "@/app/api/lib/email/templates/auction.templates";

// Middleware
import {
  withMiddleware,
  withRateLimit,
  withCache,
  withLogger,
} from "@/app/api/middleware/index";

import { cacheManager } from "@/app/api/middleware/cache";
import { apiLogger } from "@/app/api/middleware/logger";
```

---

## Validation Schemas

```typescript
// Product Validation
import {
  productSchema,
  createProductSchema,
  updateProductSchema,
} from "@/lib/validations/product.schema";

// Auction Validation
import {
  auctionSchema,
  createAuctionSchema,
  bidSchema,
} from "@/lib/validations/auction.schema";

// User Validation
import {
  userSchema,
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "@/lib/validations/user.schema";

// Address Validation
import {
  addressSchema,
  createAddressSchema,
} from "@/lib/validations/address.schema";

// Category Validation
import {
  categorySchema,
  createCategorySchema,
} from "@/lib/validations/category.schema";

// Shop Validation
import {
  shopSchema,
  createShopSchema,
  updateShopSchema,
} from "@/lib/validations/shop.schema";

// Review Validation
import {
  reviewSchema,
  createReviewSchema,
} from "@/lib/validations/review.schema";
```

---

## Media Utilities

```typescript
// Media Validation
import {
  validateFileSize,
  validateFileType,
  validateImageDimensions,
  validateVideoConstraints,
  validateMedia,
  getMediaType,
  formatFileSize,
  formatDuration,
} from "@/lib/media/media-validator";

// Image Processing
import {
  resizeImage,
  cropImage,
  rotateImage,
  flipImage,
  applyImageEdits,
  blobToFile,
} from "@/lib/media/image-processor";

// Video Processing
import {
  extractVideoThumbnail,
  extractMultipleThumbnails,
  getVideoMetadata,
  generateVideoPreview,
  createThumbnailFromBlob,
} from "@/lib/media/video-processor";
```

---

## Usage Guidelines

### Import Best Practices

1. **Always use direct imports** (no more barrel exports):

   ```typescript
   // ✅ Correct
   import { Button } from "@/components/ui/Button";
   import { ProductCard } from "@/components/cards/ProductCard";

   // ❌ Incorrect (index files removed)
   import { Button } from "@/components/ui";
   import { ProductCard } from "@/components/cards";
   ```

2. **Import types separately when needed**:

   ```typescript
   import { ProductCard } from "@/components/cards/ProductCard";
   import type { ProductCardProps } from "@/components/cards/ProductCard";
   ```

3. **Use path aliases** (@/) for cleaner imports:

   ```typescript
   // ✅ Correct
   import { authService } from "@/services/auth.service";

   // ❌ Avoid
   import { authService } from "../../../services/auth.service";
   ```

4. **Group imports logically**:

   ```typescript
   // React & Next.js
   import { useState, useEffect } from "react";
   import { useRouter } from "next/navigation";

   // Services
   import { productsService } from "@/services/products.service";

   // Components
   import { ProductCard } from "@/components/cards/ProductCard";
   import { FormInput } from "@/components/forms/FormInput";

   // Types
   import type { ProductFE } from "@/types/frontend/product.types";

   // Utilities
   import { formatPrice } from "@/lib/price.utils";
   import { formatDate } from "@/lib/formatters";
   ```

---

**Last Updated:** December 5, 2025  
**Maintained By:** Development Team

For questions or updates, please open an issue or submit a PR.
