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

const baseProduct = {
  id: "p1",
  title: "Trek Boots",
  price: 2500,
  currency: "INR",
  mainImage: "/img.jpg",
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

  it("shows featured badge for featured products", () => {
    render(<ProductCard product={{ ...baseProduct, featured: true }} />);
    expect(screen.getByText("featured")).toBeInTheDocument();
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

  it("shows play indicator when product has a video", () => {
    const withVideo = {
      ...baseProduct,
      video: { url: "/video.mp4", thumbnailUrl: "/thumb.jpg", duration: 30 },
    };
    render(<ProductCard product={withVideo} />);
    expect(screen.getByText("▶")).toBeInTheDocument();
  });

  it("does not show play indicator when product has no video", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.queryByText("▶")).toBeNull();
  });

  it("uses video thumbnail as media src when video is present", () => {
    const withVideo = {
      ...baseProduct,
      video: { url: "/video.mp4", thumbnailUrl: "/thumb.jpg", duration: 30 },
    };
    render(<ProductCard product={withVideo} />);
    const img = document.querySelector("img") as HTMLImageElement;
    expect(img?.src).toContain("thumb.jpg");
  });
});
