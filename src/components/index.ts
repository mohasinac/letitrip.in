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
 * import { Button, Input, Alert } from '@/components';
 *
 * // Import from specific subdirectory
 * import { Button, Card } from '@/components/ui';
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
// Re-export from typography subdirectory
export * from "./typography";

// ==================== SEMANTIC HTML WRAPPERS ====================
// Section, Article, Main, Aside, Nav, BlockHeader, BlockFooter, Ul, Ol, Li
export * from "./semantic";

// ==================== FEEDBACK COMPONENTS ====================
// Re-export from feedback subdirectory
export * from "./feedback";
// Error Handling
export { ErrorBoundary } from "./ErrorBoundary";

// ==================== MODALS ====================
export { default as ConfirmDeleteModal } from "./modals/ConfirmDeleteModal";
export { ImageCropModal } from "./modals/ImageCropModal";
export type { ImageCropData } from "./modals/ImageCropModal";
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

// ==================== @MOHASINAC/UI NEW PRIMITIVES (S1-1) ====================
// Components that don't have existing app-specific equivalents
// Modal, Drawer, Pagination, StatusBadge, Breadcrumbs are app-specific (see feedback/, ui/, layout/)
// BreadcrumbItem is already exported from layout/ as a React component — don't re-export as type
export { StarRating } from "@mohasinac/ui";
export type { StarRatingProps } from "@mohasinac/ui";
export { ImageLightbox } from "@mohasinac/ui";
export type { ImageLightboxProps, LightboxImage } from "@mohasinac/ui";

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
export { BlogCard, CATEGORY_BADGE } from "./BlogCard";
export { ReviewCard } from "./ReviewCard";
export { EventCard } from "./EventCard";
export { EventBanner } from "./EventBanner";
export { StoreCard } from "./StoreCard";
