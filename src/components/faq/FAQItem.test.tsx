import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FAQItem from "./FAQItem";

describe("FAQItem", () => {
  it("renders question and answer, toggles open/close", () => {
    render(
      <FAQItem
        question="What is Let It Rip?"
        answer="Let It Rip is India's trusted seller of authentic imported collectibles!"
      />
    );
    expect(screen.getByText("What is Let It Rip?")).toBeInTheDocument();
    // Initially closed, answer not visible
    expect(screen.queryByText(/trusted seller/)).not.toBeInTheDocument();
    // Click to open
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText(/trusted seller/)).toBeInTheDocument();
    // Click to close
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText(/trusted seller/)).not.toBeInTheDocument();
  });

  it("opens by default if defaultOpen is true", () => {
    render(<FAQItem question="Q" answer="A" defaultOpen={true} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
