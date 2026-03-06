import { render, screen } from "@testing-library/react";
import { TrustIndicatorsSection } from "../TrustIndicatorsSection";

describe("TrustIndicatorsSection", () => {
  // ====================================
  // Rendering
  // ====================================
  describe("Rendering", () => {
    it("renders the section", () => {
      render(<TrustIndicatorsSection />);
      expect(screen.getByText("Wide Range")).toBeInTheDocument();
    });

    it("renders all 4 trust indicators", () => {
      render(<TrustIndicatorsSection />);
      expect(screen.getByText("Wide Range")).toBeInTheDocument();
      expect(screen.getByText("Fast Shipping")).toBeInTheDocument();
      expect(screen.getByText("Original Products")).toBeInTheDocument();
      expect(screen.getByText("50,000+ Customers")).toBeInTheDocument();
    });
  });

  // ====================================
  // Indicator Content
  // ====================================
  describe("Indicator Content", () => {
    it("displays icons for each indicator", () => {
      render(<TrustIndicatorsSection />);
      expect(screen.getByText("📦")).toBeInTheDocument();
      expect(screen.getByText("🚚")).toBeInTheDocument();
      expect(screen.getByText("✓")).toBeInTheDocument();
      expect(screen.getByText("👥")).toBeInTheDocument();
    });

    it("displays descriptions for each indicator", () => {
      render(<TrustIndicatorsSection />);
      expect(
        screen.getByText("10,000+ Products Across Categories"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Delivery in 2-5 Business Days"),
      ).toBeInTheDocument();
      expect(screen.getByText("100% Authentic & Verified")).toBeInTheDocument();
      expect(
        screen.getByText("Trusted by Thousands Nationwide"),
      ).toBeInTheDocument();
    });
  });

  // ====================================
  // Layout
  // ====================================
  describe("Layout", () => {
    it("renders as a section element", () => {
      const { container } = render(<TrustIndicatorsSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("renders a grid with 4 items", () => {
      render(<TrustIndicatorsSection />);
      const titles = [
        "Wide Range",
        "Fast Shipping",
        "Original Products",
        "50,000+ Customers",
      ];
      titles.forEach((title) => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });

    it("renders headings as h3 elements", () => {
      render(<TrustIndicatorsSection />);
      const headings = screen.getAllByRole("heading", { level: 3 });
      expect(headings).toHaveLength(4);
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("uses proper heading hierarchy (h3)", () => {
      render(<TrustIndicatorsSection />);
      const h3 = screen.getByText("Wide Range");
      expect(h3.tagName).toBe("H3");
    });

    it("all text content is visible", () => {
      render(<TrustIndicatorsSection />);
      expect(screen.getByText("Wide Range")).toBeVisible();
      expect(
        screen.getByText("10,000+ Products Across Categories"),
      ).toBeVisible();
    });
  });
});
