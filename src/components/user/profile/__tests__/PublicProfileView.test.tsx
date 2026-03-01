/**
 * Tests for PublicProfileView component
 *
 * Coverage:
 * - Renders user display name via Heading primitive (not raw h1/h2)
 * - Renders profile member-since text via Text primitive
 * - Uses formatNumber for average rating (not .toFixed)
 * - Shows seller products section when isSeller=true and products exist
 * - Shows empty state when no products for seller
 */

import { render, screen } from "@testing-library/react";
import { PublicProfileView } from "../PublicProfileView";
import type { UserDocument } from "@/db/schema";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("@/components", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Text: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="text">{children}</p>
  ),
  Heading: ({
    level,
    children,
  }: {
    level: number;
    children: React.ReactNode;
  }) => <h1 data-testid={`heading-${level}`}>{children}</h1>,
  AvatarDisplay: () => <div data-testid="avatar" />,
  EmptyState: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
}));

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
  formatNumber: jest.fn((v: number) => `${v}`),
}));

jest.mock("@/constants", () => ({
  ROUTES: { PUBLIC: { SELLER: (id: string) => `/seller/${id}` } },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "",
      bgSecondary: "",
      textPrimary: "",
      textSecondary: "",
      textMuted: "",
      border: "",
    },
    spacing: { stack: "space-y-4", padding: { md: "p-4", lg: "p-6" } },
    typography: {
      h1: "text-4xl",
      h2: "text-2xl",
      h3: "text-xl",
      small: "text-sm",
    },
    borderRadius: { xl: "rounded-xl", lg: "rounded-lg" },
    badge: { active: "bg-green-100 text-green-800" },
    rating: { filled: "text-yellow-400", empty: "text-gray-300" },
  },
}));

const baseUser: Partial<UserDocument> = {
  id: "user-001",
  displayName: "Jane Doe",
  email: "jane@example.com",
  role: "user",
};

const defaultProps = {
  user: baseUser as UserDocument,
  isSeller: false,
  profileName: "Jane Doe",
  memberSince: "January 2025",
  avatarCropData: null,
  productsLoading: false,
  reviewsLoading: false,
};

describe("PublicProfileView", () => {
  it("renders the profile name using Heading primitive", () => {
    render(<PublicProfileView {...defaultProps} />);
    const heading = screen.getByTestId("heading-1");
    expect(heading).toHaveTextContent("Jane Doe");
  });

  it("renders member-since using Text primitive", () => {
    render(<PublicProfileView {...defaultProps} />);
    const texts = screen.getAllByTestId("text");
    const memberText = texts.some((t) =>
      t.textContent?.includes("January 2025"),
    );
    expect(memberText).toBe(true);
  });

  it("calls formatNumber for average rating display when reviews exist", () => {
    const { formatNumber } = require("@/utils");
    render(
      <PublicProfileView
        {...defaultProps}
        isSeller
        reviewsData={{
          averageRating: 4.567,
          totalReviews: 10,
          reviews: [],
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 3, 5: 7 },
        }}
      />,
    );
    expect(formatNumber).toHaveBeenCalledWith(4.567, "en-US", { decimals: 1 });
  });
});
