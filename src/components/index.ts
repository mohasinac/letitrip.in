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
 * import { Input, Alert } from "@/components";
 *
 * // Import from specific subdirectory
 * import { Card } from "@/components";
 * import { Input, Select } from '@/components/forms';
 * ```
 */

// ==================== UI COMPONENTS ====================
// Re-export from ui subdirectory
export * from "./ui";

// ==================== FORM COMPONENTS ====================
// Re-export from forms subdirectory
export * from "./forms";

// FormField (standalone form component)
export { FormField } from "./FormField";
export type { FormFieldProps, SelectOption } from "./FormField";

// ==================== TYPOGRAPHY ====================
// Typography (Heading, Text, Label, Caption, Span) now imported directly from @mohasinac/appkit/ui
export { TextLink } from "./typography/TextLink";
export type { TextLinkProps } from "./typography/TextLink";

// ==================== SEMANTIC HTML WRAPPERS ====================
// Semantic HTML (Section, Article, Main, Aside, Nav, etc.) now imported directly from @mohasinac/appkit/ui

// ==================== FEEDBACK COMPONENTS ====================
// Re-export from feedback subdirectory
export * from "./feedback";
// Error Handling
export { ErrorBoundary } from "./ErrorBoundary";

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
export { AvatarUpload } from "./AvatarUpload";
export { AvatarDisplay } from "./AvatarDisplay";

// ==================== PASSWORD STRENGTH ====================
export { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

// ==================== LAYOUT ====================
// Main Layout Client (stays in components root)
export { default as LayoutClient } from "./LayoutClient";

// Re-export all layout components
export * from "./layout";

// ==================== ADMIN COMPONENTS ====================
// Re-export from admin subdirectory
export * from "./admin";

// ==================== DASHBOARD STATS CARD ====================
export { DashboardStatsCard } from "./DashboardStatsCard";
export type { DashboardStatsCardProps } from "./DashboardStatsCard";
export { RowActionMenu } from "./RowActionMenu";
export type { RowAction } from "./RowActionMenu";

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
export { default as ZodSetup } from "./ZodSetup";

// ==================== ELEVATED FEATURE COMPONENTS ====================
// Purely presentational components elevated from features to Tier-1
// so shared-tier layout components and other features can import them.
export { EventBanner } from "./EventBanner";
export { InteractiveStoreCard } from "./stores";
export type { InteractiveStoreCardProps, StoreListItem as StoreListItemUI } from "./stores";
