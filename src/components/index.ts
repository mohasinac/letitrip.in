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

// ==================== FEEDBACK COMPONENTS ====================
// Re-export from feedback subdirectory
export * from "./feedback";
// Error Handling
export { ErrorBoundary } from "./ErrorBoundary";

// ==================== MODALS ====================
export { default as ConfirmDeleteModal } from "./modals/ConfirmDeleteModal";
export { ImageCropModal } from "./modals/ImageCropModal";
export type { ImageCropData } from "./modals/ImageCropModal";

// ==================== UTILITY COMPONENTS ====================
// Re-export from utility subdirectory
export * from "./utility";

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

// ==================== USER COMPONENTS ====================
// Re-export from user subdirectory
export * from "./user";

// ==================== AUTH COMPONENTS ====================
// Re-export from auth subdirectory
export * from "./auth";

// ==================== PROVIDERS ====================
// Re-export from providers subdirectory
export * from "./providers";

// ==================== PRODUCTS ====================
// Re-export from products subdirectory
export * from "./products";

// ==================== CART ====================
export * from "./cart";

// ==================== CHECKOUT ====================
export * from "./checkout";

// ==================== CATEGORIES ====================
export * from "./categories";

// ==================== AUCTIONS ====================
export * from "./auctions";
// ==================== SELLER ====================
export * from "./seller";

// ==================== BLOG ====================
export * from "./blog";

// ==================== PROMOTIONS ====================
export * from "./promotions";

// ==================== CONTACT ====================
export * from "./contact";
