import { render, screen, fireEvent } from "@testing-library/react";
import { FAQSection } from "../FAQSection";

// Mock useApiQuery
const mockUseApiQuery = jest.fn();
jest.mock("@/hooks", () => ({
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
}));

const mockFaqs = [
  {
    id: "faq-1",
    question: "How do I place an order?",
    answer:
      "<p>Simply browse our products, add items to cart, and checkout.</p>",
    category: "Orders",
    priority: 1,
  },
  {
    id: "faq-2",
    question: "What payment methods do you accept?",
    answer: "<p>We accept credit cards, debit cards, UPI, and net banking.</p>",
    category: "Payments",
    priority: 2,
  },
  {
    id: "faq-3",
    question: "How long does shipping take?",
    answer: "<p>Standard shipping takes 5-7 business days.</p>",
    category: "Shipping",
    priority: 3,
  },
];

describe("FAQSection", () => {
  beforeEach(() => {
    mockUseApiQuery.mockReset();
  });

  // ====================================
  // Loading State
  // ====================================
  describe("Loading State", () => {
    it("renders loading skeleton when loading", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      const { container } = render(<FAQSection />);
      expect(
        container.querySelectorAll(".animate-pulse").length,
      ).toBeGreaterThan(0);
    });

    it("renders 6 skeleton items", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      const { container } = render(<FAQSection />);
      // 1 title skeleton + 6 item skeletons = 7 animate-pulse elements
      const pulseElements = container.querySelectorAll(".animate-pulse");
      expect(pulseElements.length).toBe(7);
    });
  });

  // ====================================
  // No Data State
  // ====================================
  describe("No Data State", () => {
    it("shows empty state when no FAQ data", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: false });
      render(<FAQSection />);
      expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });

    it("shows empty state when faqs array is empty", () => {
      mockUseApiQuery.mockReturnValue({ data: [], isLoading: false });
      render(<FAQSection />);
      expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });
  });

  // ====================================
  // Content Rendering
  // ====================================
  describe("Content Rendering", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({ data: mockFaqs, isLoading: false });
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

    it("renders all FAQ questions", () => {
      render(<FAQSection />);
      expect(screen.getByText("How do I place an order?")).toBeInTheDocument();
      expect(
        screen.getByText("What payment methods do you accept?"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("How long does shipping take?"),
      ).toBeInTheDocument();
    });

    it("renders FAQ questions as buttons", () => {
      render(<FAQSection />);
      const buttons = screen.getAllByRole("button");
      // Category tab buttons + FAQ accordion buttons + optional "View All" button
      expect(buttons.length).toBeGreaterThanOrEqual(4);
    });

    it('renders "View All" link', () => {
      render(<FAQSection />);
      expect(screen.getByText(/view all/i)).toBeInTheDocument();
    });
  });

  // ====================================
  // Accordion Behavior
  // ====================================
  describe("Accordion Behavior", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({ data: mockFaqs, isLoading: false });
    });

    it("does not show any answer by default", () => {
      render(<FAQSection />);
      expect(
        screen.queryByText(/Simply browse our products/),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/We accept credit cards/),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Standard shipping/)).not.toBeInTheDocument();
    });

    it("shows answer when question is clicked", () => {
      const { container } = render(<FAQSection />);
      const questionButton = screen.getByText("How do I place an order?");
      fireEvent.click(questionButton);
      // Answer is rendered via dangerouslySetInnerHTML
      expect(container.innerHTML).toContain("Simply browse our products");
    });

    it("hides answer when same question is clicked again", () => {
      const { container } = render(<FAQSection />);
      const questionButton = screen.getByText("How do I place an order?");

      // Open
      fireEvent.click(questionButton);
      expect(container.innerHTML).toContain("Simply browse our products");

      // Close
      fireEvent.click(questionButton);
      expect(container.innerHTML).not.toContain("Simply browse our products");
    });

    it("closes previous answer when another question is clicked", () => {
      const { container } = render(<FAQSection />);

      // Open first FAQ
      fireEvent.click(screen.getByText("How do I place an order?"));
      expect(container.innerHTML).toContain("Simply browse our products");

      // Open second FAQ
      fireEvent.click(screen.getByText("What payment methods do you accept?"));
      expect(container.innerHTML).not.toContain("Simply browse our products");
      expect(container.innerHTML).toContain("We accept credit cards");
    });

    it("rotates chevron icon when FAQ is open", () => {
      const { container } = render(<FAQSection />);

      // Get the first FAQ's SVG chevron
      const firstQuestion = screen.getByText("How do I place an order?");
      const questionButton = firstQuestion.closest("button");
      const svg = questionButton?.querySelector("svg");

      // Initially no rotation
      expect(svg).not.toHaveClass("rotate-180");

      // Click to open
      fireEvent.click(firstQuestion);

      // After open, check rotation
      const svgAfter = questionButton?.querySelector("svg");
      expect(svgAfter).toHaveClass("rotate-180");
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("uses h2 for section heading", () => {
      mockUseApiQuery.mockReturnValue({ data: mockFaqs, isLoading: false });
      render(<FAQSection />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it("renders as a section element", () => {
      mockUseApiQuery.mockReturnValue({ data: mockFaqs, isLoading: false });
      const { container } = render(<FAQSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });
});
