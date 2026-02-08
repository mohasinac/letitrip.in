import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FAQSearchBar } from "../FAQSearchBar";
import { UI_PLACEHOLDERS } from "@/constants/ui";

describe("FAQSearchBar", () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render search input with default placeholder", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
    });

    it("should render search input with custom placeholder", () => {
      render(
        <FAQSearchBar onSearch={mockOnSearch} placeholder="Search FAQs..." />,
      );

      expect(screen.getByPlaceholderText("Search FAQs...")).toBeInTheDocument();
    });

    it("should render search icon", () => {
      const { container } = render(<FAQSearchBar onSearch={mockOnSearch} />);

      // Check for search icon SVG path
      const searchIcon = container.querySelector('svg path[d*="M21 21l-6-6"]');
      expect(searchIcon).toBeInTheDocument();
    });

    it("should not render clear button initially", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
    });

    it("should render clear button when input has text", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      fireEvent.change(input, { target: { value: "shipping" } });

      expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
    });

    it("should render clear button with X icon", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      fireEvent.change(input, { target: { value: "test" } });

      const clearButton = screen.getByLabelText("Clear search");
      const svgPath = clearButton.querySelector("svg path");
      expect(svgPath).toHaveAttribute("d", "M6 18L18 6M6 6l12 12");
    });
  });

  describe("Search Functionality", () => {
    it("should call onSearch when typing", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      fireEvent.change(input, { target: { value: "s" } });

      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("s");
    });

    it("should call onSearch multiple times as user types", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);

      fireEvent.change(input, { target: { value: "s" } });
      fireEvent.change(input, { target: { value: "sh" } });
      fireEvent.change(input, { target: { value: "shi" } });
      fireEvent.change(input, { target: { value: "ship" } });

      expect(mockOnSearch).toHaveBeenCalledTimes(4);
      expect(mockOnSearch).toHaveBeenNthCalledWith(1, "s");
      expect(mockOnSearch).toHaveBeenNthCalledWith(2, "sh");
      expect(mockOnSearch).toHaveBeenNthCalledWith(3, "shi");
      expect(mockOnSearch).toHaveBeenNthCalledWith(4, "ship");
    });

    it("should update input value as user types", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(
        UI_PLACEHOLDERS.SEARCH,
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { value: "shipping" } });
      expect(input.value).toBe("shipping");

      fireEvent.change(input, { target: { value: "shipping policy" } });
      expect(input.value).toBe("shipping policy");
    });

    it("should call onSearch with empty string when clearing input", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);

      // Type something
      fireEvent.change(input, { target: { value: "test" } });
      mockOnSearch.mockClear();

      // Clear it
      fireEvent.change(input, { target: { value: "" } });

      expect(mockOnSearch).toHaveBeenCalledWith("");
    });
  });

  describe("Clear Button Functionality", () => {
    it("should clear input when clear button is clicked", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(
        UI_PLACEHOLDERS.SEARCH,
      ) as HTMLInputElement;

      // Type something
      fireEvent.change(input, { target: { value: "shipping" } });
      expect(input.value).toBe("shipping");

      // Click clear button
      const clearButton = screen.getByLabelText("Clear search");
      fireEvent.click(clearButton);

      expect(input.value).toBe("");
    });

    it("should call onSearch with empty string when clear button is clicked", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);

      // Type something
      fireEvent.change(input, { target: { value: "test query" } });
      mockOnSearch.mockClear();

      // Click clear button
      const clearButton = screen.getByLabelText("Clear search");
      fireEvent.click(clearButton);

      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("");
    });

    it("should hide clear button after clearing", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);

      // Type something
      fireEvent.change(input, { target: { value: "test" } });
      expect(screen.getByLabelText("Clear search")).toBeInTheDocument();

      // Click clear
      const clearButton = screen.getByLabelText("Clear search");
      fireEvent.click(clearButton);

      // Clear button should be hidden
      expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string input", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);

      // Type something first
      fireEvent.change(input, { target: { value: "test" } });
      mockOnSearch.mockClear();

      // Then clear it
      fireEvent.change(input, { target: { value: "" } });

      expect(mockOnSearch).toHaveBeenCalledWith("");
    });

    it("should handle whitespace-only input", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      fireEvent.change(input, { target: { value: "   " } });

      expect(mockOnSearch).toHaveBeenCalledWith("   ");
    });

    it("should handle very long input", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const longText = "a".repeat(500);
      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      fireEvent.change(input, { target: { value: longText } });

      expect(mockOnSearch).toHaveBeenCalledWith(longText);
    });

    it("should handle special characters", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const specialChars = "!@#$%^&*()_+-=[]{}|;:'\",.<>?/`~";
      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      fireEvent.change(input, { target: { value: specialChars } });

      expect(mockOnSearch).toHaveBeenCalledWith(specialChars);
    });

    it("should handle unicode characters", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const unicode = "你好 नमस्ते مرحبا";
      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      fireEvent.change(input, { target: { value: unicode } });

      expect(mockOnSearch).toHaveBeenCalledWith(unicode);
    });

    it("should handle emojis", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const emojis = "😀 🚚 💳 🔄";
      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      fireEvent.change(input, { target: { value: emojis } });

      expect(mockOnSearch).toHaveBeenCalledWith(emojis);
    });

    it("should handle rapid typing", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);

      // Simulate rapid typing
      "shipping".split("").forEach((char, index) => {
        fireEvent.change(input, {
          target: { value: "shipping".substring(0, index + 1) },
        });
      });

      expect(mockOnSearch).toHaveBeenCalledTimes(8);
    });

    it("should handle backspace (deleting characters)", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);

      fireEvent.change(input, { target: { value: "ship" } });
      fireEvent.change(input, { target: { value: "shi" } });
      fireEvent.change(input, { target: { value: "sh" } });
      fireEvent.change(input, { target: { value: "s" } });

      expect(mockOnSearch).toHaveBeenCalledTimes(4);
      expect(mockOnSearch).toHaveBeenLastCalledWith("s");
    });

    it("should handle paste operation", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);

      // Simulate paste
      fireEvent.change(input, { target: { value: "pasted text" } });

      expect(mockOnSearch).toHaveBeenCalledWith("pasted text");
    });
  });

  describe("Accessibility", () => {
    it("should have proper input attributes", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("placeholder");
    });

    it("should have aria-label on clear button", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      fireEvent.change(input, { target: { value: "test" } });

      const clearButton = screen.getByLabelText("Clear search");
      expect(clearButton).toHaveAttribute("aria-label", "Clear search");
    });

    it("should be keyboard accessible", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);

      // Input should be focusable
      input.focus();
      expect(input).toHaveFocus();
    });

    it("should allow keyboard navigation to clear button", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      fireEvent.change(input, { target: { value: "test" } });

      const clearButton = screen.getByLabelText("Clear search");
      clearButton.focus();
      expect(clearButton).toHaveFocus();
    });

    it("should support Enter key on clear button", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(
        UI_PLACEHOLDERS.SEARCH,
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "test" } });
      mockOnSearch.mockClear();

      const clearButton = screen.getByLabelText("Clear search");
      fireEvent.keyDown(clearButton, { key: "Enter", code: "Enter" });
      fireEvent.click(clearButton);

      expect(input.value).toBe("");
      expect(mockOnSearch).toHaveBeenCalledWith("");
    });
  });

  describe("Visual States", () => {
    it("should have focus ring on input focus", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);
      expect(input).toHaveClass("focus:ring-2", "focus:ring-blue-500");
    });

    it("should show clear button only when input has value", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(UI_PLACEHOLDERS.SEARCH);

      // Initially no clear button
      expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();

      // Type something - clear button appears
      fireEvent.change(input, { target: { value: "a" } });
      expect(screen.getByLabelText("Clear search")).toBeInTheDocument();

      // Delete everything - clear button disappears
      fireEvent.change(input, { target: { value: "" } });
      expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
    });

    it("should have pointer-events-none on search icon", () => {
      const { container } = render(<FAQSearchBar onSearch={mockOnSearch} />);

      const iconContainer = container.querySelector(".pointer-events-none");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("should work with search query lifecycle", () => {
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(
        UI_PLACEHOLDERS.SEARCH,
      ) as HTMLInputElement;

      // 1. Type search query
      fireEvent.change(input, { target: { value: "shipping" } });
      expect(mockOnSearch).toHaveBeenCalledWith("shipping");
      expect(input.value).toBe("shipping");

      // 2. Refine search
      fireEvent.change(input, { target: { value: "shipping policy" } });
      expect(mockOnSearch).toHaveBeenCalledWith("shipping policy");
      expect(input.value).toBe("shipping policy");

      // 3. Clear search
      const clearButton = screen.getByLabelText("Clear search");
      fireEvent.click(clearButton);
      expect(mockOnSearch).toHaveBeenCalledWith("");
      expect(input.value).toBe("");

      // 4. New search
      fireEvent.change(input, { target: { value: "payment" } });
      expect(mockOnSearch).toHaveBeenCalledWith("payment");
      expect(input.value).toBe("payment");
    });

    it("should handle multiple search sessions", () => {
      const { unmount } = render(<FAQSearchBar onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(
        UI_PLACEHOLDERS.SEARCH,
      ) as HTMLInputElement;

      // Session 1
      fireEvent.change(input, { target: { value: "query1" } });
      expect(input.value).toBe("query1");

      // Unmount component (simulating navigation away)
      unmount();

      // Re-render fresh component (new session)
      render(<FAQSearchBar onSearch={mockOnSearch} />);

      // New input should start fresh
      const newInput = screen.getByPlaceholderText(
        UI_PLACEHOLDERS.SEARCH,
      ) as HTMLInputElement;
      expect(newInput.value).toBe("");

      // Session 2
      fireEvent.change(newInput, { target: { value: "query2" } });
      expect(newInput.value).toBe("query2");
    });
  });
});
