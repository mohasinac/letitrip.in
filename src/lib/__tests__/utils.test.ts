import { cn } from "../utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("handles conditional classes", () => {
    expect(cn("base-class", false && "hidden", "visible")).toBe(
      "base-class visible"
    );
  });

  it("overrides conflicting Tailwind classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles arrays of classes", () => {
    expect(cn(["text-red-500", "bg-blue-500"])).toBe(
      "text-red-500 bg-blue-500"
    );
  });

  it("handles objects with boolean values", () => {
    expect(
      cn({
        "text-red-500": true,
        "bg-blue-500": false,
        "p-4": true,
      })
    ).toBe("text-red-500 p-4");
  });

  it("handles undefined and null", () => {
    expect(cn("text-red-500", undefined, null, "bg-blue-500")).toBe(
      "text-red-500 bg-blue-500"
    );
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("deduplicates classes", () => {
    expect(cn("p-4", "p-4", "m-2")).toBe("p-4 m-2");
  });
});
