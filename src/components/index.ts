/**
 * Components Index
 *
 * Centralized exports for all UI components.
 * Components are organized into logical subdirectories for better maintainability.
 *
 * Directory Structure:
 * - ui/         - Basic UI components (Button, Card, Badge)
 * - forms/      - Form inputs and layout
 * - typography/ - Text and heading components
 * - feedback/   - User feedback (Alert, Modal)
 * - utility/    - Helper components (Search, BackToTop)
 * - layout/     - Navigation and layout structure
 *
 * @example
 * ```tsx
 * // Import from main barrel
 * import { Input } from "@mohasinac/appkit/ui";
import { Alert } from "@/components";
 *
 * // Import from specific subdirectory
 * import { Card } from "@/components";
 * import { Input, Select } from "@mohasinac/appkit/ui";
 * ```
 */

// ==================== UI COMPONENTS ====================
// Re-export from ui subdirectory
export * from "./ui";

// FormField (standalone form component)
export { FormField } from "@mohasinac/appkit/ui";
export type {
  SmartFormFieldProps as FormFieldProps,
  SelectOption,
} from "@mohasinac/appkit/ui";

// ==================== TYPOGRAPHY ====================
// Typography (Heading, Text, Label, Caption, Span) now imported directly from @mohasinac/appkit/ui
export { TextLink } from "./typography/TextLink";
export type { TextLinkProps } from "./typography/TextLink";

// ==================== SEMANTIC HTML WRAPPERS ====================
// Semantic HTML (Section, Article, Main, Aside, Nav, etc.) now imported directly from @mohasinac/appkit/ui

// ==================== FEEDBACK COMPONENTS ====================
// Error Handling
export { ErrorBoundary } from "@mohasinac/appkit/next";

// ==================== MODALS ====================
export { default as ConfirmDeleteModal } from "./modals/ConfirmDeleteModal";
export {
  ImageCropModal,
  VideoThumbnailSelector,
  VideoTrimModal,
} from "./media-modals.client";
export type {
  ImageCropData,
  VideoThumbnailSelectorProps,
  VideoTrimModalProps,
} from "./media-modals.client";
export { default as UnsavedChangesModal } from "./modals/UnsavedChangesModal";

// ==================== UTILITY COMPONENTS ====================
// Re-export from utility subdirectory
export * from "./utility";

// ==================== MEDIA PRIMITIVES ====================
// Rule 28: all image + video rendering goes through these Tier 1 components.
export * from "./media";

// ==================== UPLOAD COMPONENTS ====================
export { AvatarUpload } from "@mohasinac/appkit/features/media";
export { AvatarDisplay } from "@mohasinac/appkit/ui";

// ==================== PASSWORD STRENGTH ====================
export { PasswordStrengthIndicator } from "@mohasinac/appkit/ui";

// ==================== LAYOUT ====================
// Main Layout Client (stays in components root)
export { LayoutClient } from "@mohasinac/appkit/features/layout";

// Re-export all layout components
export * from "./layout";

// ==================== ADMIN COMPONENTS ====================
// Re-export from admin subdirectory
export * from "./admin";

// ==================== DASHBOARD STATS CARD ====================
export { DashboardStatsCard, RowActionMenu } from "@mohasinac/appkit/ui";
export type { DashboardStatsCardProps, RowAction } from "@mohasinac/appkit/ui";

// ==================== USER COMPONENTS ====================
export * from "./user";

// ==================== AUTH COMPONENTS ====================
// Re-export from auth subdirectory
export * from "./auth";

// ==================== @MOHASINAC/UI NEW PRIMITIVES ====================
// StarRating, ImageLightbox now imported directly from @mohasinac/appkit/ui

// ==================== PROVIDERS ====================
// Re-export from providers subdirectory
export * from "./providers";

// ==================== PRODUCTS ====================
// Admin-only product form/types (domain views live in @/features/products)
export * from "./products";

// ==================== AUCTIONS ====================
export * from "./auctions";

// ==================== PRE-ORDERS ====================
export * from "./pre-orders";

// ==================== ORDERS ====================
export * from "./orders";

// ==================== CATEGORIES ====================
export * from "./categories";

// ==================== FILTERS ====================
export * from "./filters";

// ==================== SETUP UTILITIES ====================
// Zod global error map (renders nothing, side-effect only)
export { ZodSetup } from "@mohasinac/appkit/validation";

// ==================== ELEVATED FEATURE COMPONENTS ====================
// Purely presentational components elevated from features to Tier-1
// so shared-tier layout components and other features can import them.
export { EventBanner } from "@mohasinac/appkit/features/events";
export { InteractiveStoreCard } from "./stores";
export type { InteractiveStoreCardProps, StoreListItem as StoreListItemUI } from "./stores";
