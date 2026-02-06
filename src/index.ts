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
 *   globalEventManager,
 *   validators,
 *   formatters,
 *   helpers,
 *   CacheManager,
 *   Logger
 * } from '@/index';
 * ```
 */

// ==================== COMPONENTS ====================
export * from "./components";

// ==================== CONSTANTS ====================
export * from "./constants";

// ==================== CONTEXTS ====================
export * from "./contexts";

// ==================== HOOKS ====================
export * from "./hooks";

// ==================== UTILITIES ====================
export * from "./utils";

// ==================== HELPERS ====================
export * from "./helpers/auth";
export * from "./helpers/data";
export * from "./helpers/ui";

// ==================== CLASSES ====================
export * from "./classes";

// ==================== SNIPPETS ====================
export * from "./snippets";

// ==================== TYPES ====================
export * from "./types/auth";
