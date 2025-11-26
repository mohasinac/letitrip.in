import { render, screen } from "@testing-library/react";
import CookiePolicyPage from "./page";

// Mock LegalPageLayout component
jest.mock("@/components/legal/LegalPageLayout", () => ({
  __esModule: true,
  default: ({ children, title, lastUpdated, version, effectiveDate }: any) => (
    <div data-testid="legal-layout">
      <header>
        <h1>{title}</h1>
        <p>Last Updated: {lastUpdated}</p>
        <p>Version: {version}</p>
        <p>Effective Date: {effectiveDate}</p>
      </header>
      <main>{children}</main>
    </div>
  ),
}));

describe("CookiePolicyPage", () => {
  // ===== Basic Rendering Tests =====
  describe("Basic Rendering", () => {
    it("should render the page title", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("Cookie Policy")).toBeInTheDocument();
    });

    it("should render last updated date", () => {
      render(<CookiePolicyPage />);
      expect(
        screen.getByText(/Last Updated: November 7, 2025/i)
      ).toBeInTheDocument();
    });

    it("should render version number", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText(/Version: 2.0/i)).toBeInTheDocument();
    });

    it("should render effective date", () => {
      render(<CookiePolicyPage />);
      expect(
        screen.getByText(/Effective Date: November 1, 2025/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Cookie Types Tests =====
  describe("Cookie Types", () => {
    it("should describe essential cookies", () => {
      render(<CookiePolicyPage />);
      expect(
        screen.getByText("2.1 Essential Cookies (Strictly Necessary)")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/necessary for the website to function/i)
      ).toBeInTheDocument();
    });

    it("should list essential cookie examples (session, auth, cart)", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText(/Session cookies/i)).toBeInTheDocument();
      expect(screen.getByText(/Authentication tokens/i)).toBeInTheDocument();
      expect(screen.getByText(/Shopping cart/i)).toBeInTheDocument();
    });

    it("should describe performance/analytics cookies", () => {
      render(<CookiePolicyPage />);
      expect(
        screen.getByText("2.2 Performance Cookies (Analytics)")
      ).toBeInTheDocument();
      expect(screen.getByText(/Google Analytics/i)).toBeInTheDocument();
    });

    it("should describe functional cookies", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("2.3 Functional Cookies")).toBeInTheDocument();
      expect(screen.getByText(/Recently viewed items/i)).toBeInTheDocument();
    });

    it("should describe advertising cookies", () => {
      render(<CookiePolicyPage />);
      expect(
        screen.getByText("2.4 Targeting/Advertising Cookies")
      ).toBeInTheDocument();
      expect(screen.getByText(/Google Ads/i)).toBeInTheDocument();
    });

    it("should describe social media cookies", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("2.5 Social Media Cookies")).toBeInTheDocument();
      expect(screen.getByText(/Facebook/i)).toBeInTheDocument();
    });
  });

  // ===== Tracking Technologies Tests =====
  describe("Other Tracking Technologies", () => {
    it("should describe web beacons/pixels", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("3.1 Web Beacons (Pixels)")).toBeInTheDocument();
      expect(
        screen.getByText(/Small invisible images embedded/i)
      ).toBeInTheDocument();
    });

    it("should describe local storage", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("3.2 Local Storage")).toBeInTheDocument();
      expect(
        screen.getByText(/Browser storage that persists/i)
      ).toBeInTheDocument();
    });

    it("should describe session storage", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("3.3 Session Storage")).toBeInTheDocument();
      expect(
        screen.getByText(/Temporary storage that clears/i)
      ).toBeInTheDocument();
    });

    it("should describe device fingerprinting", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("3.4 Device Fingerprinting")).toBeInTheDocument();
      expect(screen.getByText(/device configuration/i)).toBeInTheDocument();
    });
  });

  // ===== Third-Party Services Tests =====
  describe("Third-Party Services", () => {
    it("should list Razorpay as payment processor", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText(/Razorpay/i)).toBeInTheDocument();
      const razorpayLink = screen.getByRole("link", {
        name: /razorpay privacy policy/i,
      });
      expect(razorpayLink).toHaveAttribute(
        "href",
        "https://razorpay.com/privacy/"
      );
    });

    it("should list Google Analytics with privacy link", () => {
      render(<CookiePolicyPage />);
      const googleLinks = screen.getAllByRole("link", {
        name: /google privacy policy/i,
      });
      expect(googleLinks.length).toBeGreaterThan(0);
      expect(googleLinks[0]).toHaveAttribute(
        "href",
        "https://policies.google.com/privacy"
      );
    });

    it("should list Firebase with privacy link", () => {
      render(<CookiePolicyPage />);
      const firebaseLink = screen.getByRole("link", {
        name: /firebase privacy policy/i,
      });
      expect(firebaseLink).toHaveAttribute(
        "href",
        "https://firebase.google.com/support/privacy"
      );
    });

    it("should list Facebook/Meta advertising", () => {
      render(<CookiePolicyPage />);
      const metaLink = screen.getByRole("link", {
        name: /meta privacy policy/i,
      });
      expect(metaLink).toHaveAttribute(
        "href",
        "https://www.facebook.com/privacy/policy"
      );
    });
  });

  // ===== Cookie Management Tests =====
  describe("Cookie Management", () => {
    it("should describe cookie consent banner options", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("5.1 Cookie Consent Banner")).toBeInTheDocument();
      expect(screen.getByText(/Accept All/i)).toBeInTheDocument();
      expect(screen.getByText(/Reject Non-Essential/i)).toBeInTheDocument();
    });

    it("should provide browser settings instructions", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("5.2 Browser Settings")).toBeInTheDocument();
      expect(screen.getByText(/Google Chrome/i)).toBeInTheDocument();
      expect(screen.getByText(/Firefox/i)).toBeInTheDocument();
      expect(screen.getByText(/Safari/i)).toBeInTheDocument();
    });

    it("should provide opt-out tool links", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("5.3 Opt-Out Tools")).toBeInTheDocument();
      const googleOptOutLink = screen.getByRole("link", {
        name: /install google analytics opt-out/i,
      });
      expect(googleOptOutLink).toHaveAttribute(
        "href",
        "https://tools.google.com/dlpage/gaoptout"
      );
    });

    it("should describe mobile device settings", () => {
      render(<CookiePolicyPage />);
      expect(
        screen.getByText("5.4 Mobile Device Settings")
      ).toBeInTheDocument();
      expect(screen.getByText(/iOS/i)).toBeInTheDocument();
      expect(screen.getByText(/Android/i)).toBeInTheDocument();
    });
  });

  // ===== Cookie Lifespan Tests =====
  describe("Cookie Lifespan", () => {
    it("should describe session cookies (deleted when browser closes)", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("7.1 Session Cookies")).toBeInTheDocument();
      expect(
        screen.getByText(/Deleted when you close your browser/i)
      ).toBeInTheDocument();
    });

    it("should describe persistent cookies with time ranges", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("7.2 Persistent Cookies")).toBeInTheDocument();
      expect(screen.getByText(/1-7 days/i)).toBeInTheDocument();
      expect(screen.getByText(/30-90 days/i)).toBeInTheDocument();
      expect(screen.getByText(/1-2 years/i)).toBeInTheDocument();
    });
  });

  // ===== User Rights Tests =====
  describe("User Rights", () => {
    it("should describe user rights under privacy laws", () => {
      render(<CookiePolicyPage />);
      expect(
        screen.getByText("8. Cookies and Your Rights")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Know what cookies are being used/i)
      ).toBeInTheDocument();
    });

    it("should describe impact of disabling cookies", () => {
      render(<CookiePolicyPage />);
      expect(
        screen.getByText("9. Impact of Disabling Cookies")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Essential cookies cannot be disabled/i)
      ).toBeInTheDocument();
    });

    it("should describe security cookies", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("10. Cookies for Security")).toBeInTheDocument();
      expect(screen.getByText(/CSRF tokens/i)).toBeInTheDocument();
    });
  });

  // ===== Do Not Track Tests =====
  describe("Do Not Track", () => {
    it("should describe DNT signal policy", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("6. Do Not Track (DNT)")).toBeInTheDocument();
      expect(
        screen.getByText(/our site does not respond to DNT signals/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Glossary Tests =====
  describe("Glossary", () => {
    it("should provide cookie terminology glossary", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("15. Glossary")).toBeInTheDocument();
      expect(screen.getByText(/First-party cookies/i)).toBeInTheDocument();
      expect(screen.getByText(/Third-party cookies/i)).toBeInTheDocument();
      expect(screen.getByText(/Session cookies/i)).toBeInTheDocument();
    });
  });

  // ===== Contact Information Tests =====
  describe("Contact Information", () => {
    it("should provide contact information for cookie inquiries", () => {
      render(<CookiePolicyPage />);
      expect(
        screen.getByText("14. Contact Us About Cookies")
      ).toBeInTheDocument();
      expect(screen.getByText(/privacy@letitrip.com/i)).toBeInTheDocument();
    });

    it("should link to support ticket creation", () => {
      render(<CookiePolicyPage />);
      const supportLink = screen.getByRole("link", {
        name: /create a support ticket/i,
      });
      expect(supportLink).toHaveAttribute("href", "/support/ticket");
    });
  });

  // ===== Version History Tests =====
  describe("Version History", () => {
    it("should render version history section", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText(/Version History/i)).toBeInTheDocument();
    });

    it("should show Version 2.0 changes", () => {
      render(<CookiePolicyPage />);
      expect(
        screen.getByText(/Version 2.0 \(November 1, 2025\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/India-specific information/i)
      ).toBeInTheDocument();
    });

    it("should show Version 1.0 initial release", () => {
      render(<CookiePolicyPage />);
      expect(
        screen.getByText(/Version 1.0 \(January 1, 2024\)/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Layout Integration Tests =====
  describe("Layout Integration", () => {
    it("should render using LegalPageLayout component", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByTestId("legal-layout")).toBeInTheDocument();
    });

    it("should pass correct props to LegalPageLayout", () => {
      render(<CookiePolicyPage />);
      expect(screen.getByText("Cookie Policy")).toBeInTheDocument();
      expect(
        screen.getByText(/Last Updated: November 7, 2025/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Version: 2.0/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Effective Date: November 1, 2025/i)
      ).toBeInTheDocument();
    });
  });

  // ===== External Links Tests =====
  describe("External Links", () => {
    it("should render all external links with proper attributes", () => {
      render(<CookiePolicyPage />);
      const externalLinks = screen.getAllByRole("link", {
        name: /privacy|policy|opt-out/i,
      });

      externalLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (
          href &&
          (href.startsWith("http://") || href.startsWith("https://"))
        ) {
          expect(link).toHaveAttribute("target", "_blank");
          expect(link).toHaveAttribute("rel", "noopener noreferrer");
        }
      });
    });
  });
});
