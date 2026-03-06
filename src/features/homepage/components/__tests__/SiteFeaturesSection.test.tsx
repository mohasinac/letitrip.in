import { render, screen } from "@testing-library/react";
import { SiteFeaturesSection } from "../SiteFeaturesSection";

describe("SiteFeaturesSection", () => {
  // ====================================
  // Rendering
  // ====================================
  describe("Rendering", () => {
    it("renders the section", () => {
      render(<SiteFeaturesSection />);
      expect(screen.getByText("Why Shop With Us?")).toBeInTheDocument();
    });

    it("renders the heading as h2", () => {
      render(<SiteFeaturesSection />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Why Shop With Us?");
    });

    it("renders the subtitle", () => {
      render(<SiteFeaturesSection />);
      expect(
        screen.getByText(/Your satisfaction is our priority/),
      ).toBeInTheDocument();
    });
  });

  // ====================================
  // Feature Cards
  // ====================================
  describe("Feature Cards", () => {
    it("renders all 6 feature titles", () => {
      render(<SiteFeaturesSection />);
      expect(screen.getByText("Secure Payments")).toBeInTheDocument();
      expect(screen.getByText("Easy Returns")).toBeInTheDocument();
      expect(screen.getByText("Quality Check")).toBeInTheDocument();
      expect(screen.getByText("24/7 Support")).toBeInTheDocument();
      expect(screen.getByText("Seller Protection")).toBeInTheDocument();
      expect(screen.getByText("Buyer Guarantee")).toBeInTheDocument();
    });

    it("renders all 6 feature descriptions", () => {
      render(<SiteFeaturesSection />);
      expect(
        screen.getByText(
          /Multiple payment options with encrypted transactions/,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/7-day hassle-free return policy/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Every item verified before shipment/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Round-the-clock customer service/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Safe and secure platform for sellers/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Money-back guarantee if item not as described/),
      ).toBeInTheDocument();
    });

    it("renders all 6 feature icons", () => {
      render(<SiteFeaturesSection />);
      expect(screen.getByText("🔒")).toBeInTheDocument();
      expect(screen.getByText("↩️")).toBeInTheDocument();
      expect(screen.getByText("✓")).toBeInTheDocument();
      expect(screen.getByText("💬")).toBeInTheDocument();
      expect(screen.getByText("🛡️")).toBeInTheDocument();
      expect(screen.getByText("⭐")).toBeInTheDocument();
    });
  });

  // ====================================
  // Layout
  // ====================================
  describe("Layout", () => {
    it("renders as a section element", () => {
      const { container } = render(<SiteFeaturesSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("renders feature headings as h3", () => {
      render(<SiteFeaturesSection />);
      const headings = screen.getAllByRole("heading", { level: 3 });
      expect(headings).toHaveLength(6);
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("uses proper heading hierarchy", () => {
      render(<SiteFeaturesSection />);
      // Section heading is h2
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      // Feature headings are h3
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
    });

    it("all text content is visible", () => {
      render(<SiteFeaturesSection />);
      expect(screen.getByText("Why Shop With Us?")).toBeVisible();
      expect(screen.getByText("Secure Payments")).toBeVisible();
    });
  });
});
