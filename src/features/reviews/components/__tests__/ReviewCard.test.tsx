/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReviewCard } from "../ReviewCard";
import type { ReviewDocument } from "@/db/schema";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const map: Record<string, string> = {
      anonymous: "Anonymous",
      verified: "Verified Purchase",
      viewItem: "View Item",
      featured: "Featured",
      moreImages: `+${params?.count ?? 0} more`,
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

const baseReview: ReviewDocument = {
  id: "rev-1",
  productId: "prod-1",
  productTitle: "Trekking Boots",
  userId: "user-1",
  userName: "Alice Smith",
  userAvatar: undefined,
  rating: 4,
  title: "Great boots",
  comment: "These boots are very comfortable for long treks.",
  images: undefined,
  status: "approved" as any,
  verified: false,
  featured: false,
  helpfulCount: 2,
  reportCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ReviewCard", () => {
  it("renders the reviewer name", () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("renders the review comment", () => {
    render(<ReviewCard review={baseReview} />);
    expect(
      screen.getByText("These boots are very comfortable for long treks."),
    ).toBeInTheDocument();
  });

  it("renders the product title as a link", () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText("Trekking Boots")).toBeInTheDocument();
  });

  it("renders a star icon in the rating badge", () => {
    const { container } = render(<ReviewCard review={baseReview} />);
    const stars = container.querySelectorAll("svg");
    // At least 1 star SVG rendered (rating badge)
    expect(stars.length).toBeGreaterThanOrEqual(1);
  });

  it("shows fallback 'View Item' when no productTitle", () => {
    const noTitle = { ...baseReview, productTitle: undefined } as any;
    render(<ReviewCard review={noTitle} />);
    expect(screen.getByText("View Item")).toBeInTheDocument();
  });

  it("shows 'Verified Purchase' badge when verified", () => {
    const verified = { ...baseReview, verified: true };
    render(<ReviewCard review={verified} />);
    expect(screen.getByText("Verified Purchase")).toBeInTheDocument();
  });

  it("does NOT show verified badge when not verified", () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.queryByText("Verified Purchase")).toBeNull();
  });

  it("shows rating star badge with numeric rating", () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders images when provided", () => {
    const withImages = {
      ...baseReview,
      images: [
        "https://example.com/img1.jpg",
        "https://example.com/img2.jpg",
        "https://example.com/img3.jpg",
      ],
    };
    render(<ReviewCard review={withImages} />);
    // +1 more is shown for the 3rd image
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });
});
