import { render, screen } from "@testing-library/react";
import TermsOfServicePage from "./page";

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

describe("TermsOfServicePage", () => {
  // ===== Basic Rendering Tests =====
  describe("Basic Rendering", () => {
    it("should render the page title", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    });

    it("should render last updated date", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/Last Updated: November 7, 2025/i),
      ).toBeInTheDocument();
    });

    it("should render version number", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText(/Version: 2.0/i)).toBeInTheDocument();
    });

    it("should render effective date", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/Effective Date: November 1, 2025/i),
      ).toBeInTheDocument();
    });
  });

  // ===== Content Sections Tests =====
  describe("Content Sections", () => {
    it("should render Acceptance of Terms section", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText(/1\..*Acceptance of Terms/i)).toBeInTheDocument();
      expect(
        screen.getByText(/By accessing or using our platform/i),
      ).toBeInTheDocument();
    });

    it("should render Definitions section with key terms", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText(/2\..*Definitions/i)).toBeInTheDocument();
      expect(screen.getByText(/"Platform"/i)).toBeInTheDocument();
      expect(screen.getByText(/"Buyer"/i)).toBeInTheDocument();
      expect(screen.getByText(/"Seller"/i)).toBeInTheDocument();
    });

    it("should render Account Registration section", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/3\..*Account Registration/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/3\.1.*Eligibility/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Be at least 18 years of age/i),
      ).toBeInTheDocument();
    });

    it("should render User Conduct section with prohibited activities", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText(/4\..*User Conduct/i)).toBeInTheDocument();
      expect(
        screen.getByText(/4\.1.*Prohibited Activities/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Post false, misleading, or fraudulent listings/i),
      ).toBeInTheDocument();
    });

    it("should render Buying on Let It Rip section", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/5\..*Buying on Let It Rip/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/5\.1.*Product Listings/i)).toBeInTheDocument();
      expect(screen.getByText(/5\.2.*Placing Orders/i)).toBeInTheDocument();
    });

    it("should render Auctions section with bidding rules", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText(/6\..*Auctions/i)).toBeInTheDocument();
      expect(screen.getByText(/6\.1.*Bidding/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Your bid is a binding commitment/i),
      ).toBeInTheDocument();
    });

    it("should render Selling on Let It Rip section", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/7\..*Selling on Let It Rip/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/7\.1.*Shop Creation/i)).toBeInTheDocument();
      expect(screen.getByText(/Regular Users can create/i)).toBeInTheDocument();
    });

    it("should render Returns and Refunds section", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText(/8\..*Returns and Refunds/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Most items can be returned within 30 days/i),
      ).toBeInTheDocument();
    });

    it("should render Reviews and Ratings section", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText(/9\..*Reviews and Ratings/i)).toBeInTheDocument();
      expect(screen.getByText(/9\.1.*Posting Reviews/i)).toBeInTheDocument();
    });

    it("should render Intellectual Property section", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/10\..*Intellectual Property/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/10\.1.*Platform Content/i)).toBeInTheDocument();
    });

    it("should render Limitation of Liability section", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/11\..*Limitation of Liability/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/TO THE MAXIMUM EXTENT PERMITTED BY LAW/i),
      ).toBeInTheDocument();
    });

    it("should render Dispute Resolution section", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText(/13\..*Dispute Resolution/i)).toBeInTheDocument();
      expect(
        screen.getByText(/13\.1.*Buyer-Seller Disputes/i),
      ).toBeInTheDocument();
    });

    it("should render Contact Information section", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText("18. Contact Information")).toBeInTheDocument();
      expect(screen.getByText(/legal@letitrip.com/i)).toBeInTheDocument();
    });
  });

  // ===== Seller-Specific Terms Tests =====
  describe("Seller-Specific Terms", () => {
    it("should specify shop creation limit (1 shop per regular user)", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText(/Regular Users can create/i)).toBeInTheDocument();
      expect(screen.getAllByText(/1 shop/i)[0]).toBeInTheDocument();
    });

    it("should specify auction limit (5 active auctions per shop)", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/5 active auctions per shop/i),
      ).toBeInTheDocument();
    });

    it("should describe seller fees (5-15% commission)", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText("7.4 Seller Fees")).toBeInTheDocument();
      expect(screen.getByText(/5-15% of each sale/i)).toBeInTheDocument();
    });

    it("should describe payout process (7-14 days hold)", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText("7.5 Payouts")).toBeInTheDocument();
      expect(screen.getByText(/7-14 days after delivery/i)).toBeInTheDocument();
    });
  });

  // ===== Auction-Specific Terms Tests =====
  describe("Auction-Specific Terms", () => {
    it("should state bids are binding commitments", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/Your bid is a binding commitment/i),
      ).toBeInTheDocument();
    });

    it("should prohibit bid retraction", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/You cannot retract a bid once placed/i),
      ).toBeInTheDocument();
    });

    it("should describe reserve prices", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText("6.3 Reserve Prices")).toBeInTheDocument();
      expect(
        screen.getByText(/Some auctions have reserve prices/i),
      ).toBeInTheDocument();
    });

    it("should prohibit shill bidding", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText("6.4 Shill Bidding Prohibited"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Sellers and their associates cannot bid on their own auctions/i,
        ),
      ).toBeInTheDocument();
    });
  });

  // ===== Legal Protections Tests =====
  describe("Legal Protections", () => {
    it("should include liability limitation in all caps", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/TO THE MAXIMUM EXTENT PERMITTED BY LAW/i),
      ).toBeInTheDocument();
    });

    it("should describe indemnification requirements", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText("12. Indemnification")).toBeInTheDocument();
      expect(
        screen.getByText(/You agree to indemnify and hold us harmless/i),
      ).toBeInTheDocument();
    });

    it("should include class action waiver", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText("13.3 Class Action Waiver")).toBeInTheDocument();
      expect(
        screen.getByText(/waive the right to participate in class actions/i),
      ).toBeInTheDocument();
    });

    it("should specify arbitration for dispute resolution", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText("13.2 Arbitration")).toBeInTheDocument();
      expect(
        screen.getByText(/resolved through binding arbitration/i),
      ).toBeInTheDocument();
    });
  });

  // ===== Links and References Tests =====
  describe("Links and References", () => {
    it("should link to Refund Policy", () => {
      render(<TermsOfServicePage />);
      const refundLink = screen.getByRole("link", { name: /refund policy/i });
      expect(refundLink).toHaveAttribute("href", "/refund-policy");
    });

    it("should link to Create Support Ticket", () => {
      render(<TermsOfServicePage />);
      const supportLink = screen.getByRole("link", {
        name: /create a support ticket/i,
      });
      expect(supportLink).toHaveAttribute("href", "/support/ticket");
    });

    it("should provide legal contact email", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText(/legal@letitrip.com/i)).toBeInTheDocument();
    });
  });

  // ===== Version History Tests =====
  describe("Version History", () => {
    it("should render version history section", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText(/Version History/i)).toBeInTheDocument();
    });

    it("should show Version 2.0 release date and changes", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/Version 2.0 \(November 1, 2025\)/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Added auction terms, shop limits, review policies/i),
      ).toBeInTheDocument();
    });

    it("should show Version 1.0 initial release", () => {
      render(<TermsOfServicePage />);
      expect(
        screen.getByText(/Version 1.0 \(January 1, 2024\)/i),
      ).toBeInTheDocument();
    });
  });

  // ===== Layout Integration Tests =====
  describe("Layout Integration", () => {
    it("should render using LegalPageLayout component", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByTestId("legal-layout")).toBeInTheDocument();
    });

    it("should pass correct props to LegalPageLayout", () => {
      render(<TermsOfServicePage />);
      expect(screen.getByText("Terms of Service")).toBeInTheDocument();
      expect(
        screen.getByText(/Last Updated: November 7, 2025/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Version: 2.0/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Effective Date: November 1, 2025/i),
      ).toBeInTheDocument();
    });
  });
});
