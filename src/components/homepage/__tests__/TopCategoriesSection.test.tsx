import { render, screen } from "@testing-library/react";
import { TopCategoriesSection } from "../TopCategoriesSection";

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

const mockCategories = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    display: { coverImage: "/img/electronics.jpg" },
    metrics: { totalItemCount: 1200 },
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    display: { coverImage: "/img/fashion.jpg" },
    metrics: { totalItemCount: 800 },
  },
  {
    id: "3",
    name: "Home & Garden",
    slug: "home-garden",
    metrics: { totalItemCount: 350 },
  },
  {
    id: "4",
    name: "Sports",
    slug: "sports",
    display: { coverImage: "/img/sports.jpg" },
    metrics: { totalItemCount: 450 },
  },
];

describe("TopCategoriesSection", () => {
  beforeEach(() => {
    mockUseApiQuery.mockReset();
  });

  // ====================================
  // Loading State
  // ====================================
  describe("Loading State", () => {
    it("renders loading skeleton when loading", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      const { container } = render(<TopCategoriesSection />);
      expect(
        container.querySelectorAll(".animate-pulse").length,
      ).toBeGreaterThan(0);
    });
  });

  // ====================================
  // No Data State
  // ====================================
  describe("No Data State", () => {
    it("returns null when no categories", () => {
      mockUseApiQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });
      const { container } = render(<TopCategoriesSection />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when categories array is missing", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: false });
      const { container } = render(<TopCategoriesSection />);
      expect(container.innerHTML).toBe("");
    });
  });

  // ====================================
  // Content Rendering
  // ====================================
  describe("Content Rendering", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });
    });

    it('renders "Shop by Category" heading', () => {
      render(<TopCategoriesSection />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Shop by Category",
      );
    });

    it('renders "View All" button', () => {
      render(<TopCategoriesSection />);
      expect(screen.getByText("View All")).toBeInTheDocument();
    });

    it("renders category names", () => {
      render(<TopCategoriesSection />);
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Fashion")).toBeInTheDocument();
      expect(screen.getByText("Home & Garden")).toBeInTheDocument();
      expect(screen.getByText("Sports")).toBeInTheDocument();
    });

    it("renders item counts", () => {
      render(<TopCategoriesSection />);
      expect(screen.getByText("1200 items")).toBeInTheDocument();
      expect(screen.getByText("800 items")).toBeInTheDocument();
      expect(screen.getByText("350 items")).toBeInTheDocument();
      expect(screen.getByText("450 items")).toBeInTheDocument();
    });

    it("renders cover images with alt text when provided", () => {
      render(<TopCategoriesSection />);
      const images = screen.getAllByRole("img");
      // 3 categories with coverImage (Electronics, Fashion, Sports), Home & Garden has gradient fallback
      expect(images).toHaveLength(3);
      expect(images[0]).toHaveAttribute("alt", "Electronics");
    });

    it("renders category cards as clickable buttons", () => {
      render(<TopCategoriesSection />);
      // 4 category cards + 1 "View All" button
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(5);
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });
    });

    it("uses h2 for section heading", () => {
      render(<TopCategoriesSection />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it("uses h3 for category names", () => {
      render(<TopCategoriesSection />);
      const h3s = screen.getAllByRole("heading", { level: 3 });
      expect(h3s).toHaveLength(4);
    });

    it("renders as a section element", () => {
      const { container } = render(<TopCategoriesSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });

  // ====================================
  // Pagination (more than 4 categories)
  // ====================================
  describe("Pagination", () => {
    it("does not show dots when 4 or fewer categories", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });
      render(<TopCategoriesSection />);
      const dotButtons = screen.queryAllByLabelText(/Go to category group/);
      expect(dotButtons).toHaveLength(0);
    });

    it("shows pagination dots when more than 4 categories", () => {
      const manyCategories = [
        ...mockCategories,
        {
          id: "5",
          name: "Books",
          slug: "books",
          metrics: { totalItemCount: 200 },
        },
        { id: "6", name: "Art", slug: "art", metrics: { totalItemCount: 100 } },
      ];
      mockUseApiQuery.mockReturnValue({
        data: manyCategories,
        isLoading: false,
      });
      render(<TopCategoriesSection />);
      const dotButtons = screen.getAllByLabelText(/Go to category group/);
      expect(dotButtons.length).toBeGreaterThan(0);
    });
  });
});
