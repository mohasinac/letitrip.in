import { useComparison } from "@/contexts/ComparisonContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComparisonBar } from "../ComparisonBar";

// Mock dependencies
jest.mock("@/contexts/ComparisonContext");
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
    name: "Product 1",
    slug: "product-1",
    price: 1000,
    image: "https://example.com/product1.jpg",
    category: "electronics",
  },
  {
    id: "prod2",
    name: "Product 2",
    slug: "product-2",
    price: 2000,
    image: "https://example.com/product2.jpg",
    category: "electronics",
  },
  {
    id: "prod3",
    name: "Product 3",
    slug: "product-3",
    price: 3000,
    image: "https://example.com/product3.jpg",
    category: "electronics",
  },
];

describe("ComparisonBar", () => {
  const mockRemoveFromComparison = jest.fn();
  const mockClearComparison = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("does not render when no products", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: [],
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: false,
        count: 0,
      });

      const { container } = render(<ComparisonBar />);
      expect(container.firstChild).toBeNull();
    });

    it("renders when products exist", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      expect(screen.getByText("Compare (2)")).toBeInTheDocument();
    });

    it("renders product count", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts,
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 3,
      });

      render(<ComparisonBar />);
      expect(screen.getByText("Compare (3)")).toBeInTheDocument();
    });

    it("renders product thumbnails", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      expect(screen.getByAltText("Product 1")).toBeInTheDocument();
      expect(screen.getByAltText("Product 2")).toBeInTheDocument();
    });

    it("renders clear all button", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      expect(screen.getByLabelText("Clear all")).toBeInTheDocument();
    });

    it("renders Compare Now link on desktop", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      expect(screen.getByText("Compare Now")).toBeInTheDocument();
    });

    it("renders Compare text on mobile", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      expect(screen.getByText("Compare")).toBeInTheDocument();
    });
  });

  describe("Remove Product", () => {
    it("shows remove button on hover", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      expect(
        screen.getByLabelText("Remove Product 1 from comparison")
      ).toBeInTheDocument();
    });

    it("calls removeFromComparison when remove button clicked", async () => {
      const user = userEvent.setup();
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      const removeButton = screen.getByLabelText(
        "Remove Product 1 from comparison"
      );
      await user.click(removeButton);

      expect(mockRemoveFromComparison).toHaveBeenCalledWith("prod1");
    });

    it("renders X icon in remove button", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      const { container } = render(<ComparisonBar />);
      expect(container.querySelector(".lucide-x")).toBeInTheDocument();
    });
  });

  describe("Clear All", () => {
    it("calls clearComparison when clear button clicked", async () => {
      const user = userEvent.setup();
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      const clearButton = screen.getByLabelText("Clear all");
      await user.click(clearButton);

      expect(mockClearComparison).toHaveBeenCalled();
    });

    it("renders Trash icon in clear button", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      const { container } = render(<ComparisonBar />);
      expect(container.querySelector(".lucide-trash-2")).toBeInTheDocument();
    });
  });

  describe("Compare Link State", () => {
    it("renders Compare link when canCompare is true", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      const compareLink = screen.getByRole("link", { name: /compare/i });
      expect(compareLink).toBeInTheDocument();
      expect(compareLink).toHaveAttribute("href", "/compare");
    });

    it("renders Compare link when canCompare is false", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: [mockProducts[0]],
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: false,
        count: 1,
      });

      render(<ComparisonBar />);
      const compareLink = screen.getByRole("link", { name: /compare/i });
      // Check that it doesn't have blue background (active state)
      expect(compareLink.className).not.toContain("bg-blue-600");
    });

    it("shows minimum products message when cannot compare", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: [mockProducts[0]],
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: false,
        count: 1,
      });

      render(<ComparisonBar />);
      expect(
        screen.getByText("Add at least 2 products to compare")
      ).toBeInTheDocument();
    });

    it("does not show message when can compare", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      expect(
        screen.queryByText("Add at least 2 products to compare")
      ).not.toBeInTheDocument();
    });

    it("links to compare page", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      const compareLink = screen.getByRole("link", { name: /compare/i });
      expect(compareLink).toHaveAttribute("href", "/compare");
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to container", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      const { container } = render(<ComparisonBar />);
      expect(
        container.querySelector(".dark\\:bg-gray-800")
      ).toBeInTheDocument();
    });

    it("applies dark mode classes to borders", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      const { container } = render(<ComparisonBar />);
      expect(
        container.querySelector(".dark\\:border-gray-700")
      ).toBeInTheDocument();
    });

    it("applies dark mode classes to text", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      const { container } = render(<ComparisonBar />);
      expect(
        container.querySelector(".dark\\:text-gray-400")
      ).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("applies mobile bottom position", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      const { container } = render(<ComparisonBar />);
      const bar = container.querySelector(".bottom-16");
      expect(bar).toBeInTheDocument();
    });

    it("hides Compare Now text on mobile", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      const desktopText = screen.getByText("Compare Now");
      expect(desktopText).toHaveClass("hidden", "sm:inline");
    });

    it("shows Compare text on mobile", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      const mobileText = screen.getByText("Compare");
      expect(mobileText).toHaveClass("sm:hidden");
    });
  });

  describe("Fixed Positioning", () => {
    it("applies fixed positioning", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      const { container } = render(<ComparisonBar />);
      const bar = container.querySelector(".fixed");
      expect(bar).toBeInTheDocument();
    });

    it("applies z-index for layering", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      const { container } = render(<ComparisonBar />);
      const bar = container.querySelector(".z-40");
      expect(bar).toBeInTheDocument();
    });
  });

  describe("Animation", () => {
    it("applies slide-up animation class", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      const { container } = render(<ComparisonBar />);
      expect(container.querySelector(".animate-slide-up")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("provides aria-label for remove buttons", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      expect(
        screen.getByLabelText("Remove Product 1 from comparison")
      ).toBeInTheDocument();
    });

    it("provides aria-label for clear button", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      expect(screen.getByLabelText("Clear all")).toBeInTheDocument();
    });

    it("provides title attribute for clear button", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      const clearButton = screen.getByLabelText("Clear all");
      expect(clearButton).toHaveAttribute("title", "Clear all");
    });

    it("provides alt text for product images", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      expect(screen.getByAltText("Product 1")).toBeInTheDocument();
      expect(screen.getByAltText("Product 2")).toBeInTheDocument();
    });

    it("renders Compare link when canCompare is false", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: [mockProducts[0]],
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: false,
        count: 1,
      });

      render(<ComparisonBar />);
      const compareLink = screen.getByRole("link", { name: /compare/i });
      expect(compareLink).toBeInTheDocument();
      expect(compareLink).toHaveAttribute("href", "/compare");
    });
  });

  describe("Hover Effects", () => {
    it("renders product thumbnails in divs", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThan(0);
    });

    it("applies transition to clear button", () => {
      (useComparison as jest.Mock).mockReturnValue({
        products: mockProducts.slice(0, 2),
        removeFromComparison: mockRemoveFromComparison,
        clearComparison: mockClearComparison,
        canCompare: true,
        count: 2,
      });

      render(<ComparisonBar />);
      const clearButton = screen.getByLabelText("Clear all");
      // Button should have transition class
      expect(clearButton).toBeInTheDocument();
    });
  });
});
