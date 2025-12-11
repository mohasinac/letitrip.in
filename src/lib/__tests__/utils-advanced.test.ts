/**
 * Advanced Unit Tests for Utility Functions
 * Testing edge cases, performance, and error handling
 *
 * @batch 12
 * @status NEW
 */

import { cn } from "../utils";

describe("Utils - cn() function (Tailwind class merger)", () => {
  describe("Basic Functionality", () => {
    it("should merge single class", () => {
      expect(cn("text-red-500")).toBe("text-red-500");
    });

    it("should merge multiple classes", () => {
      const result = cn("text-red-500", "bg-blue-500");
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
    });

    it("should handle empty strings", () => {
      expect(cn("", "text-red-500")).toBe("text-red-500");
    });

    it("should handle undefined values", () => {
      expect(cn(undefined, "text-red-500")).toBe("text-red-500");
    });

    it("should handle null values", () => {
      expect(cn(null, "text-red-500")).toBe("text-red-500");
    });

    it("should handle false boolean values", () => {
      expect(cn(false, "text-red-500")).toBe("text-red-500");
    });

    it("should handle arrays", () => {
      const result = cn(["text-red-500", "bg-blue-500"]);
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
    });
  });

  describe("Tailwind-specific Merging", () => {
    it("should merge conflicting Tailwind classes correctly (last wins)", () => {
      // twMerge should deduplicate and keep last value
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
      expect(result).not.toContain("text-red-500");
    });

    it("should merge padding classes", () => {
      const result = cn("p-4", "px-8");
      // px-8 should override p-4's horizontal padding
      expect(result).toContain("px-8");
    });

    it("should handle responsive classes", () => {
      const result = cn("text-sm", "md:text-lg", "lg:text-xl");
      expect(result).toContain("text-sm");
      expect(result).toContain("md:text-lg");
      expect(result).toContain("lg:text-xl");
    });

    it("should handle hover/focus variants", () => {
      const result = cn("hover:bg-blue-500", "focus:ring-2");
      expect(result).toContain("hover:bg-blue-500");
      expect(result).toContain("focus:ring-2");
    });

    it("should handle dark mode variants", () => {
      const result = cn("bg-white", "dark:bg-gray-800");
      expect(result).toContain("bg-white");
      expect(result).toContain("dark:bg-gray-800");
    });

    it("should merge complex responsive and state variants", () => {
      const result = cn(
        "bg-gray-100",
        "hover:bg-gray-200",
        "md:bg-gray-300",
        "md:hover:bg-gray-400"
      );
      expect(result).toContain("bg-gray-100");
      expect(result).toContain("hover:bg-gray-200");
      expect(result).toContain("md:bg-gray-300");
      expect(result).toContain("md:hover:bg-gray-400");
    });
  });

  describe("Conditional Classes", () => {
    it("should handle conditional classes with && operator", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toContain("base-class");
      expect(result).toContain("active-class");
    });

    it("should exclude false conditional classes", () => {
      const isActive = false;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toBe("base-class");
      expect(result).not.toContain("active-class");
    });

    it("should handle ternary conditionals", () => {
      const isError = true;
      const result = cn("base", isError ? "text-red-500" : "text-green-500");
      expect(result).toContain("text-red-500");
      expect(result).not.toContain("text-green-500");
    });

    it("should handle multiple conditionals", () => {
      const isActive = true;
      const isDisabled = false;
      const isError = true;
      const result = cn(
        "base",
        isActive && "active",
        isDisabled && "disabled",
        isError && "error"
      );
      expect(result).toContain("base");
      expect(result).toContain("active");
      expect(result).not.toContain("disabled");
      expect(result).toContain("error");
    });
  });

  describe("Object Syntax", () => {
    it("should handle object with boolean values", () => {
      const result = cn({
        "text-red-500": true,
        "bg-blue-500": false,
      });
      expect(result).toContain("text-red-500");
      expect(result).not.toContain("bg-blue-500");
    });

    it("should combine string and object syntax", () => {
      const result = cn("base-class", {
        active: true,
        disabled: false,
      });
      expect(result).toContain("base-class");
      expect(result).toContain("active");
      expect(result).not.toContain("disabled");
    });
  });

  describe("Edge Cases", () => {
    it("should handle whitespace strings", () => {
      expect(cn("   ", "text-red-500")).toBe("text-red-500");
    });

    it("should handle tabs and newlines", () => {
      expect(cn("\t\n", "text-red-500")).toBe("text-red-500");
    });

    it("should handle multiple spaces between classes", () => {
      expect(cn("text-red-500    bg-blue-500")).toContain("text-red-500");
    });

    it("should handle very long class strings", () => {
      const longClass =
        "text-red-500 bg-blue-500 p-4 m-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105";
      const result = cn(longClass);
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle empty array", () => {
      expect(cn([])).toBe("");
    });

    it("should handle nested arrays", () => {
      const result = cn(["text-red-500", ["bg-blue-500", "p-4"]]);
      expect(result).toContain("text-red-500");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("p-4");
    });

    it("should handle special characters in custom class names", () => {
      // Custom Tailwind classes might have special chars
      const result = cn("custom-class_with-special.chars:test");
      expect(result).toBeTruthy();
    });
  });

  describe("Performance & Type Safety", () => {
    it("should handle 100+ classes efficiently", () => {
      const classes = Array.from({ length: 100 }, (_, i) => `class-${i}`);
      const start = Date.now();
      const result = cn(...classes);
      const duration = Date.now() - start;

      expect(result).toBeTruthy();
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });

    it("should handle mixed types", () => {
      const result = cn(
        "base",
        undefined,
        null,
        false,
        0,
        "",
        "active",
        ["nested"],
        { conditional: true }
      );
      expect(result).toContain("base");
      expect(result).toContain("active");
      expect(result).toContain("nested");
      expect(result).toContain("conditional");
    });

    it("should not throw on invalid inputs", () => {
      expect(() => cn(123 as any)).not.toThrow();
      expect(() => cn(Symbol("test") as any)).not.toThrow();
      expect(() => cn(new Date() as any)).not.toThrow();
    });
  });

  describe("Real-world Component Usage", () => {
    it("should handle button variant classes", () => {
      const variant = "primary";
      const size = "lg";
      const result = cn(
        "btn-base rounded-lg transition-colors",
        {
          "bg-blue-500 text-white hover:bg-blue-600": variant === "primary",
          "bg-gray-200 text-gray-800 hover:bg-gray-300":
            variant === "secondary",
        },
        {
          "px-4 py-2 text-sm": size === "sm",
          "px-6 py-3 text-base": size === "md",
          "px-8 py-4 text-lg": size === "lg",
        }
      );

      expect(result).toContain("btn-base");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("px-8");
      expect(result).toContain("py-4");
      expect(result).toContain("text-lg");
    });

    it("should handle card component classes", () => {
      const isHoverable = true;
      const isDark = false;
      const result = cn(
        "rounded-lg border",
        "transition-shadow duration-200",
        isHoverable && "hover:shadow-lg cursor-pointer",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      );

      expect(result).toContain("rounded-lg");
      expect(result).toContain("hover:shadow-lg");
      expect(result).toContain("bg-white");
      expect(result).not.toContain("bg-gray-800");
    });

    it("should handle input field states", () => {
      const hasError = true;
      const isDisabled = false;
      const result = cn(
        "w-full px-3 py-2 border rounded-md",
        "focus:outline-none focus:ring-2",
        {
          "border-red-500 focus:ring-red-500": hasError,
          "border-gray-300 focus:ring-blue-500": !hasError,
        },
        isDisabled && "opacity-50 cursor-not-allowed bg-gray-100"
      );

      expect(result).toContain("border-red-500");
      expect(result).toContain("focus:ring-red-500");
      expect(result).not.toContain("opacity-50");
    });
  });

  describe("Deduplication", () => {
    it("should deduplicate exact same classes", () => {
      const result = cn("text-red-500", "text-red-500", "text-red-500");
      // Count occurrences
      const matches = result.match(/text-red-500/g);
      expect(matches?.length).toBe(1);
    });

    it("should keep last value for conflicting Tailwind utilities", () => {
      const result = cn("text-xs", "text-sm", "text-base", "text-lg");
      expect(result).toBe("text-lg");
      expect(result).not.toContain("text-xs");
      expect(result).not.toContain("text-sm");
      expect(result).not.toContain("text-base");
    });

    it("should handle conflicting margin classes", () => {
      const result = cn("m-4", "mx-8", "ml-12");
      // ml-12 should win for left margin, mx-8 for right margin
      expect(result).toContain("ml-12");
    });
  });
});
