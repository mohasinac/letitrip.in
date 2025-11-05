/**
 * Beyblade Constants
 * Defines the resolution-based sizing system for beyblades
 */

import { ARENA_RESOLUTION } from "@/types/arenaConfigNew";

/**
 * BEYBLADE SIZING SYSTEM
 * 
 * Based on real-world beyblade dimensions:
 * - Standard beyblades are typically 3-5 cm in diameter
 * - This system uses: 1 cm = ARENA_RESOLUTION / 45 pixels
 * 
 * For 1080px arena: 1 cm = 1080 / 45 = 24 pixels
 * 
 * Examples:
 * - 3 cm beyblade = 72 pixels
 * - 4 cm beyblade = 96 pixels (standard)
 * - 5 cm beyblade = 120 pixels
 * - 10 cm beyblade = 240 pixels (very large)
 */

/**
 * Pixels per centimeter for beyblade sizing
 * Formula: ARENA_RESOLUTION / 45
 * Result: 1 cm = 24 pixels (for 1080px arena)
 */
export const PIXELS_PER_CM = ARENA_RESOLUTION / 45;

/**
 * Convert centimeters to pixels for beyblade rendering
 * @param cm - Size in centimeters
 * @returns Size in pixels based on arena resolution
 */
export function cmToPixels(cm: number): number {
  return cm * PIXELS_PER_CM;
}

/**
 * Convert pixels to centimeters for beyblade editing
 * @param pixels - Size in pixels
 * @returns Size in centimeters
 */
export function pixelsToCm(pixels: number): number {
  return pixels / PIXELS_PER_CM;
}

/**
 * Calculate beyblade display radius in pixels
 * @param radiusCm - Radius in centimeters from beyblade stats
 * @returns Display radius in pixels
 */
export function getBeybladeDisplayRadius(radiusCm: number): number {
  return cmToPixels(radiusCm);
}

/**
 * Calculate beyblade diameter in pixels
 * @param radiusCm - Radius in centimeters from beyblade stats
 * @returns Display diameter in pixels
 */
export function getBeybladeDisplayDiameter(radiusCm: number): number {
  return cmToPixels(radiusCm) * 2;
}

/**
 * Standard beyblade sizes in centimeters
 */
export const STANDARD_BEYBLADE_SIZES = {
  MINI: 2.5,      // 60px diameter at 1080p
  SMALL: 3.0,     // 72px diameter at 1080p
  STANDARD: 4.0,  // 96px diameter at 1080p (default)
  LARGE: 5.0,     // 120px diameter at 1080p
  XL: 7.5,        // 180px diameter at 1080p
  XXL: 10.0,      // 240px diameter at 1080p
  GIANT: 15.0,    // 360px diameter at 1080p
  MEGA: 20.0,     // 480px diameter at 1080p
} as const;

/**
 * Beyblade size constraints
 */
export const BEYBLADE_SIZE_CONSTRAINTS = {
  MIN_RADIUS_CM: 1.5,    // 36px at 1080p
  MAX_RADIUS_CM: 25,     // 600px at 1080p
  DEFAULT_RADIUS_CM: 4,  // 96px at 1080p (standard size)
} as const;

/**
 * Mass recommendations based on size (in grams)
 * Real beyblades are typically 40-60g
 */
export function getRecommendedMass(radiusCm: number): number {
  // Base mass calculation: roughly proportional to area (radius²)
  // 4cm radius (standard) = 50g
  const standardRadius = 4;
  const standardMass = 50;
  return Math.round((radiusCm / standardRadius) ** 2 * standardMass);
}

/**
 * Preview canvas settings for beyblade editor
 */
export const BEYBLADE_PREVIEW_SETTINGS = {
  CANVAS_SIZE: 400,           // Preview canvas size in pixels
  PREVIEW_SCALE: 1,           // Scale multiplier for preview
  BACKGROUND_COLOR: "#f3f4f6", // Light gray background
  GRID_COLOR: "#d1d5db",      // Grid line color
  CENTER_CIRCLE_RADIUS: 150,  // Reference circle radius
} as const;

/**
 * Calculate display scale for beyblade preview
 * This ensures beyblades are shown at correct relative size in preview
 * @param canvasSize - Canvas size in pixels (usually 400)
 * @returns Scale factor for preview rendering
 */
export function getBeybladePreviewScale(canvasSize: number = BEYBLADE_PREVIEW_SETTINGS.CANVAS_SIZE): number {
  // Scale to fit the preview canvas while maintaining arena resolution proportions
  return canvasSize / ARENA_RESOLUTION;
}
