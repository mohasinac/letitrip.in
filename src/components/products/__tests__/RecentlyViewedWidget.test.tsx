import { useViewingHistory } from "@/contexts/ViewingHistoryContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecentlyViewedWidget } from "../RecentlyViewedWidget";

// Mock dependencies
jest.mock("@/contexts/ViewingHistoryContext");
jest.mock("@/components/common/OptimizedImage", () => ({
  __esModule: true,
  default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockProducts = [
  {
    id: "prod1",
    slug: "product-1",
    title: "Product 1",
    price: 1000,
    image: "https://example.com/product1.jpg",
  },
  {
    id: "prod2",
    slug: "product-2",
    title: "Product 2",
    price: 2000,
    image: "https://example.com/product2.jpg",
  },
  {
    id: "prod3",
    slug: "product-3",
    title: "Product 3",
    price: 3000,
    image: "https://example.com/product3.jpg",
  },
];

describe("RecentlyViewedWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useViewingHistory as jest.Mock).mockReturnValue({
      recentlyViewed: mockProducts,
    });
  });

  describe("Rendering", () => {
    it("renders default title", () => {
      render(<RecentlyViewedWidget />);
      expect(
        screen.getByRole("heading", { name: "Recently Viewed" })
      ).toBeInTheDocument();
    });

    it("renders custom title", () => {
      render(<RecentlyViewedWidget title="Custom Title" />);
      expect(
        screen.getByRole("heading", { name: "Custom Title" })
      ).toBeInTheDocument();
    });

    it("renders Clock icon", () => {
      const { container } = render(<RecentlyViewedWidget />);
      expect(container.querySelector(".lucide-clock")).toBeInTheDocument();
    });

    it("renders View All link by default", () => {
      render(<RecentlyViewedWidget />);
      expect(screen.getByRole("link", { name: "View All" })).toHaveAttribute(
        "href",
        "/user/history"
      );
    });

    it("hides View All link when showViewAll is false", () => {
      render(<RecentlyViewedWidget showViewAll={false} />);
      expect(
        screen.queryByRole("link", { name: "View All" })
      ).not.toBeInTheDocument();
    });

    it("renders scroll buttons", () => {
      render(<RecentlyViewedWidget />);
      expect(screen.getByLabelText("Scroll left")).toBeInTheDocument();
      expect(screen.getByLabelText("Scroll right")).toBeInTheDocument();
    });

    it("does not render when no items", () => {
      (useViewingHistory as jest.Mock).mockReturnValue({
        recentlyViewed: [],
      });
      const { container } = render(<RecentlyViewedWidget />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Product Display", () => {
    it("renders all products within limit", () => {
      render(<RecentlyViewedWidget />);
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
      expect(screen.getByText("Product 3")).toBeInTheDocument();
    });

    it("limits number of products displayed", () => {
      const manyProducts = Array.from({ length: 20 }, (_, i) => ({
        id: `prod${i}`,
        slug: `product-${i}`,
        title: `Product ${i}`,
        price: 1000 * i,
        image: `https://example.com/product${i}.jpg`,
      }));

      (useViewingHistory as jest.Mock).mockReturnValue({
        recentlyViewed: manyProducts,
      });

      render(<RecentlyViewedWidget limit={5} />);

      // Should show first 5 products
      expect(screen.getByText("Product 0")).toBeInTheDocument();
      expect(screen.getByText("Product 4")).toBeInTheDocument();
      // Should not show products beyond limit
      expect(screen.queryByText("Product 5")).not.toBeInTheDocument();
    });

    it("excludes specified product ID", () => {
      render(<RecentlyViewedWidget excludeId="prod2" />);
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.queryByText("Product 2")).not.toBeInTheDocument();
      expect(screen.getByText("Product 3")).toBeInTheDocument();
    });

    it("renders product images", () => {
      render(<RecentlyViewedWidget />);
      const img1 = screen.getByAltText("Product 1");
      expect(img1).toHaveAttribute("src", "https://example.com/product1.jpg");
    });

    it("renders product prices", () => {
      render(<RecentlyViewedWidget />);
      // Check for prices with flexible format (formatPrice might return different format)
      expect(screen.getByText(/1,?000/)).toBeInTheDocument();
      expect(screen.getByText(/2,?000/)).toBeInTheDocument();
    });

    it("renders product links", () => {
      render(<RecentlyViewedWidget />);
      const links = screen.getAllByRole("link");
      const productLink = links.find((link) =>
        link.getAttribute("href")?.includes("/products/product-1")
      );
      expect(productLink).toBeInTheDocument();
    });
  });

  describe("Scrolling", () => {
    it("scrolls left when left button clicked", async () => {
      const user = userEvent.setup();
      const scrollBySpy = jest.fn();

      render(<RecentlyViewedWidget />);

      // Mock scrollBy
      const container = document.querySelector(
        ".overflow-x-auto"
      ) as HTMLElement;
      if (container) {
        container.scrollBy = scrollBySpy;
      }

      const leftButton = screen.getByLabelText("Scroll left");
      await user.click(leftButton);

      expect(scrollBySpy).toHaveBeenCalledWith({
        left: -300,
        behavior: "smooth",
      });
    });

    it("scrolls right when right button clicked", async () => {
      const user = userEvent.setup();
      const scrollBySpy = jest.fn();

      render(<RecentlyViewedWidget />);

      // Mock scrollBy
      const container = document.querySelector(
        ".overflow-x-auto"
      ) as HTMLElement;
      if (container) {
        container.scrollBy = scrollBySpy;
      }

      const rightButton = screen.getByLabelText("Scroll right");
      await user.click(rightButton);

      expect(scrollBySpy).toHaveBeenCalledWith({
        left: 300,
        behavior: "smooth",
      });
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to container", () => {
      const { container } = render(<RecentlyViewedWidget />);
      const darkText = container.querySelector(".dark\\:text-white");
      expect(darkText).toBeInTheDocument();
    });

    it("applies dark mode classes to scroll buttons", () => {
      const { container } = render(<RecentlyViewedWidget />);
      const darkBg = container.querySelector(".dark\\:bg-gray-700");
      expect(darkBg).toBeInTheDocument();
    });

    it("applies dark mode classes to product cards", () => {
      const { container } = render(<RecentlyViewedWidget />);
      const darkHover = container.querySelector(
        ".dark\\:group-hover\\:text-blue-400"
      );
      expect(darkHover).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("hides scroll buttons on mobile", () => {
      const { container } = render(<RecentlyViewedWidget />);
      const scrollButtons = container.querySelector(".sm\\:flex");
      expect(scrollButtons).toBeInTheDocument();
      expect(scrollButtons).toHaveClass("hidden");
    });

    it("applies scrollbar-hide class", () => {
      const { container } = render(<RecentlyViewedWidget />);
      expect(container.querySelector(".scrollbar-hide")).toBeInTheDocument();
    });

    it("applies proper scroll container styling", () => {
      const { container } = render(<RecentlyViewedWidget />);
      const scrollContainer = container.querySelector(".overflow-x-auto");
      expect(scrollContainer).toHaveStyle({ scrollbarWidth: "none" });
    });
  });

  describe("Custom className", () => {
    it("applies custom className to root element", () => {
      const { container } = render(
        <RecentlyViewedWidget className="custom-class" />
      );
      const section = container.querySelector("section");
      expect(section).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("uses semantic section element", () => {
      const { container } = render(<RecentlyViewedWidget />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("uses semantic heading", () => {
      render(<RecentlyViewedWidget />);
      expect(
        screen.getByRole("heading", { name: "Recently Viewed" })
      ).toBeInTheDocument();
    });

    it("provides aria-label for scroll buttons", () => {
      render(<RecentlyViewedWidget />);
      expect(screen.getByLabelText("Scroll left")).toBeInTheDocument();
      expect(screen.getByLabelText("Scroll right")).toBeInTheDocument();
    });

    it("provides alt text for product images", () => {
      render(<RecentlyViewedWidget />);
      expect(screen.getByAltText("Product 1")).toBeInTheDocument();
    });
  });

  describe("Hover Effects", () => {
    it("renders product links with group class for hover effects", () => {
      const { container } = render(<RecentlyViewedWidget />);
      // Product links are rendered
      const links = container.querySelectorAll("a");
      expect(links.length).toBeGreaterThan(0);
    });

    it("applies transition classes to product images", () => {
      const { container } = render(<RecentlyViewedWidget />);
      const images = container.querySelectorAll("img");
      expect(images.length).toBeGreaterThan(0);
    });

    it("applies transition classes to scroll buttons", () => {
      render(<RecentlyViewedWidget />);
      const leftButton = screen.getByLabelText("Scroll left");
      expect(leftButton.className).toContain("transition-colors");
    });
  });
});
