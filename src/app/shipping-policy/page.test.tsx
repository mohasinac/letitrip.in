import { render, screen } from "@testing-library/react";
import ShippingPolicyPage from "./page";

// Mock Next.js Link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

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

describe("ShippingPolicyPage", () => {
  // ===== Basic Rendering Tests =====
  describe("Basic Rendering", () => {
    it("should render the page title", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText("Shipping Policy")).toBeInTheDocument();
    });

    it("should render last updated date", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/Last Updated: November 7, 2025/i),
      ).toBeInTheDocument();
    });

    it("should render version number", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText(/Version: 2.0/i)).toBeInTheDocument();
    });

    it("should render effective date", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/Effective Date: November 1, 2025/i),
      ).toBeInTheDocument();
    });
  });

  // ===== Overview Tests =====
  describe("Overview", () => {
    it("should describe business model (India-based importing from international)", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/India-based seller\/reseller/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Japan, China, Hong Kong, USA, UK/i),
      ).toBeInTheDocument();
    });

    it("should emphasize no customs charges for buyers", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/You only pay for shipping within India/i),
      ).toBeInTheDocument();
    });
  });

  // ===== Shipping Process Tests =====
  describe("Shipping Process", () => {
    it("should describe in-stock item process", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/2\.1.*For IN-STOCK Items.*Already Imported/i),
      ).toBeInTheDocument();
    });

    it("should describe pre-order item process", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/2\.2.*For PRE-ORDER Items.*To Be Imported/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/International Purchase/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Customs Clearance/i)[0]).toBeInTheDocument();
    });

    it("should specify delivery timelines", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getAllByText(/In-Stock Items/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/3-7 business days/i)).toBeInTheDocument();
    });
  });

  // ===== Shipping Methods & Carriers Tests =====
  describe("Shipping Methods & Carriers", () => {
    it("should list Indian domestic carriers", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText(/Bluedart/i)).toBeInTheDocument();
      expect(screen.getByText(/Delhivery/i)).toBeInTheDocument();
      expect(screen.getAllByText(/India Post/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/DTDC/i)).toBeInTheDocument();
    });

    it("should explain carrier selection criteria", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText(/3\.2.*Carrier Selection/i)).toBeInTheDocument();
      expect(screen.getByText(/pin code and location/i)).toBeInTheDocument();
    });
  });

  // ===== Shipping Costs Tests =====
  describe("Shipping Costs", () => {
    it("should explain cost calculation factors", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText(/4\.1.*Cost Calculation/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Weight/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Dimensions/i)[0]).toBeInTheDocument();
    });

    it("should provide sample costs for different package sizes", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText(/Small package \(0-500g\)/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Medium package \(500g-2kg\)/i),
      ).toBeInTheDocument();
    });

    it("should explain free shipping eligibility", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/4\.3.*Free Shipping by Sellers/i),
      ).toBeInTheDocument();
    });
  });

  // ===== Delivery Locations Tests =====
  describe("Delivery Locations", () => {
    it("should list serviceable areas", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/5\.1.*Serviceable Areas.*India/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Delhi, Mumbai, Bangalore/i)).toBeInTheDocument();
    });

    it("should list non-serviceable areas", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/5\.2.*Non-Serviceable Areas/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/PO Box addresses/i)).toBeInTheDocument();
    });

    it("should specify address requirements", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/5\.3.*Address Requirements/i),
      ).toBeInTheDocument();
    });
  });

  // ===== Order Tracking Tests =====
  describe("Order Tracking", () => {
    it("should list all tracking stages", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/6\.1.*Tracking Your Order/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Order Placed/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Customs Clearance/i)[0]).toBeInTheDocument();
    });

    it("should describe tracking methods", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText(/6\.2.*Tracking Methods/i)).toBeInTheDocument();
      expect(screen.getByText(/My Orders page/i)).toBeInTheDocument();
    });
  });

  // ===== Import Duties Tests =====
  describe("Import Duties & Taxes (Handled By Us)", () => {
    it("should emphasize no customs charges for buyers", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/7\.1.*No Customs Charges for You/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/you don't have to pay ANY customs duties/i),
      ).toBeInTheDocument();
    });

    it("should explain how imports are handled", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/7\.2.*How We Handle Imports/i),
      ).toBeInTheDocument();
    });

    it("should list benefits of buying from them", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/7\.3.*What This Means for You/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/No surprise charges/i)).toBeInTheDocument();
    });
  });

  // ===== Delivery Process Tests =====
  describe("Delivery Process", () => {
    it("should describe delivery attempts", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText(/8\.1.*Delivery Attempts/i)).toBeInTheDocument();
      expect(screen.getByText(/2-3 times/i)).toBeInTheDocument();
    });

    it("should describe signature requirements", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/8\.2.*Signature Requirement/i),
      ).toBeInTheDocument();
    });

    it("should describe contactless delivery", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText("8.3 Contactless Delivery")).toBeInTheDocument();
    });
  });

  // ===== Packaging & Insurance Tests =====
  describe("Packaging & Insurance", () => {
    it("should describe packaging standards", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText("9.1 Our Packaging Standards"),
      ).toBeInTheDocument();
    });

    it("should describe shipping insurance", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText("9.2 Shipping Insurance")).toBeInTheDocument();
      expect(screen.getByText(/Automatic coverage/i)).toBeInTheDocument();
    });

    it("should describe high-value item handling", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/High-Value Items \(₹50,000\+\)/i),
      ).toBeInTheDocument();
    });
  });

  // ===== Prohibited Items Tests =====
  describe("Prohibited & Restricted Items", () => {
    it("should list prohibited items", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText("10.1 Cannot Ship to India")).toBeInTheDocument();
      expect(
        screen.getByText(/Weapons, firearms, ammunition/i),
      ).toBeInTheDocument();
    });

    it("should list restricted items", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText("10.2 Restricted Items (Special Permits Required)"),
      ).toBeInTheDocument();
    });

    it("should list shipping restrictions", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText("10.3 Shipping Restrictions"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Lithium batteries/i)).toBeInTheDocument();
    });
  });

  // ===== Delays & Issues Tests =====
  describe("Delays & Issues", () => {
    it("should list common delay causes", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText("11.1 Common Delay Causes")).toBeInTheDocument();
      expect(screen.getByText(/Customs inspection/i)).toBeInTheDocument();
    });

    it("should describe proactive tracking", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText("11.2 What We Do")).toBeInTheDocument();
    });

    it("should explain buyer rights for delays", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText("11.3 Your Rights")).toBeInTheDocument();
    });
  });

  // ===== Cash on Delivery Tests =====
  describe("Cash on Delivery (COD)", () => {
    it("should confirm COD availability", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/Cash on Delivery is AVAILABLE/i),
      ).toBeInTheDocument();
    });

    it("should describe COD guidelines", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText("12.2 COD Guidelines")).toBeInTheDocument();
    });

    it("should list all payment methods", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getAllByText(/UPI/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Google Pay/i)).toBeInTheDocument();
    });
  });

  // ===== Order Cancellation Tests =====
  describe("Order Cancellation & Shipping", () => {
    it("should describe cancellation before shipping", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText("13.1 Cancellation Before Shipping"),
      ).toBeInTheDocument();
    });

    it("should describe cancellation after shipping", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText("13.2 Cancellation After Shipping"),
      ).toBeInTheDocument();
    });
  });

  // ===== Bulk Orders Tests =====
  describe("Bulk Orders & Corporate Shipping", () => {
    it("should describe bulk order benefits", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText("14. Bulk Orders & Corporate Shipping"),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(/Consolidated shipping/i)[0],
      ).toBeInTheDocument();
    });
  });

  // ===== Environmental Responsibility Tests =====
  describe("Environmental Responsibility", () => {
    it("should describe sustainability efforts", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText("15. Environmental Responsibility"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Minimal packaging/i)).toBeInTheDocument();
    });
  });

  // ===== Contact Support Tests =====
  describe("Contact Shipping Support", () => {
    it("should provide shipping contact information", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText(/shipping@letitrip.com/i)).toBeInTheDocument();
    });

    it("should link to support ticket", () => {
      render(<ShippingPolicyPage />);
      const supportLink = screen.getByRole("link", { name: /create ticket/i });
      expect(supportLink).toHaveAttribute("href", "/support/ticket");
    });

    it("should link to My Orders page", () => {
      render(<ShippingPolicyPage />);
      const ordersLink = screen.getByRole("link", { name: /my orders/i });
      expect(ordersLink).toHaveAttribute("href", "/user/orders");
    });
  });

  // ===== Version History Tests =====
  describe("Version History", () => {
    it("should render version history section", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText(/Version History/i)).toBeInTheDocument();
    });

    it("should show Version 2.0 changes", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/Version 2.0 \(November 1, 2025\)/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/India-specific information/i),
      ).toBeInTheDocument();
    });

    it("should show Version 1.0 initial release", () => {
      render(<ShippingPolicyPage />);
      expect(
        screen.getByText(/Version 1.0 \(January 1, 2024\)/i),
      ).toBeInTheDocument();
    });
  });

  // ===== Layout Integration Tests =====
  describe("Layout Integration", () => {
    it("should render using LegalPageLayout component", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByTestId("legal-layout")).toBeInTheDocument();
    });

    it("should pass correct props to LegalPageLayout", () => {
      render(<ShippingPolicyPage />);
      expect(screen.getByText("Shipping Policy")).toBeInTheDocument();
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
