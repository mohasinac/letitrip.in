/**
 * Shared TypeScript Type Definitions
 * 
 * ORGANIZED STRUCTURE:
 * - shared/   → Types used by both UI and Backend
 * - api/      → Backend-specific types
 * - ui/       → Frontend-specific types
 * - game/     → Game types (reference to @/lib/game/types)
 * 
 * Import Examples:
 * - import { User, Product } from "@/types/shared";
 * - import { UserContext } from '@/types/api';
 * - import { ButtonProps, UseProductsReturn } from '@/types/ui';
 * - import { GameState } from '@/types/game';
 */

// ============================================================================
// NEW ORGANIZED EXPORTS (Recommended)
// ============================================================================

// Shared types (used by both UI and Backend)
export * from "./shared";

// ============================================================================
// LEGACY EXPORTS (To be deprecated and moved to organized structure)
// ============================================================================
