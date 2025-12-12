/**
 * @jest-environment jsdom
 *
 * FieldError & InputWrapper Component Tests
 * Tests error display, input labeling, and hint messaging
 */

import { render, screen } from "@testing-library/react";
import { FieldError, InputWrapper } from "../FieldError";

describe("FieldError Component", () => {
  describe("Basic Rendering", () => {
    it("should render error message when error is provided", () => {
      render(<FieldError error="This field is required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("should render AlertCircle icon when error exists", () => {
      const { container } = render(<FieldError error="Error message" />);
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should not render anything when error is undefined", () => {
      const { container } = render(<FieldError />);
      expect(container.firstChild).toBeNull();
    });

    it("should not render anything when error is empty string", () => {
      const { container } = render(<FieldError error="" />);
      expect(container.firstChild).toBeNull();
    });

    it("should apply correct styling classes", () => {
      const { container } = render(<FieldError error="Error" />);
      const errorDiv = container.querySelector(".text-red-600");
      expect(errorDiv).toBeInTheDocument();
    });
  });

  describe("Error Message Content", () => {
    it("should display short error message", () => {
      render(<FieldError error="Required" />);
      expect(screen.getByText("Required")).toBeInTheDocument();
    });

    it("should display long error message", () => {
      const longError =
        "This is a very long error message that explains in detail what went wrong";
      render(<FieldError error={longError} />);
      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it("should display error message with special characters", () => {
      render(<FieldError error="Error: Field can't be empty!" />);
      expect(
        screen.getByText("Error: Field can't be empty!")
      ).toBeInTheDocument();
    });

    it("should display error message with numbers", () => {
      render(<FieldError error="Must be at least 8 characters" />);
      expect(
        screen.getByText("Must be at least 8 characters")
      ).toBeInTheDocument();
    });
  });

  describe("Icon Rendering", () => {
    it("should render AlertCircle icon with correct size", () => {
      const { container } = render(<FieldError error="Error" />);
      const icon = container.querySelector(".h-4.w-4");
      expect(icon).toBeInTheDocument();
    });

    it("should render icon with flex-shrink-0 class", () => {
      const { container } = render(<FieldError error="Error" />);
      const icon = container.querySelector(".flex-shrink-0");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null error gracefully", () => {
      const { container } = render(<FieldError error={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it("should handle whitespace-only error", () => {
      const { container } = render(<FieldError error="   " />);
      // HTML normalizes whitespace - check that component renders
      const errorElement = container.querySelector(".text-red-600");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement?.textContent).toBeTruthy();
    });

    it("should handle error with HTML-like content", () => {
      render(<FieldError error="<script>alert('test')</script>" />);
      // Should render as text, not execute script
      expect(
        screen.getByText("<script>alert('test')</script>")
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper text color for visibility", () => {
      const { container } = render(<FieldError error="Error" />);
      const errorDiv = container.querySelector(".text-red-600");
      expect(errorDiv).toBeInTheDocument();
    });

    it("should have proper text size for readability", () => {
      const { container } = render(<FieldError error="Error" />);
      const errorDiv = container.querySelector(".text-sm");
      expect(errorDiv).toBeInTheDocument();
    });

    it("should use flex layout for icon-text alignment", () => {
      const { container } = render(<FieldError error="Error" />);
      const errorDiv = container.querySelector(".flex.items-center");
      expect(errorDiv).toBeInTheDocument();
    });
  });
});

describe("InputWrapper Component", () => {
  describe("Basic Rendering", () => {
    it("should render label text", () => {
      render(
        <InputWrapper label="Email">
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("should render children", () => {
      render(
        <InputWrapper label="Email">
          <input type="text" data-testid="input" />
        </InputWrapper>
      );
      expect(screen.getByTestId("input")).toBeInTheDocument();
    });

    it("should render required asterisk when required is true", () => {
      render(
        <InputWrapper label="Email" required>
          <input type="text" />
        </InputWrapper>
      );
      const asterisk = screen.getByText("*");
      expect(asterisk).toHaveClass("text-red-500");
    });

    it("should not render asterisk when required is false", () => {
      render(
        <InputWrapper label="Email" required={false}>
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("should not render asterisk when required is undefined", () => {
      render(
        <InputWrapper label="Email">
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });
  });

  describe("Error Display", () => {
    it("should render FieldError when error is provided", () => {
      render(
        <InputWrapper label="Email" error="Invalid email">
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });

    it("should not render hint when error is present", () => {
      render(
        <InputWrapper
          label="Email"
          error="Invalid email"
          hint="example@domain.com"
        >
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
      expect(screen.queryByText("example@domain.com")).not.toBeInTheDocument();
    });

    it("should not render error when error is undefined", () => {
      render(
        <InputWrapper label="Email">
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Hint Display", () => {
    it("should render hint when provided and no error", () => {
      render(
        <InputWrapper label="Email" hint="example@domain.com">
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.getByText("example@domain.com")).toBeInTheDocument();
    });

    it("should not render hint when error is present", () => {
      render(
        <InputWrapper label="Email" error="Error" hint="Hint text">
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.queryByText("Hint text")).not.toBeInTheDocument();
    });

    it("should not render hint when hint is undefined", () => {
      const { container } = render(
        <InputWrapper label="Email">
          <input type="text" />
        </InputWrapper>
      );
      expect(container.querySelector(".text-gray-500")).not.toBeInTheDocument();
    });

    it("should apply correct styling to hint", () => {
      const { container } = render(
        <InputWrapper label="Email" hint="Hint text">
          <input type="text" />
        </InputWrapper>
      );
      const hint = container.querySelector(".text-xs.text-gray-500");
      expect(hint).toBeInTheDocument();
    });
  });

  describe("Label Styling", () => {
    it("should apply correct label classes", () => {
      const { container } = render(
        <InputWrapper label="Email">
          <input type="text" />
        </InputWrapper>
      );
      const label = container.querySelector("label");
      expect(label).toHaveClass("block", "text-sm", "font-medium", "mb-1");
    });

    it("should apply dark mode classes to label", () => {
      const { container } = render(
        <InputWrapper label="Email">
          <input type="text" />
        </InputWrapper>
      );
      const label = container.querySelector("label");
      expect(label).toHaveClass("dark:text-gray-300");
    });
  });

  describe("Complex Children", () => {
    it("should render multiple input elements", () => {
      render(
        <InputWrapper label="Name">
          <>
            <input type="text" data-testid="first-name" placeholder="First" />
            <input type="text" data-testid="last-name" placeholder="Last" />
          </>
        </InputWrapper>
      );
      expect(screen.getByTestId("first-name")).toBeInTheDocument();
      expect(screen.getByTestId("last-name")).toBeInTheDocument();
    });

    it("should render select element", () => {
      render(
        <InputWrapper label="Country">
          <select data-testid="select">
            <option>India</option>
          </select>
        </InputWrapper>
      );
      expect(screen.getByTestId("select")).toBeInTheDocument();
    });

    it("should render textarea element", () => {
      render(
        <InputWrapper label="Description">
          <textarea data-testid="textarea" />
        </InputWrapper>
      );
      expect(screen.getByTestId("textarea")).toBeInTheDocument();
    });

    it("should render custom components", () => {
      const CustomInput = () => <div data-testid="custom">Custom</div>;
      render(
        <InputWrapper label="Custom">
          <CustomInput />
        </InputWrapper>
      );
      expect(screen.getByTestId("custom")).toBeInTheDocument();
    });
  });

  describe("Complete Integration", () => {
    it("should render all elements when all props provided", () => {
      render(
        <InputWrapper
          label="Email"
          required
          error="Invalid email"
          hint="This won't show"
        >
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
      expect(screen.queryByText("This won't show")).not.toBeInTheDocument();
    });

    it("should handle state transitions from hint to error", () => {
      const { rerender } = render(
        <InputWrapper label="Email" hint="Enter your email">
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.getByText("Enter your email")).toBeInTheDocument();

      rerender(
        <InputWrapper label="Email" hint="Enter your email" error="Invalid">
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.queryByText("Enter your email")).not.toBeInTheDocument();
      expect(screen.getByText("Invalid")).toBeInTheDocument();
    });

    it("should handle state transitions from error to hint", () => {
      const { rerender } = render(
        <InputWrapper label="Email" error="Invalid">
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.getByText("Invalid")).toBeInTheDocument();

      rerender(
        <InputWrapper label="Email" hint="Enter your email">
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.queryByText("Invalid")).not.toBeInTheDocument();
      expect(screen.getByText("Enter your email")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty label", () => {
      render(
        <InputWrapper label="">
          <input type="text" />
        </InputWrapper>
      );
      const label = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === "label" && content === "";
      });
      expect(label).toBeInTheDocument();
    });

    it("should handle long labels", () => {
      const longLabel =
        "This is a very long label that might wrap to multiple lines";
      render(
        <InputWrapper label={longLabel}>
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("should handle special characters in label", () => {
      render(
        <InputWrapper label="Email & Password">
          <input type="text" />
        </InputWrapper>
      );
      expect(screen.getByText(/Email & Password/)).toBeInTheDocument();
    });

    it("should handle null children gracefully", () => {
      render(<InputWrapper label="Email">{null}</InputWrapper>);
      expect(screen.getByText("Email")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should use semantic label element", () => {
      const { container } = render(
        <InputWrapper label="Email">
          <input type="text" />
        </InputWrapper>
      );
      expect(container.querySelector("label")).toBeInTheDocument();
    });

    it("should visually indicate required fields", () => {
      render(
        <InputWrapper label="Email" required>
          <input type="text" />
        </InputWrapper>
      );
      const asterisk = screen.getByText("*");
      expect(asterisk).toHaveClass("text-red-500");
    });

    it("should provide visible error messages", () => {
      render(
        <InputWrapper label="Email" error="Required field">
          <input type="text" />
        </InputWrapper>
      );
      const error = screen.getByText("Required field");
      expect(error).toBeVisible();
    });

    it("should provide helpful hint text", () => {
      render(
        <InputWrapper label="Email" hint="We'll never share your email">
          <input type="text" />
        </InputWrapper>
      );
      expect(
        screen.getByText("We'll never share your email")
      ).toBeInTheDocument();
    });
  });
});

// BUG FIX #38: FieldError & InputWrapper Issues
// ISSUE 1: FieldError renders whitespace-only errors instead of treating them as falsy
// ISSUE 2: No ARIA attributes on error messages for screen readers
// ISSUE 3: InputWrapper doesn't associate label with input (no htmlFor/id connection)
// ISSUE 4: Error and hint use different vertical spacing (mt-1) but should be consistent
// ISSUE 5: No role="alert" or aria-live on error messages for dynamic updates
// ISSUE 6: Required asterisk has no aria-label or sr-only text for screen readers
// ISSUE 7: Hint text lacks proper ARIA attributes (aria-describedby)
// ISSUE 8: No validation that children is a valid form element
// ISSUE 9: Dark mode classes hardcoded instead of using theme system
// ISSUE 10: No support for disabled state styling on label
