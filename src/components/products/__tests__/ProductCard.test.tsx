import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "../ProductCard";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}));
jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
  redirect: jest.fn(),
}));
jest.mock("@/hooks", () => ({
  useAddToCart: () => ({ mutate: jest.fn(), isLoading: false }),
  useWishlistToggle: () => ({ inWishlist: false, isLoading: false, toggle: jest.fn() }),
}));

const baseProduct = {
  id: "p1",
  title: "Trek Boots",
  description: "Perfect boots for mountain hiking and trekking.",
  price: 2500,
  currency: "INR",
  mainImage: "/img.jpg",
  images: [] as string[],
  video: undefined as
    | { url: string; thumbnailUrl: string; duration: number }
    | undefined,
  status: "published" as const,
  featured: false,
  isAuction: false,
  currentBid: undefined,
  isPromoted: false,
  slug: "trek-boots",
};

describe("ProductCard", () => {
  it("renders product title", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("Trek Boots")).toBeInTheDocument();
  });

  it("shows featured star for featured products", () => {
    render(<ProductCard product={{ ...baseProduct, featured: true }} />);
    // Featured star is a Lucide Star icon (aria-hidden), card has ring class
    const card = document.querySelector(".ring-2");
    // The star SVG should be rendered — look for the amber star container
    expect(document.querySelector(".fill-amber-400")).toBeInTheDocument();
  });

  it("shows auction badge for auction products", () => {
    render(
      <ProductCard
        product={{ ...baseProduct, isAuction: true, currentBid: 1000 }}
      />,
    );
    expect(screen.getByText("auction")).toBeInTheDocument();
  });

  it("shows promoted badge for promoted products", () => {
    render(<ProductCard product={{ ...baseProduct, isPromoted: true }} />);
    expect(screen.getByText("promoted")).toBeInTheDocument();
  });

  it("shows sold badge for sold products", () => {
    render(<ProductCard product={{ ...baseProduct, status: "sold" as any }} />);
    expect(screen.getByText("sold")).toBeInTheDocument();
  });

  it("shows outOfStock badge for out-of-stock products", () => {
    render(
      <ProductCard
        product={{ ...baseProduct, status: "out_of_stock" as any }}
      />,
    );
    expect(screen.getByText("outOfStock")).toBeInTheDocument();
  });

  it("shows play indicator on first image when product has a video", () => {
    const withVideo = {
      ...baseProduct,
      video: { url: "/video.mp4", thumbnailUrl: "/thumb.jpg", duration: 30 },
    };
    render(<ProductCard product={withVideo} />);
    expect(screen.getByText("▶")).toBeInTheDocument();
  });

  it("renders Add to Cart and Buy Now buttons", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("addToCart")).toBeInTheDocument();
    expect(screen.getByText("buyNow")).toBeInTheDocument();
  });

  it("shows disabled Out of Stock button when product is out of stock", () => {
    render(
      <ProductCard product={{ ...baseProduct, status: "out_of_stock" as any }} />,
    );
    expect(screen.queryByText("addToCart")).not.toBeInTheDocument();
    expect(screen.queryByText("buyNow")).not.toBeInTheDocument();
    expect(screen.getByText("outOfStock")).toBeInTheDocument();
    expect(screen.getByText("outOfStock").closest("button")).toBeDisabled();
  });

  it("renders wishlist heart button", () => {
    render(<ProductCard product={baseProduct} />);
    expect(
      screen.getByRole("button", { name: /addToWishlist/i }),
    ).toBeInTheDocument();
  });

  it("renders description in list variant", () => {
    render(<ProductCard product={baseProduct} variant="list" />);
    expect(
      screen.getByText("Perfect boots for mountain hiking and trekking."),
    ).toBeInTheDocument();
  });

  it("does not render description in grid variant", () => {
    render(<ProductCard product={baseProduct} variant="grid" />);
    expect(
      screen.queryByText("Perfect boots for mountain hiking and trekking."),
    ).not.toBeInTheDocument();
  });

  it("shows checkbox when selectable", () => {
    render(<ProductCard product={baseProduct} selectable isSelected={false} />);
    expect(
      screen.getByRole("button", { name: /selectItem/i }),
    ).toBeInTheDocument();
  });
});
