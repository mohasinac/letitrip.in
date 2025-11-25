import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FAQItem from "./FAQItem";

describe("FAQItem", () => {
  const mockQuestion = "What is Let It Rip?";
  const mockAnswer =
    "Let It Rip is India's trusted seller of authentic imported collectibles!";

  describe("Basic Rendering", () => {
    it("renders question text", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      expect(screen.getByText(mockQuestion)).toBeInTheDocument();
    });

    it("does not render answer initially when closed", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      expect(screen.queryByText(/trusted seller/)).not.toBeInTheDocument();
    });

    it("renders button with correct aria-expanded", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("renders chevron down icon", () => {
      const { container } = render(
        <FAQItem question={mockQuestion} answer={mockAnswer} />
      );

      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Toggle Functionality", () => {
    it("opens when button is clicked", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(screen.getByText(/trusted seller/)).toBeInTheDocument();
    });

    it("closes when button is clicked again", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      const button = screen.getByRole("button");
      fireEvent.click(button); // Open
      fireEvent.click(button); // Close

      expect(screen.queryByText(/trusted seller/)).not.toBeInTheDocument();
    });

    it("toggles multiple times", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      const button = screen.getByRole("button");

      fireEvent.click(button); // Open
      expect(screen.getByText(/trusted seller/)).toBeInTheDocument();

      fireEvent.click(button); // Close
      expect(screen.queryByText(/trusted seller/)).not.toBeInTheDocument();

      fireEvent.click(button); // Open again
      expect(screen.getByText(/trusted seller/)).toBeInTheDocument();
    });

    it("updates aria-expanded when opened", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("updates aria-expanded when closed", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      const button = screen.getByRole("button");
      fireEvent.click(button); // Open
      fireEvent.click(button); // Close

      expect(button).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Default Open State", () => {
    it("renders answer immediately when defaultOpen is true", () => {
      render(
        <FAQItem
          question={mockQuestion}
          answer={mockAnswer}
          defaultOpen={true}
        />
      );

      expect(screen.getByText(/trusted seller/)).toBeInTheDocument();
    });

    it("sets aria-expanded to true when defaultOpen is true", () => {
      render(
        <FAQItem
          question={mockQuestion}
          answer={mockAnswer}
          defaultOpen={true}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("can close when defaultOpen is true", () => {
      render(
        <FAQItem
          question={mockQuestion}
          answer={mockAnswer}
          defaultOpen={true}
        />
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(screen.queryByText(/trusted seller/)).not.toBeInTheDocument();
    });

    it("defaults to closed when defaultOpen is not provided", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      expect(screen.queryByText(/trusted seller/)).not.toBeInTheDocument();
    });

    it("defaults to closed when defaultOpen is false", () => {
      render(
        <FAQItem
          question={mockQuestion}
          answer={mockAnswer}
          defaultOpen={false}
        />
      );

      expect(screen.queryByText(/trusted seller/)).not.toBeInTheDocument();
    });
  });

  describe("Chevron Icon Animation", () => {
    it("rotates chevron when opened", () => {
      const { container } = render(
        <FAQItem question={mockQuestion} answer={mockAnswer} />
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      const icon = container.querySelector("svg");
      expect(icon).toHaveClass("rotate-180");
    });

    it("removes rotation when closed", () => {
      const { container } = render(
        <FAQItem question={mockQuestion} answer={mockAnswer} />
      );

      const button = screen.getByRole("button");
      const icon = container.querySelector("svg");

      expect(icon).not.toHaveClass("rotate-180");
    });

    it("has transition class on chevron", () => {
      const { container } = render(
        <FAQItem question={mockQuestion} answer={mockAnswer} />
      );

      const icon = container.querySelector("svg");
      expect(icon).toHaveClass("transition-transform", "duration-200");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty question", () => {
      render(<FAQItem question="" answer={mockAnswer} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("handles empty answer", () => {
      render(<FAQItem question={mockQuestion} answer="" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      // Answer div should render but be empty
      const answerDiv = button.parentElement?.querySelector(".px-6");
      expect(answerDiv).toBeInTheDocument();
    });

    it("handles very long question", () => {
      const longQuestion = "Q".repeat(200);
      render(<FAQItem question={longQuestion} answer={mockAnswer} />);

      expect(screen.getByText(longQuestion)).toBeInTheDocument();
    });

    it("handles very long answer", () => {
      const longAnswer = "A".repeat(500);
      render(<FAQItem question={mockQuestion} answer={longAnswer} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(screen.getByText(longAnswer)).toBeInTheDocument();
    });

    it("handles special characters in question", () => {
      const specialQuestion = "What's <this> & 'that'?";
      render(<FAQItem question={specialQuestion} answer={mockAnswer} />);

      expect(screen.getByText(specialQuestion)).toBeInTheDocument();
    });

    it("handles HTML in answer", () => {
      const htmlAnswer = "<p>This is HTML</p>";
      render(<FAQItem question={mockQuestion} answer={htmlAnswer} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(screen.getByText(htmlAnswer)).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies correct button styling", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("w-full", "py-5", "px-6", "flex");
    });

    it("has hover effect on button", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-gray-50", "transition-colors");
    });

    it("applies correct answer styling", () => {
      const { container } = render(
        <FAQItem
          question={mockQuestion}
          answer={mockAnswer}
          defaultOpen={true}
        />
      );

      const answerDiv = container.querySelector(".px-6.pb-5");
      expect(answerDiv).toHaveClass("text-gray-600", "leading-relaxed");
    });

    it("has border on container", () => {
      const { container } = render(
        <FAQItem question={mockQuestion} answer={mockAnswer} />
      );

      const itemDiv = container.firstChild;
      expect(itemDiv).toHaveClass("border-b", "border-gray-200");
    });
  });

  describe("Accessibility", () => {
    it("button has text-left for proper alignment", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-left");
    });

    it("button is keyboard accessible", () => {
      render(<FAQItem question={mockQuestion} answer={mockAnswer} />);

      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });
  });
});
