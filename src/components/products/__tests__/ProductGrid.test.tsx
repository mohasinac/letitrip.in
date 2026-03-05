import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductGrid } from "../ProductGrid";

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

const mockProduct = {
  id: "p1",
  title: "Trek Boots",
  description: "Great hiking boots.",
  price: 2500,
  currency: "INR",
  mainImage: "/img.jpg",
  images: [] as string[],
  video: undefined as { url: string; thumbnailUrl: string; duration: number } | undefined,
  status: "published" as const,
  featured: false,
  isAuction: false,
  currentBid: undefined,
  isPromoted: false,
  slug: "trek-boots",
};

describe("ProductGrid", () => {
  it("renders products when provided", () => {
    render(<ProductGrid products={[mockProduct]} />);
    expect(screen.getByText("Trek Boots")).toBeInTheDocument();
  });

  it("shows empty state when no products", () => {
    render(<ProductGrid products={[]} />);
    expect(screen.getByText("noProductsFound")).toBeInTheDocument();
    expect(screen.getByText("noProductsSubtitle")).toBeInTheDocument();
  });

  it("renders loading skeletons when loading", () => {
    const { container } = render(
      <ProductGrid products={[]} loading skeletonCount={3} />,
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
