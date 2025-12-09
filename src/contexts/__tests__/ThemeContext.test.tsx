/**
 * Unit Tests for ThemeContext
 *
 * Tests theme switching, localStorage persistence,
 * document class manipulation, and meta theme-color updates
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { ThemeProvider, useTheme } from "../ThemeContext";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock document
const mockClassList = {
  add: jest.fn(),
  remove: jest.fn(),
  contains: jest.fn(),
};

const mockSetAttribute = jest.fn();
const mockMetaElement = {
  setAttribute: jest.fn(),
};

Object.defineProperty(document, "documentElement", {
  value: {
    classList: mockClassList,
    setAttribute: mockSetAttribute,
  },
  writable: true,
});

Object.defineProperty(document, "querySelector", {
  value: jest.fn((selector: string) => {
    if (selector === 'meta[name="theme-color"]') {
      return mockMetaElement;
    }
    return null;
  }),
  writable: true,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe("ThemeContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();
    mockSetAttribute.mockClear();
    mockMetaElement.setAttribute.mockClear();
  });

  describe("Initialization", () => {
    it("should initialize with dark theme by default", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toBe("dark");
    });

    it("should load theme from localStorage", async () => {
      localStorageMock.setItem("jfv-theme", "light");

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toBe("light");
    });

    it("should use custom default theme", async () => {
      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), {
        wrapper: customWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toBe("light");
    });

    it("should apply theme to document on init", async () => {
      localStorageMock.setItem("jfv-theme", "light");

      renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(mockClassList.add).toHaveBeenCalledWith("light");
      });

      expect(mockSetAttribute).toHaveBeenCalledWith("data-theme", "light");
    });

    it("should throw error when used outside provider", () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow("useTheme must be used within a ThemeProvider");

      consoleError.mockRestore();
    });
  });

  describe("Setting Theme", () => {
    it("should change theme from dark to light", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setTheme("light");
      });

      expect(result.current.theme).toBe("light");
    });

    it("should save theme to localStorage", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      localStorageMock.setItem.mockClear();

      act(() => {
        result.current.setTheme("light");
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "jfv-theme",
        "light"
      );
    });

    it("should apply theme classes to document", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockClassList.add.mockClear();
      mockClassList.remove.mockClear();

      act(() => {
        result.current.setTheme("light");
      });

      expect(mockClassList.remove).toHaveBeenCalledWith("light", "dark");
      expect(mockClassList.add).toHaveBeenCalledWith("light");
    });

    it("should update data-theme attribute", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockSetAttribute.mockClear();

      act(() => {
        result.current.setTheme("light");
      });

      expect(mockSetAttribute).toHaveBeenCalledWith("data-theme", "light");
    });

    it("should update meta theme-color for light theme", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockMetaElement.setAttribute.mockClear();

      act(() => {
        result.current.setTheme("light");
      });

      expect(mockMetaElement.setAttribute).toHaveBeenCalledWith(
        "content",
        "#ffffff"
      );
    });

    it("should update meta theme-color for dark theme", async () => {
      localStorageMock.setItem("jfv-theme", "light");

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockMetaElement.setAttribute.mockClear();

      act(() => {
        result.current.setTheme("dark");
      });

      expect(mockMetaElement.setAttribute).toHaveBeenCalledWith(
        "content",
        "#111827"
      );
    });
  });

  describe("Toggle Theme", () => {
    it("should toggle from dark to light", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toBe("dark");

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("light");
    });

    it("should toggle from light to dark", async () => {
      localStorageMock.setItem("jfv-theme", "light");

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toBe("light");

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("dark");
    });

    it("should save toggled theme to localStorage", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      localStorageMock.setItem.mockClear();

      act(() => {
        result.current.toggleTheme();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "jfv-theme",
        "light"
      );
    });
  });

  describe("Storage Disabled", () => {
    it("should not save to localStorage when storage disabled", async () => {
      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider enableStorage={false}>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), {
        wrapper: customWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      localStorageMock.setItem.mockClear();

      act(() => {
        result.current.setTheme("light");
      });

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it("should not load from localStorage when storage disabled", async () => {
      localStorageMock.setItem("jfv-theme", "light");

      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider enableStorage={false} defaultTheme="dark">
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), {
        wrapper: customWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toBe("dark");
    });
  });

  describe("Loading State", () => {
    it("should start with loading false", () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });

    it("should maintain loading false after initialization", async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle localStorage errors gracefully", async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("localStorage not available");
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should use default theme
      expect(result.current.theme).toBe("dark");
    });

    it("should handle invalid stored theme", async () => {
      localStorageMock.setItem("jfv-theme", "invalid-theme");

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should use default theme
      expect(result.current.theme).toBe("dark");
    });

    it("should handle missing meta theme-color element", async () => {
      const querySelectorMock = jest.fn(() => null);
      Object.defineProperty(document, "querySelector", {
        value: querySelectorMock,
        writable: true,
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.setTheme("light");
        });
      }).not.toThrow();
    });

    it("should handle SSR environment (no window)", async () => {
      const originalWindow = global.window;

      // Simulate SSR
      delete (global as any).window;

      const customWrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), {
        wrapper: customWrapper,
      });

      // Restore window
      (global as any).window = originalWindow;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toBe("dark");
    });
  });

  describe("Performance", () => {
    it("should memoize context value", async () => {
      const { result, rerender } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const firstSetTheme = result.current.setTheme;
      const firstToggleTheme = result.current.toggleTheme;

      rerender();

      // Functions should be the same reference
      expect(result.current.setTheme).toBe(firstSetTheme);
      expect(result.current.toggleTheme).toBe(firstToggleTheme);
    });
  });
});

// Test export to verify available functions
describe("ThemeContext", () => {
  it("should export useTheme hook", () => {
    expect(useTheme).toBeDefined();
    expect(typeof useTheme).toBe("function");
  });
});
