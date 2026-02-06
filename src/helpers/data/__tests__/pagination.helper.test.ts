/**
 * @jest-environment jsdom
 */

import {
  calculatePagination,
  generatePageNumbers,
  type PaginationOptions,
  type PaginationResult,
} from "../pagination.helper";

describe("Pagination Helper", () => {
  describe("calculatePagination", () => {
    it("should calculate pagination for first page", () => {
      const options: PaginationOptions = {
        page: 1,
        perPage: 10,
        total: 100,
      };
      const result = calculatePagination(options);

      expect(result).toEqual({
        currentPage: 1,
        perPage: 10,
        total: 100,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false,
        nextPage: 2,
        prevPage: null,
        startIndex: 0,
        endIndex: 10,
      });
    });

    it("should calculate pagination for middle page", () => {
      const options: PaginationOptions = {
        page: 5,
        perPage: 10,
        total: 100,
      };
      const result = calculatePagination(options);

      expect(result.currentPage).toBe(5);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(true);
      expect(result.nextPage).toBe(6);
      expect(result.prevPage).toBe(4);
      expect(result.startIndex).toBe(40);
      expect(result.endIndex).toBe(50);
    });

    it("should calculate pagination for last page", () => {
      const options: PaginationOptions = {
        page: 10,
        perPage: 10,
        total: 100,
      };
      const result = calculatePagination(options);

      expect(result.currentPage).toBe(10);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(true);
      expect(result.nextPage).toBe(null);
      expect(result.prevPage).toBe(9);
      expect(result.startIndex).toBe(90);
      expect(result.endIndex).toBe(100);
    });

    it("should handle partial last page", () => {
      const options: PaginationOptions = {
        page: 3,
        perPage: 10,
        total: 25,
      };
      const result = calculatePagination(options);

      expect(result.totalPages).toBe(3);
      expect(result.endIndex).toBe(25);
      expect(result.hasNextPage).toBe(false);
    });

    it("should handle page beyond total pages", () => {
      const options: PaginationOptions = {
        page: 20,
        perPage: 10,
        total: 100,
      };
      const result = calculatePagination(options);

      // Should clamp to last page
      expect(result.currentPage).toBe(10);
      expect(result.hasNextPage).toBe(false);
    });

    it("should handle page less than 1", () => {
      const options: PaginationOptions = {
        page: 0,
        perPage: 10,
        total: 100,
      };
      const result = calculatePagination(options);

      // Should clamp to first page
      expect(result.currentPage).toBe(1);
      expect(result.hasPrevPage).toBe(false);
    });

    it("should handle negative page", () => {
      const options: PaginationOptions = {
        page: -5,
        perPage: 10,
        total: 100,
      };
      const result = calculatePagination(options);

      expect(result.currentPage).toBe(1);
    });

    it("should handle empty dataset", () => {
      const options: PaginationOptions = {
        page: 1,
        perPage: 10,
        total: 0,
      };
      const result = calculatePagination(options);

      expect(result.totalPages).toBe(0);
      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBe(0);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(false);
    });

    it("should handle single item", () => {
      const options: PaginationOptions = {
        page: 1,
        perPage: 10,
        total: 1,
      };
      const result = calculatePagination(options);

      expect(result.totalPages).toBe(1);
      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBe(1);
    });

    it("should handle different perPage values", () => {
      const options: PaginationOptions = {
        page: 2,
        perPage: 25,
        total: 100,
      };
      const result = calculatePagination(options);

      expect(result.totalPages).toBe(4);
      expect(result.startIndex).toBe(25);
      expect(result.endIndex).toBe(50);
    });
  });

  describe("generatePageNumbers", () => {
    it("should show all pages when total <= maxVisible", () => {
      const pages = generatePageNumbers(3, 5, 7);
      expect(pages).toEqual([1, 2, 3, 4, 5]);
    });

    it("should show ellipsis in middle for large page count", () => {
      const pages = generatePageNumbers(5, 20, 7);
      expect(pages).toContain("...");
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(20);
    });

    it("should handle first page", () => {
      const pages = generatePageNumbers(1, 20, 7);
      expect(pages[0]).toBe(1);
      expect(pages).toContain(2);
      expect(pages).toContain("...");
      expect(pages[pages.length - 1]).toBe(20);
    });

    it("should handle last page", () => {
      const pages = generatePageNumbers(20, 20, 7);
      expect(pages[0]).toBe(1);
      expect(pages).toContain("...");
      expect(pages[pages.length - 1]).toBe(20);
    });

    it("should show consecutive pages in middle", () => {
      const pages = generatePageNumbers(10, 20, 7);
      expect(pages).toContain(10);
      expect(pages).toContain(9);
      expect(pages).toContain(11);
    });

    it("should handle edge case with 2 pages", () => {
      const pages = generatePageNumbers(1, 2, 7);
      expect(pages).toEqual([1, 2]);
    });

    it("should handle single page", () => {
      const pages = generatePageNumbers(1, 1, 7);
      expect(pages).toEqual([1]);
    });

    it("should use default maxVisible", () => {
      const pages = generatePageNumbers(1, 20);
      expect(pages.length).toBeLessThanOrEqual(9); // 7 numbers + 2 ellipsis max
    });

    it("should not show ellipsis when unnecessary", () => {
      const pages = generatePageNumbers(1, 7, 7);
      expect(pages).not.toContain("...");
      expect(pages).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("should handle maxVisible of 3", () => {
      const pages = generatePageNumbers(5, 10, 3);
      expect(pages.length).toBeGreaterThan(0);
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(10);
      expect(pages).toContain("...");
    });

    it("should show proper range near beginning", () => {
      const pages = generatePageNumbers(2, 20, 7);
      expect(pages[0]).toBe(1);
      expect(pages[1]).toBe(2);
      expect(pages[pages.length - 1]).toBe(20);
    });

    it("should show proper range near end", () => {
      const pages = generatePageNumbers(19, 20, 7);
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 2]).toBe(19);
      expect(pages[pages.length - 1]).toBe(20);
    });
  });
});
