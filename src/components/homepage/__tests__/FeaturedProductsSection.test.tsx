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

    it('renders "View All" button', () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByText("View All")).toBeInTheDocument();
    });

    it("renders all product titles", () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByText("Premium Headphones")).toBeInTheDocument();
      expect(screen.getByText("Vintage Watch")).toBeInTheDocument();
      expect(screen.getByText("Leather Wallet")).toBeInTheDocument();
    });

    it("renders product images with alt text", () => {
      render(<FeaturedProductsSection />);
      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(3);
      expect(images[0]).toHaveAttribute("alt", "Premium Headphones");
    });

    it('renders "Featured" badge for promoted products', () => {
      render(<FeaturedProductsSection />);
      const badges = screen.getAllByText("Featured");
      expect(badges.length).toBe(2); // headphones and wallet are promoted
    });

    it("renders brand name when available", () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByText("SoundMax")).toBeInTheDocument();
      expect(screen.getByText("TimeCraft")).toBeInTheDocument();
    });

    it("renders product cards as clickable buttons", () => {
      render(<FeaturedProductsSection />);
      // 3 product cards + 1 "View All" button
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(4);
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
      expect(screen.getByText(/₹\s?4,999/)).toBeInTheDocument();
      expect(screen.getByText(/₹\s?12,500/)).toBeInTheDocument();
      expect(screen.getByText(/₹\s?1,299/)).toBeInTheDocument();
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
      expect(h3s).toHaveLength(3);
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
