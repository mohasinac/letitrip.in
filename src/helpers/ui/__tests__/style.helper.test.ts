/**
 * Style Helper Tests
 *
 * Tests for dynamic styling and CSS class management functions
 */

import {
  classNames,
  cn,
  mergeTailwindClasses,
  responsive,
  variant,
  toggleClass,
  sizeClass,
} from "../style.helper";

describe("classNames", () => {
  test("should join string classes", () => {
    expect(classNames("class1", "class2", "class3")).toBe(
      "class1 class2 class3",
    );
  });

  test("should filter out falsy values", () => {
    expect(
      classNames("class1", false, "class2", null, "class3", undefined),
    ).toBe("class1 class2 class3");
  });

  test("should handle empty input", () => {
    expect(classNames()).toBe("");
  });

  test("should handle all falsy values", () => {
    expect(classNames(false, null, undefined)).toBe("");
  });

  test("should handle conditional classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      classNames("btn", isActive && "active", isDisabled && "disabled"),
    ).toBe("btn active");
  });

  test("should handle single class", () => {
    expect(classNames("single")).toBe("single");
  });

  test("should handle boolean conditions", () => {
    expect(classNames(true && "show", false && "hide")).toBe("show");
  });
});

describe("cn", () => {
  test("should be an alias for classNames", () => {
    expect(cn).toBe(classNames);
  });

  test("should work exactly like classNames", () => {
    expect(cn("class1", false, "class2")).toBe("class1 class2");
  });
});

describe("mergeTailwindClasses", () => {
  test("should merge classes", () => {
    expect(mergeTailwindClasses("class1", "class2")).toBe("class1 class2");
  });

  test("should remove duplicate classes", () => {
    expect(mergeTailwindClasses("class1 class2", "class2 class3")).toBe(
      "class1 class2 class3",
    );
  });

  test("should filter out null and undefined", () => {
    expect(mergeTailwindClasses("class1", null, "class2", undefined)).toBe(
      "class1 class2",
    );
  });

  test("should handle empty input", () => {
    expect(mergeTailwindClasses()).toBe("");
  });

  test("should handle single class", () => {
    expect(mergeTailwindClasses("single")).toBe("single");
  });

  test("should handle multiple spaces", () => {
    const result = mergeTailwindClasses("class1  class2", "class3   class4");
    // Should contain all classes (exact spacing may vary)
    expect(result).toContain("class1");
    expect(result).toContain("class2");
    expect(result).toContain("class3");
    expect(result).toContain("class4");
  });

  test("should preserve class order", () => {
    const result = mergeTailwindClasses("z-10", "bg-red-500", "text-white");
    expect(result).toBe("z-10 bg-red-500 text-white");
  });

  test("should handle duplicate classes in same string", () => {
    expect(mergeTailwindClasses("class1 class1 class2")).toBe("class1 class2");
  });

  test("should handle complex Tailwind utilities", () => {
    const result = mergeTailwindClasses(
      "px-4 py-2 bg-blue-500",
      "hover:bg-blue-600 focus:ring-2",
    );
    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
    expect(result).toContain("bg-blue-500");
    expect(result).toContain("hover:bg-blue-600");
    expect(result).toContain("focus:ring-2");
  });
});

describe("responsive", () => {
  test("should generate responsive classes", () => {
    const result = responsive("text-base", {
      sm: "text-sm",
      md: "text-md",
      lg: "text-lg",
    });
    expect(result).toBe("text-base sm:text-sm md:text-md lg:text-lg");
  });

  test("should handle missing breakpoints", () => {
    const result = responsive("text-base", {
      md: "text-md",
    });
    expect(result).toBe("text-base md:text-md");
  });

  test("should handle empty breakpoints", () => {
    const result = responsive("text-base", {});
    expect(result).toBe("text-base");
  });

  test("should handle all breakpoints", () => {
    const result = responsive("p-0", {
      sm: "p-1",
      md: "p-2",
      lg: "p-3",
      xl: "p-4",
      "2xl": "p-5",
    });
    expect(result).toBe("p-0 sm:p-1 md:p-2 lg:p-3 xl:p-4 2xl:p-5");
  });

  test("should skip undefined values", () => {
    const result = responsive("flex", {
      sm: "flex-col",
      md: undefined,
      lg: "flex-row",
    });
    expect(result).toBe("flex sm:flex-col lg:flex-row");
  });

  test("should handle base class only", () => {
    const result = responsive("w-full", {});
    expect(result).toBe("w-full");
  });
});

describe("variant", () => {
  test("should apply correct variant class", () => {
    const variants = {
      primary: "bg-blue-500",
      secondary: "bg-gray-500",
      danger: "bg-red-500",
    };
    expect(variant("btn", "color", "primary", variants)).toBe(
      "btn bg-blue-500",
    );
  });

  test("should handle different variant values", () => {
    const variants = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    };
    expect(variant("text", "size", "lg", variants)).toBe("text text-lg");
  });

  test("should work with single base class", () => {
    const variants = {
      solid: "border-0",
      outline: "border-2",
    };
    expect(variant("border", "style", "outline", variants)).toBe(
      "border border-2",
    );
  });

  test("should handle numeric-like variant keys", () => {
    const variants = {
      "1": "opacity-100",
      "2": "opacity-50",
      "3": "opacity-25",
    };
    expect(variant("opacity", "level", "2", variants)).toBe(
      "opacity opacity-50",
    );
  });
});

describe("toggleClass", () => {
  test("should return true class when condition is true", () => {
    expect(toggleClass(true, "active", "inactive")).toBe("active");
  });

  test("should return false class when condition is false", () => {
    expect(toggleClass(false, "active", "inactive")).toBe("inactive");
  });

  test("should return empty string when condition is false and no false class", () => {
    expect(toggleClass(false, "active")).toBe("");
  });

  test("should handle truthy condition", () => {
    expect(toggleClass(!!1, "show", "hide")).toBe("show");
  });

  test("should handle falsy condition", () => {
    expect(toggleClass(!!0, "show", "hide")).toBe("hide");
  });

  test("should work without false class", () => {
    expect(toggleClass(true, "visible")).toBe("visible");
    expect(toggleClass(false, "visible")).toBe("");
  });

  test("should handle complex class names", () => {
    expect(
      toggleClass(true, "bg-green-500 text-white", "bg-gray-500 text-black"),
    ).toBe("bg-green-500 text-white");
  });
});

describe("sizeClass", () => {
  test("should return correct size class", () => {
    const sizeMap = {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    };
    expect(sizeClass("lg", sizeMap)).toBe("text-lg");
  });

  test("should return md as default for unmapped size", () => {
    const sizeMap = {
      md: "text-base",
      lg: "text-lg",
    };
    expect(sizeClass("xs", sizeMap)).toBe("text-base");
  });

  test("should handle all standard sizes", () => {
    const sizeMap = {
      xs: "p-1",
      sm: "p-2",
      md: "p-3",
      lg: "p-4",
      xl: "p-5",
    };
    expect(sizeClass("xs", sizeMap)).toBe("p-1");
    expect(sizeClass("sm", sizeMap)).toBe("p-2");
    expect(sizeClass("md", sizeMap)).toBe("p-3");
    expect(sizeClass("lg", sizeMap)).toBe("p-4");
    expect(sizeClass("xl", sizeMap)).toBe("p-5");
  });

  test("should fallback to md when size not in map", () => {
    const sizeMap = {
      md: "w-32",
      lg: "w-64",
    };
    expect(sizeClass("xl", sizeMap)).toBe("w-32");
  });

  test("should handle button size variants", () => {
    const buttonSizes = {
      xs: "h-6 px-2 text-xs",
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
      xl: "h-14 px-8 text-xl",
    };
    expect(sizeClass("sm", buttonSizes)).toBe("h-8 px-3 text-sm");
  });

  test("should handle icon size variants", () => {
    const iconSizes = {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
      xl: "w-8 h-8",
    };
    expect(sizeClass("md", iconSizes)).toBe("w-5 h-5");
  });
});
