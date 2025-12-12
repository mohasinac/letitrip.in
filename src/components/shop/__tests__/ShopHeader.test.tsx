import { logError } from "@/lib/firebase-error-logger";
import { shopsService } from "@/services/shops.service";
import type { ShopFE } from "@/types/frontend/shop.types";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { ShopHeader } from "../ShopHeader";

// Mock dependencies
jest.mock("sonner");
jest.mock("@/services/shops.service");
jest.mock("@/lib/firebase-error-logger");
jest.mock("@/components/common/OptimizedImage", () => ({
  __esModule: true,
  default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}));
jest.mock("@/components/common/values/DateDisplay", () => ({
  DateDisplay: ({ date, className }: any) => (
    <span className={className}>{new Date(date).toLocaleDateString()}</span>
  ),
}));

const mockShop: ShopFE = {
  id: "shop123",
  slug: "test-shop",
  name: "Test Shop",
  description: "A great shop",
  logo: "https://example.com/logo.jpg",
  banner: "https://example.com/banner.jpg",
  rating: 4.5,
  reviewCount: 100,
  productCount: 50,
  city: "Mumbai",
  state: "Maharashtra",
  isVerified: true,
  createdAt: new Date("2023-01-15").toISOString(),
  updatedAt: new Date("2023-01-15").toISOString(),
  ownerId: "owner123",
  categories: [],
  status: "active",
  email: "test@shop.com",
  phone: "+919876543210",
};

describe("ShopHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (shopsService.checkFollowing as jest.Mock).mockResolvedValue({
      isFollowing: false,
    });
  });

  describe("Rendering", () => {
    it("renders shop banner when provided", () => {
      render(<ShopHeader shop={mockShop} />);
      const banner = screen.getByAltText("Test Shop banner");
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveAttribute("src", mockShop.banner);
    });

    it("does not render banner section when banner is missing", () => {
      const shopWithoutBanner = { ...mockShop, banner: undefined };
      render(<ShopHeader shop={shopWithoutBanner} />);
      expect(screen.queryByAltText(/banner/i)).not.toBeInTheDocument();
    });

    it("renders shop logo when provided", () => {
      render(<ShopHeader shop={mockShop} />);
      const logo = screen.getByAltText("Test Shop");
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("src", mockShop.logo);
    });

    it("renders fallback logo with first letter when logo is missing", () => {
      const shopWithoutLogo = { ...mockShop, logo: undefined };
      render(<ShopHeader shop={shopWithoutLogo} />);
      expect(screen.getByText("T")).toBeInTheDocument();
    });

    it("renders shop name as heading", () => {
      render(<ShopHeader shop={mockShop} />);
      expect(
        screen.getByRole("heading", { name: "Test Shop" })
      ).toBeInTheDocument();
    });

    it("renders rating and review count when rating > 0", () => {
      render(<ShopHeader shop={mockShop} />);
      expect(screen.getByText("4.5")).toBeInTheDocument();
      expect(screen.getByText("(100 reviews)")).toBeInTheDocument();
    });

    it("does not render rating section when rating is 0", () => {
      const shopWithoutRating = { ...mockShop, rating: 0 };
      render(<ShopHeader shop={shopWithoutRating} />);
      expect(screen.queryByText(/reviews/i)).not.toBeInTheDocument();
    });

    it("renders location when city and state are provided", () => {
      render(<ShopHeader shop={mockShop} />);
      expect(screen.getByText("Mumbai, Maharashtra")).toBeInTheDocument();
    });

    it("renders only city when state is missing", () => {
      const shopWithCityOnly = { ...mockShop, state: undefined };
      render(<ShopHeader shop={shopWithCityOnly} />);
      expect(screen.getByText("Mumbai")).toBeInTheDocument();
    });

    it("renders verified badge when shop is verified", () => {
      render(<ShopHeader shop={mockShop} />);
      expect(screen.getByText("Verified Seller")).toBeInTheDocument();
    });

    it("does not render verified badge when shop is not verified", () => {
      const unverifiedShop = { ...mockShop, isVerified: false };
      render(<ShopHeader shop={unverifiedShop} />);
      expect(screen.queryByText("Verified Seller")).not.toBeInTheDocument();
    });

    it("renders product count", () => {
      render(<ShopHeader shop={mockShop} />);
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
    });

    it("renders product count as 0 when productCount is missing", () => {
      const shopWithoutProducts = { ...mockShop, productCount: undefined };
      render(<ShopHeader shop={shopWithoutProducts} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("renders joined date when createdAt is provided", () => {
      render(<ShopHeader shop={mockShop} />);
      expect(screen.getByText("Joined")).toBeInTheDocument();
      // The DateDisplay component formats the date, just check it exists
      const dateElement = screen
        .getByText("Joined")
        .parentElement?.querySelector("span");
      expect(dateElement).toBeInTheDocument();
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to main container", () => {
      const { container } = render(<ShopHeader shop={mockShop} />);
      const mainDiv = container.querySelector(".dark\\:bg-gray-900");
      expect(mainDiv).toBeInTheDocument();
    });

    it("applies dark mode classes to text elements", () => {
      const { container } = render(<ShopHeader shop={mockShop} />);
      const heading = screen.getByRole("heading", { name: "Test Shop" });
      expect(heading.className).toContain("dark:text-white");
    });

    it("applies dark mode classes to border elements", () => {
      const { container } = render(<ShopHeader shop={mockShop} />);
      const border = container.querySelector(".dark\\:border-gray-700");
      expect(border).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive flex direction classes", () => {
      const { container } = render(<ShopHeader shop={mockShop} />);
      const flexContainer = container.querySelector(".md\\:flex-row");
      expect(flexContainer).toBeInTheDocument();
    });

    it("applies responsive height to banner", () => {
      const { container } = render(<ShopHeader shop={mockShop} />);
      const bannerContainer = container.querySelector(".md\\:h-64");
      expect(bannerContainer).toBeInTheDocument();
    });

    it("applies responsive gap classes", () => {
      const { container } = render(<ShopHeader shop={mockShop} />);
      const gapContainer = container.querySelector(".gap-6");
      expect(gapContainer).toBeInTheDocument();
    });
  });

  describe("Follow Functionality", () => {
    it("checks follow status on mount", async () => {
      render(<ShopHeader shop={mockShop} />);
      await waitFor(() => {
        expect(shopsService.checkFollowing).toHaveBeenCalledWith("test-shop");
      });
    });

    it("displays loading state while checking follow status", () => {
      render(<ShopHeader shop={mockShop} />);
      expect(screen.getByText("...")).toBeInTheDocument();
    });

    it("displays Follow button when not following", async () => {
      (shopsService.checkFollowing as jest.Mock).mockResolvedValue({
        isFollowing: false,
      });
      render(<ShopHeader shop={mockShop} />);
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /follow/i })
        ).toHaveTextContent("Follow");
      });
    });

    it("displays Following button when already following", async () => {
      (shopsService.checkFollowing as jest.Mock).mockResolvedValue({
        isFollowing: true,
      });
      render(<ShopHeader shop={mockShop} />);
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /following/i })
        ).toBeInTheDocument();
      });
    });

    it("handles follow action successfully", async () => {
      const user = userEvent.setup();
      (shopsService.follow as jest.Mock).mockResolvedValue({});
      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const followButton = screen.getByRole("button", { name: /follow/i });
      await user.click(followButton);

      await waitFor(() => {
        expect(shopsService.follow).toHaveBeenCalledWith("test-shop");
      });
    });

    it("handles unfollow action successfully", async () => {
      const user = userEvent.setup();
      (shopsService.checkFollowing as jest.Mock).mockResolvedValue({
        isFollowing: true,
      });
      (shopsService.unfollow as jest.Mock).mockResolvedValue({});
      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Following")).toBeInTheDocument();
      });

      const followButton = screen.getByRole("button", { name: /following/i });
      await user.click(followButton);

      await waitFor(() => {
        expect(shopsService.unfollow).toHaveBeenCalledWith("test-shop");
      });
    });

    it("shows error toast when follow fails", async () => {
      const user = userEvent.setup();
      const error = new Error("Please login to follow shops");
      (shopsService.follow as jest.Mock).mockRejectedValue(error);
      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const followButton = screen.getByRole("button", { name: /follow/i });
      await user.click(followButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Please login to follow shops"
        );
        expect(logError).toHaveBeenCalled();
      });
    });

    it("disables follow button during loading", async () => {
      const user = userEvent.setup();
      (shopsService.follow as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const followButton = screen.getByRole("button", { name: /follow/i });
      await user.click(followButton);

      expect(followButton).toBeDisabled();
    });

    it("defaults to not following when check fails", async () => {
      (shopsService.checkFollowing as jest.Mock).mockRejectedValue(
        new Error("Not authenticated")
      );
      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });
    });
  });

  describe("Share Functionality", () => {
    it("renders share button", async () => {
      render(<ShopHeader shop={mockShop} />);
      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });
      const shareButtons = screen.getAllByRole("button");
      const shareButton = shareButtons.find((btn) =>
        btn.querySelector(".lucide-share-2")
      );
      expect(shareButton).toBeInTheDocument();
    });

    it("uses native share API when available", async () => {
      const user = userEvent.setup();
      const mockShare = jest.fn().mockResolvedValue(undefined);

      Object.defineProperty(navigator, "share", {
        value: mockShare,
        writable: true,
        configurable: true,
      });

      render(<ShopHeader shop={mockShop} />);
      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const shareButtons = screen.getAllByRole("button");
      const shareButton = shareButtons.find((btn) =>
        btn.querySelector(".lucide-share-2")
      );
      await user.click(shareButton!);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: "Test Shop",
          url: expect.any(String),
        });
      });
    });

    it("falls back to clipboard when share API not available", async () => {
      const user = userEvent.setup();
      const mockWriteText = jest.fn().mockResolvedValue(undefined);

      // Ensure share API is undefined
      Object.defineProperty(navigator, "share", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      render(<ShopHeader shop={mockShop} />);
      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const shareButtons = screen.getAllByRole("button");
      const shareButton = shareButtons.find((btn) =>
        btn.querySelector(".lucide-share-2")
      );
      await user.click(shareButton!);

      expect(mockWriteText).toHaveBeenCalledWith(expect.any(String));
      expect(toast.success).toHaveBeenCalledWith("Link copied to clipboard!");
    });

    it("logs error when share fails", async () => {
      const user = userEvent.setup();
      const error = new Error("Share failed");
      const mockShare = jest.fn().mockRejectedValue(error);

      Object.defineProperty(navigator, "share", {
        value: mockShare,
        writable: true,
        configurable: true,
      });

      render(<ShopHeader shop={mockShop} />);
      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const shareButtons = screen.getAllByRole("button");
      const shareButton = shareButtons.find((btn) =>
        btn.querySelector(".lucide-share-2")
      );
      await user.click(shareButton!);

      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(error, {
          component: "ShopHeader.handleShare",
        });
      });
    });
  });

  describe("Accessibility", () => {
    it("uses semantic heading for shop name", () => {
      render(<ShopHeader shop={mockShop} />);
      expect(
        screen.getByRole("heading", { name: "Test Shop" })
      ).toBeInTheDocument();
    });

    it("provides alt text for images", () => {
      render(<ShopHeader shop={mockShop} />);
      expect(screen.getByAltText("Test Shop")).toBeInTheDocument();
      expect(screen.getByAltText("Test Shop banner")).toBeInTheDocument();
    });

    it("uses buttons with proper semantics", async () => {
      render(<ShopHeader shop={mockShop} />);
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /follow/i })
        ).toBeInTheDocument();
      });
    });
  });
});
