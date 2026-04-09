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
// Note: helpers/validation exports via @/helpers directly; not re-exported here
// to avoid ambiguity with hooks exports of the same types.

// ==================== CLASSES (now from appkit) ====================
export {
  logger,
  Logger,
  eventBus,
  EventBus,
  cacheManager,
  CacheManager,
  storageManager,
  StorageManager,
  Queue,
  type LogLevel,
} from "@mohasinac/appkit/core";
export { apiClient, ApiClient } from "@mohasinac/appkit/http";

// ==================== TYPES ====================
export * from "./types/auth";
