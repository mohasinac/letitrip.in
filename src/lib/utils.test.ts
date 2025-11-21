/**
 * Tests for utils.ts
 * Testing utility functions
 */

import { describe, it, expect } from "@jest/globals";
import { cn } from "./utils";

describe("cn", () => {
  it("should merge Tailwind classes correctly", () => {
    const result = cn("bg-red-500", "text-white", "p-4");
    expect(result).toBe("bg-red-500 text-white p-4");
  });

  it("should handle clsx inputs", () => {
    const result = cn("bg-red-500", false && "hidden", "text-white");
    expect(result).toBe("bg-red-500 text-white");
  });

  it("should merge conflicting classes with tailwind-merge", () => {
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });

  it("should handle empty inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle undefined and null values", () => {
    const result = cn("bg-red-500", undefined, null, "text-white");
    expect(result).toBe("bg-red-500 text-white");
  });

  it("should handle array inputs", () => {
    const result = cn(["bg-red-500", "text-white"], "p-4");
    expect(result).toBe("bg-red-500 text-white p-4");
  });
});
