import { render, screen } from "@testing-library/react";
import FAQPage from "@/app/faq/page";

// Mock the FAQSection component
jest.mock("@/components/faq/FAQSection", () => ({
  __esModule: true,
  default: ({ showSearch }: { showSearch?: boolean }) => (
    <div data-testid="faq-section" data-show-search={showSearch}>
      Mock FAQ Section
    </div>
  ),
}));

// Mock the schema utilities
jest.mock("@/lib/seo/schema", () => ({
  generateFAQSchema: jest.fn(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [],
  })),
  generateJSONLD: jest.fn(() => ({
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [],
    }),
  })),
}));

// Mock the FAQ constants
jest.mock("@/constants/faq", () => ({
  FAQ_ITEMS: [
    {
      id: "test-1",
      question: "Test Question 1?",
      answer: "Test Answer 1",
      category: "getting-started",
    },
    {
      id: "test-2",
      question: "Test Question 2?",
      answer: "Test Answer 2",
      category: "shopping",
    },
  ],
}));

describe("FAQ Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Page Structure", () => {
    it("renders the main page structure", () => {
      render(<FAQPage />);

      // Check main container
      const mainElement = screen.getByRole("main");
      expect(mainElement).toHaveClass("min-h-screen", "bg-gray-50");
    });

    it("renders hero section with correct content", () => {
      render(<FAQPage />);

      expect(screen.getByText("How can we help you?")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Find answers to common questions about shopping from Japan",
        ),
      ).toBeInTheDocument();

      // Check for HelpCircle icon (rendered as SVG)
      const heroSection = screen
        .getByText("How can we help you?")
        .closest("section");
      expect(heroSection).toBeInTheDocument();
    });

    it("renders FAQ section with search enabled", () => {
      render(<FAQPage />);

      const faqSection = screen.getByTestId("faq-section");
      expect(faqSection).toBeInTheDocument();
      expect(faqSection).toHaveAttribute("data-show-search", "true");
    });
  });

  describe("Support Section", () => {
    it("renders support contact options", () => {
      render(<FAQPage />);

      expect(screen.getByText("Still have questions?")).toBeInTheDocument();
      expect(
        screen.getByText("We're here to help! Contact our support team"),
      ).toBeInTheDocument();
    });

    it("renders support ticket link", () => {
      render(<FAQPage />);

      const supportLink = screen.getByRole("link", {
        name: /create support ticket/i,
      });
      expect(supportLink).toHaveAttribute("href", "/support/ticket");
      expect(supportLink).toHaveTextContent("Create Support Ticket");
    });

    it("renders email contact link", () => {
      render(<FAQPage />);

      const emailLink = screen.getByRole("link", { name: /email us/i });
      expect(emailLink).toHaveAttribute("href", "mailto:support@letitrip.com");
      expect(emailLink).toHaveTextContent("Email Us");
    });

    it("renders support icons", () => {
      render(<FAQPage />);

      // Check that the support cards have the expected structure
      const supportCards = screen.getAllByText(
        /Create Support Ticket|Email Us/,
      );
      expect(supportCards).toHaveLength(2);
    });
  });

  describe("Quick Links Section", () => {
    it("renders popular help topics", () => {
      render(<FAQPage />);

      expect(screen.getByText("Popular Help Topics")).toBeInTheDocument();
    });

    it("renders category links", () => {
      render(<FAQPage />);

      const categories = ["Shipping", "Returns", "Payments", "Auctions"];

      categories.forEach((category) => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    it("renders working category links", () => {
      render(<FAQPage />);

      const shippingLink = screen.getByRole("link", { name: /shipping/i });
      const returnsLink = screen.getByRole("link", { name: /returns/i });
      const paymentsLink = screen.getByRole("link", { name: /payments/i });
      const auctionsLink = screen.getByRole("link", { name: /auctions/i });

      expect(shippingLink).toHaveAttribute("href", "/faq?category=shipping");
      expect(returnsLink).toHaveAttribute("href", "/faq?category=returns");
      expect(paymentsLink).toHaveAttribute("href", "/faq?category=payments");
      expect(auctionsLink).toHaveAttribute("href", "/faq?category=auctions");
    });
  });

  describe("SEO and Schema", () => {
    it("includes JSON-LD schema script", () => {
      const { generateFAQSchema, generateJSONLD } = require("@/lib/seo/schema");

      render(<FAQPage />);

      const scriptElement = document.querySelector(
        'script[type="application/ld+json"]',
      );
      expect(scriptElement).toBeInTheDocument();

      expect(generateFAQSchema).toHaveBeenCalledTimes(1);
      expect(generateFAQSchema).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            question: expect.any(String),
            answer: expect.any(String),
          }),
        ]),
      );
      expect(generateJSONLD).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("has proper heading hierarchy", () => {
      render(<FAQPage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("How can we help you?");

      const h2Elements = screen.getAllByRole("heading", { level: 2 });
      expect(h2Elements.length).toBeGreaterThanOrEqual(2); // At least "Still have questions?" and "Popular Help Topics"
    });

    it("has descriptive link text", () => {
      render(<FAQPage />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
      });
    });
  });

  describe("Visual Structure", () => {
    it("renders sections with proper styling", () => {
      render(<FAQPage />);

      // Hero section should have gradient background
      const heroSection = screen
        .getByText("How can we help you?")
        .closest("section");
      expect(heroSection).toHaveClass(
        "bg-gradient-to-br",
        "from-blue-600",
        "to-blue-700",
      );

      // Support section should have white background
      const supportSection = screen
        .getByText("Still have questions?")
        .closest("section");
      expect(supportSection).toHaveClass(
        "bg-white",
        "border-t",
        "border-gray-200",
      );

      // Quick links section should have gray background
      const quickLinksSection = screen
        .getByText("Popular Help Topics")
        .closest("section");
      expect(quickLinksSection).toHaveClass("bg-gray-50");
    });

    it("renders support cards with proper layout", () => {
      render(<FAQPage />);

      // Support cards should be in a grid
      const supportCards = screen.getAllByText(
        /Create Support Ticket|Email Us/,
      );
      expect(supportCards.length).toBe(2);

      // Each card should have proper styling classes
      supportCards.forEach((card) => {
        const cardElement = card.closest("a");
        expect(cardElement).toHaveClass("block", "p-6", "rounded-lg");
      });
    });

    it("renders category links in grid layout", () => {
      render(<FAQPage />);

      const categoryLinks = screen.getAllByRole("link", {
        name: /shipping|returns|payments|auctions/i,
      });
      expect(categoryLinks.length).toBe(4);

      // Links should have consistent styling
      categoryLinks.forEach((link) => {
        expect(link).toHaveClass("p-4", "bg-white", "border", "rounded-lg");
      });
    });
  });

  describe("Metadata", () => {
    it("exports correct metadata", () => {
      const { metadata } = require("@/app/faq/page");

      expect(metadata.title).toBe("Frequently Asked Questions - Let It Rip");
      expect(metadata.description).toContain(
        "Find answers to common questions",
      );
      expect(metadata.keywords).toContain("FAQ");
      expect(metadata.keywords).toContain("help");
      expect(metadata.openGraph?.title).toBe("FAQ - Let It Rip Help Center");
    });
  });
});
