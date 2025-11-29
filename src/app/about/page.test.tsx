import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/about/page";

// Mock the SEO utilities
jest.mock("@/lib/seo/metadata", () => ({
  generateMetadata: jest.fn(() => ({
    title: "About Us - Authentic Collectibles Seller",
    description: "Mock description",
  })),
}));

jest.mock("@/lib/seo/schema", () => ({
  generateLocalBusinessSchema: jest.fn(() => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Mock Business",
  })),
  generateJSONLD: jest.fn(() => ({
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Mock Business",
    }),
  })),
}));

describe("About Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Page Structure", () => {
    it("renders the main page structure", () => {
      render(<AboutPage />);

      // Check main container
      const mainElement = screen.getByRole("main");
      expect(mainElement).toHaveAttribute("id", "about-page");
      expect(mainElement).toHaveClass("min-h-screen", "bg-gray-50");
    });

    it("renders hero section with correct content", () => {
      render(<AboutPage />);

      // Check hero section
      expect(screen.getByText("About Let It Rip")).toBeInTheDocument();
      expect(
        screen.getByText(
          "India's Trusted Source for Authentic Imported Collectibles",
        ),
      ).toBeInTheDocument();
    });

    it("renders main content sections", () => {
      render(<AboutPage />);

      // Check section headings
      expect(screen.getByText("Our Story")).toBeInTheDocument();
      expect(screen.getByText("What We Sell")).toBeInTheDocument();
      expect(screen.getByText("Why Choose Let It Rip?")).toBeInTheDocument();
      expect(screen.getByText("Where We Import From")).toBeInTheDocument();
      expect(screen.getByText("Our Promise to You")).toBeInTheDocument();
    });
  });

  describe("Content Sections", () => {
    it("renders Our Story section with correct content", () => {
      render(<AboutPage />);

      // Check key phrases from the story - use partial matches since text is split
      expect(screen.getByText(/famous battle cry/)).toBeInTheDocument();
      expect(
        screen.getByText(/We're India's premier seller/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Founded by collectors, for collectors/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/That's why we created Let It Rip/),
      ).toBeInTheDocument();
    });

    it("renders What We Sell section with all categories", () => {
      render(<AboutPage />);

      // Check all product categories are present
      const categories = [
        "Beyblades",
        "Pokemon TCG",
        "Yu-Gi-Oh! TCG",
        "Transformers",
        "Hot Wheels",
        "Stickers",
        "Crafts",
        "Collectibles",
      ];

      categories.forEach((category) => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    it("renders Why Choose Us section with all features", () => {
      render(<AboutPage />);

      // Check all feature titles
      const features = [
        "100% Authentic Products",
        "Zero Customs Charges for You",
        "Fast India Delivery",
        "COD Available",
        "Collector-Friendly",
        "Easy Returns",
      ];

      features.forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it("renders import sources section", () => {
      render(<AboutPage />);

      // Check countries
      expect(screen.getByText("Japan")).toBeInTheDocument();
      expect(screen.getByText("USA")).toBeInTheDocument();
      expect(screen.getByText("China")).toBeInTheDocument();

      // Check flag emojis
      expect(screen.getByText("🇯🇵")).toBeInTheDocument();
      expect(screen.getByText("🇺🇸")).toBeInTheDocument();
      expect(screen.getByText("🇨🇳")).toBeInTheDocument();
    });

    it("renders Our Promise section", () => {
      render(<AboutPage />);

      expect(screen.getByText("Our Promise to You")).toBeInTheDocument();
      // Check for key phrases that are unique to the promise section
      expect(
        screen.getByText(/Every order is handled with/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Every customer gets the/)).toBeInTheDocument();
      expect(screen.getByText(/We're not just a store/)).toBeInTheDocument();
    });
  });

  describe("Call to Action", () => {
    it("renders contact CTA section", () => {
      render(<AboutPage />);

      expect(
        screen.getByText("Questions? We're Here to Help!"),
      ).toBeInTheDocument();
      expect(screen.getByText("Contact Support")).toBeInTheDocument();
      expect(screen.getByText("View FAQs")).toBeInTheDocument();
    });

    it("renders working links in CTA section", () => {
      render(<AboutPage />);

      const supportLink = screen.getByRole("link", {
        name: /contact support/i,
      });
      const faqLink = screen.getByRole("link", { name: /view faqs/i });

      expect(supportLink).toHaveAttribute("href", "/support/ticket");
      expect(faqLink).toHaveAttribute("href", "/faq");
    });
  });

  describe("SEO and Schema", () => {
    it("includes JSON-LD schema script", () => {
      render(<AboutPage />);

      const scriptElement = document.querySelector(
        'script[type="application/ld+json"]',
      );
      expect(scriptElement).toBeInTheDocument();
    });

    it("calls schema generation functions", () => {
      const {
        generateLocalBusinessSchema,
        generateJSONLD,
      } = require("@/lib/seo/schema");

      render(<AboutPage />);

      expect(generateLocalBusinessSchema).toHaveBeenCalledTimes(1);
      expect(generateJSONLD).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("has proper heading hierarchy", () => {
      render(<AboutPage />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("About Let It Rip");

      const h2Elements = screen.getAllByRole("heading", { level: 2 });
      expect(h2Elements.length).toBe(5); // Our Story, What We Sell, Why Choose Us, Where We Import From, Our Promise to You

      const h3Elements = screen.getAllByRole("heading", { level: 3 });
      expect(h3Elements.length).toBeGreaterThan(15); // Many h3s for categories, features, countries
    });

    it("has descriptive link text", () => {
      render(<AboutPage />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveTextContent(/\w+/); // Links should have meaningful text
      });
    });
  });

  describe("Visual Structure", () => {
    it("renders product categories in a grid layout", () => {
      render(<AboutPage />);

      // The grid should contain category cards
      const categoryCards = screen.getAllByText(
        /Authentic Takara Tomy|Official booster packs|Konami originals|Hasbro & Takara Tomy|Die-cast cars|Collectible stickers|Japanese washi tape|Figurines, model kits/,
      );
      expect(categoryCards.length).toBe(8); // Should have 8 categories
    });

    it("renders features with icons and descriptions", () => {
      render(<AboutPage />);

      // Check for feature icons - some appear multiple times
      expect(screen.getAllByText("✅").length).toBeGreaterThan(0);
      expect(screen.getAllByText("💰").length).toBeGreaterThan(0);
      expect(screen.getAllByText("🚀").length).toBeGreaterThan(0);
      expect(screen.getAllByText("💵").length).toBeGreaterThan(0);
      expect(screen.getAllByText("🎯").length).toBeGreaterThan(0); // Appears in categories and features
      expect(screen.getAllByText("🔄").length).toBeGreaterThan(0);
    });

    it("renders import source cards with gradients", () => {
      render(<AboutPage />);

      // Check that the source cards are rendered (they have specific classes)
      const japanCard = screen.getByText("Japan").closest("div");
      const usaCard = screen.getByText("USA").closest("div");
      const chinaCard = screen.getByText("China").closest("div");

      expect(japanCard).toHaveClass("bg-gradient-to-br", "from-red-50");
      expect(usaCard).toHaveClass("bg-gradient-to-br", "from-blue-50");
      expect(chinaCard).toHaveClass("bg-gradient-to-br", "from-yellow-50");
    });
  });
});
