import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SellersPage from "../page";

jest.mock("next/link", () => {
  const Link = ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  Link.displayName = "Link";
  return Link;
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/sellers",
}));

jest.mock("@/constants", () => ({
  UI_LABELS: {
    SELLERS_PAGE: {
      TITLE: "Become a Seller",
      SUBTITLE: "Start selling with us today",
      HERO_CTA: "Start Selling Now",
      HERO_SECONDARY: "Learn How It Works",
      BENEFIT_REACH: "Wide Reach",
      BENEFIT_REACH_TEXT: "Access millions of buyers",
      BENEFIT_TOOLS: "Seller Tools",
      BENEFIT_TOOLS_TEXT: "Powerful management tools",
      BENEFIT_TRUST: "Trusted Platform",
      BENEFIT_TRUST_TEXT: "Secure transactions",
      BENEFIT_FEES: "Low Fees",
      BENEFIT_FEES_TEXT: "Competitive commission rates",
      HOW_IT_WORKS_TITLE: "How It Works",
      STEP_1_TITLE: "Create an Account",
      STEP_1_TEXT: "Sign up as a seller",
      STEP_2_TITLE: "List Your Products",
      STEP_2_TEXT: "Add your products",
      STEP_3_TITLE: "Start Earning",
      STEP_3_TEXT: "Get paid",
      FAQ_TITLE: "Frequently Asked Questions",
      FAQ_1_Q: "How do I start selling?",
      FAQ_1_A: "Sign up and list your products.",
      FAQ_2_Q: "When do I get paid?",
      FAQ_2_A: "Payments are processed weekly.",
      FAQ_3_Q: "What are the fees?",
      FAQ_3_A: "We charge a small commission.",
      CTA_TITLE: "Ready to Start?",
      CTA_BTN: "Join as Seller",
    },
  },
  SITE_CONFIG: {
    brand: { name: "LetItRip" },
    seo: { siteName: "LetItRip" },
  },
  ROUTES: {
    AUTH: { REGISTER: "/auth/register", LOGIN: "/auth/login" },
    SELLER: { DASHBOARD: "/seller/dashboard" },
  },
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-white",
      bgSecondary: "bg-gray-50",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
    },
    spacing: {
      stack: "space-y-4",
      padding: { lg: "p-6", md: "p-4" },
      gap: { md: "gap-4", lg: "gap-6" },
    },
    typography: {
      h1: "text-3xl font-bold",
      h2: "text-2xl font-bold",
      h3: "text-xl font-bold",
      h4: "text-lg font-semibold",
    },
    borderRadius: { xl: "rounded-xl", lg: "rounded-lg" },
    container: { xl: "max-w-xl", "2xl": "max-w-2xl", "6xl": "max-w-6xl" },
    button: {
      ctaPrimary:
        "bg-white text-emerald-700 font-bold px-8 py-4 rounded-full text-lg",
      ctaOutline:
        "border-2 border-white text-white font-semibold px-8 py-4 rounded-full text-lg",
    },
  },
}));

// Override next-intl/server to return values matching test expectations
jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockImplementation(async () => {
    const map: Record<string, string> = {
      title: "Become a Seller",
      subtitle: "Start selling with us today",
      heroCta: "Start Selling Now",
      heroSecondary: "Learn How It Works",
      whyTitle: "Why Sell with Us?",
      benefitReach: "Wide Reach",
      benefitReachText: "Access millions of buyers",
      benefitTools: "Seller Tools",
      benefitToolsText: "Powerful management tools",
      benefitTrust: "Trusted Platform",
      benefitTrustText: "Secure transactions",
      benefitFees: "Low Fees",
      benefitFeesText: "Competitive commission rates",
      howTitle: "How It Works",
      step1Title: "Create an Account",
      step1Text: "Sign up as a seller",
      step2Title: "List Your Products",
      step2Text: "Add your products",
      step3Title: "Start Earning",
      step3Text: "Get paid",
      faqTitle: "Frequently Asked Questions",
      faq1Q: "How do I start selling?",
      faq1A: "Sign up and list your products.",
      faq2Q: "When do I get paid?",
      faq2A: "Payments are processed weekly.",
      faq3Q: "What are the fees?",
      faq3A: "We charge a small commission.",
      ctaTitle: "Ready to Start?",
      ctaButton: "Join as Seller",
      signInPrompt: "Already a seller?",
      signInLink: "Sign in",
      statSellersLabel: "Active Sellers",
      statSellersValue: "5,000+",
      statProductsLabel: "Products Listed",
      statProductsValue: "50,000+",
      statBuyersLabel: "Happy Buyers",
      statBuyersValue: "100,000+",
      statCommissionLabel: "Commission",
      statCommissionValue: "Low fees",
      testimonialsTitle: "What Sellers Say",
    };
    return (key: string) => map[key] ?? key;
  }),
}));

describe("Sellers (Become a Seller) Page", () => {
  it("renders the main heading", async () => {
    render(await SellersPage());
    // "Become a Seller" appears in h1 - use role-based query
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain("Become a Seller");
  });

  it("renders hero CTA linking to register", async () => {
    render(await SellersPage());
    // Both HERO_CTA ("Start Selling Now") and CTA_BTN ("Join as Seller") use AUTH.REGISTER route
    const links = screen.getAllByText(
      (content) =>
        content.includes("Start Selling Now") ||
        content.includes("Join as Seller"),
    );
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it("renders benefits section", async () => {
    render(await SellersPage());
    expect(screen.getByText("Wide Reach")).toBeInTheDocument();
    expect(screen.getByText("Seller Tools")).toBeInTheDocument();
    expect(screen.getByText("Trusted Platform")).toBeInTheDocument();
    expect(screen.getByText("Low Fees")).toBeInTheDocument();
  });

  it("renders how-it-works steps", async () => {
    render(await SellersPage());
    expect(screen.getByText("Create an Account")).toBeInTheDocument();
    expect(screen.getByText("List Your Products")).toBeInTheDocument();
    expect(screen.getByText("Start Earning")).toBeInTheDocument();
  });

  it("renders FAQ section with questions", async () => {
    render(await SellersPage());
    expect(screen.getByText("How do I start selling?")).toBeInTheDocument();
    expect(screen.getByText("When do I get paid?")).toBeInTheDocument();
    expect(screen.getByText("What are the fees?")).toBeInTheDocument();
  });
});
