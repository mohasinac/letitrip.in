import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

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
    PUBLIC: {
      HOME: "/",
      TERMS: "/terms",
      CONTACT: "/contact",
      PRIVACY: "/privacy",
    },
  },
  UI_LABELS: {
    FOOTER: {
      TERMS_OF_SERVICE: "Terms of Service",
      CONTACT: "Contact",
      PRIVACY_POLICY: "Privacy Policy",
    },
    TERMS_PAGE: {
      TITLE: "Terms & Conditions",
      LAST_UPDATED: "Last updated",
      ACCEPTANCE_TITLE: "Acceptance of Terms",
      ACCEPTANCE_TEXT: "By using this site, you agree.",
      USE_TITLE: "Use of Service",
      USE_TEXT: "You may use the service.",
      ACCOUNTS_TITLE: "Accounts",
      ACCOUNTS_TEXT: "You are responsible for your account.",
      SELLERS_TITLE: "Sellers",
      SELLERS_TEXT: "Sellers must follow our policies.",
      AUCTIONS_TITLE: "Auctions",
      AUCTIONS_TEXT: "Auction bids are binding.",
      LIABILITY_TITLE: "Liability",
      LIABILITY_TEXT: "We are not liable for losses.",
      CHANGES_TITLE: "Changes to Terms",
      CHANGES_TEXT: "We may update these terms.",
      CONTACT_TEXT: "Contact us with questions.",
    },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    typography: { h1: "text-4xl font-bold", h2: "text-3xl font-bold" },
  },
  SITE_CONFIG: { brand: { name: "LetItRip" } },
}));

import TermsPage from "../page";

describe("TermsPage", () => {
  it("renders without crashing", () => {
    render(<TermsPage />);
    expect(document.body).toBeInTheDocument();
  });

  it("page title contains 'Terms'", () => {
    render(<TermsPage />);
    expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
  });

  it("renders terms sections", () => {
    render(<TermsPage />);
    expect(screen.getByText("Acceptance of Terms")).toBeInTheDocument();
    expect(screen.getByText("Sellers")).toBeInTheDocument();
  });
});
