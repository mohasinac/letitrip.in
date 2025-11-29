import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShopCard } from "./ShopCard";

jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

jest.mock("@/components/common/OptimizedImage", () => {
  return ({ alt, src, width, height }: any) => (
    <img alt={alt} src={src} width={width} height={height} />
  );
});

jest.mock("lucide-react", () => ({
  Star: ({ className }: any) => (
    <div data-testid="star-icon" className={className} />
  ),
  MapPin: () => <div data-testid="map-pin-icon" />,
  BadgeCheck: ({ className }: any) => (
    <div data-testid="badge-check-icon" className={className} />
  ),
  ShoppingBag: () => <div data-testid="shopping-bag-icon" />,
}));

jest.mock("@/components/common/FavoriteButton", () => ({
  FavoriteButton: () => <button data-testid="favorite-button">Favorite</button>,
}));

jest.mock("@/lib/formatters", () => ({
  formatCompactNumber: (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  },
}));

const mockShop = {
  id: "shop1",
  name: "Vintage Treasures",
  slug: "vintage-treasures",
  logo: "https://example.com/logo.jpg",
  banner: "https://example.com/banner.jpg",
  description: "Best vintage items in town",
  rating: 4.8,
  reviewCount: 120,
  productCount: 450,
  liveProductCount: 420,
  auctionCount: 15,
  liveAuctionCount: 10,
  location: "Mumbai, India",
  isVerified: true,
  featured: true,
  categories: ["Collectibles", "Antiques"],
};

describe("ShopCard", () => {
  describe("Display", () => {
    it("renders shop name", () => {
      render(<ShopCard {...mockShop} />);
      expect(screen.getByText("Vintage Treasures")).toBeInTheDocument();
    });

    it("renders shop logo", () => {
      render(<ShopCard {...mockShop} />);
      const logo = screen.getByRole("img", { name: "Vintage Treasures" });
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("src", "https://example.com/logo.jpg");
    });

    it("renders shop banner when showBanner is true", () => {
      render(<ShopCard {...mockShop} showBanner={true} />);
      const banner = screen.getByRole("img", {
        name: "Vintage Treasures banner",
      });
      expect(banner).toBeInTheDocument();
    });

    it("hides banner when showBanner is false", () => {
      render(<ShopCard {...mockShop} showBanner={false} />);
      const banner = screen.queryByRole("img", {
        name: "Vintage Treasures banner",
      });
      expect(banner).not.toBeInTheDocument();
    });

    it("renders rating", () => {
      render(<ShopCard {...mockShop} />);
      expect(screen.getAllByText("4.8")[0]).toBeInTheDocument();
    });

    it("renders review count", () => {
      render(<ShopCard {...mockShop} />);
      expect(screen.getAllByText(/reviews/)[0]).toBeInTheDocument();
    });

    it("renders product count", () => {
      render(<ShopCard {...mockShop} />);
      expect(screen.getByText(/450/)).toBeInTheDocument();
    });

    it("renders location when provided", () => {
      render(<ShopCard {...mockShop} />);
      expect(screen.getByText("Mumbai, India")).toBeInTheDocument();
    });

    it("renders description", () => {
      render(<ShopCard {...mockShop} />);
      expect(
        screen.getByText("Best vintage items in town"),
      ).toBeInTheDocument();
    });

    it("links to shop page", () => {
      render(<ShopCard {...mockShop} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/shops/vintage-treasures");
    });
  });

  describe("Badges", () => {
    it("shows verified badge when isVerified is true", () => {
      render(<ShopCard {...mockShop} isVerified={true} />);
      expect(screen.getByTestId("badge-check-icon")).toBeInTheDocument();
    });

    it("hides verified badge when isVerified is false", () => {
      render(<ShopCard {...mockShop} isVerified={false} />);
      expect(screen.queryByTestId("badge-check-icon")).not.toBeInTheDocument();
    });

    it("shows featured badge when featured is true", () => {
      render(<ShopCard {...mockShop} featured={true} />);
      expect(screen.getByText("Featured Shop")).toBeInTheDocument();
    });

    it("hides featured badge when featured is false", () => {
      render(<ShopCard {...mockShop} featured={false} />);
      expect(screen.queryByText("Featured Shop")).not.toBeInTheDocument();
    });
  });

  describe("Follow Button", () => {
    it("renders follow button when onFollow provided", () => {
      const onFollow = jest.fn();
      render(<ShopCard {...mockShop} onFollow={onFollow} />);
      expect(screen.getByText("Follow")).toBeInTheDocument();
    });

    it("calls onFollow when follow button clicked", () => {
      const onFollow = jest.fn();
      render(<ShopCard {...mockShop} onFollow={onFollow} />);

      const followButton = screen.getByText("Follow");
      fireEvent.click(followButton);

      expect(onFollow).toHaveBeenCalledWith("shop1");
    });

    it("shows following state when isFollowing is true", () => {
      const onFollow = jest.fn();
      render(<ShopCard {...mockShop} onFollow={onFollow} isFollowing={true} />);
      expect(screen.getByText("Following")).toBeInTheDocument();
    });

    it("prevents navigation when follow button clicked", () => {
      const onFollow = jest.fn();
      render(<ShopCard {...mockShop} onFollow={onFollow} />);

      const followButton = screen.getByText("Follow");
      const clickEvent = new MouseEvent("click", { bubbles: true });
      const preventDefault = jest.spyOn(clickEvent, "preventDefault");

      fireEvent(followButton, clickEvent);

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe("Favorite Button", () => {
    it("renders favorite button", () => {
      render(<ShopCard {...mockShop} />);
      expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
    });
  });

  describe("Statistics", () => {
    it("shows live product count", () => {
      render(<ShopCard {...mockShop} />);
      expect(screen.getByText(/420/)).toBeInTheDocument();
    });

    it("shows auction count when provided", () => {
      render(<ShopCard {...mockShop} />);
      expect(screen.getByText(/15/)).toBeInTheDocument();
    });

    it("formats large numbers compactly", () => {
      render(<ShopCard {...mockShop} productCount={1500} />);
      expect(screen.getByText(/1\.5k/)).toBeInTheDocument();
    });
  });

  describe("Categories", () => {
    it("renders category tags when provided", () => {
      render(
        <ShopCard {...mockShop} categories={["Collectibles", "Antiques"]} />,
      );
      expect(screen.getByText("Collectibles")).toBeInTheDocument();
      expect(screen.getByText("Antiques")).toBeInTheDocument();
    });

    it("does not render categories when empty", () => {
      render(<ShopCard {...mockShop} categories={[]} />);
      // Categories section should not be present
      expect(screen.queryByText("Collectibles")).not.toBeInTheDocument();
    });
  });

  describe("Compact Mode", () => {
    it("applies compact styles when compact is true", () => {
      render(<ShopCard {...mockShop} compact={true} />);
      // In compact mode, banner is hidden
      const banner = screen.queryByRole("img", {
        name: "Vintage Treasures banner",
      });
      expect(banner).not.toBeInTheDocument();
    });

    it("shows full layout when compact is false", () => {
      render(<ShopCard {...mockShop} compact={false} />);
      const banner = screen.getByRole("img", {
        name: "Vintage Treasures banner",
      });
      expect(banner).toBeInTheDocument();
    });
  });

  describe("Logo Fallback", () => {
    it("shows shopping bag icon when no logo provided", () => {
      const { logo, ...shopWithoutLogo } = mockShop;
      render(<ShopCard {...shopWithoutLogo} />);
      expect(screen.getByTestId("shopping-bag-icon")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("renders without rating", () => {
      const { rating, reviewCount, ...shopWithoutRating } = mockShop;
      render(<ShopCard {...shopWithoutRating} />);
      expect(screen.getByText("Vintage Treasures")).toBeInTheDocument();
      expect(screen.queryByTestId("star-icon")).not.toBeInTheDocument();
    });

    it("renders with zero rating", () => {
      render(<ShopCard {...mockShop} rating={0} />);
      expect(screen.queryByText("0.0")).not.toBeInTheDocument();
    });

    it("renders without location", () => {
      const { location, ...shopWithoutLocation } = mockShop;
      render(<ShopCard {...shopWithoutLocation} />);
      expect(screen.queryByTestId("map-pin-icon")).not.toBeInTheDocument();
    });

    it("renders without description", () => {
      const { description, ...shopWithoutDescription } = mockShop;
      render(<ShopCard {...shopWithoutDescription} />);
      expect(
        screen.queryByText("Best vintage items in town"),
      ).not.toBeInTheDocument();
    });

    it("renders without banner", () => {
      const { banner, ...shopWithoutBanner } = mockShop;
      render(<ShopCard {...shopWithoutBanner} />);
      const bannerImg = screen.queryByRole("img", {
        name: "Vintage Treasures banner",
      });
      expect(bannerImg).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has accessible link", () => {
      render(<ShopCard {...mockShop} />);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("renders verified badge icon", () => {
      render(<ShopCard {...mockShop} isVerified={true} />);
      const badge = screen.getByTestId("badge-check-icon");
      expect(badge).toBeInTheDocument();
    });
  });
});
