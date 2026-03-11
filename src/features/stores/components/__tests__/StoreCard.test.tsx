/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { StoreCard } from "@/components";
import type { StoreListItem } from "@/types/stores";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const map: Record<string, string> = {
      productsCount: `${params?.count ?? 0} products`,
      sellerBadge: "Verified Seller",
    };
    return map[key] ?? key;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
  redirect: jest.fn(),
}));

const baseStore: StoreListItem = {
  uid: "seller-1",
  ownerId: "seller-1",
  storeSlug: "himalaya-treks",
  displayName: "Anand Kumar",
  storeName: "Himalaya Treks",
  storeDescription: "Best trekking gear in town.",
  storeCategory: "Sports",
  storeLogoURL: undefined,
  storeBannerURL: undefined,
  photoURL: undefined,
  totalProducts: 42,
  totalReviews: 18,
  averageRating: 4.3,
  createdAt: new Date().toISOString(),
};

describe("StoreCard", () => {
  it("renders the store name", () => {
    render(<StoreCard store={baseStore} />);
    expect(screen.getByText("Himalaya Treks")).toBeInTheDocument();
  });

  it("renders the store description", () => {
    render(<StoreCard store={baseStore} />);
    expect(screen.getByText("Best trekking gear in town.")).toBeInTheDocument();
  });

  it("renders the average rating", () => {
    render(<StoreCard store={baseStore} />);
    expect(screen.getByText("4.3")).toBeInTheDocument();
  });

  it("renders product count", () => {
    render(<StoreCard store={baseStore} />);
    expect(screen.getByText(/42 products/i)).toBeInTheDocument();
  });

  it("renders seller badge", () => {
    render(<StoreCard store={baseStore} />);
    expect(screen.getByText(/Verified Seller/i)).toBeInTheDocument();
  });

  it("renders a link to the store page", () => {
    render(<StoreCard store={baseStore} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("himalaya-treks"),
    );
  });

  it("renders checkbox when selectable is true", () => {
    render(
      <StoreCard
        store={baseStore}
        selectable
        selected={false}
        onSelect={jest.fn()}
      />,
    );
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("calls onSelect when checkbox is toggled", async () => {
    const onSelect = jest.fn();
    render(
      <StoreCard
        store={baseStore}
        selectable
        selected={false}
        onSelect={onSelect}
      />,
    );
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onSelect).toHaveBeenCalledWith("seller-1", true);
  });
});
