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
 * Lightens a hex color by a specified percentage
 *
 * @param hex - The hex color to lighten
 * @param percent - Percentage to lighten (0-100)
 * @returns The lightened hex color
 *
 * @example
 * ```typescript
 * const lighter = lightenColor('#FF5733', 20);
 * console.log(lighter); // '#ff7d5c' (lighter version)
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * (percent / 100)));
  const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * (percent / 100)));
  const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * (percent / 100)));

  return rgbToHex(r, g, b);
}

/**
 * Darkens a hex color by a specified percentage
 *
 * @param hex - The hex color to darken
 * @param percent - Percentage to darken (0-100)
 * @returns The darkened hex color
 *
 * @example
 * ```typescript
 * const darker = darkenColor('#FF5733', 20);
 * console.log(darker); // '#cc4629' (darker version)
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = Math.max(0, Math.floor(rgb.r * (1 - percent / 100)));
  const g = Math.max(0, Math.floor(rgb.g * (1 - percent / 100)));
  const b = Math.max(0, Math.floor(rgb.b * (1 - percent / 100)));

  return rgbToHex(r, g, b);
}

/**
 * Generates a random hex color
 *
 * @returns A random hex color string with '#' prefix
 *
 * @example
 * ```typescript
 * const color = randomColor();
 * console.log(color); // '#a3f2c1' (random)
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function randomColor(): string {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
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

/**
 * Generates a gradient array of colors between two colors
 *
 * @param startHex - The starting hex color
 * @param endHex - The ending hex color
 * @param steps - Number of color steps in the gradient
 * @returns An array of hex colors forming a gradient
 *
 * @example
 * ```typescript
 * const gradient = generateGradient('#FF0000', '#0000FF', 5);
 * console.log(gradient); // ['#ff0000', '#bf003f', '#7f007f', '#3f00bf', '#0000ff']
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function generateGradient(
  startHex: string,
  endHex: string,
  steps: number,
): string[] {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);

  if (!start || !end) return [startHex, endHex];

  const gradient: string[] = [];
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);
    gradient.push(rgbToHex(r, g, b));
  }

  return gradient;
}
