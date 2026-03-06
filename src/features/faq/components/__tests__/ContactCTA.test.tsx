import { render, screen } from "@testing-library/react";
import { ContactCTA } from "../ContactCTA";

// Mock next/link
jest.mock("next/link", () => {
  return ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock SITE_CONFIG
jest.mock("@/constants/site", () => ({
  SITE_CONFIG: {
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
      promotions: "/promotions",
    },
  },
}));

describe("ContactCTA", () => {
  // ====================================
  // Rendering
  // ====================================
  describe("Rendering", () => {
    it("renders the component", () => {
      render(<ContactCTA />);
      expect(screen.getByText("Still Need Help?")).toBeInTheDocument();
    });

    it("renders the heading as h2", () => {
      render(<ContactCTA />);
      const heading = screen.getByText("Still Need Help?");
      expect(heading.tagName).toBe("H2");
    });

    it("renders the description text", () => {
      render(<ContactCTA />);
      expect(
        screen.getByText(/Can't find the answer you're looking for\?/),
      ).toBeInTheDocument();
    });

    it("renders full description message", () => {
      render(<ContactCTA />);
      expect(
        screen.getByText(/Our support team is here to help you/),
      ).toBeInTheDocument();
    });
  });

  // ====================================
  // Email Contact Card
  // ====================================
  describe("Email Contact Card", () => {
    it('renders "Email Us" label', () => {
      render(<ContactCTA />);
      expect(screen.getByText("Email Us")).toBeInTheDocument();
    });

    it("displays the email address", () => {
      render(<ContactCTA />);
      expect(screen.getByText("info@letitrip.in")).toBeInTheDocument();
    });

    it("has correct mailto link", () => {
      render(<ContactCTA />);
      const emailLink = screen.getByText("Email Us").closest("a");
      expect(emailLink).toHaveAttribute("href", "mailto:info@letitrip.in");
    });
  });

  // ====================================
  // Phone Contact Card
  // ====================================
  describe("Phone Contact Card", () => {
    it('renders "Call Us" label', () => {
      render(<ContactCTA />);
      expect(screen.getByText("Call Us")).toBeInTheDocument();
    });

    it("displays the phone number", () => {
      render(<ContactCTA />);
      expect(screen.getByText("+1 (555) 123-4567")).toBeInTheDocument();
    });

    it("has correct tel link", () => {
      render(<ContactCTA />);
      const phoneLink = screen.getByText("Call Us").closest("a");
      expect(phoneLink).toHaveAttribute("href", "tel:+1 (555) 123-4567");
    });
  });

  // ====================================
  // Contact Form Card
  // ====================================
  describe("Contact Form Card", () => {
    it('renders "Contact Form" label', () => {
      render(<ContactCTA />);
      expect(screen.getByText("Contact Form")).toBeInTheDocument();
    });

    it('renders "Submit a request" subtitle', () => {
      render(<ContactCTA />);
      expect(screen.getByText("Submit a request")).toBeInTheDocument();
    });

    it("links to /contact page", () => {
      render(<ContactCTA />);
      const contactFormLink = screen.getByText("Contact Form").closest("a");
      expect(contactFormLink).toHaveAttribute("href", "/contact");
    });
  });

  // ====================================
  // Primary CTA Button
  // ====================================
  describe("Primary CTA Button", () => {
    it('renders "Contact Support Team" button', () => {
      render(<ContactCTA />);
      expect(screen.getByText("Contact Support Team")).toBeInTheDocument();
    });

    it("CTA links to /contact page", () => {
      render(<ContactCTA />);
      const ctaLink = screen.getByText("Contact Support Team").closest("a");
      expect(ctaLink).toHaveAttribute("href", "/contact");
    });
  });

  // ====================================
  // Three Contact Options
  // ====================================
  describe("Three Contact Options", () => {
    it("renders all three contact cards", () => {
      render(<ContactCTA />);
      expect(screen.getByText("Email Us")).toBeInTheDocument();
      expect(screen.getByText("Call Us")).toBeInTheDocument();
      expect(screen.getByText("Contact Form")).toBeInTheDocument();
    });

    it("renders contact details for each card", () => {
      render(<ContactCTA />);
      // Email card shows email address
      expect(screen.getByText("info@letitrip.in")).toBeInTheDocument();
      // Phone card shows phone number
      expect(screen.getByText("+1 (555) 123-4567")).toBeInTheDocument();
      // Contact form card shows subtitle
      expect(screen.getByText("Submit a request")).toBeInTheDocument();
    });
  });

  // ====================================
  // SVG Icons
  // ====================================
  describe("SVG Icons", () => {
    it("renders SVG icons for each section", () => {
      render(<ContactCTA />);
      // Main icon + 3 contact card icons + CTA arrow icon = 5 SVGs
      const svgs = document.querySelectorAll("svg");
      expect(svgs.length).toBe(5);
    });
  });

  // ====================================
  // Links Count
  // ====================================
  describe("Links Count", () => {
    it("has the correct total number of links", () => {
      render(<ContactCTA />);
      const links = screen.getAllByRole("link");
      // Contact Form card (Link) + CTA button (Link) = 2 Next.js Links
      // Email card (<a>) and Phone card (<a>) are not role="link" but native anchors
      // Actually all <a> tags have role=link by default
      // Email (mailto) + Phone (tel) + Contact Form (/contact) + CTA (/contact) = 4
      expect(links).toHaveLength(4);
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("uses semantic heading hierarchy", () => {
      render(<ContactCTA />);
      const heading = screen.getByText("Still Need Help?");
      expect(heading.tagName).toBe("H2");
    });

    it("all interactive elements are accessible", () => {
      render(<ContactCTA />);
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toBeVisible();
      });
    });

    it("email link is accessible", () => {
      render(<ContactCTA />);
      const emailLink = screen.getByText("Email Us").closest("a");
      expect(emailLink).toBeVisible();
      expect(emailLink).toHaveAttribute("href", "mailto:info@letitrip.in");
    });

    it("phone link is accessible", () => {
      render(<ContactCTA />);
      const phoneLink = screen.getByText("Call Us").closest("a");
      expect(phoneLink).toBeVisible();
      expect(phoneLink).toHaveAttribute("href", "tel:+1 (555) 123-4567");
    });
  });

  // ====================================
  // Visual Structure
  // ====================================
  describe("Visual Structure", () => {
    it("renders as a centered container", () => {
      render(<ContactCTA />);
      const heading = screen.getByText("Still Need Help?");
      const container = heading.closest("div");
      expect(container?.className).toContain("text-center");
    });

    it("renders contact grid layout", () => {
      render(<ContactCTA />);
      // The grid container wraps the 3 contact cards
      const emailCard = screen.getByText("Email Us").closest("a");
      const grid = emailCard?.parentElement;
      expect(grid?.className).toContain("grid");
      expect(grid?.className).toContain("md:grid-cols-3");
    });
  });

  // ====================================
  // SITE_CONFIG Integration
  // ====================================
  describe("SITE_CONFIG Integration", () => {
    it("uses SITE_CONFIG.contact.email for mailto link", () => {
      render(<ContactCTA />);
      const emailLink = screen.getByText("info@letitrip.in").closest("a");
      expect(emailLink).toHaveAttribute("href", "mailto:info@letitrip.in");
    });

    it("uses SITE_CONFIG.contact.phone for tel link", () => {
      render(<ContactCTA />);
      const phoneLink = screen.getByText("+1 (555) 123-4567").closest("a");
      expect(phoneLink).toHaveAttribute("href", "tel:+1 (555) 123-4567");
    });

    it("displays email from SITE_CONFIG as text", () => {
      render(<ContactCTA />);
      expect(screen.getByText("info@letitrip.in")).toBeInTheDocument();
    });

    it("displays phone from SITE_CONFIG as text", () => {
      render(<ContactCTA />);
      expect(screen.getByText("+1 (555) 123-4567")).toBeInTheDocument();
    });
  });
});
