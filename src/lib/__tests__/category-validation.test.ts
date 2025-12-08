import { parseCategoryPath } from "../validation/category";

describe("Category Validation Utils", () => {
  describe("parseCategoryPath", () => {
    it("should parse simple path", () => {
      expect(parseCategoryPath("electronics/phones")).toEqual([
        "electronics",
        "phones",
      ]);
    });

    it("should parse path with multiple segments", () => {
      expect(parseCategoryPath("electronics/phones/smartphones")).toEqual([
        "electronics",
        "phones",
        "smartphones",
      ]);
    });

    it("should handle leading slash", () => {
      expect(parseCategoryPath("/electronics/phones")).toEqual([
        "electronics",
        "phones",
      ]);
    });

    it("should handle trailing slash", () => {
      expect(parseCategoryPath("electronics/phones/")).toEqual([
        "electronics",
        "phones",
      ]);
    });

    it("should handle both leading and trailing slashes", () => {
      expect(parseCategoryPath("/electronics/phones/")).toEqual([
        "electronics",
        "phones",
      ]);
    });

    it("should filter empty segments", () => {
      expect(parseCategoryPath("electronics//phones")).toEqual([
        "electronics",
        "phones",
      ]);
    });

    it("should handle empty string", () => {
      expect(parseCategoryPath("")).toEqual([]);
    });

    it("should handle single slash", () => {
      expect(parseCategoryPath("/")).toEqual([]);
    });

    it("should handle multiple slashes", () => {
      expect(parseCategoryPath("///")).toEqual([]);
    });

    it("should handle single segment", () => {
      expect(parseCategoryPath("electronics")).toEqual(["electronics"]);
    });

    it("should preserve segment names", () => {
      expect(parseCategoryPath("mobile-phones/smartphones")).toEqual([
        "mobile-phones",
        "smartphones",
      ]);
    });

    it("should handle paths with numbers", () => {
      expect(parseCategoryPath("category1/subcategory2")).toEqual([
        "category1",
        "subcategory2",
      ]);
    });

    it("should handle paths with special characters", () => {
      expect(parseCategoryPath("electronics/phones-&-tablets")).toEqual([
        "electronics",
        "phones-&-tablets",
      ]);
    });
  });
});
