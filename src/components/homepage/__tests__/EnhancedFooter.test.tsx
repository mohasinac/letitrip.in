import { render, screen } from "@testing-library/react";
import { EnhancedFooter } from "../EnhancedFooter";

// Mock SITE_CONFIG - must include all properties used transitively (navigation.tsx uses nav.*)
jest.mock("@/constants/site", () => ({
  SITE_CONFIG: {
    brand: {
      name: "LetItRip",
      shortName: "L",
      logoUrl: "/logo.png",
      logoAlt: "LetItRip",
      tagline: "",
    },
    contact: {
      email: "info@letitrip.in",
      phone: "+1 (555) 123-4567",
      address: "123 Marketplace Street, City, Country",
    },
    nav: {
      home: "/",
      products: "/products",
      auctions: "/auctions",
      sellers: "/sellers",
      categories: "/categories",
      promotions: "/promotions",
      about: "/about",
      contact: "/contact",
      blog: "/blog",
    },
    account: {
      profile: "/user/profile",
      settings: "/user/settings",
      orders: "/user/orders",
      wishlist: "/user/wishlist",
      addresses: "/user/addresses",
      cart: "/cart",
      login: "/auth/login",
      register: "/auth/register",
      logout: "/auth/logout",
      forgotPassword: "/auth/forgot-password",
      verifyEmail: "/auth/verify-email",
    },
    social: { facebook: "", twitter: "", instagram: "", linkedin: "" },
    seo: {},
  },
}));

describe("EnhancedFooter", () => {
  // ====================================
  // Rendering
  // ====================================
  describe("Rendering", () => {
    it("renders the footer", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("LetItRip")).toBeInTheDocument();
    });

    it("renders as a footer element", () => {
      const { container } = render(<EnhancedFooter />);
      expect(container.querySelector("footer")).toBeInTheDocument();
    });

    it("renders the brand description", () => {
      render(<EnhancedFooter />);
      expect(
        screen.getByText(/Your trusted marketplace for buying and selling/),
      ).toBeInTheDocument();
    });
  });

  // ====================================
  // Footer Sections
  // ====================================
  describe("Footer Sections", () => {
    it("renders all 4 section titles", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("Company")).toBeInTheDocument();
      expect(screen.getByText("Support")).toBeInTheDocument();
      expect(screen.getByText("For Sellers")).toBeInTheDocument();
      expect(screen.getByText("Legal")).toBeInTheDocument();
    });

    it("renders Company section links", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("About Us")).toBeInTheDocument();
      expect(screen.getByText("Careers")).toBeInTheDocument();
      expect(screen.getByText("Press Kit")).toBeInTheDocument();
      expect(screen.getByText("Blog")).toBeInTheDocument();
      expect(screen.getByText("Contact Us")).toBeInTheDocument();
    });

    it("renders Support section links", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("Help Center")).toBeInTheDocument();
      expect(screen.getByText("FAQs")).toBeInTheDocument();
      expect(screen.getByText("Shipping Info")).toBeInTheDocument();
      expect(screen.getByText("Returns")).toBeInTheDocument();
      expect(screen.getByText("Track Order")).toBeInTheDocument();
    });

    it("renders For Sellers section links", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("Sell on Platform")).toBeInTheDocument();
      expect(screen.getByText("Seller Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Seller Guide")).toBeInTheDocument();
      expect(screen.getByText("Fees & Pricing")).toBeInTheDocument();
      expect(screen.getByText("Seller Success")).toBeInTheDocument();
    });

    it("renders Legal section links", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("Terms of Service")).toBeInTheDocument();
      expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
      expect(screen.getByText("Cookie Policy")).toBeInTheDocument();
      expect(screen.getByText("Refund Policy")).toBeInTheDocument();
      expect(screen.getByText("Prohibited Items")).toBeInTheDocument();
    });

    it("renders 20 section links total (5 per section)", () => {
      render(<EnhancedFooter />);
      const lists = screen.getAllByRole("list");
      let totalItems = 0;
      lists.forEach((list) => {
        totalItems += list.querySelectorAll("li").length;
      });
      expect(totalItems).toBe(20);
    });
  });

  // ====================================
  // Section Links - href
  // ====================================
  describe("Section Link Hrefs", () => {
    it("Company links have correct hrefs", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("About Us").closest("a")).toHaveAttribute(
        "href",
        "/about",
      );
      expect(screen.getByText("Careers").closest("a")).toHaveAttribute(
        "href",
        "/careers",
      );
      expect(screen.getByText("Blog").closest("a")).toHaveAttribute(
        "href",
        "/blog",
      );
    });

    it("Support links have correct hrefs", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("FAQs").closest("a")).toHaveAttribute(
        "href",
        "/faqs",
      );
      expect(screen.getByText("Track Order").closest("a")).toHaveAttribute(
        "href",
        "/track",
      );
    });
  });

  // ====================================
  // Social Links
  // ====================================
  describe("Social Links", () => {
    it("renders all 5 social media links", () => {
      render(<EnhancedFooter />);
      expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
      expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
      expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
      expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
      expect(screen.getByLabelText("YouTube")).toBeInTheDocument();
    });

    it("social links open in new tab", () => {
      render(<EnhancedFooter />);
      const facebookLink = screen.getByLabelText("Facebook");
      expect(facebookLink).toHaveAttribute("target", "_blank");
      expect(facebookLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("social links have correct hrefs", () => {
      render(<EnhancedFooter />);
      expect(screen.getByLabelText("Facebook")).toHaveAttribute(
        "href",
        "https://facebook.com/letitrip",
      );
      expect(screen.getByLabelText("Instagram")).toHaveAttribute(
        "href",
        "https://instagram.com/letitrip",
      );
      expect(screen.getByLabelText("Twitter")).toHaveAttribute(
        "href",
        "https://twitter.com/letitrip",
      );
    });

    it("renders social link icons", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("📘")).toBeInTheDocument();
      expect(screen.getByText("📷")).toBeInTheDocument();
      expect(screen.getByText("🐦")).toBeInTheDocument();
      expect(screen.getByText("💼")).toBeInTheDocument();
      expect(screen.getByText("📺")).toBeInTheDocument();
    });
  });

  // ====================================
  // Contact Info
  // ====================================
  describe("Contact Info", () => {
    it("renders email from SITE_CONFIG", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("info@letitrip.in")).toBeInTheDocument();
    });

    it("renders phone from SITE_CONFIG", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("+1 (555) 123-4567")).toBeInTheDocument();
    });

    it("renders address from SITE_CONFIG", () => {
      render(<EnhancedFooter />);
      expect(
        screen.getByText("123 Marketplace Street, City, Country"),
      ).toBeInTheDocument();
    });

    it("email has mailto link", () => {
      render(<EnhancedFooter />);
      const emailLink = screen.getByText("info@letitrip.in").closest("a");
      expect(emailLink).toHaveAttribute("href", "mailto:info@letitrip.in");
    });

    it("phone has tel link", () => {
      render(<EnhancedFooter />);
      const phoneLink = screen.getByText("+1 (555) 123-4567").closest("a");
      expect(phoneLink).toHaveAttribute("href", "tel:+1 (555) 123-4567");
    });

    it("renders contact labels with icons", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("📧 Email")).toBeInTheDocument();
      expect(screen.getByText("📞 Phone")).toBeInTheDocument();
      expect(screen.getByText("📍 Address")).toBeInTheDocument();
    });
  });

  // ====================================
  // Payment Methods
  // ====================================
  describe("Payment Methods", () => {
    it("renders the payment methods heading", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("Accepted Payment Methods")).toBeInTheDocument();
    });

    it("renders all 6 payment methods", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("💳 Visa")).toBeInTheDocument();
      expect(screen.getByText("💳 Mastercard")).toBeInTheDocument();
      expect(screen.getByText("💳 Amex")).toBeInTheDocument();
      expect(screen.getByText("📱 UPI")).toBeInTheDocument();
      expect(screen.getByText("💰 Net Banking")).toBeInTheDocument();
      expect(screen.getByText("📲 Wallets")).toBeInTheDocument();
    });
  });

  // ====================================
  // Copyright & Bottom Bar
  // ====================================
  describe("Copyright & Bottom Bar", () => {
    it("renders copyright with current year and brand name", () => {
      render(<EnhancedFooter />);
      const currentYear = new Date().getFullYear();
      expect(
        screen.getByText(`© ${currentYear} LetItRip. All rights reserved.`),
      ).toBeInTheDocument();
    });

    it("renders bottom bar links", () => {
      render(<EnhancedFooter />);
      // These are the bottom bar short links (separate from the section links)
      const termsLinks = screen.getAllByText("Terms");
      expect(termsLinks.length).toBeGreaterThanOrEqual(1);

      const privacyLinks = screen.getAllByText("Privacy");
      expect(privacyLinks.length).toBeGreaterThanOrEqual(1);

      const cookiesLinks = screen.getAllByText("Cookies");
      expect(cookiesLinks.length).toBeGreaterThanOrEqual(1);

      expect(screen.getByText("Sitemap")).toBeInTheDocument();
    });

    it("bottom bar links have correct hrefs", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("Sitemap").closest("a")).toHaveAttribute(
        "href",
        "/sitemap.xml",
      );
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("renders brand name as h3 heading", () => {
      render(<EnhancedFooter />);
      const brandHeading = screen.getByRole("heading", { level: 3 });
      expect(brandHeading).toHaveTextContent("LetItRip");
    });

    it("social links have aria-label attributes", () => {
      render(<EnhancedFooter />);
      const socialNames = [
        "Facebook",
        "Instagram",
        "Twitter",
        "LinkedIn",
        "YouTube",
      ];
      socialNames.forEach((name) => {
        expect(screen.getByLabelText(name)).toBeInTheDocument();
      });
    });

    it("all text content is visible", () => {
      render(<EnhancedFooter />);
      expect(screen.getByText("LetItRip")).toBeVisible();
      expect(screen.getByText("Company")).toBeVisible();
      expect(screen.getByText("info@letitrip.in")).toBeVisible();
    });
  });
});
