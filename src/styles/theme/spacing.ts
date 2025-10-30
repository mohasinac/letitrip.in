/**
 * Theme Spacing
 * Centralized spacing scale for consistent margins and padding
 */

export const spacing = {
  // Base unit
  unit: 8,

  // Scale
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px

  // Common patterns
  gutter: "2rem", // 32px - standard vertical spacing
  section: "4rem", // 64px - section spacing
  component: "1rem", // 16px - internal component spacing
  element: "0.5rem", // 8px - small element spacing
};

// Breakpoint-aware spacing (responsive)
export const responsiveSpacing = {
  mobile: spacing[4], // 16px
  tablet: spacing[6], // 24px
  desktop: spacing[8], // 32px
};

export default spacing;
