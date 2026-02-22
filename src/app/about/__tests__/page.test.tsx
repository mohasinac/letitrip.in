import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// about/page.tsx is a server component with no dynamic data — pure static render
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

jest.mock("@/constants", () => ({
  ROUTES: {
    PUBLIC: { PRODUCTS: "/products", SELLERS: "/sellers" },
    AUTH: { REGISTER: "/auth/register" },
  },
  UI_LABELS: {
    ABOUT_PAGE: {
      TITLE: "About Us",
      SUBTITLE: "We make buying and selling easy",
      MISSION_TITLE: "Our Mission",
      MISSION_TEXT: "Mission text",
      HOW_IT_WORKS_TITLE: "How It Works",
      HOW_BUYERS_TITLE: "For Buyers",
      HOW_BUYERS_TEXT: "Browse and buy",
      HOW_SELLERS_TITLE: "For Sellers",
      HOW_SELLERS_TEXT: "List your products",
      HOW_AUCTIONS_TITLE: "Live Auctions",
      HOW_AUCTIONS_TEXT: "Bid on items",
      HOW_BIDDERS_TITLE: "For Bidders",
      HOW_BIDDERS_TEXT: "Bid on auctions",
      VALUES_TITLE: "Our Values",
      VALUES_TRUST: "Trust",
      VALUES_TRUST_TEXT: "We value trust.",
      VALUES_COMMUNITY: "Community",
      VALUES_COMMUNITY_TEXT: "We value community.",
      VALUES_INNOVATION: "Innovation",
      VALUES_INNOVATION_TEXT: "We value innovation.",
      JOIN_TITLE: "Join Us",
      JOIN_TEXT: "Start today",
      JOIN_SELLER_CTA: "Become a Seller",
      JOIN_BUYER_CTA: "Start Shopping",
    },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    typography: { h2: "text-3xl font-bold", h3: "text-2xl font-bold" },
    spacing: { stack: "space-y-4", padding: { lg: "p-6" } },
  },
  SITE_CONFIG: { brand: { name: "LetItRip" } },
}));

import AboutPage from "../page";

describe("AboutPage", () => {
  it("renders without crashing", () => {
    render(<AboutPage />);
    expect(document.body).toBeInTheDocument();
  });

  it("renders the main heading", () => {
    render(<AboutPage />);
    expect(screen.getByText("About Us")).toBeInTheDocument();
  });

  it("renders the values section", () => {
    render(<AboutPage />);
    expect(screen.getByText("Our Values")).toBeInTheDocument();
  });

  it("renders mission section", () => {
    render(<AboutPage />);
    expect(screen.getByText("Our Mission")).toBeInTheDocument();
  });
});
