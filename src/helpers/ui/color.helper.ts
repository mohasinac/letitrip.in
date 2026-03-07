/**
 * Color Helpers
 *
 * UI helpers for color manipulation and utilities
 */

/**
 * Converts a hexadecimal color to RGB values
 *
 * @param hex - The hex color string (with or without '#')
 * @returns An object with r, g, b values, or null if invalid
 *
 * @example
 * ```typescript
 * const rgb = hexToRgb('#FF5733');
 * console.log(rgb); // { r: 255, g: 87, b: 51 }
 * ```
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB values to a hexadecimal color string
 *
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns The hex color string with '#' prefix
 *
 * @example
 * ```typescript
 * const hex = rgbToHex(255, 87, 51);
 * console.log(hex); // '#ff5733'
 * ```
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Determines the best contrasting text color (black or white) for a background
 *
 * @param hex - The background hex color
 * @returns '#000000' for light backgrounds, '#ffffff' for dark backgrounds
 *
 * @example
 * ```typescript
 * const textColor = getContrastColor('#FF5733');
 * console.log(textColor); // '#ffffff' (white text for dark red background)
 * ```
 */
export function getContrastColor(hex: string): "#000000" | "#ffffff" {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
}
