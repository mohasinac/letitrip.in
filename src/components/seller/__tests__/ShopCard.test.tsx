import { fireEvent, render, screen } from "@testing-library/react";
import ShopCard from "../ShopCard";

// Mock dependencies
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock("@/components/common/OptimizedImage", () => ({
  __esModule: true,
  default: ({ src, alt, className, width, height, fill, objectFit }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      data-fill={fill}
      data-object-fit={objectFit}
    />
  ),
}));

const mockShop = {
  id: "shop-1",
  name: "Test Shop",
  slug: "test-shop",
  description: "This is a test shop description",
  logo: "/logos/test-shop.jpg",
  isVerified: true,
  featured: true,
  isBanned: false,
  productCount: 25,
  rating: 4.5,
  reviewCount: 120,
};

describe("ShopCard", () => {
  describe("Compact Variant", () => {
    it("renders in compact mode", () => {
      render(<ShopCard shop={mockShop} variant="compact" />);
      expect(screen.getByText("Test Shop")).toBeInTheDocument();
      expect(screen.getByText("@test-shop")).toBeInTheDocument();
    });

    it("renders as a link in compact mode", () => {
      const { container } = render(
        <ShopCard shop={mockShop} variant="compact" />
      );
      const link = container.querySelector("a");
      expect(link).toHaveAttribute("href", "/seller/my-shops/test-shop");
    });

    it("displays shop logo in compact mode", () => {
      render(<ShopCard shop={mockShop} variant="compact" />);
      const logo = screen.getByAltText("Test Shop");
      expect(logo).toHaveAttribute("src", "/logos/test-shop.jpg");
      expect(logo).toHaveAttribute("width", "48");
      expect(logo).toHaveAttribute("height", "48");
    });

    it("displays gradient fallback when no logo in compact mode", () => {
      const noLogoShop = { ...mockShop, logo: null };
      const { container } = render(
        <ShopCard shop={noLogoShop} variant="compact" />
      );
      const gradientDiv = container.querySelector(".from-blue-500");
      expect(gradientDiv).toBeInTheDocument();
      expect(gradientDiv?.querySelector("svg")).toBeInTheDocument(); // Store icon
    });

    it("displays verified badge in compact mode", () => {
      render(<ShopCard shop={mockShop} variant="compact" />);
      const checkIcon = screen
        .getByText("Test Shop")
        .parentElement?.querySelector("svg");
      expect(checkIcon).toBeInTheDocument();
    });

    it("does not show actions in compact mode", () => {
      render(<ShopCard shop={mockShop} variant="compact" />);
      expect(screen.queryByText("View")).not.toBeInTheDocument();
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });

    it("truncates long shop name in compact mode", () => {
      render(<ShopCard shop={mockShop} variant="compact" />);
      const shopName = screen.getByText("Test Shop");
      expect(shopName).toHaveClass("truncate");
    });

    it("applies dark mode classes in compact mode", () => {
      const { container } = render(
        <ShopCard shop={mockShop} variant="compact" />
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });
  });

  describe("Default Variant - Rendering", () => {
    it("renders shop name", () => {
      render(<ShopCard shop={mockShop} />);
      expect(screen.getByText("Test Shop")).toBeInTheDocument();
    });

    it("renders shop slug", () => {
      render(<ShopCard shop={mockShop} />);
      expect(screen.getByText("@test-shop")).toBeInTheDocument();
    });

    it("renders shop description", () => {
      render(<ShopCard shop={mockShop} />);
      expect(
        screen.getByText("This is a test shop description")
      ).toBeInTheDocument();
    });

    it("does not render description when missing", () => {
      const noDescShop = { ...mockShop, description: undefined };
      render(<ShopCard shop={noDescShop} />);
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it("renders shop logo", () => {
      render(<ShopCard shop={mockShop} />);
      const logo = screen.getByAltText("Test Shop");
      expect(logo).toHaveAttribute("src", "/logos/test-shop.jpg");
      expect(logo).toHaveAttribute("data-fill", "true");
    });

    it("displays gradient background when no logo", () => {
      const noLogoShop = { ...mockShop, logo: null };
      const { container } = render(<ShopCard shop={noLogoShop} />);
      const gradient = container.querySelector(".from-blue-500.to-purple-600");
      expect(gradient).toBeInTheDocument();
    });
  });

  describe("Status Badges", () => {
    it("displays verified badge", () => {
      render(<ShopCard shop={mockShop} />);
      expect(screen.getByText("Verified")).toBeInTheDocument();
    });

    it("does not display verified badge when not verified", () => {
      const unverifiedShop = { ...mockShop, isVerified: false };
      render(<ShopCard shop={unverifiedShop} />);
      expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    });

    it("displays featured badge", () => {
      render(<ShopCard shop={mockShop} />);
      expect(screen.getByText("Featured")).toBeInTheDocument();
    });

    it("does not display featured badge when not featured", () => {
      const unfeaturedShop = { ...mockShop, featured: false };
      render(<ShopCard shop={unfeaturedShop} />);
      expect(screen.queryByText("Featured")).not.toBeInTheDocument();
    });

    it("displays banned badge", () => {
      const bannedShop = { ...mockShop, isBanned: true };
      render(<ShopCard shop={bannedShop} />);
      expect(screen.getByText("Banned")).toBeInTheDocument();
    });

    it("does not display banned badge when not banned", () => {
      render(<ShopCard shop={mockShop} />);
      expect(screen.queryByText("Banned")).not.toBeInTheDocument();
    });

    it("displays multiple badges simultaneously", () => {
      render(<ShopCard shop={mockShop} />);
      expect(screen.getByText("Verified")).toBeInTheDocument();
      expect(screen.getByText("Featured")).toBeInTheDocument();
    });

    it("applies correct badge colors", () => {
      render(<ShopCard shop={mockShop} />);
      const verifiedBadge = screen.getByText("Verified").closest("span");
      const featuredBadge = screen.getByText("Featured").closest("span");

      expect(verifiedBadge?.className).toContain("bg-blue-100");
      expect(verifiedBadge?.className).toContain("text-blue-700");
      expect(featuredBadge?.className).toContain("bg-purple-100");
      expect(featuredBadge?.className).toContain("text-purple-700");
    });
  });

  describe("Shop Stats", () => {
    it("displays product count", () => {
      render(<ShopCard shop={mockShop} />);
      expect(screen.getByText("25 products")).toBeInTheDocument();
    });

    it("displays zero when no products", () => {
      const noProductsShop = { ...mockShop, productCount: undefined };
      render(<ShopCard shop={noProductsShop} />);
      expect(screen.getByText("0 products")).toBeInTheDocument();
    });

    it("displays rating", () => {
      render(<ShopCard shop={mockShop} />);
      expect(screen.getByText(/4\.5/)).toBeInTheDocument();
    });

    it("displays review count with rating", () => {
      render(<ShopCard shop={mockShop} />);
      expect(screen.getByText(/\(120\)/)).toBeInTheDocument();
    });

    it("does not display rating when zero", () => {
      const noRatingShop = { ...mockShop, rating: 0 };
      render(<ShopCard shop={noRatingShop} />);
      expect(screen.queryByText(/0\.0/)).not.toBeInTheDocument();
    });

    it("does not display rating when undefined", () => {
      const noRatingShop = { ...mockShop, rating: undefined };
      render(<ShopCard shop={noRatingShop} />);
      expect(screen.getByText("25 products")).toBeInTheDocument();
      // Should not have star icon indicating rating
      expect(screen.queryByText(/\(120\)/)).not.toBeInTheDocument();
    });

    it("formats rating to one decimal place", () => {
      const preciseRatingShop = { ...mockShop, rating: 4.567 };
      render(<ShopCard shop={preciseRatingShop} />);
      expect(screen.getByText(/4\.6/)).toBeInTheDocument();
    });
  });

  describe("Actions Menu", () => {
    it("does not show menu by default", () => {
      render(<ShopCard shop={mockShop} />);
      expect(screen.queryByText("View Dashboard")).not.toBeInTheDocument();
    });

    it("shows menu when more button clicked", () => {
      const { container } = render(<ShopCard shop={mockShop} />);
      const moreButton = container.querySelector("button");
      fireEvent.click(moreButton!);
      expect(screen.getByText("View Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Edit Shop")).toBeInTheDocument();
      expect(screen.getByText("Analytics")).toBeInTheDocument();
    });

    it("closes menu when backdrop clicked", () => {
      const { container } = render(<ShopCard shop={mockShop} />);
      const moreButton = container.querySelector("button");
      fireEvent.click(moreButton!);
      expect(screen.getByText("View Dashboard")).toBeInTheDocument();

      const backdrop = container.querySelector(".fixed.inset-0");
      fireEvent.click(backdrop!);
      expect(screen.queryByText("View Dashboard")).not.toBeInTheDocument();
    });

    it("closes menu when Escape key pressed", () => {
      const { container } = render(<ShopCard shop={mockShop} />);
      const moreButton = container.querySelector("button");
      fireEvent.click(moreButton!);

      const backdrop = container.querySelector(".fixed.inset-0");
      fireEvent.keyDown(backdrop!, { key: "Escape" });
      expect(screen.queryByText("View Dashboard")).not.toBeInTheDocument();
    });

    it("toggles menu open and closed", () => {
      const { container } = render(<ShopCard shop={mockShop} />);
      const moreButton = container.querySelector("button");

      fireEvent.click(moreButton!);
      expect(screen.getByText("View Dashboard")).toBeInTheDocument();

      fireEvent.click(moreButton!);
      expect(screen.queryByText("View Dashboard")).not.toBeInTheDocument();
    });

    it("menu links have correct hrefs", () => {
      const { container } = render(<ShopCard shop={mockShop} />);
      const moreButton = container.querySelector("button");
      fireEvent.click(moreButton!);

      const viewLink = screen.getByText("View Dashboard").closest("a");
      const editLink = screen.getByText("Edit Shop").closest("a");
      const analyticsLink = screen.getByText("Analytics").closest("a");

      expect(viewLink).toHaveAttribute("href", "/seller/my-shops/test-shop");
      expect(editLink).toHaveAttribute(
        "href",
        "/seller/my-shops/test-shop/edit"
      );
      expect(analyticsLink).toHaveAttribute(
        "href",
        "/seller/my-shops/test-shop/analytics"
      );
    });

    it("does not render menu when showActions is false", () => {
      const { container } = render(
        <ShopCard shop={mockShop} showActions={false} />
      );
      expect(container.querySelector("button")).not.toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("renders View and Edit buttons", () => {
      render(<ShopCard shop={mockShop} />);
      const viewButtons = screen.getAllByText("View");
      const editButtons = screen.getAllByText("Edit");
      expect(viewButtons.length).toBeGreaterThan(0);
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it("View button links to shop dashboard", () => {
      render(<ShopCard shop={mockShop} />);
      const viewButtons = screen.getAllByText("View");
      const viewButton = viewButtons
        .find((btn) => !btn.closest(".absolute"))
        ?.closest("a");
      expect(viewButton).toHaveAttribute("href", "/seller/my-shops/test-shop");
    });

    it("Edit button links to shop edit page", () => {
      render(<ShopCard shop={mockShop} />);
      const editButtons = screen.getAllByText("Edit");
      const editButton = editButtons
        .find((btn) => !btn.closest(".absolute"))
        ?.closest("a");
      expect(editButton).toHaveAttribute(
        "href",
        "/seller/my-shops/test-shop/edit"
      );
    });

    it("does not render action buttons when showActions is false", () => {
      render(<ShopCard shop={mockShop} showActions={false} />);
      // Check that View and Edit buttons are not present
      const viewButtons = screen.queryAllByText("View");
      const editButtons = screen.queryAllByText("Edit");
      expect(viewButtons.length).toBe(0);
      expect(editButtons.length).toBe(0);
    });

    it("Edit button has primary styling", () => {
      render(<ShopCard shop={mockShop} />);
      const editButtons = screen.getAllByText("Edit");
      const mainEditButton = editButtons
        .find((btn) => !btn.closest(".absolute"))
        ?.closest("a");
      expect(mainEditButton?.className).toContain("bg-blue-600");
      expect(mainEditButton?.className).toContain("text-white");
    });

    it("View button has secondary styling", () => {
      render(<ShopCard shop={mockShop} />);
      const viewButtons = screen.getAllByText("View");
      const mainViewButton = viewButtons
        .find((btn) => !btn.closest(".absolute"))
        ?.closest("a");
      expect(mainViewButton?.className).toContain("border-gray-300");
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to card", () => {
      const { container } = render(<ShopCard shop={mockShop} />);
      const card = container.querySelector(".bg-white");
      expect(card).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });

    it("applies dark mode classes to text", () => {
      render(<ShopCard shop={mockShop} />);
      const shopName = screen.getByText("Test Shop");
      expect(shopName).toHaveClass("dark:text-white");
    });

    it("applies dark mode classes to badges", () => {
      render(<ShopCard shop={mockShop} />);
      const verifiedBadge = screen.getByText("Verified").closest("span");
      expect(verifiedBadge?.className).toContain("dark:bg-blue-900/50");
      expect(verifiedBadge?.className).toContain("dark:text-blue-300");
    });
  });

  describe("Responsive Design", () => {
    it("truncates shop name", () => {
      render(<ShopCard shop={mockShop} />);
      const shopName = screen.getByText("Test Shop");
      expect(shopName).toHaveClass("truncate");
    });

    it("applies line-clamp to description", () => {
      render(<ShopCard shop={mockShop} />);
      const description = screen.getByText("This is a test shop description");
      expect(description).toHaveClass("line-clamp-2");
    });

    it("uses flex layout for action buttons", () => {
      const { container } = render(<ShopCard shop={mockShop} />);
      const buttonContainer = container.querySelector(".flex.gap-2");
      const buttons = buttonContainer?.querySelectorAll("a");
      buttons?.forEach((btn) => {
        expect(btn).toHaveClass("flex-1");
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles missing optional fields", () => {
      const minimalShop = {
        id: "shop-2",
        name: "Minimal Shop",
        slug: "minimal-shop",
        logo: null,
        isVerified: false,
        featured: false,
        isBanned: false,
      };
      render(<ShopCard shop={minimalShop} />);
      expect(screen.getByText("Minimal Shop")).toBeInTheDocument();
      expect(screen.getByText("0 products")).toBeInTheDocument();
    });

    it("handles very long description", () => {
      const longDescShop = {
        ...mockShop,
        description:
          "This is a very long description that should be clamped to two lines using the line-clamp-2 utility class for proper display",
      };
      render(<ShopCard shop={longDescShop} />);
      const description = screen.getByText(/very long description/);
      expect(description).toHaveClass("line-clamp-2");
    });

    it("handles very long shop name", () => {
      const longNameShop = {
        ...mockShop,
        name: "This is a very long shop name that should be truncated",
      };
      render(<ShopCard shop={longNameShop} />);
      const shopName = screen.getByText(
        "This is a very long shop name that should be truncated"
      );
      expect(shopName).toHaveClass("truncate");
    });
  });
});
