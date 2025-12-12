import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShopTabs, ShopTabType } from "../ShopTabs";

describe("ShopTabs", () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all default tabs", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      expect(
        screen.getByRole("button", { name: /products/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /auctions/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /about/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /reviews/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /contact/i })
      ).toBeInTheDocument();
    });

    it("renders custom tabs when provided", () => {
      const customTabs = [
        { id: "products" as ShopTabType, label: "Custom Products" },
        { id: "about" as ShopTabType, label: "Custom About" },
      ];

      render(
        <ShopTabs
          activeTab="products"
          onTabChange={mockOnTabChange}
          tabs={customTabs}
        />
      );

      expect(screen.getByText("Custom Products")).toBeInTheDocument();
      expect(screen.getByText("Custom About")).toBeInTheDocument();
      expect(screen.queryByText(/auctions/i)).not.toBeInTheDocument();
    });

    it("renders icons for tabs", () => {
      const { container } = render(
        <ShopTabs activeTab="products" onTabChange={mockOnTabChange} />
      );

      expect(container.querySelector(".lucide-package")).toBeInTheDocument();
      expect(container.querySelector(".lucide-gavel")).toBeInTheDocument();
      expect(container.querySelector(".lucide-store")).toBeInTheDocument();
      expect(container.querySelector(".lucide-star")).toBeInTheDocument();
      expect(
        container.querySelector(".lucide-message-circle")
      ).toBeInTheDocument();
    });

    it("renders product count when provided", () => {
      render(
        <ShopTabs
          activeTab="products"
          onTabChange={mockOnTabChange}
          productCount={42}
        />
      );

      const productsTab = screen.getByRole("button", { name: /products/i });
      expect(productsTab).toHaveTextContent("42");
    });

    it("renders auction count when provided", () => {
      render(
        <ShopTabs
          activeTab="auctions"
          onTabChange={mockOnTabChange}
          auctionCount={15}
        />
      );

      const auctionsTab = screen.getByRole("button", { name: /auctions/i });
      expect(auctionsTab).toHaveTextContent("15");
    });

    it("renders review count when provided", () => {
      render(
        <ShopTabs
          activeTab="reviews"
          onTabChange={mockOnTabChange}
          reviewCount={100}
        />
      );

      const reviewsTab = screen.getByRole("button", { name: /reviews/i });
      expect(reviewsTab).toHaveTextContent("100");
    });

    it("does not render count when undefined", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const productsTab = screen.getByRole("button", { name: /products/i });
      const countBadge = productsTab.querySelector(".rounded-full");
      expect(countBadge).not.toBeInTheDocument();
    });

    it("renders custom badge when provided", () => {
      const customTabs = [
        {
          id: "products" as ShopTabType,
          label: "Products",
          badge: "New",
        },
      ];

      render(
        <ShopTabs
          activeTab="products"
          onTabChange={mockOnTabChange}
          tabs={customTabs}
        />
      );

      expect(screen.getByText("New")).toBeInTheDocument();
    });
  });

  describe("Active State", () => {
    it("highlights products tab when active", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const productsTab = screen.getByRole("button", { name: /products/i });
      expect(productsTab).toHaveClass("border-blue-600", "text-blue-600");
    });

    it("highlights auctions tab with purple when active", () => {
      render(<ShopTabs activeTab="auctions" onTabChange={mockOnTabChange} />);

      const auctionsTab = screen.getByRole("button", { name: /auctions/i });
      expect(auctionsTab).toHaveClass("border-purple-600", "text-purple-600");
    });

    it("highlights reviews tab with yellow when active", () => {
      render(<ShopTabs activeTab="reviews" onTabChange={mockOnTabChange} />);

      const reviewsTab = screen.getByRole("button", { name: /reviews/i });
      expect(reviewsTab).toHaveClass("border-yellow-600", "text-yellow-600");
    });

    it("highlights contact tab with green when active", () => {
      render(<ShopTabs activeTab="contact" onTabChange={mockOnTabChange} />);

      const contactTab = screen.getByRole("button", { name: /contact/i });
      expect(contactTab).toHaveClass("border-green-600", "text-green-600");
    });

    it("sets aria-current on active tab", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const productsTab = screen.getByRole("button", { name: /products/i });
      expect(productsTab).toHaveAttribute("aria-current", "page");
    });

    it("does not set aria-current on inactive tabs", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const auctionsTab = screen.getByRole("button", { name: /auctions/i });
      expect(auctionsTab).not.toHaveAttribute("aria-current");
    });

    it("applies inactive styles to non-active tabs", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const auctionsTab = screen.getByRole("button", { name: /auctions/i });
      expect(auctionsTab).toHaveClass("border-transparent");
    });
  });

  describe("Tab Navigation", () => {
    it("calls onTabChange when clicking a tab", async () => {
      const user = userEvent.setup();
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const auctionsTab = screen.getByRole("button", { name: /auctions/i });
      await user.click(auctionsTab);

      expect(mockOnTabChange).toHaveBeenCalledWith("auctions");
    });

    it("calls onTabChange with correct tab id", async () => {
      const user = userEvent.setup();
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      await user.click(screen.getByRole("button", { name: /reviews/i }));
      expect(mockOnTabChange).toHaveBeenCalledWith("reviews");

      await user.click(screen.getByRole("button", { name: /contact/i }));
      expect(mockOnTabChange).toHaveBeenCalledWith("contact");
    });

    it("allows clicking on active tab", async () => {
      const user = userEvent.setup();
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const productsTab = screen.getByRole("button", { name: /products/i });
      await user.click(productsTab);

      expect(mockOnTabChange).toHaveBeenCalledWith("products");
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to container", () => {
      const { container } = render(
        <ShopTabs activeTab="products" onTabChange={mockOnTabChange} />
      );

      const tabContainer = container.querySelector(".dark\\:bg-gray-800");
      expect(tabContainer).toBeInTheDocument();
    });

    it("applies dark mode classes to borders", () => {
      const { container } = render(
        <ShopTabs activeTab="products" onTabChange={mockOnTabChange} />
      );

      const border = container.querySelector(".dark\\:border-gray-700");
      expect(border).toBeInTheDocument();
    });

    it("applies dark mode active colors for products tab", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const productsTab = screen.getByRole("button", { name: /products/i });
      expect(productsTab).toHaveClass("dark:text-blue-400");
    });

    it("applies dark mode inactive colors", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const auctionsTab = screen.getByRole("button", { name: /auctions/i });
      expect(auctionsTab).toHaveClass("dark:text-gray-400");
    });
  });

  describe("Responsive Design", () => {
    it("applies horizontal scroll for mobile", () => {
      const { container } = render(
        <ShopTabs activeTab="products" onTabChange={mockOnTabChange} />
      );

      const scrollContainer = container.querySelector(".overflow-x-auto");
      expect(scrollContainer).toBeInTheDocument();
    });

    it("applies scrollbar-hide class", () => {
      const { container } = render(
        <ShopTabs activeTab="products" onTabChange={mockOnTabChange} />
      );

      const scrollContainer = container.querySelector(".scrollbar-hide");
      expect(scrollContainer).toBeInTheDocument();
    });

    it("applies responsive padding", () => {
      const { container } = render(
        <ShopTabs activeTab="products" onTabChange={mockOnTabChange} />
      );

      const paddingContainer = container.querySelector(".sm\\:px-6");
      expect(paddingContainer).toBeInTheDocument();
    });

    it("applies responsive gap between tabs", () => {
      const { container } = render(
        <ShopTabs activeTab="products" onTabChange={mockOnTabChange} />
      );

      const gapContainer = container.querySelector(".sm\\:gap-8");
      expect(gapContainer).toBeInTheDocument();
    });

    it("applies whitespace-nowrap to tab buttons", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const productsTab = screen.getByRole("button", { name: /products/i });
      expect(productsTab).toHaveClass("whitespace-nowrap");
    });
  });

  describe("Sticky Positioning", () => {
    it("applies sticky position to container", () => {
      const { container } = render(
        <ShopTabs activeTab="products" onTabChange={mockOnTabChange} />
      );

      const stickyContainer = container.querySelector(".sticky");
      expect(stickyContainer).toBeInTheDocument();
    });

    it("applies top-0 for sticky positioning", () => {
      const { container } = render(
        <ShopTabs activeTab="products" onTabChange={mockOnTabChange} />
      );

      const stickyContainer = container.querySelector(".top-0");
      expect(stickyContainer).toBeInTheDocument();
    });

    it("applies z-10 for layering", () => {
      const { container } = render(
        <ShopTabs activeTab="products" onTabChange={mockOnTabChange} />
      );

      const stickyContainer = container.querySelector(".z-10");
      expect(stickyContainer).toBeInTheDocument();
    });
  });

  describe("Custom className", () => {
    it("applies custom className to root element", () => {
      const { container } = render(
        <ShopTabs
          activeTab="products"
          onTabChange={mockOnTabChange}
          className="custom-tabs"
        />
      );

      const root = container.querySelector(".custom-tabs");
      expect(root).toBeInTheDocument();
    });

    it("preserves default classes when custom className is provided", () => {
      const { container } = render(
        <ShopTabs
          activeTab="products"
          onTabChange={mockOnTabChange}
          className="custom-tabs"
        />
      );

      const root = container.querySelector(".sticky");
      expect(root).toBeInTheDocument();
    });
  });

  describe("Count Badge Styling", () => {
    it("applies active badge style to active tab count", () => {
      render(
        <ShopTabs
          activeTab="products"
          onTabChange={mockOnTabChange}
          productCount={42}
        />
      );

      const productsTab = screen.getByRole("button", { name: /products/i });
      const badge = productsTab.querySelector(".rounded-full");
      expect(badge).toHaveClass("bg-current", "bg-opacity-10");
    });

    it("applies inactive badge style to inactive tab count", () => {
      render(
        <ShopTabs
          activeTab="products"
          onTabChange={mockOnTabChange}
          auctionCount={15}
        />
      );

      const auctionsTab = screen.getByRole("button", { name: /auctions/i });
      const badge = auctionsTab.querySelector(".rounded-full");
      expect(badge).toHaveClass("bg-gray-200", "dark:bg-gray-700");
    });

    it("applies red background to custom badge", () => {
      const customTabs = [
        {
          id: "products" as ShopTabType,
          label: "Products",
          badge: "New",
        },
      ];

      render(
        <ShopTabs
          activeTab="products"
          onTabChange={mockOnTabChange}
          tabs={customTabs}
        />
      );

      const badge = screen.getByText("New");
      expect(badge).toHaveClass("bg-red-500", "text-white");
    });
  });

  describe("Accessibility", () => {
    it("uses button elements for tabs", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const tabs = screen.getAllByRole("button");
      expect(tabs.length).toBeGreaterThan(0);
    });

    it("provides accessible names for tabs", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      expect(
        screen.getByRole("button", { name: /products/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /auctions/i })
      ).toBeInTheDocument();
    });

    it("uses aria-current for active state", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const activeTab = screen.getByRole("button", { name: /products/i });
      expect(activeTab).toHaveAttribute("aria-current", "page");
    });
  });

  describe("Transition Effects", () => {
    it("applies transition-colors to tab buttons", () => {
      render(<ShopTabs activeTab="products" onTabChange={mockOnTabChange} />);

      const productsTab = screen.getByRole("button", { name: /products/i });
      expect(productsTab).toHaveClass("transition-colors");
    });
  });

  describe("CSS-in-JS Styles", () => {
    it("applies scrollbar hiding styles", () => {
      const { container } = render(
        <ShopTabs activeTab="products" onTabChange={mockOnTabChange} />
      );

      // Check that scrollbar-hide class is applied
      const scrollContainer = container.querySelector(".scrollbar-hide");
      expect(scrollContainer).toBeInTheDocument();
    });
  });
});
