import { render, screen } from "@testing-library/react";
import RefundPolicyPage from "./page";

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

describe("RefundPolicyPage", () => {
  // ===== Basic Rendering Tests =====
  describe("Basic Rendering", () => {
    it("should render the page title", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText("Refund & Return Policy")).toBeInTheDocument();
    });

    it("should render last updated date", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/Last Updated: November 7, 2025/i)
      ).toBeInTheDocument();
    });

    it("should render version number", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText(/Version: 2.0/i)).toBeInTheDocument();
    });

    it("should render effective date", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/Effective Date: November 1, 2025/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Unboxing Video Requirements Tests =====
  describe("Unboxing Video Requirements", () => {
    it("should emphasize unboxing video as mandatory", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(
          /To be eligible for return or refund, you MUST provide an unboxing video/i
        )
      ).toBeInTheDocument();
    });

    it("should list unboxing video requirements", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText(/one continuous take/i)).toBeInTheDocument();
      expect(
        screen.getByText(/sealed package with shipping label/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/entire unboxing process/i)).toBeInTheDocument();
    });

    it("should warn about rejection without video", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(
          /Without unboxing video, return requests will be automatically rejected/i
        )
      ).toBeInTheDocument();
    });

    it("should require same-day timestamp images", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/Minimum 5-10 clear photos/i)
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(/same day as delivery/i)[0]
      ).toBeInTheDocument();
    });

    it("should explain why strict requirements exist", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/2\.3.*Why These Requirements/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/imported internationally/i)).toBeInTheDocument();
    });
  });

  // ===== Return Eligibility Tests =====
  describe("Return Eligibility", () => {
    it("should specify 30-day return window", () => {
      render(<RefundPolicyPage />);
      expect(screen.getAllByText(/Within 30 Days/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/30 days of delivery/i)).toBeInTheDocument();
    });

    it("should list eligible return reasons", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getAllByText(/Damaged or Defective/i)[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText(/Wrong Item/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Missing Parts/i)[0]).toBeInTheDocument();
    });

    it("should list non-returnable items", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/3\.2.*Non-Returnable Items/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Final Sale/i)).toBeInTheDocument();
      expect(screen.getByText(/Opened collectibles/i)).toBeInTheDocument();
    });

    it("should describe return window variations", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getAllByText(/Report within 48 hours/i)[0]
      ).toBeInTheDocument();
    });
  });

  // ===== Return Process Tests =====
  describe("Return Process", () => {
    it("should outline 4-step return process", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText(/Step 1: Report the Issue/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 2: Seller Review/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Step 3: Ship the Product Back/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Step 4: Inspection & Refund Processing/i)
      ).toBeInTheDocument();
    });

    it("should describe seller review timeline", () => {
      render(<RefundPolicyPage />);
      expect(screen.getAllByText(/24-48 Hours/i)[0]).toBeInTheDocument();
    });

    it("should explain return shipping costs", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/Damaged\/Defective\/Wrong Item/i)
      ).toBeInTheDocument();
      expect(screen.getAllByText(/Buyer's Remorse/i)[0]).toBeInTheDocument();
    });
  });

  // ===== Refund Methods Tests =====
  describe("Refund Methods & Timeline", () => {
    it("should list Indian payment refund methods", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText(/UPI/i)).toBeInTheDocument();
      expect(screen.getByText(/Credit\/Debit Card/i)).toBeInTheDocument();
      expect(screen.getByText(/Net Banking/i)).toBeInTheDocument();
    });

    it("should specify refund timelines for each method", () => {
      render(<RefundPolicyPage />);
      expect(screen.getAllByText(/1-3 business days/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/5-7 business days/i)).toBeInTheDocument();
    });

    it("should describe refund amount calculation", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText(/5\.2.*Refund Amount/i)).toBeInTheDocument();
      expect(screen.getByText(/Product price/i)).toBeInTheDocument();
      expect(screen.getByText(/Original shipping/i)).toBeInTheDocument();
    });

    it("should explain refund deductions", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText(/Restocking fee/i)).toBeInTheDocument();
      expect(screen.getByText(/10-20%/i)).toBeInTheDocument();
    });

    it("should describe partial refund scenarios", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText(/5\.3.*Partial Refunds/i)).toBeInTheDocument();
    });
  });

  // ===== Damaged/Defective Items Tests =====
  describe("Damaged or Defective Items", () => {
    it("should require reporting damage within 48 hours", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/Report damage within 48 hours of delivery/i)
      ).toBeInTheDocument();
    });

    it("should list resolution options", () => {
      render(<RefundPolicyPage />);
      expect(screen.getAllByText(/Full Refund/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Replacement/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Partial Refund/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Repair/i)[0]).toBeInTheDocument();
    });

    it("should differentiate shipping damage vs product defect", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/6\.3.*Shipping Damage vs.*Product Defect/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Wrong Item Tests =====
  describe("Wrong Item or Missing Items", () => {
    it("should describe wrong item process", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/7\..*Wrong Item or Missing Items/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Seller will arrange pickup\/return/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Escalation Tests =====
  describe("Seller Disputes & Admin Intervention", () => {
    it("should outline escalation process", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText(/8\.1.*Escalation Process/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Escalate to Admin/i)[0]).toBeInTheDocument();
    });

    it("should describe admin intervention scenarios", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/8\.2.*Admin Intervention Scenarios/i)
      ).toBeInTheDocument();
    });

    it("should list admin resolution powers", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/8\.3.*Admin Resolution Powers/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Override seller decision/i)).toBeInTheDocument();
    });
  });

  // ===== Auction Items Tests =====
  describe("Auction Items", () => {
    it("should specify special rules for auction items", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText(/9\..*Auction Items/i)).toBeInTheDocument();
      expect(
        screen.getByText(/All auction sales are final/i)
      ).toBeInTheDocument();
    });

    it("should require faster reporting for auctions", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/Report issues within 24 hours for auction items/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Refund Processing Timeline Tests =====
  describe("Refund Processing Time", () => {
    it("should break down total refund timeline", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/10\..*Refund Processing Time/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/7-14 days from return approval to refund in account/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Consumer Rights Tests =====
  describe("Consumer Rights (India)", () => {
    it("should mention Consumer Protection Act 2019", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/11\..*Consumer Rights.*India/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Consumer Protection Act, 2019/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Non-Delivery Tests =====
  describe("Non-Delivery & Lost Packages", () => {
    it("should describe non-delivery process", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/12\.1.*Package Not Received/i)
      ).toBeInTheDocument();
    });

    it("should describe lost package process", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/12\.2.*Package Lost in Transit/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Special Cases Tests =====
  describe("Exceptions & Special Cases", () => {
    it("should describe high-value item rules", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/High-Value Items \(₹50,000\+\)/i)
      ).toBeInTheDocument();
    });

    it("should describe electronics warranty", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/13\.2.*Electronics.*Gadgets/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/30-day warranty/i)).toBeInTheDocument();
    });

    it("should explain import duty refunds", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/13\.3.*Import Duty Refunds/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Tips Tests =====
  describe("Tips for Smooth Returns", () => {
    it("should provide helpful return tips", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/14\..*Tips for Smooth Returns/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Always record unboxing/i)).toBeInTheDocument();
    });
  });

  // ===== Contact Support Tests =====
  describe("Contact Support", () => {
    it("should provide return contact information", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText(/returns@letitrip.com/i)).toBeInTheDocument();
    });

    it("should link to support ticket", () => {
      render(<RefundPolicyPage />);
      const supportLink = screen.getByRole("link", { name: /create ticket/i });
      expect(supportLink).toHaveAttribute("href", "/support/ticket");
    });
  });

  // ===== Version History Tests =====
  describe("Version History", () => {
    it("should render version history section", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText(/Version History/i)).toBeInTheDocument();
    });

    it("should show Version 2.0 changes", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/Version 2.0 \(November 1, 2025\)/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/mandatory unboxing video/i)).toBeInTheDocument();
    });

    it("should show Version 1.0 initial release", () => {
      render(<RefundPolicyPage />);
      expect(
        screen.getByText(/Version 1.0 \(January 1, 2024\)/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Layout Integration Tests =====
  describe("Layout Integration", () => {
    it("should render using LegalPageLayout component", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByTestId("legal-layout")).toBeInTheDocument();
    });

    it("should pass correct props to LegalPageLayout", () => {
      render(<RefundPolicyPage />);
      expect(screen.getByText("Refund & Return Policy")).toBeInTheDocument();
      expect(
        screen.getByText(/Last Updated: November 7, 2025/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Version: 2.0/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Effective Date: November 1, 2025/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Warning Highlights Tests =====
  describe("Warning Highlights", () => {
    it("should render warning box for unboxing requirement", () => {
      render(<RefundPolicyPage />);
      const { container } = render(<RefundPolicyPage />);
      const warningBox = container.querySelector(".bg-yellow-50");
      expect(warningBox).toBeInTheDocument();
    });
  });
});
