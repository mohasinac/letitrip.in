/**
 * Color Helper Tests
 *
 * Tests for color manipulation and utility functions
 */

import {
  hexToRgb,
  rgbToHex,
  lightenColor,
  darkenColor,
  randomColor,
  getContrastColor,
  generateGradient,
} from "../color.helper";

describe("hexToRgb", () => {
  test("should convert valid hex color to RGB", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#00ff00")).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb("#0000ff")).toEqual({ r: 0, g: 0, b: 255 });
  });

  test("should handle hex without # prefix", () => {
    expect(hexToRgb("ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("00ff00")).toEqual({ r: 0, g: 255, b: 0 });
  });

  test("should handle mixed case hex colors", () => {
    expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#Ff00fF")).toEqual({ r: 255, g: 0, b: 255 });
  });

  test("should return null for invalid hex", () => {
    expect(hexToRgb("invalid")).toBeNull();
    expect(hexToRgb("#gg0000")).toBeNull();
    expect(hexToRgb("#ff")).toBeNull();
    expect(hexToRgb("")).toBeNull();
  });

  test("should handle common colors", () => {
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 }); // white
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 }); // black
    expect(hexToRgb("#808080")).toEqual({ r: 128, g: 128, b: 128 }); // gray
  });
});

describe("rgbToHex", () => {
  test("should convert RGB to hex", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
    expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
    expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
  });

  test("should handle common colors", () => {
    expect(rgbToHex(255, 255, 255)).toBe("#ffffff"); // white
    expect(rgbToHex(0, 0, 0)).toBe("#000000"); // black
    expect(rgbToHex(128, 128, 128)).toBe("#808080"); // gray
  });

  test("should handle single digit hex values", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
    expect(rgbToHex(1, 2, 3)).toBe("#010203");
  });

  test("should handle mid-range values", () => {
    expect(rgbToHex(128, 64, 192)).toBe("#8040c0");
    expect(rgbToHex(200, 100, 50)).toBe("#c86432");
  });

  test("should handle boundary values", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
    expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
    expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
  });
});

describe("lightenColor", () => {
  test("should lighten color by percentage", () => {
    const red = "#ff0000";
    const lightRed = lightenColor(red, 20);
    const rgb = hexToRgb(lightRed);
    expect(rgb).not.toBeNull();
    expect(rgb!.r).toBe(255); // Already max red
    expect(rgb!.g).toBeGreaterThan(0); // Should increase green
    expect(rgb!.b).toBeGreaterThan(0); // Should increase blue
  });

  test("should not exceed 255 for any channel", () => {
    const result = lightenColor("#ffffff", 50);
    const rgb = hexToRgb(result);
    expect(rgb).not.toBeNull();
    expect(rgb!.r).toBeLessThanOrEqual(255);
    expect(rgb!.g).toBeLessThanOrEqual(255);
    expect(rgb!.b).toBeLessThanOrEqual(255);
  });

  test("should return original color for invalid hex", () => {
    expect(lightenColor("invalid", 50)).toBe("invalid");
    expect(lightenColor("#gg0000", 50)).toBe("#gg0000");
  });

  test("should lighten black", () => {
    const result = lightenColor("#000000", 50);
    expect(result).not.toBe("#000000");
    const rgb = hexToRgb(result);
    expect(rgb).not.toBeNull();
    expect(rgb!.r).toBeGreaterThan(0);
    expect(rgb!.g).toBeGreaterThan(0);
    expect(rgb!.b).toBeGreaterThan(0);
  });

  test("should handle 0% lightening", () => {
    const color = "#808080";
    expect(lightenColor(color, 0)).toBe(color);
  });

  test("should handle 100% lightening", () => {
    const result = lightenColor("#000000", 100);
    expect(result).toBe("#ffffff");
  });
});

describe("darkenColor", () => {
  test("should darken color by percentage", () => {
    const white = "#ffffff";
    const darkWhite = darkenColor(white, 20);
    const rgb = hexToRgb(darkWhite);
    expect(rgb).not.toBeNull();
    expect(rgb!.r).toBeLessThan(255);
    expect(rgb!.g).toBeLessThan(255);
    expect(rgb!.b).toBeLessThan(255);
  });

  test("should not go below 0 for any channel", () => {
    const result = darkenColor("#000000", 50);
    const rgb = hexToRgb(result);
    expect(rgb).not.toBeNull();
    expect(rgb!.r).toBeGreaterThanOrEqual(0);
    expect(rgb!.g).toBeGreaterThanOrEqual(0);
    expect(rgb!.b).toBeGreaterThanOrEqual(0);
  });

  test("should return original color for invalid hex", () => {
    expect(darkenColor("invalid", 50)).toBe("invalid");
    expect(darkenColor("#gg0000", 50)).toBe("#gg0000");
  });

  test("should darken white", () => {
    const result = darkenColor("#ffffff", 50);
    expect(result).not.toBe("#ffffff");
    const rgb = hexToRgb(result);
    expect(rgb).not.toBeNull();
    expect(rgb!.r).toBeLessThan(255);
    expect(rgb!.g).toBeLessThan(255);
    expect(rgb!.b).toBeLessThan(255);
  });

  test("should handle 0% darkening", () => {
    const color = "#808080";
    expect(darkenColor(color, 0)).toBe(color);
  });

  test("should handle 100% darkening", () => {
    const result = darkenColor("#ffffff", 100);
    expect(result).toBe("#000000");
  });
});

describe("randomColor", () => {
  test("should generate valid hex color", () => {
    const color = randomColor();
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  test("should generate different colors", () => {
    const colors = new Set();
    for (let i = 0; i < 100; i++) {
      colors.add(randomColor());
    }
    // Should generate at least 90 unique colors out of 100
    expect(colors.size).toBeGreaterThan(90);
  });

  test("should always start with #", () => {
    for (let i = 0; i < 10; i++) {
      const color = randomColor();
      expect(color.startsWith("#")).toBe(true);
    }
  });

  test("should always be 7 characters long", () => {
    for (let i = 0; i < 10; i++) {
      const color = randomColor();
      expect(color.length).toBe(7);
    }
  });
});

describe("getContrastColor", () => {
  test("should return black for light backgrounds", () => {
    expect(getContrastColor("#ffffff")).toBe("#000000"); // white
    expect(getContrastColor("#ffff00")).toBe("#000000"); // yellow
    expect(getContrastColor("#00ffff")).toBe("#000000"); // cyan
  });

  test("should return white for dark backgrounds", () => {
    expect(getContrastColor("#000000")).toBe("#ffffff"); // black
    expect(getContrastColor("#0000ff")).toBe("#ffffff"); // blue
    expect(getContrastColor("#ff0000")).toBe("#ffffff"); // red
  });

  test("should return black for default on invalid color", () => {
    expect(getContrastColor("invalid")).toBe("#000000");
    expect(getContrastColor("#gg0000")).toBe("#000000");
  });

  test("should handle mid-tone colors", () => {
    expect(getContrastColor("#808080")).toBe("#000000"); // gray (luminance > 0.5)
  });

  test("should handle colors at luminance threshold", () => {
    // Test colors near the 0.5 luminance threshold
    const result1 = getContrastColor("#7f7f7f"); // Just below threshold
    const result2 = getContrastColor("#808080"); // Just above threshold
    expect([result1, result2]).toContain("#ffffff");
    expect([result1, result2]).toContain("#000000");
  });
});

describe("generateGradient", () => {
  test("should generate gradient between two colors", () => {
    const gradient = generateGradient("#ff0000", "#0000ff", 5);
    expect(gradient).toHaveLength(5);
    expect(gradient[0]).toBe("#ff0000"); // Start color
    expect(gradient[4]).toBe("#0000ff"); // End color
  });

  test("should generate intermediate colors", () => {
    const gradient = generateGradient("#000000", "#ffffff", 3);
    expect(gradient).toHaveLength(3);
    expect(gradient[0]).toBe("#000000"); // Black
    expect(gradient[1]).toBe("#808080"); // Gray (midpoint)
    expect(gradient[2]).toBe("#ffffff"); // White
  });

  test("should handle single step", () => {
    const gradient = generateGradient("#ff0000", "#0000ff", 1);
    expect(gradient).toHaveLength(1);
    // With steps=1, division by 0 occurs (steps-1), so this is an edge case
    // Just verify we get one color back
    expect(gradient.length).toBe(1);
  });

  test("should handle two steps", () => {
    const gradient = generateGradient("#ff0000", "#0000ff", 2);
    expect(gradient).toHaveLength(2);
    expect(gradient[0]).toBe("#ff0000");
    expect(gradient[1]).toBe("#0000ff");
  });

  test("should return start and end for invalid colors", () => {
    const gradient = generateGradient("invalid", "#0000ff", 5);
    expect(gradient).toEqual(["invalid", "#0000ff"]);
  });

  test("should generate smooth gradient", () => {
    const gradient = generateGradient("#ff0000", "#00ff00", 10);
    expect(gradient).toHaveLength(10);

    // Check that each step is progressively different
    for (let i = 1; i < gradient.length; i++) {
      expect(gradient[i]).not.toBe(gradient[i - 1]);
    }
  });

  test("should handle large step count", () => {
    const gradient = generateGradient("#000000", "#ffffff", 100);
    expect(gradient).toHaveLength(100);
    expect(gradient[0]).toBe("#000000");
    expect(gradient[99]).toBe("#ffffff");
  });

  test("should generate correct RGB interpolation", () => {
    const gradient = generateGradient("#ff0000", "#0000ff", 3);
    const middle = gradient[1];
    const rgb = hexToRgb(middle);

    expect(rgb).not.toBeNull();
    // Middle should be roughly (#ff0000 + #0000ff) / 2
    expect(rgb!.r).toBeGreaterThan(100);
    expect(rgb!.r).toBeLessThan(155);
    expect(rgb!.b).toBeGreaterThan(100);
    expect(rgb!.b).toBeLessThan(155);
  });
});
