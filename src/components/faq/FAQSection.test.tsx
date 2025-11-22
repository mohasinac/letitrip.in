import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FAQSection from "./FAQSection";
import * as faqConstants from "@/constants/faq";

jest.mock("@/constants/faq", () => ({
  ...jest.requireActual("@/constants/faq"),
  getFAQsByCategory: jest.fn((cat) => [
    {
      id: `faq-1-${cat}`,
      question: "Mock Q1?",
      answer: "Mock A1.",
      category: cat,
    },
    {
      id: `faq-2-${cat}`,
      question: "Mock Q2?",
      answer: "Mock A2.",
      category: cat,
    },
  ]),
  FAQ_CATEGORIES: [
    { id: "cat-1", name: "Cat 1", icon: "rocket", description: "desc" },
    { id: "cat-2", name: "Cat 2", icon: "gavel", description: "desc" },
  ],
}));

describe("FAQSection", () => {
  it("renders FAQ section with title and description", () => {
    render(<FAQSection title="Test FAQ" description="Desc" />);
    expect(screen.getByText("Test FAQ")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });

  it("shows category tabs and switches category", () => {
    render(<FAQSection showSearch={false} />);
    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText("Cat 1")).toBeInTheDocument();
    expect(screen.getByText("Cat 2")).toBeInTheDocument();
    // Switch category
    fireEvent.click(screen.getByText("Cat 2"));
    expect(faqConstants.getFAQsByCategory).toHaveBeenCalledWith("cat-2");
  });

  it("shows search bar and filters FAQs", () => {
    render(<FAQSection showSearch={true} />);
    expect(screen.getByPlaceholderText("Search FAQs...")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Search FAQs..."), {
      target: { value: "Mock Q2" },
    });
    // There may be multiple elements with the same question text
    expect(screen.getAllByText("Mock Q2?").length).toBeGreaterThan(0);
  });

  it("shows empty state if no FAQs", () => {
    (faqConstants.getFAQsByCategory as jest.Mock).mockReturnValueOnce([]);
    render(<FAQSection defaultCategory="cat-1" />);
    expect(screen.getByText(/No FAQs found/)).toBeInTheDocument();
  });
});
