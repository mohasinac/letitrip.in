import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchBar from "./SearchBar";
import { searchService } from "@/services/search.service";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock search service
jest.mock("@/services/search.service", () => ({
  searchService: {
    quickSearch: jest.fn(),
  },
}));

const mockSearchResults = {
  total: 3,
  products: [
    {
      id: "prod1",
      name: "Test Product",
      slug: "test-product",
      sale_price: 999,
      images: ["https://example.com/product.jpg"],
    },
  ],
  shops: [
    {
      id: "shop1",
      name: "Test Shop",
      slug: "test-shop",
      logo_url: "https://example.com/shop.jpg",
      city: "Mumbai",
      state: "Maharashtra",
    },
  ],
  categories: [
    {
      id: "cat1",
      name: "Test Category",
      slug: "test-category",
      image_url: "https://example.com/category.jpg",
    },
  ],
};

describe("SearchBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Basic Rendering", () => {
    it("renders search input with placeholder", () => {
      render(<SearchBar />);
      expect(
        screen.getByPlaceholderText("Search products, shops, categories...")
      ).toBeInTheDocument();
    });

    it("renders search icon", () => {
      const { container } = render(<SearchBar />);
      const searchIcon = container.querySelector("svg");
      expect(searchIcon).toBeInTheDocument();
    });

    it("input has proper styling classes", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );
      expect(input).toHaveClass("w-full", "pl-12", "pr-12", "py-3", "border");
    });

    it("renders form element for submission", () => {
      const { container } = render(<SearchBar />);
      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
    });
  });

  describe("Input Handling", () => {
    it("allows typing in search input", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { value: "phone" } });

      expect(input.value).toBe("phone");
    });

    it("shows clear button (X) when input has text", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.change(input, { target: { value: "test" } });

      const clearButton = screen.getByRole("button", { name: "" });
      expect(clearButton).toBeInTheDocument();
    });

    it("does not show clear button when input is empty", () => {
      const { container } = render(<SearchBar />);
      const clearButtons = container.querySelectorAll('button[type="button"]');

      expect(clearButtons.length).toBe(0);
    });

    it("clears input when X button is clicked", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { value: "test" } });
      expect(input.value).toBe("test");

      const clearButton = screen.getByRole("button", { name: "" });
      fireEvent.click(clearButton);

      expect(input.value).toBe("");
    });
  });

  describe("Debounced Search", () => {
    it("does not trigger search for queries less than 2 characters", async () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.change(input, { target: { value: "a" } });
      jest.advanceTimersByTime(300);

      expect(searchService.quickSearch).not.toHaveBeenCalled();
    });

    it("triggers search after debounce delay (300ms) for queries 2+ chars", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.change(input, { target: { value: "phone" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(searchService.quickSearch).toHaveBeenCalledWith("phone");
      });
    });

    it("cancels previous search when typing continues", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.change(input, { target: { value: "ph" } });
      jest.advanceTimersByTime(100);

      fireEvent.change(input, { target: { value: "pho" } });
      jest.advanceTimersByTime(100);

      fireEvent.change(input, { target: { value: "phon" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(searchService.quickSearch).toHaveBeenCalledTimes(1);
        expect(searchService.quickSearch).toHaveBeenCalledWith("phon");
      });
    });
  });

  describe("Search Results Display", () => {
    it("shows loading spinner while searching", async () => {
      (searchService.quickSearch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "phone" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Searching...")).toBeInTheDocument();
      });
    });

    it("displays products in search results", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "phone" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Test Product")).toBeInTheDocument();
        expect(screen.getByText("₹999")).toBeInTheDocument();
      });
    });

    it("displays shops in search results", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "shop" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Test Shop")).toBeInTheDocument();
        expect(screen.getByText("Mumbai, Maharashtra")).toBeInTheDocument();
      });
    });

    it("displays categories in search results", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "category" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("Test Category")).toBeInTheDocument();
      });
    });

    it("shows 'View all results' link with total count", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "test" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("View all 3 results →")).toBeInTheDocument();
      });
    });

    it("shows 'No results found' when search returns empty", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue({
        total: 0,
        products: [],
        shops: [],
        categories: [],
      });

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "xyz123" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(
          screen.getByText(/No results found for "xyz123"/)
        ).toBeInTheDocument();
        expect(screen.getByText("Try different keywords")).toBeInTheDocument();
      });
    });
  });

  describe("Recent Searches", () => {
    it("loads recent searches from localStorage on mount", () => {
      localStorage.setItem(
        "recentSearches",
        JSON.stringify(["laptop", "shoes"])
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );
      fireEvent.focus(input);

      expect(screen.getByText("laptop")).toBeInTheDocument();
      expect(screen.getByText("shoes")).toBeInTheDocument();
    });

    it("shows 'Recent Searches' heading with Clock icon", () => {
      localStorage.setItem("recentSearches", JSON.stringify(["test"]));

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );
      fireEvent.focus(input);

      expect(screen.getByText("Recent Searches")).toBeInTheDocument();
    });

    it("shows Clear button for recent searches", () => {
      localStorage.setItem("recentSearches", JSON.stringify(["test"]));

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );
      fireEvent.focus(input);

      expect(screen.getByText("Clear")).toBeInTheDocument();
    });

    it("clears recent searches when Clear button clicked", () => {
      localStorage.setItem(
        "recentSearches",
        JSON.stringify(["laptop", "shoes"])
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );
      fireEvent.focus(input);

      const clearButton = screen.getByText("Clear");
      fireEvent.click(clearButton);

      expect(screen.queryByText("laptop")).not.toBeInTheDocument();
      expect(localStorage.getItem("recentSearches")).toBeNull();
    });

    it("populates input when recent search is clicked", () => {
      localStorage.setItem("recentSearches", JSON.stringify(["laptop"]));

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      ) as HTMLInputElement;
      fireEvent.focus(input);

      const recentSearch = screen.getByText("laptop");
      fireEvent.click(recentSearch);

      expect(input.value).toBe("laptop");
    });

    it("does not show recent searches when query is entered", async () => {
      localStorage.setItem("recentSearches", JSON.stringify(["laptop"]));
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "phone" } });

      expect(screen.queryByText("Recent Searches")).not.toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("navigates to search page on form submit", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.change(input, { target: { value: "phone" } });
      fireEvent.submit(input.closest("form")!);

      expect(mockPush).toHaveBeenCalledWith("/search?q=phone");
    });

    it("saves search to recent searches on submit", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.change(input, { target: { value: "laptop" } });
      fireEvent.submit(input.closest("form")!);

      const savedSearches = JSON.parse(
        localStorage.getItem("recentSearches") || "[]"
      );
      expect(savedSearches).toContain("laptop");
    });

    it("navigates to product page when product result clicked", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "phone" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        const productButton = screen
          .getByText("Test Product")
          .closest("button");
        fireEvent.click(productButton!);

        expect(mockPush).toHaveBeenCalledWith("/products/test-product");
      });
    });

    it("navigates to shop page when shop result clicked", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "shop" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        const shopButton = screen.getByText("Test Shop").closest("button");
        fireEvent.click(shopButton!);

        expect(mockPush).toHaveBeenCalledWith("/shops/test-shop");
      });
    });

    it("navigates to category page when category result clicked", async () => {
      (searchService.quickSearch as jest.Mock).mockResolvedValue(
        mockSearchResults
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "category" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        const categoryButton = screen
          .getByText("Test Category")
          .closest("button");
        fireEvent.click(categoryButton!);

        expect(mockPush).toHaveBeenCalledWith("/categories/test-category");
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles empty query submit gracefully", () => {
      render(<SearchBar />);
      const form = screen
        .getByPlaceholderText("Search products, shops, categories...")
        .closest("form")!;

      fireEvent.submit(form);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("handles whitespace-only query", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );
      const form = input.closest("form")!;

      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.submit(form);

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("handles search service error gracefully", async () => {
      (searchService.quickSearch as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "phone" } });
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Search failed:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("limits recent searches to 5 items", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      const searches = [
        "search1",
        "search2",
        "search3",
        "search4",
        "search5",
        "search6",
      ];
      searches.forEach((search) => {
        fireEvent.change(input, { target: { value: search } });
        fireEvent.submit(input.closest("form")!);
      });

      const savedSearches = JSON.parse(
        localStorage.getItem("recentSearches") || "[]"
      );
      expect(savedSearches.length).toBe(5);
      expect(savedSearches[0]).toBe("search6");
    });

    it("removes duplicate from recent searches and adds to top", () => {
      localStorage.setItem(
        "recentSearches",
        JSON.stringify(["laptop", "phone", "shoes"])
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.change(input, { target: { value: "phone" } });
      fireEvent.submit(input.closest("form")!);

      const savedSearches = JSON.parse(
        localStorage.getItem("recentSearches") || "[]"
      );
      expect(savedSearches).toEqual(["phone", "laptop", "shoes"]);
    });
  });

  describe("Accessibility", () => {
    it("search input has type text", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );
      expect(input).toHaveAttribute("type", "text");
    });

    it("shows results dropdown when input is focused", () => {
      localStorage.setItem("recentSearches", JSON.stringify(["laptop"]));

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(
        "Search products, shops, categories..."
      );

      fireEvent.focus(input);

      // Verify dropdown is shown by checking for recent searches
      expect(screen.getByText("Recent Searches")).toBeInTheDocument();
    });
  });
});
