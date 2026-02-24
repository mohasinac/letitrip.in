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
    PRIVACY_PAGE: {
      TITLE: "Privacy Policy",
      LAST_UPDATED: "Last updated",
      INTRO_TITLE: "Introduction",
      INTRO_TEXT: "We value your privacy.",
      COLLECT_TITLE: "What We Collect",
      COLLECT_TEXT: "We collect data.",
      USE_TITLE: "How We Use It",
      USE_TEXT: "We use it to improve.",
      SHARE_TITLE: "How We Share It",
      SHARE_TEXT: "We do not sell data.",
      SECURITY_TITLE: "Security",
      SECURITY_TEXT: "We use encryption.",
      RIGHTS_TITLE: "Your Rights",
      RIGHTS_TEXT: "You have rights.",
      COOKIES_TITLE: "Cookies",
      COOKIES_TEXT: "We use cookies.",
      CHANGES_TITLE: "Changes",
      CHANGES_TEXT: "We may update this policy.",
      CONTACT_TEXT: "Contact us at privacy@example.com",
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

import PrivacyPage from "../page";

describe("PrivacyPage", () => {
  it("renders without crashing", () => {
    render(<PrivacyPage />);
    expect(document.body).toBeInTheDocument();
  });

  it("page title contains 'Privacy'", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders privacy sections", () => {
    render(<PrivacyPage />);
    expect(screen.getByText("Introduction")).toBeInTheDocument();
    expect(screen.getByText("What We Collect")).toBeInTheDocument();
  });
});
