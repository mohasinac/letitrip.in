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
    PUBLIC: { FAQS: "/faqs" },
  },
  UI_LABELS: {
    HELP_PAGE: {
      TITLE: "Help Center",
      SUBTITLE: "Find the answers you need",
      SEARCH_PLACEHOLDER: "Search help articles",
      TOPIC_ORDERS: "Orders & Shipping",
      TOPIC_PAYMENTS: "Payments",
      TOPIC_ACCOUNT: "My Account",
      TOPIC_SELLING: "Selling",
      TOPIC_AUCTIONS: "Auctions",
      POPULAR_TITLE: "Popular Articles",
      FAQ_TITLE: "FAQs",
      FAQ_DESCRIPTION: "Browse all FAQs",
      FAQ_LINK: "View all FAQs",
      CONTACT_TITLE: "Still need help?",
      CONTACT_DESCRIPTION: "Our support team is ready.",
      CONTACT_LINK: "Contact Support",
    },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      border: "border-gray-200",
    },
    typography: { h2: "text-3xl font-bold", h3: "text-2xl font-bold" },
    spacing: { stack: "space-y-4", padding: { lg: "p-6" } },
  },
  SITE_CONFIG: { brand: { name: "LetItRip" } },
}));

import HelpPage from "../page";

describe("HelpPage", () => {
  it("renders without crashing", () => {
    render(<HelpPage />);
    expect(document.body).toBeInTheDocument();
  });

  it("renders the main heading", () => {
    render(<HelpPage />);
    expect(screen.getByText("Help Center")).toBeInTheDocument();
  });

  it("renders at least one help topic heading", () => {
    render(<HelpPage />);
    expect(screen.getByText("Orders & Shipping")).toBeInTheDocument();
  });

  it("renders link to FAQs page", () => {
    render(<HelpPage />);
    const faqLinks = screen.getAllByRole("link");
    const faqLink = faqLinks.find((l) => l.getAttribute("href") === "/faqs");
    expect(faqLink).toBeDefined();
  });
});
