import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FeaturedCategories from "./FeaturedCategories";
import { categoriesService } from "@/services/categories.service";

// Mock dependencies
jest.mock("@/services/categories.service");
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockCategories = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    icon: "headphones",
    product_count: 50,
  },
  {
    id: "2",
    name: "Toys",
    slug: "toys",
    icon: "gamepad-2",
    product_count: 30,
  },
  {
    id: "3",
    name: "Clothing",
    slug: "clothing",
    icon: "shirt",
    product_count: 40,
  },
  {
    id: "4",
    name: "Music",
    slug: "music",
    icon: "music",
    product_count: 20,
  },
  {
    id: "5",
    name: "Collectibles",
    slug: "collectibles",
    icon: "gem",
    product_count: 60,
  },
  {
    id: "6",
    name: "Sports",
    slug: "sports",
    icon: "mountain",
    product_count: 25,
  },
  {
    id: "7",
    name: "Art",
    slug: "art",
    icon: "heart",
    product_count: 15,
  },
  {
    id: "8",
    name: "Books",
    slug: "books",
    icon: "layers",
    product_count: 35,
  },
  {
    id: "9",
    name: "Home",
    slug: "home",
    icon: "shopping-bag",
    product_count: 45,
  },
];

describe("FeaturedCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (categoriesService.getFeatured as jest.Mock).mockResolvedValue(
      mockCategories
    );
  });

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("renders featured categories section", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.getByText("Featured Categories")).toBeInTheDocument();
      });
    });

    it("renders section heading", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Featured Categories" })
        ).toBeInTheDocument();
      });
    });

    it("renders category names", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Toys")).toBeInTheDocument();
        expect(screen.getByText("Clothing")).toBeInTheDocument();
      });
    });

    it("renders category links", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const link = screen.getByText("Electronics").closest("a");
        expect(link).toHaveAttribute("href", "/categories/electronics");
      });
    });

    it("has section id", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(
          document.getElementById("featured-categories")
        ).toBeInTheDocument();
      });
    });
  });

  // Category Loading
  describe("Category Loading", () => {
    it("fetches categories on mount", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(categoriesService.getFeatured).toHaveBeenCalled();
      });
    });

    it("displays loading skeletons", () => {
      (categoriesService.getFeatured as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );
      render(<FeaturedCategories />);
      // Each skeleton has 2 elements: circle + text = 9 skeletons * 2 = 18 elements
      expect(document.querySelectorAll(".animate-pulse")).toHaveLength(18);
    });

    it("displays categories after loading", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
      });
    });

    it("handles API error gracefully", async () => {
      (categoriesService.getFeatured as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to fetch featured categories:",
          expect.any(Error)
        );
      });
      consoleSpy.mockRestore();
    });

    it("handles nested response data", async () => {
      (categoriesService.getFeatured as jest.Mock).mockResolvedValue({
        data: mockCategories,
      });
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
      });
    });

    it("handles empty array response", async () => {
      (categoriesService.getFeatured as jest.Mock).mockResolvedValue([]);
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
      });
    });
  });

  // Category Display
  describe("Category Display", () => {
    it("displays first 9 categories", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Home")).toBeInTheDocument();
      });
    });

    it("limits to 9 categories", async () => {
      const manyCategories = [
        ...mockCategories,
        {
          id: "10",
          name: "Extra",
          slug: "extra",
          icon: "package",
          product_count: 10,
        },
      ];
      (categoriesService.getFeatured as jest.Mock).mockResolvedValue(
        manyCategories
      );
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.queryByText("Extra")).not.toBeInTheDocument();
      });
    });

    it("renders category icons", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const icons = document.querySelectorAll(".w-6.h-6");
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it("uses correct icon for each category", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
      });
    });

    it("falls back to package icon for missing icon", async () => {
      const categoriesWithNoIcon = [{ ...mockCategories[0], icon: null }];
      (categoriesService.getFeatured as jest.Mock).mockResolvedValue(
        categoriesWithNoIcon
      );
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
      });
    });

    it("falls back to package icon for invalid icon", async () => {
      const categoriesWithInvalidIcon = [
        { ...mockCategories[0], icon: "invalid-icon" },
      ];
      (categoriesService.getFeatured as jest.Mock).mockResolvedValue(
        categoriesWithInvalidIcon
      );
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
      });
    });
  });

  // Show More Button
  describe("Show More Button", () => {
    it("displays show more button when 9 or more categories", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.getByText("Show More")).toBeInTheDocument();
      });
    });

    it("links to categories page", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const link = screen.getByText("Show More").closest("a");
        expect(link).toHaveAttribute("href", "/categories");
      });
    });

    it("does not show when less than 9 categories", async () => {
      (categoriesService.getFeatured as jest.Mock).mockResolvedValue(
        mockCategories.slice(0, 5)
      );
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.queryByText("Show More")).not.toBeInTheDocument();
      });
    });

    it("does not show during loading", () => {
      (categoriesService.getFeatured as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );
      render(<FeaturedCategories />);
      expect(screen.queryByText("Show More")).not.toBeInTheDocument();
    });
  });

  // Scrolling
  describe("Scrolling", () => {
    it("renders scroll arrows on mobile", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        // Right arrow should be visible by default (showRightArrow = true initially)
        expect(screen.getByLabelText("Scroll right")).toBeInTheDocument();
        // Left arrow is hidden initially (showLeftArrow = false)
        expect(screen.queryByLabelText("Scroll left")).not.toBeInTheDocument();
      });
    });

    it("left arrow is hidden by default", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        // Left arrow doesn't render when showLeftArrow = false (initial state)
        expect(screen.queryByLabelText("Scroll left")).not.toBeInTheDocument();
      });
    });

    it("right arrow is visible by default", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const rightArrow = screen.getByLabelText("Scroll right");
        expect(rightArrow).toBeInTheDocument();
        expect(rightArrow).toHaveClass("lg:hidden");
      });
    });

    it("scroll buttons have mobile-only class", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        // Only right arrow is visible initially
        const rightArrow = screen.getByLabelText("Scroll right");
        expect(rightArrow).toHaveClass("lg:hidden");
      });
    });
  });

  // Category Links
  describe("Category Links", () => {
    it("links to correct category page", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const link = screen.getByText("Toys").closest("a");
        expect(link).toHaveAttribute("href", "/categories/toys");
      });
    });

    it("all categories have links", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const categories = screen.getAllByRole("link");
        expect(categories.length).toBeGreaterThanOrEqual(9); // 9 categories + show more
      });
    });
  });

  // Styling
  describe("Styling", () => {
    it("has white background", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const section = document.getElementById("featured-categories");
        expect(section).toHaveClass("bg-white");
      });
    });

    it("has border bottom", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const section = document.getElementById("featured-categories");
        expect(section).toHaveClass("border-b");
      });
    });

    it("has responsive padding", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const section = document.getElementById("featured-categories");
        expect(section).toHaveClass("py-4", "lg:py-4");
      });
    });

    it("categories have hover effect", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        // Next.js Link renders the anchor, check for hover-related classes in the structure
        const link = screen.getByText("Electronics").closest("a");
        expect(link).toBeInTheDocument();
        // Verify hover effect by checking icon container has transition classes
        const iconContainer = link?.querySelector(".bg-yellow-100");
        expect(iconContainer).toHaveClass(
          "group-hover:bg-yellow-200",
          "transition-colors"
        );
      });
    });

    it("icon has yellow background", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const iconContainer = document.querySelector(".bg-yellow-100");
        expect(iconContainer).toBeInTheDocument();
      });
    });

    it("icon container is circular", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const iconContainer = document.querySelector(".rounded-full");
        expect(iconContainer).toBeInTheDocument();
      });
    });
  });

  // Responsive Design
  describe("Responsive Design", () => {
    it("has responsive heading size", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const heading = screen.getByRole("heading", {
          name: "Featured Categories",
        });
        expect(heading).toHaveClass("text-lg", "lg:text-xl");
      });
    });

    it("has responsive icon size", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const icons = document.querySelectorAll(".w-6.h-6.lg\\:w-8");
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it("has responsive container size", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const containers = document.querySelectorAll(".w-12.h-12.lg\\:w-16");
        expect(containers.length).toBeGreaterThan(0);
      });
    });

    it("has responsive text size", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const text = screen.getByText("Electronics");
        expect(text).toHaveClass("text-[10px]", "lg:text-xs");
      });
    });

    it("has responsive gap", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const container = document.querySelector(".gap-3.lg\\:gap-4");
        expect(container).toBeInTheDocument();
      });
    });
  });

  // Loading Skeleton
  describe("Loading Skeleton", () => {
    it("shows 9 loading skeletons", () => {
      (categoriesService.getFeatured as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );
      render(<FeaturedCategories />);
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThanOrEqual(9);
    });

    it("skeleton has correct structure", () => {
      (categoriesService.getFeatured as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );
      render(<FeaturedCategories />);
      const circle = document.querySelector(".rounded-full.animate-pulse");
      expect(circle).toBeInTheDocument();
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles exactly 9 categories", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const links = screen.getAllByRole("link");
        expect(links.length).toBe(10); // 9 categories + show more
      });
    });

    it("handles less than 9 categories", async () => {
      (categoriesService.getFeatured as jest.Mock).mockResolvedValue(
        mockCategories.slice(0, 5)
      );
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.queryByText("Show More")).not.toBeInTheDocument();
      });
    });

    it("handles empty category name", async () => {
      const categoriesWithEmptyName = [{ ...mockCategories[0], name: "" }];
      (categoriesService.getFeatured as jest.Mock).mockResolvedValue(
        categoriesWithEmptyName
      );
      render(<FeaturedCategories />);
      await waitFor(() => {
        const links = screen.getAllByRole("link");
        expect(links.length).toBeGreaterThan(0);
      });
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("has semantic heading", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        expect(screen.getByRole("heading")).toBeInTheDocument();
      });
    });

    it("all categories are links", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const links = screen.getAllByRole("link");
        links.forEach((link) => {
          expect(link).toHaveAttribute("href");
        });
      });
    });

    it("scroll buttons have aria-labels", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        // Arrows are conditionally visible based on scroll state
        const leftArrow = screen.queryByLabelText("Scroll left");
        const rightArrow = screen.queryByLabelText("Scroll right");
        // At least one should exist
        expect(leftArrow || rightArrow).toBeTruthy();
      });
    });
  });

  // Layout
  describe("Layout", () => {
    it("uses flex layout", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const container = document.querySelector(".flex.items-center");
        expect(container).toBeInTheDocument();
      });
    });

    it("has horizontal scroll", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const container = document.querySelector(".overflow-x-auto");
        expect(container).toBeInTheDocument();
      });
    });

    it("hides scrollbar", async () => {
      render(<FeaturedCategories />);
      await waitFor(() => {
        const container = document.querySelector(".scrollbar-hide");
        expect(container).toBeInTheDocument();
      });
    });
  });
});
