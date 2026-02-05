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
export * from './ui';

// ==================== FORM COMPONENTS ====================
// Re-export from forms subdirectory
export * from './forms';

// ==================== TYPOGRAPHY ====================
// Re-export from typography subdirectory
export * from './typography';

// ==================== FEEDBACK COMPONENTS ====================
// Re-export from feedback subdirectory
export * from './feedback';
// Error Handling
export { ErrorBoundary } from './ErrorBoundary';
// ==================== UTILITY COMPONENTS ====================
// Re-export from utility subdirectory
export * from './utility';

// ==================== LAYOUT ====================
// Main Layout Client (stays in components root)
export { default as LayoutClient } from './LayoutClient';

// Re-export all layout components
export * from './layout';
