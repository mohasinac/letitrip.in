import { render, screen } from "@testing-library/react";
import { RelatedFAQs } from "../RelatedFAQs";
import type { FAQDocument } from "@/db/schema/faqs";

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

// Helper to create mock FAQ documents
const createMockFAQ = (overrides: Partial<FAQDocument> = {}): FAQDocument => ({
  id: "faq-1",
  question: "How do I reset my password?",
  answer: { text: "Go to settings and click reset.", format: "plain" as const },
  category: "account_security" as FAQDocument["category"],
  showOnHomepage: false,
  showInFooter: false,
  isPinned: false,
  order: 1,
  priority: 5,
  tags: [],
  relatedFAQs: [],
  useSiteSettings: false,
  stats: { views: 0, helpful: 0, notHelpful: 0 },
  seo: { slug: "reset-password", metaTitle: "", metaDescription: "" },
  isActive: true,
  createdBy: "admin-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockRelatedFAQs: FAQDocument[] = [
  createMockFAQ({ id: "faq-1", question: "How do I reset my password?" }),
  createMockFAQ({ id: "faq-2", question: "How do I change my email?" }),
  createMockFAQ({
    id: "faq-3",
    question: "How do I enable two-factor authentication?",
  }),
];

describe("RelatedFAQs", () => {
  // ====================================
  // Rendering
  // ====================================
  describe("Rendering", () => {
    it('renders the "Related Questions" heading', () => {
      render(<RelatedFAQs relatedFAQs={mockRelatedFAQs} />);
      expect(screen.getByText("Related Questions")).toBeInTheDocument();
    });

    it("renders all related FAQ items", () => {
      render(<RelatedFAQs relatedFAQs={mockRelatedFAQs} />);
      expect(
        screen.getByText("How do I reset my password?"),
      ).toBeInTheDocument();
      expect(screen.getByText("How do I change my email?")).toBeInTheDocument();
      expect(
        screen.getByText("How do I enable two-factor authentication?"),
      ).toBeInTheDocument();
    });

    it("renders correct number of FAQ links", () => {
      render(<RelatedFAQs relatedFAQs={mockRelatedFAQs} />);
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);
    });
  });

  // ====================================
  // Links & Navigation
  // ====================================
  describe("Links & Navigation", () => {
    it("links to the correct FAQ anchor URL", () => {
      render(<RelatedFAQs relatedFAQs={mockRelatedFAQs} />);
      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveAttribute("href", "/faqs#faq-1");
      expect(links[1]).toHaveAttribute("href", "/faqs#faq-2");
      expect(links[2]).toHaveAttribute("href", "/faqs#faq-3");
    });

    it("uses FAQ id in the href hash", () => {
      const customFAQ = createMockFAQ({
        id: "custom-unique-id",
        question: "Custom FAQ",
      });
      render(<RelatedFAQs relatedFAQs={[customFAQ]} />);
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        "/faqs#custom-unique-id",
      );
    });
  });

  // ====================================
  // Empty / Null States
  // ====================================
  describe("Empty / Null States", () => {
    it("returns null when relatedFAQs is empty", () => {
      const { container } = render(<RelatedFAQs relatedFAQs={[]} />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when relatedFAQs is undefined", () => {
      const { container } = render(
        <RelatedFAQs relatedFAQs={undefined as unknown as FAQDocument[]} />,
      );
      expect(container.innerHTML).toBe("");
    });

    it("returns null when relatedFAQs is null", () => {
      const { container } = render(
        <RelatedFAQs relatedFAQs={null as unknown as FAQDocument[]} />,
      );
      expect(container.innerHTML).toBe("");
    });

    it("does not render heading when empty", () => {
      render(<RelatedFAQs relatedFAQs={[]} />);
      expect(screen.queryByText("Related Questions")).not.toBeInTheDocument();
    });
  });

  // ====================================
  // Single Item
  // ====================================
  describe("Single Item", () => {
    it("renders correctly with a single FAQ", () => {
      const singleFAQ = [
        createMockFAQ({ id: "single-1", question: "Only related question" }),
      ];
      render(<RelatedFAQs relatedFAQs={singleFAQ} />);

      expect(screen.getByText("Related Questions")).toBeInTheDocument();
      expect(screen.getByText("Only related question")).toBeInTheDocument();
      expect(screen.getAllByRole("link")).toHaveLength(1);
    });
  });

  // ====================================
  // Many Items
  // ====================================
  describe("Many Items", () => {
    it("renders correctly with many FAQs", () => {
      const manyFAQs = Array.from({ length: 10 }, (_, i) =>
        createMockFAQ({
          id: `faq-${i}`,
          question: `Related question ${i + 1}`,
        }),
      );
      render(<RelatedFAQs relatedFAQs={manyFAQs} />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(10);
      expect(screen.getByText("Related question 1")).toBeInTheDocument();
      expect(screen.getByText("Related question 10")).toBeInTheDocument();
    });
  });

  // ====================================
  // SVG Icons
  // ====================================
  describe("SVG Icons", () => {
    it("renders question mark icon for each FAQ item", () => {
      render(<RelatedFAQs relatedFAQs={mockRelatedFAQs} />);
      // Each FAQ has 2 SVGs (question icon + arrow icon)
      const svgs = document.querySelectorAll("svg");
      expect(svgs.length).toBe(mockRelatedFAQs.length * 2);
    });
  });

  // ====================================
  // Unique Keys
  // ====================================
  describe("Unique Keys", () => {
    it("uses FAQ id as key for each item", () => {
      // This test verifies no React key warning - if keys were missing React would warn
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      render(<RelatedFAQs relatedFAQs={mockRelatedFAQs} />);

      const keyWarnings = consoleSpy.mock.calls.filter(
        (call) => typeof call[0] === "string" && call[0].includes("key"),
      );
      expect(keyWarnings).toHaveLength(0);
      consoleSpy.mockRestore();
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("all FAQ items are accessible as links", () => {
      render(<RelatedFAQs relatedFAQs={mockRelatedFAQs} />);
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toBeVisible();
      });
    });

    it("renders heading with correct hierarchy (h3)", () => {
      render(<RelatedFAQs relatedFAQs={mockRelatedFAQs} />);
      const heading = screen.getByText("Related Questions");
      expect(heading.tagName).toBe("H3");
    });

    it("question text is readable within each link", () => {
      render(<RelatedFAQs relatedFAQs={mockRelatedFAQs} />);
      const link = screen.getByText("How do I reset my password?").closest("a");
      expect(link).toHaveAttribute("href", "/faqs#faq-1");
    });
  });

  // ====================================
  // Visual Structure
  // ====================================
  describe("Visual Structure", () => {
    it("wraps content in a styled container", () => {
      render(<RelatedFAQs relatedFAQs={mockRelatedFAQs} />);
      const heading = screen.getByText("Related Questions");
      const container = heading.parentElement;
      expect(container).toBeInTheDocument();
    });

    it("displays question text for each FAQ", () => {
      const faqs = [
        createMockFAQ({ id: "q1", question: "What is the return policy?" }),
        createMockFAQ({ id: "q2", question: "How long does shipping take?" }),
      ];
      render(<RelatedFAQs relatedFAQs={faqs} />);

      expect(
        screen.getByText("What is the return policy?"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("How long does shipping take?"),
      ).toBeInTheDocument();
    });
  });

  // ====================================
  // Edge Cases
  // ====================================
  describe("Edge Cases", () => {
    it("handles FAQ with very long question text", () => {
      const longQuestion = "A".repeat(500);
      const faq = createMockFAQ({ id: "long-q", question: longQuestion });
      render(<RelatedFAQs relatedFAQs={[faq]} />);
      expect(screen.getByText(longQuestion)).toBeInTheDocument();
    });

    it("handles FAQ with special characters in question", () => {
      const faq = createMockFAQ({
        id: "special",
        question: 'How do I use "quotes" & <brackets>?',
      });
      render(<RelatedFAQs relatedFAQs={[faq]} />);
      expect(
        screen.getByText('How do I use "quotes" & <brackets>?'),
      ).toBeInTheDocument();
    });

    it("handles FAQ with special characters in id", () => {
      const faq = createMockFAQ({
        id: "faq-with-dashes_and_underscores",
        question: "Special ID FAQ",
      });
      render(<RelatedFAQs relatedFAQs={[faq]} />);
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        "/faqs#faq-with-dashes_and_underscores",
      );
    });

    it("handles FAQ with unicode characters", () => {
      const faq = createMockFAQ({
        id: "unicode",
        question: "¿Cómo puedo cambiar mi contraseña? 🔑",
      });
      render(<RelatedFAQs relatedFAQs={[faq]} />);
      expect(
        screen.getByText("¿Cómo puedo cambiar mi contraseña? 🔑"),
      ).toBeInTheDocument();
    });
  });
});
