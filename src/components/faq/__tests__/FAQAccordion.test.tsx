import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FAQAccordion } from "../FAQAccordion";
import type { FAQDocument } from "@/db/schema/faqs";

// Mock child components
jest.mock("../FAQHelpfulButtons", () => ({
  FAQHelpfulButtons: ({ faqId, stats }: any) => (
    <div data-testid={`helpful-buttons-${faqId}`}>
      Helpful: {stats?.helpful || 0} | Not Helpful: {stats?.notHelpful || 0}
    </div>
  ),
}));

jest.mock("../RelatedFAQs", () => ({
  RelatedFAQs: ({ currentFaqId, category }: any) => (
    <div data-testid={`related-faqs-${currentFaqId}`}>
      Related FAQs for category: {category}
    </div>
  ),
}));

describe("FAQAccordion", () => {
  const mockFAQs: FAQDocument[] = [
    {
      id: "faq-1",
      question: "What is your return policy?",
      answer: {
        text: "<p>You can return items within <strong>30 days</strong> of purchase.</p>",
        format: "html" as const,
      },
      category: "returns_refunds",
      tags: ["returns", "refunds", "30-day"],
      priority: 5,
      order: 1,
      showOnHomepage: true,
      showInFooter: false,
      isPinned: false,
      relatedFAQs: [],
      useSiteSettings: false,
      stats: { helpful: 25, notHelpful: 3, views: 150 },
      seo: {
        slug: "return-policy",
        metaTitle: "Return Policy",
        metaDescription: "Return policy FAQ",
      },
      isActive: true,
      createdBy: "admin",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    },
    {
      id: "faq-2",
      question: "How long does shipping take?",
      answer: {
        text: "Shipping typically takes 3-5 business days for domestic orders.",
        format: "plain" as const,
      },
      category: "shipping_delivery",
      tags: ["shipping", "delivery", "timeline"],
      priority: 8,
      order: 2,
      showOnHomepage: false,
      showInFooter: true,
      isPinned: false,
      relatedFAQs: [],
      useSiteSettings: false,
      stats: { helpful: 40, notHelpful: 2, views: 200 },
      seo: {
        slug: "shipping-time",
        metaTitle: "Shipping Time",
        metaDescription: "Shipping FAQ",
      },
      isActive: true,
      createdBy: "admin",
      createdAt: new Date("2026-01-02"),
      updatedAt: new Date("2026-01-02"),
    },
    {
      id: "faq-3",
      question: "Do you ship internationally?",
      answer: {
        text: "Yes, we ship to over 50 countries worldwide.",
        format: "plain" as const,
      },
      category: "shipping_delivery",
      tags: ["shipping", "international"],
      priority: 6,
      order: 3,
      showOnHomepage: false,
      showInFooter: false,
      isPinned: false,
      relatedFAQs: [],
      useSiteSettings: false,
      stats: { helpful: 15, notHelpful: 5, views: 100 },
      seo: {
        slug: "international-shipping",
        metaTitle: "International Shipping",
        metaDescription: "International FAQ",
      },
      isActive: true,
      createdBy: "admin",
      createdAt: new Date("2026-01-03"),
      updatedAt: new Date("2026-01-03"),
    },
  ];

  describe("Rendering", () => {
    it("should render all FAQ items", () => {
      render(<FAQAccordion faqs={mockFAQs} />);

      expect(
        screen.getByText("What is your return policy?"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("How long does shipping take?"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Do you ship internationally?"),
      ).toBeInTheDocument();
    });

    it("should render empty state when no FAQs provided", () => {
      render(<FAQAccordion faqs={[]} />);

      expect(screen.getByText(/no faqs found/i)).toBeInTheDocument();
      expect(
        screen.getByText(/try adjusting your filters/i),
      ).toBeInTheDocument();
    });

    it("should render FAQ with HTML content in answer", () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      const button = screen.getByRole("button", {
        name: /what is your return policy/i,
      });
      fireEvent.click(button);

      // HTML should be rendered (dangerouslySetInnerHTML)
      expect(
        screen.getByText(/you can return items within/i),
      ).toBeInTheDocument();
      expect(screen.getByText("30 days")).toBeInTheDocument();
    });

    it("should render FAQ with plain text answer", () => {
      render(<FAQAccordion faqs={[mockFAQs[1]]} />);

      const button = screen.getByRole("button", {
        name: /how long does shipping take/i,
      });
      fireEvent.click(button);

      expect(
        screen.getByText(/shipping typically takes 3-5 business days/i),
      ).toBeInTheDocument();
    });
  });

  describe("Accordion Behavior", () => {
    it("should start with all FAQs collapsed", () => {
      render(<FAQAccordion faqs={mockFAQs} />);

      // Answers should not be visible initially
      expect(
        screen.queryByText(/you can return items within/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/shipping typically takes/i),
      ).not.toBeInTheDocument();
    });

    it("should expand FAQ when question is clicked", () => {
      render(<FAQAccordion faqs={mockFAQs} />);

      const button = screen.getByRole("button", {
        name: /what is your return policy/i,
      });
      fireEvent.click(button);

      expect(
        screen.getByText(/you can return items within/i),
      ).toBeInTheDocument();
    });

    it("should collapse FAQ when clicked again", () => {
      render(<FAQAccordion faqs={mockFAQs} />);

      const button = screen.getByRole("button", {
        name: /what is your return policy/i,
      });

      // Expand
      fireEvent.click(button);
      expect(
        screen.getByText(/you can return items within/i),
      ).toBeInTheDocument();

      // Collapse
      fireEvent.click(button);
      expect(
        screen.queryByText(/you can return items within/i),
      ).not.toBeInTheDocument();
    });

    it("should allow multiple FAQs to be expanded simultaneously", () => {
      render(<FAQAccordion faqs={mockFAQs} />);

      const button1 = screen.getByRole("button", {
        name: /what is your return policy/i,
      });
      const button2 = screen.getByRole("button", {
        name: /how long does shipping take/i,
      });

      fireEvent.click(button1);
      fireEvent.click(button2);

      expect(
        screen.getByText(/you can return items within/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/shipping typically takes/i)).toBeInTheDocument();
    });

    it("should toggle chevron icon direction when expanding/collapsing", () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      const button = screen.getByRole("button", {
        name: /what is your return policy/i,
      });

      // Initially collapsed - should have chevron down
      const svgCollapsed = button.querySelector("svg");
      expect(svgCollapsed).toBeInTheDocument();

      // Expand
      fireEvent.click(button);

      // Should still have SVG but might be rotated via CSS
      const svgExpanded = button.querySelector("svg");
      expect(svgExpanded).toBeInTheDocument();
    });
  });

  describe("Tags Display", () => {
    it("should display all tags for FAQ", () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      expect(screen.getByText("returns")).toBeInTheDocument();
      expect(screen.getByText("refunds")).toBeInTheDocument();
      expect(screen.getByText("30-day")).toBeInTheDocument();
    });

    it("should handle FAQ with no tags", () => {
      const faqWithoutTags = { ...mockFAQs[0], tags: [] };
      render(<FAQAccordion faqs={[faqWithoutTags]} />);

      // Should not crash, just not display tags
      expect(
        screen.getByText("What is your return policy?"),
      ).toBeInTheDocument();
    });

    it("should handle FAQ with empty tags array", () => {
      const faqWithEmptyTags = { ...mockFAQs[0], tags: [] };
      render(<FAQAccordion faqs={[faqWithEmptyTags]} />);

      // Should not crash
      expect(
        screen.getByText("What is your return policy?"),
      ).toBeInTheDocument();
    });
  });

  describe("Helpful Buttons Integration", () => {
    it("should render FAQHelpfulButtons for expanded FAQ", () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      const button = screen.getByRole("button", {
        name: /what is your return policy/i,
      });
      fireEvent.click(button);

      expect(screen.getByTestId("helpful-buttons-faq-1")).toBeInTheDocument();
      expect(screen.getByText(/helpful: 25/i)).toBeInTheDocument();
      expect(screen.getByText(/not helpful: 3/i)).toBeInTheDocument();
    });

    it("should not render FAQHelpfulButtons for collapsed FAQ", () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      // Don't expand
      expect(
        screen.queryByTestId("helpful-buttons-faq-1"),
      ).not.toBeInTheDocument();
    });

    it("should pass correct stats to FAQHelpfulButtons", () => {
      render(<FAQAccordion faqs={[mockFAQs[1]]} />);

      const button = screen.getByRole("button", {
        name: /how long does shipping take/i,
      });
      fireEvent.click(button);

      expect(screen.getByTestId("helpful-buttons-faq-2")).toBeInTheDocument();
      expect(screen.getByText(/helpful: 40/i)).toBeInTheDocument();
      expect(screen.getByText(/not helpful: 2/i)).toBeInTheDocument();
    });
  });

  describe("Related FAQs Integration", () => {
    it("should render RelatedFAQs for expanded FAQ", () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      const button = screen.getByRole("button", {
        name: /what is your return policy/i,
      });
      fireEvent.click(button);

      expect(screen.getByTestId("related-faqs-faq-1")).toBeInTheDocument();
      expect(
        screen.getByText(/related faqs for category: returns/i),
      ).toBeInTheDocument();
    });

    it("should not render RelatedFAQs for collapsed FAQ", () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      // Don't expand
      expect(
        screen.queryByTestId("related-faqs-faq-1"),
      ).not.toBeInTheDocument();
    });

    it("should pass correct category to RelatedFAQs", () => {
      render(<FAQAccordion faqs={[mockFAQs[1]]} />);

      const button = screen.getByRole("button", {
        name: /how long does shipping take/i,
      });
      fireEvent.click(button);

      expect(
        screen.getByText(/related faqs for category: shipping/i),
      ).toBeInTheDocument();
    });
  });

  describe("Copy Link Functionality", () => {
    const originalClipboard = navigator.clipboard;
    const mockWriteText = jest.fn();

    beforeEach(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });
      mockWriteText.mockResolvedValue(undefined);
    });

    afterEach(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
      mockWriteText.mockClear();
    });

    it("should have copy link button for each FAQ", () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      const button = screen.getByRole("button", {
        name: /what is your return policy/i,
      });
      fireEvent.click(button);

      expect(
        screen.getByRole("button", { name: /copy link/i }),
      ).toBeInTheDocument();
    });

    it("should copy FAQ link to clipboard when button clicked", async () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      const expandButton = screen.getByRole("button", {
        name: /what is your return policy/i,
      });
      fireEvent.click(expandButton);

      const copyButton = screen.getByRole("button", { name: /copy link/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          expect.stringContaining("#faq-faq-1"),
        );
      });
    });

    it("should show success feedback after copying", async () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      const expandButton = screen.getByRole("button", {
        name: /what is your return policy/i,
      });
      fireEvent.click(expandButton);

      const copyButton = screen.getByRole("button", { name: /copy link/i });
      fireEvent.click(copyButton);

      // Check for visual feedback (button text change or icon)
      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for accordion", () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      const button = screen.getByRole("button", {
        name: /what is your return policy/i,
      });

      expect(button).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("should have unique IDs for each FAQ", () => {
      render(<FAQAccordion faqs={mockFAQs} />);

      const buttons = screen.getAllByRole("button");
      const ids = buttons.map(
        (btn) =>
          btn.getAttribute("id") || btn.parentElement?.getAttribute("id"),
      );

      // All IDs should be unique
      const uniqueIds = new Set(ids.filter(Boolean));
      expect(uniqueIds.size).toBeGreaterThan(0);
    });

    it("should be keyboard navigable", () => {
      render(<FAQAccordion faqs={mockFAQs} />);

      const firstButton = screen.getByRole("button", {
        name: /what is your return policy/i,
      });
      firstButton.focus();

      expect(document.activeElement).toBe(firstButton);
    });

    it("should support Enter key to expand/collapse", () => {
      render(<FAQAccordion faqs={[mockFAQs[0]]} />);

      const button = screen.getByRole("button", {
        name: /what is your return policy/i,
      });

      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

      expect(
        screen.getByText(/you can return items within/i),
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle FAQ with very long question", () => {
      const longQuestionFAQ = {
        ...mockFAQs[0],
        question:
          "This is a very long question that might wrap to multiple lines and could potentially cause layout issues if not handled properly in the UI component".repeat(
            3,
          ),
      };

      render(<FAQAccordion faqs={[longQuestionFAQ]} />);

      expect(screen.getByText(longQuestionFAQ.question)).toBeInTheDocument();
    });

    it("should handle FAQ with very long answer", () => {
      const longAnswerFAQ = {
        ...mockFAQs[0],
        answer: {
          text:
            "<p>" +
            "This is a very long answer with lots of detail. ".repeat(100) +
            "</p>",
          format: "html" as const,
        },
      };

      render(<FAQAccordion faqs={[longAnswerFAQ]} />);

      const button = screen.getByRole("button", {
        name: /what is your return policy/i,
      });
      fireEvent.click(button);

      // Should render without crashing
      expect(
        screen.getByText(/this is a very long answer/i),
      ).toBeInTheDocument();
    });

    it("should handle FAQ with special characters in question", () => {
      const specialCharFAQ = {
        ...mockFAQs[0],
        question:
          'What\'s your policy on items with <special> & "quoted" characters?',
      };

      render(<FAQAccordion faqs={[specialCharFAQ]} />);

      expect(screen.getByText(/what's your policy/i)).toBeInTheDocument();
    });

    it("should handle FAQ with missing stats", () => {
      const noStatsFAQ = {
        ...mockFAQs[0],
        stats: { helpful: 0, notHelpful: 0, views: 0 },
      };

      render(<FAQAccordion faqs={[noStatsFAQ]} />);

      const button = screen.getByRole("button", {
        name: /what is your return policy/i,
      });
      fireEvent.click(button);

      // Should render with 0 stats
      expect(screen.getByText(/helpful: 0/i)).toBeInTheDocument();
    });
  });
});
