/**
 * FAQSection Tests
 *
 * FAQSection is now fully static — it reads from STATIC_FAQS constants
 * directly (no API/hook calls). Tests verify rendering and accordion behaviour
 * using the real static data.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { FAQSection } from "../FAQSection";

// No API hook mocks needed — FAQSection uses static constants only

describe("FAQSection", () => {
  // ====================================
  // Section Structure
  // ====================================
  describe("Section Structure", () => {
    it("renders as a section element", () => {
      const { container } = render(<FAQSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("uses h2 for section heading", () => {
      render(<FAQSection />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it('renders "Frequently Asked Questions" heading', () => {
      render(<FAQSection />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Frequently Asked Questions",
      );
    });

    it("renders subtitle text", () => {
      render(<FAQSection />);
      expect(
        screen.getByText(
          "Find answers to common questions about our platform, products, shipping, and more.",
        ),
      ).toBeInTheDocument();
    });
  });

  // ====================================
  // Category Tabs
  // ====================================
  describe("Category Tabs", () => {
    it("renders category tab buttons", () => {
      render(<FAQSection />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(7); // 7 categories + FAQ buttons
    });

    it("defaults to general category with active styling", () => {
      render(<FAQSection />);
      const generalBtn = screen.getByRole("button", { name: /general/i });
      expect(generalBtn).toHaveClass("bg-blue-600");
    });

    it("switches active category when tab is clicked", () => {
      render(<FAQSection />);
      const shippingBtn = screen.getByRole("button", { name: /shipping/i });
      fireEvent.click(shippingBtn);
      expect(shippingBtn).toHaveClass("bg-blue-600");
    });
  });

  // ====================================
  // FAQ Items (Static Data)
  // ====================================
  describe("FAQ Items", () => {
    it("renders FAQ question buttons beyond the category tabs", () => {
      render(<FAQSection />);
      const buttons = screen.getAllByRole("button");
      // 7 category tabs + at least 1 FAQ accordion button
      expect(buttons.length).toBeGreaterThan(7);
    });

    it("shows at most 10 FAQ items for a category", () => {
      const { container } = render(<FAQSection />);
      // Each FAQ accordion item contains one SVG chevron
      const chevrons = container.querySelectorAll("button svg");
      expect(chevrons.length).toBeLessThanOrEqual(10);
    });

    it("renders a View All link to the FAQ page", () => {
      render(<FAQSection />);
      expect(screen.getByText(/view all/i)).toBeInTheDocument();
    });
  });

  // ====================================
  // Accordion Behaviour
  // ====================================
  describe("Accordion Behaviour", () => {
    it("does not show any answer panel by default", () => {
      const { container } = render(<FAQSection />);
      // Answer panels are rendered conditionally; none should exist on first render
      const answerPanels = container.querySelectorAll(".pt-0");
      expect(answerPanels.length).toBe(0);
    });

    it("shows an answer panel when a question is clicked", () => {
      const { container } = render(<FAQSection />);
      const buttons = screen.getAllByRole("button");
      // 7 category tabs come first; first FAQ button is at index 7
      const firstFaqBtn = buttons[7];
      if (!firstFaqBtn) return;
      fireEvent.click(firstFaqBtn);
      expect(container.querySelector(".pt-0")).toBeInTheDocument();
    });

    it("closes the answer panel when the same question is clicked again", () => {
      const { container } = render(<FAQSection />);
      const buttons = screen.getAllByRole("button");
      const firstFaqBtn = buttons[7];
      if (!firstFaqBtn) return;

      fireEvent.click(firstFaqBtn);
      expect(container.querySelector(".pt-0")).toBeInTheDocument();

      fireEvent.click(firstFaqBtn);
      expect(container.querySelector(".pt-0")).not.toBeInTheDocument();
    });

    it("rotates chevron icon to rotate-180 when FAQ is opened", () => {
      render(<FAQSection />);
      const buttons = screen.getAllByRole("button");
      const firstFaqBtn = buttons[7];
      if (!firstFaqBtn) return;

      const svg = firstFaqBtn.querySelector("svg");
      expect(svg).not.toHaveClass("rotate-180");

      fireEvent.click(firstFaqBtn);

      expect(firstFaqBtn.querySelector("svg")).toHaveClass("rotate-180");
    });
  });
});
