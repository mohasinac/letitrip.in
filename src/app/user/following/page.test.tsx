import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FollowingPage from "./page";
import { shopsService } from "@/services/shops.service";

// Mock dependencies
jest.mock("@/services/shops.service");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/components/cards/ShopCard", () => ({
  ShopCard: ({ name, id }: any) => (
    <div data-testid={`shop-card-${id}`}>
      <div>{name}</div>
    </div>
  ),
}));
jest.mock("@/components/cards/CardGrid", () => ({
  CardGrid: ({ children }: any) => <div className="card-grid">{children}</div>,
}));
jest.mock("@/components/common/EmptyState", () => ({
  EmptyState: ({ title, description, action }: any) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
      {action && <button onClick={action.onClick}>{action.label}</button>}
    </div>
  ),
}));

const mockShops = [
  {
    id: "shop1",
    name: "Electronics Store",
    slug: "electronics-store",
    description: "Best electronics",
    logo: "/logo1.jpg",
    rating: 4.5,
    totalRatings: 100,
    totalProducts: 50,
    isFollowing: true,
  },
  {
    id: "shop2",
    name: "Fashion Hub",
    slug: "fashion-hub",
    description: "Trendy fashion",
    logo: "/logo2.jpg",
    rating: 4.8,
    totalRatings: 200,
    totalProducts: 120,
    isFollowing: true,
  },
  {
    id: "shop3",
    name: "Home Decor",
    slug: "home-decor",
    description: "Beautiful home items",
    logo: "/logo3.jpg",
    rating: 4.2,
    totalRatings: 80,
    totalProducts: 30,
    isFollowing: true,
  },
];

describe("FollowingPage", () => {
  const mockGetFollowing = shopsService.getFollowing as jest.MockedFunction<
    typeof shopsService.getFollowing
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFollowing.mockResolvedValue({ shops: mockShops, total: 3 } as any);
  });

  describe("Basic Rendering", () => {
    it("should render the following page with header", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        expect(screen.getByText("Following")).toBeInTheDocument();
      });
    });

    it("should render heart icon", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        const icons = document.querySelectorAll("svg");
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it("should display loading state initially", () => {
      mockGetFollowing.mockReturnValue(new Promise(() => {}));

      render(<FollowingPage />);

      expect(screen.getByText("Loading followed shops...")).toBeInTheDocument();
    });

    it("should have proper page structure", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        const page = document.querySelector(".min-h-screen");
        expect(page).toBeInTheDocument();
        expect(page).toHaveClass("bg-gray-50");
      });
    });
  });

  describe("Shop Count Display", () => {
    it("should display correct shop count for multiple shops", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        expect(
          screen.getByText("3 shops you're following")
        ).toBeInTheDocument();
      });
    });

    it("should display singular form for one shop", async () => {
      mockGetFollowing.mockResolvedValue({
        shops: [mockShops[0]],
        total: 1,
      } as any);

      render(<FollowingPage />);

      await waitFor(() => {
        expect(screen.getByText("1 shop you're following")).toBeInTheDocument();
      });
    });

    it("should show placeholder text when no shops", async () => {
      mockGetFollowing.mockResolvedValue({ shops: [], total: 0 } as any);

      render(<FollowingPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Shops you follow will appear here")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Shops Display", () => {
    it("should call getFollowing on mount", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        expect(mockGetFollowing).toHaveBeenCalled();
      });
    });

    it("should render all followed shops", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        expect(screen.getByTestId("shop-card-shop1")).toBeInTheDocument();
        expect(screen.getByTestId("shop-card-shop2")).toBeInTheDocument();
        expect(screen.getByTestId("shop-card-shop3")).toBeInTheDocument();
      });
    });

    it("should display shop names", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        expect(screen.getByText("Electronics Store")).toBeInTheDocument();
        expect(screen.getByText("Fashion Hub")).toBeInTheDocument();
        expect(screen.getByText("Home Decor")).toBeInTheDocument();
      });
    });

    it("should render shops in CardGrid component", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        const grid = document.querySelector(".card-grid");
        expect(grid).toBeInTheDocument();
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no followed shops", async () => {
      mockGetFollowing.mockResolvedValue({ shops: [], total: 0 } as any);

      render(<FollowingPage />);

      await waitFor(() => {
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });
    });

    it("should display empty state title", async () => {
      mockGetFollowing.mockResolvedValue({ shops: [], total: 0 } as any);

      render(<FollowingPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Not following any shops yet")
        ).toBeInTheDocument();
      });
    });

    it("should display empty state description", async () => {
      mockGetFollowing.mockResolvedValue({ shops: [], total: 0 } as any);

      render(<FollowingPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Start following your favorite shops to get updates on new products and special offers"
          )
        ).toBeInTheDocument();
      });
    });

    it("should show Browse Shops action button", async () => {
      mockGetFollowing.mockResolvedValue({ shops: [], total: 0 } as any);

      render(<FollowingPage />);

      await waitFor(() => {
        const button = screen.getByText("Browse Shops");
        expect(button).toBeInTheDocument();
      });
    });

    it("should navigate to shops page when button clicked", async () => {
      mockGetFollowing.mockResolvedValue({ shops: [], total: 0 } as any);
      const mockPush = jest.fn();
      const { useRouter } = require("next/navigation");
      useRouter.mockReturnValue({ push: mockPush });

      render(<FollowingPage />);

      await waitFor(() => {
        const button = screen.getByText("Browse Shops");
        button.click();
        expect(mockPush).toHaveBeenCalledWith("/shops");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle loading error gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockGetFollowing.mockRejectedValue(new Error("Failed to load"));

      render(<FollowingPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to load following shops:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("should show empty state on error", async () => {
      jest.spyOn(console, "error").mockImplementation();
      mockGetFollowing.mockRejectedValue(new Error("Failed to load"));

      render(<FollowingPage />);

      await waitFor(() => {
        // Should still show empty state instead of crashing
        expect(screen.queryByTestId("empty-state")).toBeInTheDocument();
      });
    });

    it("should set shops to empty array on error", async () => {
      jest.spyOn(console, "error").mockImplementation();
      mockGetFollowing.mockRejectedValue(new Error("Failed to load"));

      render(<FollowingPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("shop-card-shop1")).not.toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner", () => {
      mockGetFollowing.mockReturnValue(new Promise(() => {}));

      render(<FollowingPage />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("should show loading text", () => {
      mockGetFollowing.mockReturnValue(new Promise(() => {}));

      render(<FollowingPage />);

      expect(screen.getByText("Loading followed shops...")).toBeInTheDocument();
    });

    it("should center loading content", () => {
      mockGetFollowing.mockReturnValue(new Promise(() => {}));

      render(<FollowingPage />);

      const loadingContainer = screen
        .getByText("Loading followed shops...")
        .closest(".min-h-screen");
      expect(loadingContainer).toHaveClass(
        "flex",
        "items-center",
        "justify-center"
      );
    });
  });

  describe("Styling & Layout", () => {
    it("should have white header background", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        const header = screen.getByText("Following").closest(".bg-white");
        expect(header).toBeInTheDocument();
        expect(header).toHaveClass("border-b");
      });
    });

    it("should have proper content spacing", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        const content = document.querySelector(".max-w-7xl");
        expect(content).toBeInTheDocument();
        expect(content).toHaveClass("mx-auto", "px-4");
      });
    });

    it("should apply heart icon styling", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        const heartIcon = document.querySelector(".text-blue-600.fill-current");
        expect(heartIcon).toBeInTheDocument();
      });
    });

    it("should have responsive header layout", async () => {
      render(<FollowingPage />);

      await waitFor(() => {
        const headerContainer = screen
          .getByText("Following")
          .closest(".max-w-7xl");
        expect(headerContainer).toHaveClass("mx-auto", "px-4", "py-6");
      });
    });
  });

  describe("Data Handling", () => {
    it("should handle null shops array", async () => {
      mockGetFollowing.mockResolvedValue({
        shops: null as any,
        total: 0,
      } as any);

      render(<FollowingPage />);

      await waitFor(() => {
        // Should show empty state instead of crashing
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });
    });

    it("should handle undefined shops array", async () => {
      mockGetFollowing.mockResolvedValue({
        shops: undefined as any,
        total: 0,
      } as any);

      render(<FollowingPage />);

      await waitFor(() => {
        // Should show empty state instead of crashing
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });
    });

    it("should handle malformed response", async () => {
      mockGetFollowing.mockResolvedValue({} as any);

      render(<FollowingPage />);

      await waitFor(() => {
        // Should handle gracefully
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });
    });
  });
});
