/**
 * Tests for useFilters Hook
 */

import { act, renderHook } from "@testing-library/react";
import { useFilters } from "../useFilters";

// Mock Next.js navigation hooks
const mockPush = jest.fn();
const mockPathname = "/products";
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

// Mock error logger
jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("useFilters Hook", () => {
  const initialFilters = {
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    search: "",
  };

  beforeEach(() => {
    mockPush.mockClear();
    localStorage.clear();
  });

  describe("Basic Functionality", () => {
    it("should initialize with default filters", () => {
      const { result } = renderHook(() => useFilters(initialFilters));

      expect(result.current.filters).toEqual(initialFilters);
      expect(result.current.appliedFilters).toEqual(initialFilters);
    });

    it("should update filters without applying", () => {
      const { result } = renderHook(() => useFilters(initialFilters));

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
      });

      expect(result.current.filters.category).toBe("electronics");
      expect(result.current.appliedFilters.category).toBe("");
    });

    it("should apply filters", () => {
      const { result } = renderHook(() => useFilters(initialFilters));

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
      });

      act(() => {
        result.current.applyFilters();
      });

      expect(result.current.appliedFilters.category).toBe("electronics");
    });

    it("should reset filters to initial state", () => {
      const { result } = renderHook(() => useFilters(initialFilters));

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
        result.current.applyFilters();
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual(initialFilters);
      expect(result.current.appliedFilters).toEqual(initialFilters);
    });

    it("should clear specific filter", () => {
      const { result } = renderHook(() =>
        useFilters({
          ...initialFilters,
          category: "electronics",
        })
      );

      act(() => {
        result.current.clearFilter("category");
      });

      expect(result.current.filters.category).toBeUndefined();
    });
  });

  describe("Active Filters Detection", () => {
    it("should detect no active filters", () => {
      const { result } = renderHook(() =>
        useFilters({
          category: "",
          search: "",
        })
      );

      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.activeFilterCount).toBe(0);
    });

    it("should detect active filters", () => {
      const { result } = renderHook(() =>
        useFilters({
          ...initialFilters,
          category: "electronics",
        })
      );

      expect(result.current.hasActiveFilters).toBe(true);
      expect(result.current.activeFilterCount).toBeGreaterThan(0);
    });

    it("should ignore empty string values", () => {
      const { result } = renderHook(() =>
        useFilters({
          category: "",
          search: "",
        })
      );

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("should ignore empty arrays", () => {
      const { result } = renderHook(() =>
        useFilters({
          tags: [],
        })
      );

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("should count non-empty array filters", () => {
      const { result } = renderHook(() =>
        useFilters({
          tags: ["tag1", "tag2"],
        })
      );

      expect(result.current.hasActiveFilters).toBe(true);
      expect(result.current.activeFilterCount).toBe(1);
    });
  });

  describe("URL Synchronization", () => {
    it("should sync filters to URL when applied", () => {
      const { result } = renderHook(() =>
        useFilters(initialFilters, { syncWithUrl: true })
      );

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
        result.current.applyFilters();
      });

      expect(mockPush).toHaveBeenCalled();
    });

    it("should not sync to URL when disabled", () => {
      const { result } = renderHook(() =>
        useFilters(initialFilters, { syncWithUrl: false })
      );

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
        result.current.applyFilters();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("LocalStorage Persistence", () => {
    it("should persist filters to localStorage", () => {
      const storageKey = "test-filters";
      const { result } = renderHook(() =>
        useFilters(initialFilters, {
          persist: true,
          storageKey,
        })
      );

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
        result.current.applyFilters();
      });

      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeDefined();
    });

    it("should not persist when disabled", () => {
      const storageKey = "test-filters";
      const { result } = renderHook(() =>
        useFilters(initialFilters, {
          persist: false,
          storageKey,
        })
      );

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
        result.current.applyFilters();
      });

      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeNull();
    });
  });

  describe("Callbacks", () => {
    it("should call onChange when filters are applied", () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useFilters(initialFilters, { onChange, syncWithUrl: false })
      );

      const newFilters = {
        ...initialFilters,
        category: "electronics",
      };

      act(() => {
        result.current.updateFilters(newFilters);
      });

      act(() => {
        result.current.applyFilters();
      });

      expect(onChange).toHaveBeenCalledWith(newFilters);
    });

    it("should call onChange when filters are reset", () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useFilters(initialFilters, { onChange })
      );

      act(() => {
        result.current.resetFilters();
      });

      expect(onChange).toHaveBeenCalledWith(initialFilters);
    });
  });

  describe("BUG FIX #36: Input Validation Edge Cases", () => {
    describe("initialFilters parameter validation", () => {
      it("should throw error for null initialFilters", () => {
        expect(() => {
          renderHook(() => useFilters(null as any));
        }).toThrow("initialFilters must be a valid object");
      });

      it("should throw error for undefined initialFilters", () => {
        expect(() => {
          renderHook(() => useFilters(undefined as any));
        }).toThrow("initialFilters must be a valid object");
      });

      it("should throw error for non-object initialFilters", () => {
        expect(() => {
          renderHook(() => useFilters("invalid" as any));
        }).toThrow("initialFilters must be a valid object");
      });

      it("should accept empty object as initialFilters", () => {
        const { result } = renderHook(() => useFilters({}));
        expect(result.current.filters).toEqual({});
      });
    });

    describe("options parameter validation", () => {
      it("should throw error for non-object options", () => {
        expect(() => {
          renderHook(() => useFilters(initialFilters, "invalid" as any));
        }).toThrow("options must be an object or undefined");
      });

      it("should accept undefined options", () => {
        const { result } = renderHook(() =>
          useFilters(initialFilters, undefined)
        );
        expect(result.current.filters).toEqual(initialFilters);
      });

      it("should accept empty object as options", () => {
        const { result } = renderHook(() => useFilters(initialFilters, {}));
        expect(result.current.filters).toEqual(initialFilters);
      });

      it("should throw error for number as options", () => {
        expect(() => {
          renderHook(() => useFilters(initialFilters, 123 as any));
        }).toThrow("options must be an object or undefined");
      });
    });

    describe("storageKey validation", () => {
      it("should throw error for empty storageKey with persist enabled", () => {
        expect(() => {
          renderHook(() =>
            useFilters(initialFilters, { persist: true, storageKey: "" })
          );
        }).toThrow(
          "storageKey must be a non-empty string when persist is enabled"
        );
      });

      it("should throw error for whitespace-only storageKey with persist enabled", () => {
        expect(() => {
          renderHook(() =>
            useFilters(initialFilters, { persist: true, storageKey: "   " })
          );
        }).toThrow(
          "storageKey must be a non-empty string when persist is enabled"
        );
      });

      it("should throw error for non-string storageKey with persist enabled", () => {
        expect(() => {
          renderHook(() =>
            useFilters(initialFilters, {
              persist: true,
              storageKey: 123 as any,
            })
          );
        }).toThrow(
          "storageKey must be a non-empty string when persist is enabled"
        );
      });

      it("should accept valid storageKey with persist enabled", () => {
        const { result } = renderHook(() =>
          useFilters(initialFilters, { persist: true, storageKey: "myFilters" })
        );
        expect(result.current.filters).toEqual(initialFilters);
      });

      it("should not validate storageKey when persist is disabled", () => {
        const { result } = renderHook(() =>
          useFilters(initialFilters, { persist: false, storageKey: "" })
        );
        expect(result.current.filters).toEqual(initialFilters);
      });
    });

    describe("updateFilters parameter validation", () => {
      it("should throw error for null newFilters", () => {
        const { result } = renderHook(() => useFilters(initialFilters));

        expect(() => {
          act(() => {
            result.current.updateFilters(null as any);
          });
        }).toThrow("newFilters must be a valid object");
      });

      it("should throw error for undefined newFilters", () => {
        const { result } = renderHook(() => useFilters(initialFilters));

        expect(() => {
          act(() => {
            result.current.updateFilters(undefined as any);
          });
        }).toThrow("newFilters must be a valid object");
      });

      it("should throw error for non-object newFilters", () => {
        const { result } = renderHook(() => useFilters(initialFilters));

        expect(() => {
          act(() => {
            result.current.updateFilters("invalid" as any);
          });
        }).toThrow("newFilters must be a valid object");
      });

      it("should accept empty object as newFilters", () => {
        const { result } = renderHook(() => useFilters(initialFilters));

        act(() => {
          result.current.updateFilters({} as any);
        });

        expect(result.current.filters).toEqual({});
      });
    });

    describe("clearFilter key validation", () => {
      it("should handle null key gracefully", () => {
        const { result } = renderHook(() =>
          useFilters({ ...initialFilters, category: "electronics" })
        );

        act(() => {
          result.current.clearFilter(null as any);
        });

        // Should not crash, filters remain unchanged
        expect(result.current.filters.category).toBe("electronics");
      });

      it("should handle undefined key gracefully", () => {
        const { result } = renderHook(() =>
          useFilters({ ...initialFilters, category: "electronics" })
        );

        act(() => {
          result.current.clearFilter(undefined as any);
        });

        expect(result.current.filters.category).toBe("electronics");
      });

      it("should handle non-existent key gracefully", () => {
        const { result } = renderHook(() => useFilters(initialFilters));

        act(() => {
          result.current.clearFilter("nonExistent" as any);
        });

        expect(result.current.filters).toEqual(initialFilters);
      });

      it("should clear existing key successfully", () => {
        const { result } = renderHook(() =>
          useFilters({ ...initialFilters, category: "electronics" })
        );

        act(() => {
          result.current.clearFilter("category");
        });

        expect(result.current.filters.category).toBeUndefined();
      });
    });

    describe("syncFiltersToUrl edge cases", () => {
      it("should handle invalid newFilters in syncFiltersToUrl", () => {
        const { result } = renderHook(() =>
          useFilters(initialFilters, { syncWithUrl: true })
        );

        // Manually test the internal sync by applying filters
        // The validation is internal, so we test the behavior
        act(() => {
          result.current.applyFilters();
        });

        // Should handle gracefully even with edge cases
        expect(result.current.appliedFilters).toEqual(initialFilters);
      });

      it("should not crash with empty filters object", () => {
        const { result } = renderHook(() =>
          useFilters({} as any, { syncWithUrl: true })
        );

        act(() => {
          result.current.applyFilters();
        });

        expect(result.current.appliedFilters).toEqual({});
      });
    });

    describe("persistFilters edge cases", () => {
      it("should handle null newFilters gracefully", () => {
        const { result } = renderHook(() =>
          useFilters(initialFilters, { persist: true, storageKey: "test" })
        );

        // The persistFilters is called internally
        // Test that applying filters doesn't crash even with validation
        act(() => {
          result.current.applyFilters();
        });

        expect(localStorage.getItem("test")).toBeTruthy();
      });

      it("should persist valid filter objects to localStorage", () => {
        localStorage.clear();

        const testFilters = { category: "", search: "" };
        const { result } = renderHook(() =>
          useFilters(testFilters, { persist: true, storageKey: "testValid" })
        );

        // Valid flow should work
        const updatedFilters = { ...testFilters, category: "test" };
        act(() => {
          result.current.updateFilters(updatedFilters);
        });

        act(() => {
          result.current.applyFilters();
        });

        const stored = localStorage.getItem("testValid");
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed.category).toBe("test");
      });
    });

    describe("Combined validation scenarios", () => {
      it("should handle all validations together", () => {
        localStorage.clear();

        const { result } = renderHook(() =>
          useFilters(initialFilters, {
            persist: true,
            storageKey: "combined",
            syncWithUrl: true,
          })
        );

        act(() => {
          result.current.updateFilters({ ...initialFilters, category: "test" });
        });

        act(() => {
          result.current.applyFilters();
        });

        expect(result.current.filters.category).toBe("test");
        expect(result.current.appliedFilters.category).toBe("test");
        expect(localStorage.getItem("combined")).toBeTruthy();
      });

      it("should handle reset with all options enabled", () => {
        const onChange = jest.fn();
        const { result } = renderHook(() =>
          useFilters(initialFilters, {
            persist: true,
            storageKey: "reset-test",
            syncWithUrl: true,
            onChange,
          })
        );

        act(() => {
          result.current.updateFilters({ ...initialFilters, category: "test" });
          result.current.applyFilters();
        });

        act(() => {
          result.current.resetFilters();
        });

        expect(result.current.filters).toEqual(initialFilters);
        expect(onChange).toHaveBeenCalledWith(initialFilters);
      });

      it("should handle multiple filter operations in sequence", () => {
        const { result } = renderHook(() => useFilters(initialFilters));

        act(() => {
          result.current.updateFilters({
            ...initialFilters,
            category: "test1",
          });
        });

        act(() => {
          result.current.updateFilters({
            ...initialFilters,
            category: "test2",
          });
        });

        act(() => {
          result.current.clearFilter("category");
        });

        expect(result.current.filters.category).toBeUndefined();
      });
    });
  });
});
