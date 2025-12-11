/**
 * @jest-environment jsdom
 *
 * OTPInput Component Tests
 * Tests OTP entry, keyboard navigation, paste support, and accessibility
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { OTPInput } from "../OTPInput";

describe("OTPInput Component", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");
      expect(inputs).toHaveLength(6);
    });

    it("should render custom length", () => {
      render(<OTPInput value="" onChange={mockOnChange} length={4} />);
      const inputs = screen.getAllByRole("textbox");
      expect(inputs).toHaveLength(4);
    });

    it("should render 8-digit OTP", () => {
      render(<OTPInput value="" onChange={mockOnChange} length={8} />);
      const inputs = screen.getAllByRole("textbox");
      expect(inputs).toHaveLength(8);
    });

    it("should display current value", () => {
      render(<OTPInput value="123456" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");
      expect(inputs[0]).toHaveValue("1");
      expect(inputs[1]).toHaveValue("2");
      expect(inputs[2]).toHaveValue("3");
      expect(inputs[3]).toHaveValue("4");
      expect(inputs[4]).toHaveValue("5");
      expect(inputs[5]).toHaveValue("6");
    });

    it("should display partial value", () => {
      render(<OTPInput value="123" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");
      expect(inputs[0]).toHaveValue("1");
      expect(inputs[1]).toHaveValue("2");
      expect(inputs[2]).toHaveValue("3");
      expect(inputs[3]).toHaveValue("");
      expect(inputs[4]).toHaveValue("");
      expect(inputs[5]).toHaveValue("");
    });

    it("should handle empty value", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input) => {
        expect(input).toHaveValue("");
      });
    });
  });

  describe("Input Behavior", () => {
    it("should call onChange when typing a digit", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.change(inputs[0], { target: { value: "5" } });

      expect(mockOnChange).toHaveBeenCalledWith("5");
    });

    it("should only accept digits", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.change(inputs[0], { target: { value: "a" } });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("should reject special characters", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.change(inputs[0], { target: { value: "@" } });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("should reject spaces", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.change(inputs[0], { target: { value: " " } });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("should only accept single digit per input", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.change(inputs[0], { target: { value: "12" } });

      // Should only take last character
      expect(mockOnChange).toHaveBeenCalledWith("2");
    });

    it("should update value when digit entered", () => {
      const { rerender } = render(
        <OTPInput value="" onChange={mockOnChange} />
      );
      const inputs = screen.getAllByRole("textbox");

      fireEvent.change(inputs[0], { target: { value: "1" } });

      rerender(<OTPInput value="1" onChange={mockOnChange} />);
      expect(inputs[0]).toHaveValue("1");
    });
  });

  describe("Auto-Focus Behavior", () => {
    it("should auto-focus first input when autoFocus is true", () => {
      render(<OTPInput value="" onChange={mockOnChange} autoFocus />);
      const inputs = screen.getAllByRole("textbox");

      expect(inputs[0]).toHaveFocus();
    });

    it("should not auto-focus when autoFocus is false", () => {
      render(<OTPInput value="" onChange={mockOnChange} autoFocus={false} />);
      const inputs = screen.getAllByRole("textbox");

      expect(inputs[0]).not.toHaveFocus();
    });

    it("should focus next input after digit entry", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs[0].focus();
      fireEvent.change(inputs[0], { target: { value: "1" } });

      // Next input should receive focus
      expect(inputs[1]).toHaveFocus();
    });

    it("should not focus beyond last input", () => {
      render(<OTPInput value="12345" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs[5].focus();
      fireEvent.change(inputs[5], { target: { value: "6" } });

      // Should stay on last input
      expect(inputs[5]).toHaveFocus();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should move to previous input on Backspace when empty", () => {
      render(<OTPInput value="1" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs[1].focus();
      fireEvent.keyDown(inputs[1], { key: "Backspace" });

      expect(inputs[0]).toHaveFocus();
    });

    it("should clear current input on Backspace when filled", () => {
      render(<OTPInput value="12" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs[1].focus();
      fireEvent.keyDown(inputs[1], { key: "Backspace" });

      expect(mockOnChange).toHaveBeenCalledWith("1");
    });

    it("should not move before first input on Backspace", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs[0].focus();
      fireEvent.keyDown(inputs[0], { key: "Backspace" });

      expect(inputs[0]).toHaveFocus();
    });

    it("should move to previous input on ArrowLeft", () => {
      render(<OTPInput value="12" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs[1].focus();
      fireEvent.keyDown(inputs[1], { key: "ArrowLeft" });

      expect(inputs[0]).toHaveFocus();
    });

    it("should move to next input on ArrowRight", () => {
      render(<OTPInput value="12" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs[0].focus();
      fireEvent.keyDown(inputs[0], { key: "ArrowRight" });

      expect(inputs[1]).toHaveFocus();
    });

    it("should not move before first input on ArrowLeft", () => {
      render(<OTPInput value="1" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs[0].focus();
      fireEvent.keyDown(inputs[0], { key: "ArrowLeft" });

      expect(inputs[0]).toHaveFocus();
    });

    it("should not move beyond last input on ArrowRight", () => {
      render(<OTPInput value="123456" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs[5].focus();
      fireEvent.keyDown(inputs[5], { key: "ArrowRight" });

      expect(inputs[5]).toHaveFocus();
    });
  });

  describe("Paste Support", () => {
    it("should handle pasting complete OTP", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.paste(inputs[0], {
        clipboardData: {
          getData: () => "123456",
        },
      });

      expect(mockOnChange).toHaveBeenCalledWith("123456");
    });

    it("should handle pasting partial OTP", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.paste(inputs[0], {
        clipboardData: {
          getData: () => "123",
        },
      });

      expect(mockOnChange).toHaveBeenCalledWith("123");
    });

    it("should extract digits from pasted text with spaces", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.paste(inputs[0], {
        clipboardData: {
          getData: () => "1 2 3 4 5 6",
        },
      });

      expect(mockOnChange).toHaveBeenCalledWith("123456");
    });

    it("should extract digits from pasted text with letters", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.paste(inputs[0], {
        clipboardData: {
          getData: () => "Your OTP is 123456",
        },
      });

      expect(mockOnChange).toHaveBeenCalledWith("123456");
    });

    it("should truncate pasted OTP to length", () => {
      render(<OTPInput value="" onChange={mockOnChange} length={4} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.paste(inputs[0], {
        clipboardData: {
          getData: () => "123456789",
        },
      });

      expect(mockOnChange).toHaveBeenCalledWith("1234");
    });

    it("should focus correct input after paste", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.paste(inputs[0], {
        clipboardData: {
          getData: () => "123",
        },
      });

      // Should focus input at index 2 (third input)
      expect(inputs[2]).toHaveFocus();
    });

    it("should focus last input when pasting complete OTP", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.paste(inputs[0], {
        clipboardData: {
          getData: () => "123456",
        },
      });

      expect(inputs[5]).toHaveFocus();
    });

    it("should handle empty paste", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.paste(inputs[0], {
        clipboardData: {
          getData: () => "",
        },
      });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("should handle paste with no digits", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.paste(inputs[0], {
        clipboardData: {
          getData: () => "abc xyz",
        },
      });

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("should disable all inputs when disabled is true", () => {
      render(<OTPInput value="" onChange={mockOnChange} disabled />);
      const inputs = screen.getAllByRole("textbox");

      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it("should not call onChange when disabled", () => {
      render(<OTPInput value="" onChange={mockOnChange} disabled />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.change(inputs[0], { target: { value: "1" } });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("should apply disabled styling", () => {
      const { container } = render(
        <OTPInput value="" onChange={mockOnChange} disabled />
      );
      const inputs = container.querySelectorAll(".cursor-not-allowed");

      expect(inputs.length).toBeGreaterThan(0);
    });

    it("should enable inputs when disabled is false", () => {
      render(<OTPInput value="" onChange={mockOnChange} disabled={false} />);
      const inputs = screen.getAllByRole("textbox");

      inputs.forEach((input) => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe("Error State", () => {
    it("should apply error styling when error is true", () => {
      const { container } = render(
        <OTPInput value="" onChange={mockOnChange} error />
      );
      const errorInput = container.querySelector(".border-red-500");

      expect(errorInput).toBeInTheDocument();
    });

    it("should apply normal styling when error is false", () => {
      const { container } = render(
        <OTPInput value="" onChange={mockOnChange} error={false} />
      );
      const normalInput = container.querySelector(".border-gray-300");

      expect(normalInput).toBeInTheDocument();
    });

    it("should still accept input in error state", () => {
      render(<OTPInput value="" onChange={mockOnChange} error />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.change(inputs[0], { target: { value: "1" } });

      expect(mockOnChange).toHaveBeenCalledWith("1");
    });
  });

  describe("Accessibility", () => {
    it("should have aria-label for each input", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);

      expect(screen.getByLabelText("Digit 1 of 6")).toBeInTheDocument();
      expect(screen.getByLabelText("Digit 2 of 6")).toBeInTheDocument();
      expect(screen.getByLabelText("Digit 3 of 6")).toBeInTheDocument();
      expect(screen.getByLabelText("Digit 4 of 6")).toBeInTheDocument();
      expect(screen.getByLabelText("Digit 5 of 6")).toBeInTheDocument();
      expect(screen.getByLabelText("Digit 6 of 6")).toBeInTheDocument();
    });

    it("should have correct aria-labels for custom length", () => {
      render(<OTPInput value="" onChange={mockOnChange} length={4} />);

      expect(screen.getByLabelText("Digit 1 of 4")).toBeInTheDocument();
      expect(screen.getByLabelText("Digit 2 of 4")).toBeInTheDocument();
      expect(screen.getByLabelText("Digit 3 of 4")).toBeInTheDocument();
      expect(screen.getByLabelText("Digit 4 of 4")).toBeInTheDocument();
    });

    it('should use inputMode="numeric" for mobile keyboards', () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs.forEach((input) => {
        expect(input).toHaveAttribute("inputMode", "numeric");
      });
    });

    it("should have maxLength of 1", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs.forEach((input) => {
        expect(input).toHaveAttribute("maxLength", "1");
      });
    });

    it("should be keyboard navigable", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs.forEach((input) => {
        expect(input).toHaveAttribute("type", "text");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle length of 1", () => {
      render(<OTPInput value="" onChange={mockOnChange} length={1} />);
      const inputs = screen.getAllByRole("textbox");

      expect(inputs).toHaveLength(1);
    });

    it("should handle very long OTP", () => {
      render(<OTPInput value="" onChange={mockOnChange} length={12} />);
      const inputs = screen.getAllByRole("textbox");

      expect(inputs).toHaveLength(12);
    });

    it("should handle rapid input", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.change(inputs[0], { target: { value: "1" } });
      fireEvent.change(inputs[0], { target: { value: "2" } });
      fireEvent.change(inputs[0], { target: { value: "3" } });

      // Should have called onChange 3 times
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });

    it("should handle value longer than length", () => {
      render(<OTPInput value="12345678" onChange={mockOnChange} length={6} />);
      const inputs = screen.getAllByRole("textbox");

      // Should only display first 6 digits
      expect(inputs[0]).toHaveValue("1");
      expect(inputs[5]).toHaveValue("6");
    });

    it("should trim final value", () => {
      render(<OTPInput value="   " onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      fireEvent.change(inputs[0], { target: { value: "1" } });

      expect(mockOnChange).toHaveBeenCalledWith("1");
    });

    it("should handle changing length prop", () => {
      const { rerender } = render(
        <OTPInput value="123" onChange={mockOnChange} length={6} />
      );

      rerender(<OTPInput value="123" onChange={mockOnChange} length={4} />);

      const inputs = screen.getAllByRole("textbox");
      expect(inputs).toHaveLength(4);
    });
  });

  describe("Input Focus Management", () => {
    it("should maintain focus order when typing sequentially", () => {
      render(<OTPInput value="" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs[0].focus();
      fireEvent.change(inputs[0], { target: { value: "1" } });
      expect(inputs[1]).toHaveFocus();

      fireEvent.change(inputs[1], { target: { value: "2" } });
      expect(inputs[2]).toHaveFocus();

      fireEvent.change(inputs[2], { target: { value: "3" } });
      expect(inputs[3]).toHaveFocus();
    });

    it("should handle clicking on different input", () => {
      render(<OTPInput value="123" onChange={mockOnChange} />);
      const inputs = screen.getAllByRole("textbox");

      inputs[4].focus();
      fireEvent.change(inputs[4], { target: { value: "5" } });

      expect(mockOnChange).toHaveBeenCalled();
      expect(inputs[5]).toHaveFocus();
    });
  });
});

// BUG FIX #41: OTPInput Component Issues
// ISSUE 1: No validation for length prop - negative or 0 length crashes component
// ISSUE 2: paddedValue uses space character which can cause issues with trim()
// ISSUE 3: handleChange doesn't prevent default, could cause issues in forms
// ISSUE 4: No maxLength validation - length could change mid-input
// ISSUE 5: Paste doesn't prevent default before checking if paste has digits
// ISSUE 6: inputRefs array can grow unbounded if length prop changes
// ISSUE 7: No ARIA role or aria-required for the OTP group
// ISSUE 8: No way to clear all inputs programmatically
// ISSUE 9: Auto-focus only first input, no way to auto-focus specific position
// ISSUE 10: handleInputChange takes last character but doesn't handle multi-char paste in input
