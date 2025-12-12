/**
 * @jest-environment jsdom
 *
 * SearchBar Component Tests
 * Tests search input, debouncing, results display, recent searches
 */

import { searchService } from "@/services/search.service";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "../SearchBar";

// Mock dependencies
jest.mock("@/services/search.service");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock("@/lib/firebase-error-logger");

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("SearchBar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const mockSearchResults = {
    products: [
      {
        id: "1",
        name: "Product 1",
        slug: "product-1",
        image: "/img1.jpg",
        price: 100,
        rating: 4.5,
      },
      {
        id: "2",
        name: "Product 2",
        slug: "product-2",
        image: "/img2.jpg",
        price: 200,
        rating: 3.5,
      },
    ],
    shops: [
      {
        id: "s1",
        name: "Shop 1",
        slug: "shop-1",
        logo: "/logo1.jpg",
        rating: 4.0,
        productCount: 10,
      },
    ],
    categories: [
      { id: "c1", name: "Category 1", slug: "category-1", productCount: 5 },
    ],
  };

  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      render(<SearchBar />);
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it("should render search icon", () => {
      const { container } = render(<SearchBar />);
      const searchIcon = container.querySelector("svg");
      expect(searchIcon).toBeInTheDocument();
    });

    it("should render input field", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
    });

    it("should start with empty query", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });

  describe("Search Input", () => {
    it("should update query on input", async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      expect(input.value).toBe("laptop");
    });

    it("should clear input when clear button clicked", async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      expect(input.value).toBe("laptop");

      await act(async () => {
        const clearButton = screen.getByRole("button", { name: "" });
        fireEvent.click(clearButton);
      });
      expect(input.value).toBe("");
    });

    it("should show clear button when input has value", async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      expect(
        screen.queryByRole("button", { name: "" })
      ).not.toBeInTheDocument();

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should not trigger search for queries less than 2 characters", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "a" } });
      });
      
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      expect(searchService.quickSearch).not.toHaveBeenCalled();
    });

    it("should trigger search for queries 2+ characters", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });

      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(searchService.quickSearch).toHaveBeenCalledWith("laptop");
      });
    });
  });

  describe("Debouncing", () => {
    it("should debounce search requests", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "l" } });
      });
      await act(async () => {
        fireEvent.change(input, { target: { value: "la" } });
      });
      await act(async () => {
        fireEvent.change(input, { target: { value: "lap" } });
      });

      // Should not call until debounce time passes
      expect(searchService.quickSearch).not.toHaveBeenCalled();

      // Advance timer past debounce delay (300ms)
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(searchService.quickSearch).toHaveBeenCalledTimes(1);
        expect(searchService.quickSearch).toHaveBeenCalledWith("lap");
      });
    });

    it("should cancel previous search on new input", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(200); // Not enough to trigger
      });

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop bag" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(searchService.quickSearch).toHaveBeenCalledTimes(1);
        expect(searchService.quickSearch).toHaveBeenCalledWith("laptop bag");
      });
    });

    it("should have 300ms debounce delay", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });

      await act(async () => {
        jest.advanceTimersByTime(299);
      });
      expect(searchService.quickSearch).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(1);
      });
      await waitFor(() => {
        expect(searchService.quickSearch).toHaveBeenCalled();
      });
    });
  });

  describe("Search Results Display", () => {
    it("should display results after successful search", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(screen.getByText("Product 1")).toBeInTheDocument();
        expect(screen.getByText("Shop 1")).toBeInTheDocument();
        expect(screen.getByText("Category 1")).toBeInTheDocument();
      });
    });

    it("should show loading state during search", async () => {
      (searchService.quickSearch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockSearchResults), 1000)
          )
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });

    it("should hide results when clicking outside", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(
        <div>
          <SearchBar />
          <div data-testid="outside">Outside</div>
        </div>
      );

      const input = screen.getByPlaceholderText(/search/i);
      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(screen.getByText("Product 1")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.mouseDown(screen.getByTestId("outside"));
      });

      await waitFor(() => {
        expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
      });
    });

    it("should clear results when query becomes less than 2 chars", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(screen.getByText("Product 1")).toBeInTheDocument();
      });

      // Clear input to 1 character
      await act(async () => {
        fireEvent.change(input, { target: { value: "l" } });
      });

      await waitFor(() => {
        expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
      });
    });
  });

  describe("Recent Searches", () => {
    it("should load recent searches from localStorage on mount", () => {
      localStorageMock.setItem(
        "recentSearches",
        JSON.stringify(["laptop", "phone"])
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      fireEvent.focus(input);

      expect(screen.getByText("laptop")).toBeInTheDocument();
      expect(screen.getByText("phone")).toBeInTheDocument();
    });

    it("should save search to recent searches on submit", async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        fireEvent.submit(input.closest("form")!);
      });

      const saved = JSON.parse(
        localStorageMock.getItem("recentSearches") || "[]"
      );
      expect(saved).toContain("laptop");
    });

    it("should limit recent searches to 5", async () => {
      localStorageMock.setItem(
        "recentSearches",
        JSON.stringify(["search1", "search2", "search3", "search4", "search5"])
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "search6" } });
      });
      await act(async () => {
        fireEvent.submit(input.closest("form")!);
      });

      const saved = JSON.parse(
        localStorageMock.getItem("recentSearches") || "[]"
      );
      expect(saved).toHaveLength(5);
      expect(saved[0]).toBe("search6");
      expect(saved).not.toContain("search1");
    });

    it("should move recent search to top if searched again", async () => {
      localStorageMock.setItem(
        "recentSearches",
        JSON.stringify(["laptop", "phone", "tablet"])
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "phone" } });
      });
      await act(async () => {
        fireEvent.submit(input.closest("form")!);
      });

      const saved = JSON.parse(
        localStorageMock.getItem("recentSearches") || "[]"
      );
      expect(saved[0]).toBe("phone");
    });

    it("should clear recent searches when clear button clicked", async () => {
      localStorageMock.setItem(
        "recentSearches",
        JSON.stringify(["laptop", "phone"])
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.focus(input);
      });
      expect(screen.getByText("laptop")).toBeInTheDocument();

      const clearButton = screen.getByRole("button", { name: "Clear" });
      await act(async () => {
        fireEvent.click(clearButton);
      });

      expect(localStorageMock.getItem("recentSearches")).toBeNull();
      expect(screen.queryByText("laptop")).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("should navigate to search page on submit", async () => {
      const mockPush = jest.fn();
      jest
        .spyOn(require("next/navigation"), "useRouter")
        .mockReturnValue({ push: mockPush });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        fireEvent.submit(input.closest("form")!);
      });

      expect(mockPush).toHaveBeenCalledWith("/search?q=laptop");
    });

    it("should not submit empty query", () => {
      const mockPush = jest.fn();
      jest
        .spyOn(require("next/navigation"), "useRouter")
        .mockReturnValue({ push: mockPush });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      fireEvent.submit(input.closest("form")!);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should trim whitespace before submitting", async () => {
      const mockPush = jest.fn();
      jest
        .spyOn(require("next/navigation"), "useRouter")
        .mockReturnValue({ push: mockPush });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "  laptop  " } });
      });
      await act(async () => {
        fireEvent.submit(input.closest("form")!);
      });

      expect(mockPush).toHaveBeenCalledWith("/search?q=laptop");
    });

    it("should URL encode special characters", async () => {
      const mockPush = jest.fn();
      jest
        .spyOn(require("next/navigation"), "useRouter")
        .mockReturnValue({ push: mockPush });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop & bag" } });
      });
      await act(async () => {
        fireEvent.submit(input.closest("form")!);
      });

      expect(mockPush).toHaveBeenCalledWith("/search?q=laptop%20%26%20bag");
    });

    it("should close results after submission", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(screen.getByText("Product 1")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.submit(input.closest("form")!);
      });

      await waitFor(() => {
        expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
      });
    });
  });

  describe("Result Navigation", () => {
    it("should navigate to product on product click", async () => {
      const mockPush = jest.fn();
      jest
        .spyOn(require("next/navigation"), "useRouter")
        .mockReturnValue({ push: mockPush });
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(screen.getByText("Product 1")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Product 1"));
      });

      expect(mockPush).toHaveBeenCalledWith("/products/product-1");
    });

    it("should navigate to shop on shop click", async () => {
      const mockPush = jest.fn();
      jest
        .spyOn(require("next/navigation"), "useRouter")
        .mockReturnValue({ push: mockPush });
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(screen.getByText("Shop 1")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Shop 1"));
      });

      expect(mockPush).toHaveBeenCalledWith("/shops/shop-1");
    });

    it("should navigate to category on category click", async () => {
      const mockPush = jest.fn();
      jest
        .spyOn(require("next/navigation"), "useRouter")
        .mockReturnValue({ push: mockPush });
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "electronics" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(screen.getByText("Category 1")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Category 1"));
      });

      expect(mockPush).toHaveBeenCalledWith("/categories/category-1");
    });

    it("should save recent search on result click", async () => {
      const mockPush = jest.fn();
      jest
        .spyOn(require("next/navigation"), "useRouter")
        .mockReturnValue({ push: mockPush });
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(screen.getByText("Product 1")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Product 1"));
      });

      const saved = JSON.parse(
        localStorageMock.getItem("recentSearches") || "[]"
      );
      expect(saved).toContain("laptop");
    });

    it("should close results after result click", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(screen.getByText("Product 1")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Product 1"));
      });

      await waitFor(() => {
        expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle search errors gracefully", async () => {
      (searchService.quickSearch as jest.Mock).mockRejectedValue(
        new Error("API error")
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      // Should not crash and should clear loading state
      await waitFor(() => {
        expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
      });
    });

    it("should log errors", async () => {
      const mockLogError = jest.fn();
      jest
        .spyOn(require("@/lib/firebase-error-logger"), "logError")
        .mockImplementation(mockLogError);
      (searchService.quickSearch as jest.Mock).mockRejectedValue(
        new Error("API error")
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(mockLogError).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible input", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);
      expect(input).toHaveAttribute("type", "text");
    });

    it("should have form role", () => {
      const { container } = render(<SearchBar />);
      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("should be keyboard navigable", async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid input changes", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        for (let i = 0; i < 10; i++) {
          fireEvent.change(input, { target: { value: "a".repeat(i + 2) } });
          jest.advanceTimersByTime(100);
        }
      });

      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      // Should only call once after last input
      await waitFor(() => {
        expect(searchService.quickSearch).toHaveBeenCalledTimes(1);
      });
    });

    it("should handle empty search results", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue({
        products: [],
        shops: [],
        categories: [],
      });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "nonexistent" } });
      });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });

      await waitFor(() => {
        expect(screen.getByText(/no results/i)).toBeInTheDocument();
      });
    });

    it("should cleanup timeout on unmount", async () => {
      const { unmount } = render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: "laptop" } });
      });

      unmount();

      // Should not throw error
      await act(async () => {
        jest.advanceTimersByTime(400);
      });
    });
  });
});

// BUG FIX #44: SearchBar Component Issues
// ISSUE 1: No max length on search input - users can type very long queries
// ISSUE 2: No input sanitization before sending to API - potential XSS risk
// ISSUE 3: Recent searches not validated on load from localStorage - can crash with corrupt data
// ISSUE 4: localStorage.setItem can throw QuotaExceededError - not caught
// ISSUE 5: No aria-label on search input for screen readers
// ISSUE 6: Results container lacks role="listbox" for accessibility
// ISSUE 7: Individual results lack role="option" for ARIA
// ISSUE 8: No keyboard navigation (arrow keys) through results
// ISSUE 9: No highlight on keyboard navigation
// ISSUE 10: Debounce timeout not configurable - hardcoded 300ms
