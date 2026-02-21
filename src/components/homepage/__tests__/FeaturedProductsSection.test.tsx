import { render, screen } from "@testing-library/react";
import { FeaturedProductsSection } from "../FeaturedProductsSection";

// Mock useApiQuery
const mockUseApiQuery = jest.fn();
jest.mock("@/hooks", () => ({
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
}));

// Mock Button component
jest.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

const mockProducts = [
  {
    id: "1",
    title: "Premium Headphones",
    slug: "premium-headphones",
    price: 4999,
    currency: "INR",
    mainImage: "/img/headphones.jpg",
    isPromoted: true,
    brand: "SoundMax",
    category: "Electronics",
  },
  {
    id: "2",
    title: "Vintage Watch",
    slug: "vintage-watch",
    price: 12500,
    currency: "INR",
    mainImage: "/img/watch.jpg",
    isPromoted: false,
    brand: "TimeCraft",
    category: "Accessories",
  },
  {
    id: "3",
    title: "Leather Wallet",
    slug: "leather-wallet",
    price: 1299,
    currency: "INR",
    mainImage: "/img/wallet.jpg",
    isPromoted: true,
    category: "Accessories",
  },
];

describe("FeaturedProductsSection", () => {
  beforeEach(() => {
    mockUseApiQuery.mockReset();
  });

  // ====================================
  // Loading State
  // ====================================
  describe("Loading State", () => {
    it("renders loading skeleton when loading", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      const { container } = render(<FeaturedProductsSection />);
      expect(
        container.querySelectorAll(".animate-pulse").length,
      ).toBeGreaterThan(0);
    });
  });

  // ====================================
  // No Data State
  // ====================================
  describe("No Data State", () => {
    it("returns null when no products", () => {
      mockUseApiQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });
      const { container } = render(<FeaturedProductsSection />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when products array is missing", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: false });
      const { container } = render(<FeaturedProductsSection />);
      expect(container.innerHTML).toBe("");
    });
  });

  // ====================================
  // Content Rendering
  // ====================================
  describe("Content Rendering", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: mockProducts,
        isLoading: false,
      });
    });

    it('renders "Featured Products" heading', () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Featured Products",
      );
    });

    it("renders subtitle", () => {
      render(<FeaturedProductsSection />);
      expect(
        screen.getByText("Handpicked items just for you"),
      ).toBeInTheDocument();
    });

    it('renders "View All" link', () => {
      render(<FeaturedProductsSection />);
      // Component renders View All link in both mobile and desktop layouts
      const links = screen.getAllByText(/view all/i);
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it("renders all product titles", () => {
      render(<FeaturedProductsSection />);
      // Component renders products in both mobile (carousel) and desktop (grid) layouts
      expect(
        screen.getAllByText("Premium Headphones").length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByText("Vintage Watch").length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByText("Leather Wallet").length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("renders product images with alt text", () => {
      render(<FeaturedProductsSection />);
      const images = screen.getAllByRole("img");
      // Images appear in both mobile and desktop layouts
      expect(images.length).toBeGreaterThanOrEqual(3);
      expect(images[0]).toHaveAttribute("alt");
    });

    it('renders "Featured" badge for promoted products', () => {
      render(<FeaturedProductsSection />);
      const badges = screen.getAllByText("Featured");
      // 2 promoted products × 2 layouts (mobile + desktop) = 4 badges
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });

    it("renders brand name when available", () => {
      render(<FeaturedProductsSection />);
      expect(screen.getAllByText("SoundMax").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("TimeCraft").length).toBeGreaterThanOrEqual(1);
    });

    it("renders product cards as links", () => {
      render(<FeaturedProductsSection />);
      // Products are rendered as Link elements
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ====================================
  // Price Formatting
  // ====================================
  describe("Price Formatting", () => {
    it("formats prices in INR currency", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockProducts,
        isLoading: false,
      });
      render(<FeaturedProductsSection />);
      // Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })
      expect(screen.getAllByText(/₹\s?4,999/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/₹\s?12,500/).length).toBeGreaterThanOrEqual(
        1,
      );
      expect(screen.getAllByText(/₹\s?1,299/).length).toBeGreaterThanOrEqual(1);
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: mockProducts,
        isLoading: false,
      });
    });

    it("uses h2 for section heading", () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it("uses h3 for product titles", () => {
      render(<FeaturedProductsSection />);
      const h3s = screen.getAllByRole("heading", { level: 3 });
      // 3 products × 2 layouts (mobile + desktop) = 6 h3s
      expect(h3s.length).toBeGreaterThanOrEqual(3);
    });

    it("all images have alt text", () => {
      render(<FeaturedProductsSection />);
      screen.getAllByRole("img").forEach((img) => {
        expect(img).toHaveAttribute("alt");
        expect(img.getAttribute("alt")).not.toBe("");
      });
    });
  });
});
