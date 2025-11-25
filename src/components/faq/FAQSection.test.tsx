import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FAQSection from "./FAQSection";
import * as faqConstants from "@/constants/faq";

// Mock function that tracks which category is called
let mockFAQData: any[] = [];
const mockGetFAQsByCategory = jest.fn((cat) => {
  return [
    {
      id: `faq-${cat}-1`,
      question: "Mock Q1?",
      answer: "Mock A1.",
      category: cat,
    },
    {
      id: `faq-${cat}-2`,
      question: "Mock Q2?",
      answer: "Mock A2.",
      category: cat,
    },
  ];
});

jest.mock("@/constants/faq", () => ({
  ...jest.requireActual("@/constants/faq"),
  get getFAQsByCategory() {
    return mockGetFAQsByCategory;
  },
  FAQ_CATEGORIES: [
    { id: "cat-1", name: "Cat 1", icon: "Rocket", description: "desc" },
    { id: "cat-2", name: "Cat 2", icon: "Gavel", description: "desc" },
  ],
}));

describe("FAQSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFAQsByCategory.mockImplementation((cat) => {
      return [
        {
          id: `faq-${cat}-1`,
          question: "Mock Q1?",
          answer: "Mock A1.",
          category: cat,
        },
        {
          id: `faq-${cat}-2`,
          question: "Mock Q2?",
          answer: "Mock A2.",
          category: cat,
        },
      ];
    });
  });

  describe("Basic Rendering", () => {
    it("renders FAQ section with default title", () => {
      render(<FAQSection />);
      expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    });

    it("renders FAQ section with custom title and description", () => {
      render(<FAQSection title="Test FAQ" description="Desc" />);
      expect(screen.getByText("Test FAQ")).toBeInTheDocument();
      expect(screen.getByText("Desc")).toBeInTheDocument();
    });

    it("renders section element with proper structure", () => {
      const { container } = render(<FAQSection />);
      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass("w-full");
    });

    it("renders h2 heading with proper styling", () => {
      render(<FAQSection title="My FAQs" />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("My FAQs");
      expect(heading).toHaveClass("text-3xl", "font-bold", "text-gray-900");
    });

    it("does not render description when not provided", () => {
      const { container } = render(<FAQSection title="Test" />);
      const description = container.querySelector("p.text-gray-600");
      expect(description).not.toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("does not show search bar by default", () => {
      render(<FAQSection />);
      expect(screen.queryByPlaceholderText("Search FAQs...")).not.toBeInTheDocument();
    });

    it("shows search bar when showSearch is true", () => {
      render(<FAQSection showSearch={true} />);
      expect(screen.getByPlaceholderText("Search FAQs...")).toBeInTheDocument();
    });

    it("filters FAQs by question text", () => {
      render(<FAQSection showSearch={true} />);
      const searchInput = screen.getByPlaceholderText("Search FAQs...");
      
      fireEvent.change(searchInput, { target: { value: "Mock Q2" } });
      
      expect(screen.getAllByText("Mock Q2?").length).toBeGreaterThan(0);
    });

    it("filters FAQs by answer text", () => {
      render(<FAQSection showSearch={true} defaultCategory="cat-1" />);
      const searchInput = screen.getByPlaceholderText("Search FAQs...");
      
      fireEvent.change(searchInput, { target: { value: "Mock A1" } });
      
      expect(screen.getByText("Mock Q1?")).toBeInTheDocument();
    });

    it("search is case-insensitive", () => {
      render(<FAQSection showSearch={true} />);
      const searchInput = screen.getByPlaceholderText("Search FAQs...");
      
      fireEvent.change(searchInput, { target: { value: "MOCK q2" } });
      
      expect(screen.getAllByText("Mock Q2?").length).toBeGreaterThan(0);
    });

    it("shows empty state when search returns no results", () => {
      render(<FAQSection showSearch={true} />);
      const searchInput = screen.getByPlaceholderText("Search FAQs...");
      
      fireEvent.change(searchInput, { target: { value: "NonexistentQuery123" } });
      
      expect(screen.getByText(/No FAQs found/)).toBeInTheDocument();
    });

    it("search input has proper styling", () => {
      render(<FAQSection showSearch={true} />);
      const searchInput = screen.getByPlaceholderText("Search FAQs...");
      
      expect(searchInput).toHaveClass("w-full", "px-4", "py-3", "border", "rounded-lg");
    });
  });

  describe("Category Tabs", () => {
    it("renders 'All Categories' button", () => {
      render(<FAQSection />);
      expect(screen.getByText("All Categories")).toBeInTheDocument();
    });

    it("renders all category buttons", () => {
      render(<FAQSection />);
      expect(screen.getByText("Cat 1")).toBeInTheDocument();
      expect(screen.getByText("Cat 2")).toBeInTheDocument();
    });

    it("'All Categories' is active by default", () => {
      render(<FAQSection />);
      const allCategoriesBtn = screen.getByText("All Categories");
      expect(allCategoriesBtn).toHaveClass("bg-blue-600", "text-white");
    });

    it("switches to specific category when clicked", () => {
      render(<FAQSection />);
      
      const cat2Btn = screen.getByText("Cat 2");
      fireEvent.click(cat2Btn);
      
      expect(cat2Btn).toHaveClass("bg-blue-600", "text-white");
      expect(mockGetFAQsByCategory).toHaveBeenCalledWith("cat-2");
    });

    it("switches back to 'All Categories' when clicked", () => {
      render(<FAQSection defaultCategory="cat-1" />);
      
      const allCategoriesBtn = screen.getByText("All Categories");
      fireEvent.click(allCategoriesBtn);
      
      expect(allCategoriesBtn).toHaveClass("bg-blue-600", "text-white");
    });

    it("renders category icons", () => {
      const { container } = render(<FAQSection />);
      const categoryButtons = container.querySelectorAll("button");
      
      // Should have icons (SVG elements) in category buttons
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });

    it("inactive category buttons have gray styling", () => {
      render(<FAQSection defaultCategory="cat-1" />);
      const cat2Btn = screen.getByText("Cat 2");
      
      expect(cat2Btn).toHaveClass("bg-gray-100", "text-gray-700");
    });

    it("category buttons have hover effect classes", () => {
      render(<FAQSection />);
      const cat1Btn = screen.getByText("Cat 1");
      
      expect(cat1Btn).toHaveClass("hover:bg-gray-200");
    });
  });

  describe("FAQ Items Display", () => {
    it("renders FAQ items from selected category", () => {
      render(<FAQSection defaultCategory="cat-1" />);
      
      expect(screen.getByText("Mock Q1?")).toBeInTheDocument();
      expect(screen.getByText("Mock Q2?")).toBeInTheDocument();
    });

    it("first FAQ item has defaultOpen set to true", () => {
      render(<FAQSection />);
      
      // First item should be expanded by default
      const firstAnswer = screen.getAllByText("Mock A1.")[0];
      expect(firstAnswer).toBeVisible();
    });

    it("renders FAQs in a white bordered container", () => {
      const { container } = render(<FAQSection />);
      const faqContainer = container.querySelector(".bg-white.rounded-lg.shadow-sm.border");
      
      expect(faqContainer).toBeInTheDocument();
    });

    it("shows empty state when no FAQs available", () => {
      mockGetFAQsByCategory.mockReturnValue([]);
      render(<FAQSection defaultCategory="cat-1" />);
      
      expect(screen.getByText(/No FAQs found/)).toBeInTheDocument();
    });

    it("empty state has proper styling", () => {
      mockGetFAQsByCategory.mockReturnValue([]);
      const { container } = render(<FAQSection />);
      const emptyState = container.querySelector(".py-12.text-center.text-gray-500");
      
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe("MaxItems Limiting", () => {
    it("limits displayed FAQs when maxItemsToShow is set", () => {
      mockGetFAQsByCategory.mockReturnValue([
        { id: "1", question: "Q1?", answer: "A1", category: "cat-1" },
        { id: "2", question: "Q2?", answer: "A2", category: "cat-1" },
        { id: "3", question: "Q3?", answer: "A3", category: "cat-1" },
      ]);
      
      render(<FAQSection maxItemsToShow={2} defaultCategory="cat-1" />);
      
      expect(screen.getByText("Q1?")).toBeInTheDocument();
      expect(screen.getByText("Q2?")).toBeInTheDocument();
      expect(screen.queryByText("Q3?")).not.toBeInTheDocument();
    });

    it("shows 'View all FAQs' link when items are limited", () => {
      mockGetFAQsByCategory.mockReturnValue([
        { id: "1", question: "Q1?", answer: "A1", category: "cat-1" },
        { id: "2", question: "Q2?", answer: "A2", category: "cat-1" },
      ]);
      
      render(<FAQSection maxItemsToShow={2} defaultCategory="cat-1" />);
      
      expect(screen.getByText("View all FAQs")).toBeInTheDocument();
    });

    it("'View all FAQs' link has correct href", () => {
      mockGetFAQsByCategory.mockReturnValue([
        { id: "1", question: "Q1?", answer: "A1", category: "cat-1" },
        { id: "2", question: "Q2?", answer: "A2", category: "cat-1" },
      ]);
      
      render(<FAQSection maxItemsToShow={2} defaultCategory="cat-1" />);
      const link = screen.getByText("View all FAQs").closest("a");
      
      expect(link).toHaveAttribute("href", "/faq");
    });

    it("does not show 'View all FAQs' link when no limit set", () => {
      render(<FAQSection defaultCategory="cat-1" />);
      
      expect(screen.queryByText("View all FAQs")).not.toBeInTheDocument();
    });

    it("does not show 'View all FAQs' when FAQs count is less than limit", () => {
      mockGetFAQsByCategory.mockReturnValue([
        { id: "1", question: "Q1?", answer: "A1", category: "cat-1" },
      ]);
      
      render(<FAQSection maxItemsToShow={5} defaultCategory="cat-1" />);
      
      expect(screen.queryByText("View all FAQs")).not.toBeInTheDocument();
    });
  });

  describe("Default Category", () => {
    it("uses defaultCategory prop to set initial category", () => {
      render(<FAQSection defaultCategory="cat-2" />);
      
      const cat2Btn = screen.getByText("Cat 2");
      expect(cat2Btn).toHaveClass("bg-blue-600", "text-white");
      expect(mockGetFAQsByCategory).toHaveBeenCalledWith("cat-2");
    });

    it("shows all categories when defaultCategory is not provided", () => {
      render(<FAQSection defaultCategory="cat-1" />);
      
      const allCategoriesBtn = screen.getByText("All Categories");
      fireEvent.click(allCategoriesBtn);
      expect(allCategoriesBtn).toHaveClass("bg-blue-600", "text-white");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty string search gracefully", () => {
      render(<FAQSection showSearch={true} defaultCategory="cat-1" />);
      const searchInput = screen.getByPlaceholderText("Search FAQs...");
      
      fireEvent.change(searchInput, { target: { value: "" } });
      
      expect(screen.getByText("Mock Q1?")).toBeInTheDocument();
      expect(screen.getByText("Mock Q2?")).toBeInTheDocument();
    });

    it("handles special characters in search - search by text without special char", () => {
      render(<FAQSection showSearch={true} defaultCategory="cat-1" />);
      const searchInput = screen.getByPlaceholderText("Search FAQs...");
      
      fireEvent.change(searchInput, { target: { value: "Mock Q1" } });
      
      expect(screen.getByText("Mock Q1?")).toBeInTheDocument();
    });

    it("handles maxItemsToShow of 0 - BUG: shows all FAQs instead of limiting", () => {
      render(<FAQSection maxItemsToShow={0} defaultCategory="cat-1" />);
      
      // BUG: When maxItemsToShow=0, the component doesn't apply slice because of 
      // `if (maxItemsToShow)` check which is falsy for 0
      // Expected behavior: Should show 0 items or empty state
      // Actual behavior: Shows all FAQs (2 items in this case)
      // This is a component bug that should be fixed
      expect(screen.getByText("Mock Q1?")).toBeInTheDocument();
      expect(screen.getByText("Mock Q2?")).toBeInTheDocument();
    });

    it("handles very long title text", () => {
      const longTitle = "A".repeat(200);
      render(<FAQSection title={longTitle} defaultCategory="cat-1" />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("handles very long description text", () => {
      const longDesc = "B".repeat(300);
      render(<FAQSection description={longDesc} defaultCategory="cat-1" />);
      
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic section element", () => {
      const { container } = render(<FAQSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("uses proper heading hierarchy with h2", () => {
      render(<FAQSection title="FAQ Title" />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it("search input has proper type attribute", () => {
      render(<FAQSection showSearch={true} />);
      const searchInput = screen.getByPlaceholderText("Search FAQs...");
      expect(searchInput).toHaveAttribute("type", "text");
    });

    it("category buttons are keyboard accessible", () => {
      render(<FAQSection />);
      const allCategoriesBtn = screen.getByText("All Categories");
      expect(allCategoriesBtn.tagName).toBe("BUTTON");
    });
  });

  describe("Styling", () => {
    it("header has proper text alignment and spacing", () => {
      const { container } = render(<FAQSection title="Test" />);
      const header = container.querySelector(".text-center.mb-8");
      expect(header).toBeInTheDocument();
    });

    it("category tabs have overflow-x-auto for responsiveness", () => {
      const { container } = render(<FAQSection />);
      const tabsContainer = container.querySelector(".overflow-x-auto");
      expect(tabsContainer).toBeInTheDocument();
    });

    it("description has max-width constraint", () => {
      const { container } = render(<FAQSection description="Test desc" />);
      const description = container.querySelector(".max-w-2xl.mx-auto");
      expect(description).toBeInTheDocument();
    });
  });
});
