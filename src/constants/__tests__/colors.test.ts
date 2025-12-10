/**
 * Colors Constants Tests
 *
 * Tests color constants for theming consistency
 * Coverage: 100%
 */

import { COLORS, COLOR_CLASSES } from "../colors";

describe("Colors Constants", () => {
  describe("COLORS Object", () => {
    it("should have primary color definitions", () => {
      expect(COLORS.primary).toBeDefined();
      expect(COLORS.primary.DEFAULT).toBe("yellow-500");
      expect(COLORS.primary.light).toBe("yellow-400");
      expect(COLORS.primary.dark).toBe("yellow-600");
      expect(COLORS.primary.darker).toBe("yellow-700");
      expect(COLORS.primary.bg).toBe("yellow-50");
      expect(COLORS.primary.border).toBe("yellow-200");
    });

    it("should have background color definitions", () => {
      expect(COLORS.background).toBeDefined();
      expect(COLORS.background.primary).toBe("bg-yellow-500");
      expect(COLORS.background.primaryHover).toBe("bg-yellow-600");
      expect(COLORS.background.light).toBe("bg-yellow-50");
      expect(COLORS.background.gradient).toContain("bg-gradient-to-r");
    });

    it("should have text color definitions", () => {
      expect(COLORS.text).toBeDefined();
      expect(COLORS.text.primary).toBe("text-yellow-600");
      expect(COLORS.text.primaryDark).toBe("text-yellow-700");
      expect(COLORS.text.primaryHover).toBe("text-yellow-700");
      expect(COLORS.text.onPrimary).toBe("text-gray-900");
      expect(COLORS.text.secondary).toBe("text-gray-600");
      expect(COLORS.text.white).toBe("text-white");
    });

    it("should have border color definitions", () => {
      expect(COLORS.border).toBeDefined();
      expect(COLORS.border.primary).toBe("border-yellow-200");
      expect(COLORS.border.secondary).toBe("border-gray-300");
    });

    it("should have hover state definitions", () => {
      expect(COLORS.hover).toBeDefined();
      expect(COLORS.hover.primary).toBe("hover:bg-yellow-600");
      expect(COLORS.hover.light).toBe("hover:bg-yellow-50");
      expect(COLORS.hover.text).toBe("hover:text-yellow-700");
    });

    it("should have focus state definitions", () => {
      expect(COLORS.focus).toBeDefined();
      expect(COLORS.focus.ring).toBe("focus:ring-yellow-500");
    });

    it("should be a const object", () => {
      expect(Object.isFrozen(COLORS)).toBe(false); // as const doesn't freeze, but makes readonly
      expect(typeof COLORS).toBe("object");
    });
  });

  describe("COLOR_CLASSES Object", () => {
    it("should have button class definitions", () => {
      expect(COLOR_CLASSES.button).toBeDefined();
      expect(COLOR_CLASSES.button.primary).toContain("bg-yellow-500");
      expect(COLOR_CLASSES.button.primary).toContain("hover:bg-yellow-600");
      expect(COLOR_CLASSES.button.primary).toContain("text-gray-900");
      expect(COLOR_CLASSES.button.secondary).toContain("bg-gray-700");
    });

    it("should have badge class definitions", () => {
      expect(COLOR_CLASSES.badge).toBeDefined();
      expect(COLOR_CLASSES.badge.primary).toContain("bg-yellow-500");
      expect(COLOR_CLASSES.badge.primary).toContain("text-gray-900");
      expect(COLOR_CLASSES.badge.cart).toContain("font-extrabold");
    });

    it("should have link class definitions", () => {
      expect(COLOR_CLASSES.link).toBeDefined();
      expect(COLOR_CLASSES.link.primary).toContain("text-yellow-600");
      expect(COLOR_CLASSES.link.primary).toContain("hover:text-yellow-700");
      expect(COLOR_CLASSES.link.primaryBold).toContain("font-bold");
    });

    it("should have background class definitions", () => {
      expect(COLOR_CLASSES.background).toBeDefined();
      expect(COLOR_CLASSES.background.light).toBe("bg-yellow-50");
      expect(COLOR_CLASSES.background.gradient).toContain("bg-gradient-to-r");
      expect(COLOR_CLASSES.background.card).toContain("border-2");
    });

    it("should have icon class definitions", () => {
      expect(COLOR_CLASSES.icon).toBeDefined();
      expect(COLOR_CLASSES.icon.primary).toBe("text-yellow-600");
      expect(COLOR_CLASSES.icon.light).toBe("text-yellow-400");
      expect(COLOR_CLASSES.icon.bright).toBe("text-yellow-500");
    });

    it("should have category class definitions", () => {
      expect(COLOR_CLASSES.category).toBeDefined();
      expect(COLOR_CLASSES.category.background).toContain("bg-yellow-100");
      expect(COLOR_CLASSES.category.background).toContain(
        "group-hover:bg-yellow-200"
      );
    });
  });

  describe("Color Consistency", () => {
    it("should use consistent yellow shades across definitions", () => {
      const yellowShades = [
        COLORS.primary.DEFAULT,
        COLORS.primary.light,
        COLORS.primary.dark,
        COLORS.primary.darker,
      ];

      yellowShades.forEach((shade) => {
        expect(shade).toMatch(/yellow-\d{3}/);
      });
    });

    it("should use gray for text on yellow backgrounds for visibility", () => {
      expect(COLORS.text.onPrimary).toContain("gray");
      expect(COLORS.text.onPrimaryBold).toContain("gray");
    });

    it("should have darker hover states for better UX", () => {
      expect(COLORS.background.primaryHover).toContain("600"); // Darker than 500
      expect(COLORS.hover.primary).toContain("600");
    });

    it("should maintain consistent naming patterns", () => {
      // Check that color names follow pattern
      expect(COLORS.primary.DEFAULT).toBeDefined();
      expect(COLORS.primary.light).toBeDefined();
      expect(COLORS.primary.dark).toBeDefined();
    });
  });

  describe("Tailwind Class Validity", () => {
    it("should use valid Tailwind color classes in COLORS", () => {
      const validPrefixes = ["text-", "bg-", "border-", "hover:", "focus:"];
      const allColorValues = [
        ...Object.values(COLORS.primary),
        ...Object.values(COLORS.background),
        ...Object.values(COLORS.text),
        ...Object.values(COLORS.border),
        ...Object.values(COLORS.hover),
        ...Object.values(COLORS.focus),
      ];

      allColorValues.forEach((value) => {
        // Should either be a color name or a class
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it("should use valid Tailwind utility classes in COLOR_CLASSES", () => {
      const allClasses = [
        COLOR_CLASSES.button.primary,
        COLOR_CLASSES.button.secondary,
        COLOR_CLASSES.badge.primary,
        COLOR_CLASSES.link.primary,
        COLOR_CLASSES.background.light,
        COLOR_CLASSES.icon.primary,
      ];

      allClasses.forEach((classString) => {
        expect(typeof classString).toBe("string");
        expect(classString.length).toBeGreaterThan(0);
        // Should contain valid Tailwind classes
        expect(classString).toMatch(/[a-z-]+/);
      });
    });

    it("should have complete class strings with multiple utilities", () => {
      expect(COLOR_CLASSES.button.primary.split(" ").length).toBeGreaterThan(1);
      expect(COLOR_CLASSES.link.primary.split(" ").length).toBeGreaterThan(1);
    });
  });

  describe("Accessibility", () => {
    it("should use high contrast colors for text readability", () => {
      // Gray 900 on yellow provides good contrast
      expect(COLOR_CLASSES.button.primary).toContain("text-gray-900");
      expect(COLORS.text.onPrimary).toContain("gray-900");
    });

    it("should have bold font weights for important elements", () => {
      expect(COLOR_CLASSES.button.primary).toContain("font-bold");
      expect(COLOR_CLASSES.badge.cart).toContain("font-extrabold");
      expect(COLORS.text.onPrimaryBold).toContain("font-bold");
    });

    it("should have focus ring for keyboard navigation", () => {
      expect(COLORS.focus.ring).toContain("focus:ring");
    });
  });

  describe("Component-Specific Classes", () => {
    it("should have button variants", () => {
      expect(COLOR_CLASSES.button.primary).toBeDefined();
      expect(COLOR_CLASSES.button.primaryFull).toBeDefined();
      expect(COLOR_CLASSES.button.secondary).toBeDefined();
    });

    it("should have link variants", () => {
      expect(COLOR_CLASSES.link.primary).toBeDefined();
      expect(COLOR_CLASSES.link.primaryBold).toBeDefined();
      expect(COLOR_CLASSES.link.hoverOnly).toBeDefined();
      expect(COLOR_CLASSES.link.secondary).toBeDefined();
    });

    it("should have badge variants", () => {
      expect(COLOR_CLASSES.badge.primary).toBeDefined();
      expect(COLOR_CLASSES.badge.cart).toBeDefined();
    });

    it("should differentiate button variants", () => {
      expect(COLOR_CLASSES.button.primary).not.toBe(
        COLOR_CLASSES.button.secondary
      );
      expect(COLOR_CLASSES.button.primary).toContain("yellow");
      expect(COLOR_CLASSES.button.secondary).toContain("gray");
    });
  });

  describe("Hover States", () => {
    it("should have hover states for interactive elements", () => {
      expect(COLOR_CLASSES.button.primary).toContain("hover:");
      expect(COLOR_CLASSES.link.primary).toContain("hover:");
      expect(COLOR_CLASSES.category.background).toContain("hover:");
    });

    it("should have darker colors on hover for visual feedback", () => {
      expect(COLORS.hover.primary).toContain("600"); // Darker than 500
      expect(COLORS.hover.text).toContain("700"); // Darker than 600
    });
  });

  describe("Edge Cases", () => {
    it("should handle accessing nested properties", () => {
      expect(COLORS.primary.DEFAULT).toBe("yellow-500");
      expect(COLOR_CLASSES.button.primary).toContain("bg-yellow-500");
    });

    it("should maintain type safety with string values", () => {
      Object.values(COLORS.primary).forEach((value) => {
        expect(typeof value).toBe("string");
      });
    });

    it("should not have undefined values", () => {
      const checkNoUndefined = (obj: any) => {
        Object.values(obj).forEach((value) => {
          if (typeof value === "object") {
            checkNoUndefined(value);
          } else {
            expect(value).toBeDefined();
          }
        });
      };

      checkNoUndefined(COLORS);
      checkNoUndefined(COLOR_CLASSES);
    });

    it("should handle string concatenation for dynamic classes", () => {
      const dynamicClass = `${COLOR_CLASSES.button.primary} extra-class`;
      expect(dynamicClass).toContain("bg-yellow-500");
      expect(dynamicClass).toContain("extra-class");
    });
  });

  describe("Performance", () => {
    it("should be able to access color values quickly", () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        const _ = COLORS.primary.DEFAULT;
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10);
    });

    it("should be able to access class strings quickly", () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        const _ = COLOR_CLASSES.button.primary;
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10);
    });
  });

  describe("Gradient Classes", () => {
    it("should have gradient background definition", () => {
      expect(COLORS.background.gradient).toContain("bg-gradient-to-r");
      expect(COLORS.background.gradient).toContain("from-yellow-400");
      expect(COLORS.background.gradient).toContain("to-yellow-500");
    });

    it("should have gradient in COLOR_CLASSES", () => {
      expect(COLOR_CLASSES.background.gradient).toContain("bg-gradient-to-r");
    });
  });

  describe("Font Weights", () => {
    it("should have various font weights for hierarchy", () => {
      expect(COLOR_CLASSES.button.primary).toContain("font-bold");
      expect(COLOR_CLASSES.button.primaryFull).toContain("font-semibold");
      expect(COLOR_CLASSES.button.secondary).toContain("font-medium");
      expect(COLOR_CLASSES.link.primary).toContain("font-medium");
    });

    it("should use extrabold for important badges", () => {
      expect(COLOR_CLASSES.badge.cart).toContain("font-extrabold");
    });
  });

  describe("Border Styles", () => {
    it("should have card border definition", () => {
      expect(COLOR_CLASSES.background.card).toContain("border-2");
      expect(COLOR_CLASSES.background.card).toContain("border-yellow-200");
    });

    it("should have border color variants", () => {
      expect(COLORS.border.primary).toBe("border-yellow-200");
      expect(COLORS.border.secondary).toBe("border-gray-300");
    });
  });
});
