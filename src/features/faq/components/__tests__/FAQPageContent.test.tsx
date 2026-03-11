/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { FAQPageContent } from "../FAQPageContent";

const mockSetSort = jest.fn();
const mockTableGet = jest.fn().mockReturnValue("helpful");
const mockTableSet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("@/hooks", () => ({
  useAllFaqs: jest.fn(() => ({
    data: [
      {
        id: "faq-1",
        question: "How do I return an item?",
        answer: "You can return within 30 days.",
        category: "returns",
        status: "published",
        createdAt: new Date("2025-01-01"),
        tags: ["return", "refund"],
        stats: { helpful: 10, notHelpful: 1 },
      },
      {
        id: "faq-2",
        question: "What payment methods do you accept?",
        answer: "We accept cards and UPI.",
        category: "payment",
        status: "published",
        createdAt: new Date("2025-01-05"),
        tags: ["payment"],
        stats: { helpful: 5, notHelpful: 0 },
      },
    ],
    isLoading: false,
  })),
  useUrlTable: jest.fn(() => ({
    get: mockTableGet,
    set: mockTableSet,
    setSort: mockSetSort,
    setPage: jest.fn(),
    params: new URLSearchParams(),
  })),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    container: { "2xl": "max-w-screen-2xl" },
    spacing: {
      padding: { xl: "p-8" },
      gap: { lg: "gap-6" },
      stack: "space-y-4",
    },
    typography: {
      h1: "text-4xl font-bold",
      body: "text-base",
    },
    themed: {
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      bgSecondary: "bg-gray-50",
    },
    borderRadius: { xl: "rounded-xl" },
  },
  UI_LABELS: {
    FAQ: {
      TITLE: "Frequently Asked Questions",
      SUBTITLE: "Find answers to common questions",
      SEARCH_PLACEHOLDER: "Search FAQs...",
      QUESTION_SINGULAR: "question",
      QUESTION_PLURAL: "questions",
      IN_CATEGORY: "in",
    },
  },
  ROUTES: {
    PUBLIC: {
      FAQS: "/faqs",
      FAQ_CATEGORY: (cat: string) => `/faqs/${cat}`,
    },
  },
  FAQ_CATEGORIES: {
    general: { label: "General" },
    products: { label: "Products" },
    shipping: { label: "Shipping" },
    returns: { label: "Returns" },
    payment: { label: "Payment" },
    account: { label: "Account" },
    sellers: { label: "Sellers" },
  },
}));

jest.mock("../FAQCategorySidebar", () => ({
  FAQCategorySidebar: ({ onCategorySelect }: any) => (
    <div data-testid="faq-category-sidebar">
      <button onClick={() => onCategorySelect("returns")}>Returns</button>
    </div>
  ),
}));

jest.mock("../FAQSortDropdown", () => ({
  FAQSortDropdown: ({ selectedSort, onSortChange }: any) => (
    <select
      data-testid="faq-sort-dropdown"
      value={selectedSort}
      onChange={(e) => onSortChange(e.target.value)}
    >
      <option value="helpful">Helpful</option>
      <option value="newest">Newest</option>
      <option value="alphabetical">Alphabetical</option>
    </select>
  ),
}));

jest.mock("../FAQAccordion", () => ({
  FAQAccordion: ({ faqs }: any) => (
    <div data-testid="faq-accordion">
      {faqs.map((faq: any) => (
        <div key={faq.id} data-testid="faq-item">
          {faq.question}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("../ContactCTA", () => ({
  ContactCTA: () => <div data-testid="contact-cta" />,
}));

describe("FAQPageContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTableGet.mockReturnValue("helpful");
  });

  it("renders without crashing", () => {
    expect(() => render(<FAQPageContent />)).not.toThrow();
  });

  it("renders the page title", () => {
    render(<FAQPageContent />);
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
  });

  it("renders the FAQSortDropdown", () => {
    render(<FAQPageContent />);
    expect(screen.getByTestId("faq-sort-dropdown")).toBeInTheDocument();
  });

  it("renders the FAQAccordion with FAQs", () => {
    render(<FAQPageContent />);
    expect(screen.getByTestId("faq-accordion")).toBeInTheDocument();
    const faqItems = screen.getAllByTestId("faq-item");
    expect(faqItems.length).toBe(2);
  });

  it("calls table.setSort when sort changes", () => {
    render(<FAQPageContent />);
    const sortDropdown = screen.getByTestId("faq-sort-dropdown");
    fireEvent.change(sortDropdown, { target: { value: "newest" } });
    expect(mockSetSort).toHaveBeenCalledWith("newest");
  });

  it("uses useUrlTable for sort state (not useState)", () => {
    const { useUrlTable } = require("@/hooks");
    render(<FAQPageContent />);
    expect(useUrlTable).toHaveBeenCalledWith({ defaults: { sort: "helpful" } });
  });

  it("reads sort from useUrlTable.get('sort')", () => {
    render(<FAQPageContent />);
    expect(mockTableGet).toHaveBeenCalledWith("sort");
  });

  it("renders ContactCTA when faqs are present", () => {
    render(<FAQPageContent />);
    expect(screen.getByTestId("contact-cta")).toBeInTheDocument();
  });
});
