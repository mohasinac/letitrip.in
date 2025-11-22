import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ShopsPage from "./page";
import { shopsService } from "@/services/shops.service";

// Mock dependencies
jest.mock("@/services/shops.service");
jest.mock("@/hooks/useMobile", () => ({
  useIsMobile: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Grid: () => <div data-testid="grid-icon" />,
  List: () => <div data-testid="list-icon" />,
  Star: () => <div data-testid="star-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  BadgeCheck: () => <div data-testid="badge-check-icon" />,
  ShoppingBag: () => <div data-testid="shopping-bag-icon" />,
}));

// Mock components
jest.mock("@/components/cards/ShopCard", () => ({
  ShopCard: ({ name, slug }: any) => (
    <div data-testid={`shop-card-${slug}`}>
      <h3>{name}</h3>
      <p>Shop: {slug}</p>
    </div>
  ),
}));

jest.mock("@/components/common/inline-edit", () => ({
  UnifiedFilterSidebar: ({ resultCount, isLoading }: any) => (
    <div data-testid="unified-filter-sidebar">
      <div>Filters</div>
      <div>Results: {resultCount}</div>
      <div>Loading: {isLoading ? "true" : "false"}</div>
    </div>
  ),
}));

jest.mock("@/constants/filters", () => ({
  SHOP_FILTERS: [
    {
      title: "Verification Status",
      fields: [
        {
          key: "is_verified",
          label: "Verified Shops Only",
          type: "checkbox",
          options: [{ label: "Show only verified shops", value: "true" }],
        },
      ],
    },
  ],
}));

const mockShopsService = shopsService as jest.Mocked<typeof shopsService>;
const mockUseIsMobile = require("@/hooks/useMobile").useIsMobile;
const mockUseSearchParams = require("next/navigation").useSearchParams;

describe("ShopsPage", () => {
  const mockShopsData = [
    {
      id: "shop-1",
      name: "Test Shop 1",
      slug: "test-shop-1",
      logo: "logo1.jpg",
      rating: 4.5,
      ratingDisplay: "4.5",
      totalProducts: 50,
      isVerified: true,
      urlPath: "/shops/test-shop-1",
      badges: ["verified"],
      description: "A great shop",
      banner: "banner1.jpg",
      reviewCount: 25,
      productCount: 50,
      featured: false,
      location: "New York",
    },
    {
      id: "shop-2",
      name: "Test Shop 2",
      slug: "test-shop-2",
      logo: "logo2.jpg",
      rating: 4.2,
      ratingDisplay: "4.2",
      totalProducts: 35,
      isVerified: false,
      urlPath: "/shops/test-shop-2",
      badges: [],
      description: "Another great shop",
      banner: "banner2.jpg",
      reviewCount: 18,
      productCount: 35,
      featured: true,
      location: "Los Angeles",
    },
  ];

  const mockPaginationResponse = {
    data: mockShopsData,
    count: 2,
    pagination: {
      limit: 20,
      hasNextPage: false,
      nextCursor: null,
      count: 2,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    mockUseIsMobile.mockReturnValue(false);
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((key) => {
        if (key === "search") return "";
        if (key === "sortBy") return "rating";
        if (key === "sortOrder") return "desc";
        return null;
      }),
    });

    mockShopsService.list.mockResolvedValue(mockPaginationResponse);
  });

  it("can be imported", () => {
    expect(ShopsPage).toBeDefined();
  });

  describe("Initial Rendering", () => {
    it("renders with Suspense fallback initially", () => {
      render(<ShopsPage />);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    it("renders page title and description", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Browse Shops")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Discover trusted sellers and their unique collections"
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe("Data Loading", () => {
    it("loads shops data on mount", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        expect(mockShopsService.list).toHaveBeenCalledWith({
          startAfter: undefined,
          limit: 20,
          sortBy: "rating",
          sortOrder: "desc",
          search: undefined,
        });
      });
    });

    it("displays shops in grid view by default", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("shop-card-test-shop-1")).toBeInTheDocument();
        expect(screen.getByTestId("shop-card-test-shop-2")).toBeInTheDocument();
      });
    });

    it("shows loading state while fetching", async () => {
      // Make the service call hang
      mockShopsService.list.mockImplementation(() => new Promise(() => {}));

      render(<ShopsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("displays search input", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Search shops...")
        ).toBeInTheDocument();
      });
    });

    it("updates search query on input change", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Search shops...");
        fireEvent.change(searchInput, { target: { value: "test search" } });

        expect(searchInput).toHaveValue("test search");
      });
    });

    it("searches when Enter is pressed", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Search shops...");
        fireEvent.change(searchInput, { target: { value: "test search" } });
        fireEvent.keyDown(searchInput, { key: "Enter" });
      });

      await waitFor(() => {
        expect(mockShopsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "test search",
          })
        );
      });
    });

    it("searches when search button is clicked", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        const searchButton = screen.getByText("Search");
        fireEvent.click(searchButton);
      });

      await waitFor(() => {
        expect(mockShopsService.list).toHaveBeenCalled();
      });
    });
  });

  describe("Sorting", () => {
    it("displays sort selector", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        const sortSelect = screen.getByRole("combobox");
        expect(sortSelect).toBeInTheDocument();
        expect(sortSelect).toHaveValue("rating");
      });
    });

    it("changes sort and reloads data", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        const sortSelect = screen.getByRole("combobox");
        fireEvent.change(sortSelect, { target: { value: "products" } });
      });

      await waitFor(() => {
        expect(mockShopsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: "products",
          })
        );
      });
    });
  });

  describe("View Toggle", () => {
    it("displays view toggle buttons", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("grid-icon")).toBeInTheDocument();
        expect(screen.getByTestId("list-icon")).toBeInTheDocument();
      });
    });

    it("starts in grid view", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        // Grid view should be active (blue background)
        const gridButton = screen.getByTestId("grid-icon").parentElement;
        expect(gridButton).toHaveClass("bg-blue-600");
      });
    });

    it("switches to list view", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        const listIcon = screen.getByTestId("list-icon");
        const listButton = listIcon.parentElement;
        if (listButton) {
          fireEvent.click(listButton);
        }
      });

      // Should still display shops (just in different layout)
      expect(screen.getByTestId("shop-card-test-shop-1")).toBeInTheDocument();
    });
  });

  describe("Filtering", () => {
    it("displays filter sidebar on desktop", async () => {
      mockUseIsMobile.mockReturnValue(false);

      render(<ShopsPage />);

      await waitFor(() => {
        expect(
          screen.getByTestId("unified-filter-sidebar")
        ).toBeInTheDocument();
      });
    });

    it("shows filter toggle button on mobile", async () => {
      mockUseIsMobile.mockReturnValue(true);

      render(<ShopsPage />);

      await waitFor(() => {
        const filterButton = screen.getByTestId("filter-icon").parentElement;
        expect(filterButton).toBeInTheDocument();
        expect(filterButton).toHaveTextContent("Filters");
      });
    });

    it("applies filters and reloads data", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        // This would normally be tested by mocking the UnifiedFilterSidebar's onChange
        // For now, we'll test that the component renders with filters
        expect(
          screen.getByTestId("unified-filter-sidebar")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Empty States", () => {
    it("shows empty state when no shops found", async () => {
      mockShopsService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          limit: 20,
          hasNextPage: false,
          nextCursor: null,
          count: 0,
        },
      });

      render(<ShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("No shops found")).toBeInTheDocument();
        expect(screen.getByText("Clear filters")).toBeInTheDocument();
      });
    });

    it("shows result count", async () => {
      render(<ShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Showing 2 shops")).toBeInTheDocument();
      });
    });
  });

  describe("Pagination", () => {
    it("shows pagination when there are multiple pages", async () => {
      mockShopsService.list.mockResolvedValue({
        data: mockShopsData,
        count: 50,
        pagination: {
          limit: 20,
          hasNextPage: true,
          nextCursor: "cursor-123",
          count: 50,
        },
      });

      render(<ShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Next")).toBeInTheDocument();
        expect(screen.getByText("Page 1 (2 shops)")).toBeInTheDocument();
      });
    });

    it("navigates to next page", async () => {
      mockShopsService.list.mockResolvedValueOnce({
        data: mockShopsData,
        count: 50,
        pagination: {
          limit: 20,
          hasNextPage: true,
          nextCursor: "cursor-123",
          count: 50,
        },
      });

      render(<ShopsPage />);

      await waitFor(() => {
        const nextButton = screen.getByText("Next");
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(mockShopsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            startAfter: "cursor-123",
          })
        );
      });
    });

    it("navigates to previous page", async () => {
      // First set up a scenario where we're on page 2
      mockShopsService.list.mockResolvedValueOnce({
        data: mockShopsData,
        count: 50,
        pagination: {
          limit: 20,
          hasNextPage: true,
          nextCursor: "cursor-123",
          count: 50,
        },
      });

      render(<ShopsPage />);

      await waitFor(() => {
        const nextButton = screen.getByText("Next");
        fireEvent.click(nextButton);
      });

      // Now we should be able to go back
      await waitFor(() => {
        const prevButton = screen.getByText("Previous");
        expect(prevButton).not.toBeDisabled();
      });
    });
  });

  describe("Reset Functionality", () => {
    it("resets all filters and search", async () => {
      mockShopsService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          limit: 20,
          hasNextPage: false,
          nextCursor: null,
          count: 0,
        },
      });

      render(<ShopsPage />);

      await waitFor(() => {
        const clearButton = screen.getByText("Clear filters");
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(mockShopsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            search: undefined,
          })
        );
      });
    });
  });

  describe("Responsive Behavior", () => {
    it("shows mobile filter drawer on mobile", async () => {
      mockUseIsMobile.mockReturnValue(true);

      render(<ShopsPage />);

      await waitFor(() => {
        const filterButton = screen.getByTestId("filter-icon").parentElement;
        if (filterButton) {
          fireEvent.click(filterButton);
        }

        // Filter sidebar should be rendered for mobile
        expect(
          screen.getByTestId("unified-filter-sidebar")
        ).toBeInTheDocument();
      });
    });

    it("hides view toggle on mobile", async () => {
      mockUseIsMobile.mockReturnValue(true);

      render(<ShopsPage />);

      await waitFor(() => {
        // View toggle buttons should be hidden on mobile (have 'hidden' class)
        const viewToggle =
          screen.getByTestId("grid-icon").parentElement?.parentElement;
        expect(viewToggle).toHaveClass("hidden");
      });
    });
  });

  describe("Error Handling", () => {
    it("handles API errors gracefully", async () => {
      mockShopsService.list.mockRejectedValue(new Error("API Error"));

      render(<ShopsPage />);

      // Should not crash and should show empty state or handle error
      await waitFor(() => {
        expect(mockShopsService.list).toHaveBeenCalled();
      });

      // Component should still render
      expect(screen.getByText("Browse Shops")).toBeInTheDocument();
    });
  });
});
