/**
 * Source Index
 * 
 * Main barrel export file for the entire src directory.
 * Provides convenient access to all major modules.
 * 
 * @example
 * ```tsx
 * import { 
 *   Button, 
 *   Input, 
 *   THEME_CONSTANTS, 
 *   useTheme,
 *   useSwipe,
 *   globalEventManager
 * } from '@/index';
 * ```
 */

// ==================== COMPONENTS ====================
export * from './components';

// ==================== CONSTANTS ====================
export * from './constants';

// ==================== CONTEXTS ====================
export * from './contexts';

// ==================== HOOKS ====================
export * from './hooks';

// ==================== UTILITIES ====================
export * from './utils/eventHandlers';
