import React from "react";
import { render, screen } from "@testing-library/react";
import { AuctionCard } from "../AuctionCard";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params?.count !== undefined) return `${params.count} ${key}`;
    return key;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

jest.mock("@/hooks", () => ({
  useCountdown: jest.fn().mockReturnValue({ days: 0, hours: 1, minutes: 30, seconds: 0 }),
  useWishlistToggle: () => ({ inWishlist: false, isLoading: false, toggle: jest.fn() }),
}));

jest.mock("@/utils", () => ({
  formatCurrency: (amount: number) => `₹${amount}`,
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
  redirect: jest.fn(),
}));

const baseProduct = {
  id: "a1",
  title: "Vintage Camera",
  description: "A rare vintage film camera in great condition.",
  price: 5000,
  currency: "INR",
  mainImage: "/cam.jpg",
  images: [] as string[],
  isAuction: true,
  auctionEndDate: new Date(Date.now() + 3_600_000),
  startingBid: 3000,
  currentBid: 4200,
  bidCount: 5,
  featured: false,
} as const;

describe("AuctionCard", () => {
  it("renders the product title", () => {
    render(<AuctionCard product={baseProduct} />);
    expect(screen.getByText("Vintage Camera")).toBeInTheDocument();
  });

  it("renders the current bid formatted as currency", () => {
    render(<AuctionCard product={baseProduct} />);
    expect(screen.getByText("₹4200")).toBeInTheDocument();
  });

  it("renders product image with alt text", () => {
    render(<AuctionCard product={baseProduct} />);
    expect(screen.getByAltText("Vintage Camera")).toBeInTheDocument();
  });

  it("shows LIVE badge when auction has not ended", () => {
    render(<AuctionCard product={baseProduct} />);
    expect(screen.getByText("liveBadge")).toBeInTheDocument();
  });

  it("shows ended badge when useCountdown returns null", () => {
    const { useCountdown } = require("@/hooks");
    (useCountdown as jest.Mock).mockReturnValueOnce(null);
    render(<AuctionCard product={baseProduct} />);
    expect(screen.getAllByText("ended").length).toBeGreaterThanOrEqual(1);
  });

  it("renders fallback emoji when mainImage is undefined", () => {
    const noImage = { ...baseProduct, mainImage: undefined as unknown as string };
    render(<AuctionCard product={noImage} />);
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Vintage Camera" })).toBeInTheDocument();
  });

  it("shows play indicator when product has a video", () => {
    const withVideo = {
      ...baseProduct,
      video: { url: "/demo.mp4", thumbnailUrl: "/thumb.jpg", duration: 60 },
    };
    render(<AuctionCard product={withVideo} />);
    expect(screen.getByText("▶")).toBeInTheDocument();
  });

  it("does not show play indicator when product has no video", () => {
    render(<AuctionCard product={baseProduct} />);
    expect(screen.queryByText("▶")).toBeNull();
  });

  it("renders Bid button when auction is live", () => {
    render(<AuctionCard product={baseProduct} />);
    expect(screen.getByText("placeBid")).toBeInTheDocument();
  });

  it("renders Buyout button when buyoutPrice is provided", () => {
    render(<AuctionCard product={baseProduct} buyoutPrice={8000} />);
    expect(screen.getByText("buyout")).toBeInTheDocument();
  });

  it("does not render Buyout button when no buyoutPrice", () => {
    render(<AuctionCard product={baseProduct} />);
    expect(screen.queryByText("buyout")).toBeNull();
  });

  it("shows disabled Ended button when auction has ended", () => {
    const { useCountdown } = require("@/hooks");
    (useCountdown as jest.Mock).mockReturnValueOnce(null);
    render(<AuctionCard product={baseProduct} />);
    expect(screen.queryByText("placeBid")).toBeNull();
    const endedBtns = screen.getAllByText("ended");
    const disabledBtn = endedBtns.find(
      (el) => el.closest("button") !== null,
    );
    expect(disabledBtn).toBeTruthy();
    expect(disabledBtn!.closest("button")).toBeDisabled();
  });

  it("renders description in list variant", () => {
    render(<AuctionCard product={baseProduct} variant="list" />);
    expect(
      screen.getByText("A rare vintage film camera in great condition."),
    ).toBeInTheDocument();
  });

  it("renders wishlist heart button", () => {
    render(<AuctionCard product={baseProduct} />);
    expect(
      screen.getByRole("button", { name: /addToWishlist/i }),
    ).toBeInTheDocument();
  });
});
