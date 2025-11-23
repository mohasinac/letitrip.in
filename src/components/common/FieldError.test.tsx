import React from "react";
import { render, screen } from "@testing-library/react";
import { FieldError, InputWrapper } from "./FieldError";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  AlertCircle: ({ className }: any) => (
    <svg data-testid="alert-icon" className={className} />
  ),
}));

describe("FieldError", () => {
  describe("Rendering", () => {
    it("renders error message when error provided", () => {
      render(<FieldError error="This field is required" />);

      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("renders alert icon with error", () => {
      render(<FieldError error="Error message" />);

      expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
    });

    it("does not render when no error", () => {
      const { container } = render(<FieldError />);

      expect(container.firstChild).toBeNull();
    });

    it("does not render when error is empty string", () => {
      const { container } = render(<FieldError error="" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Styling", () => {
    it("applies error text color", () => {
      render(<FieldError error="Error" />);

      const errorDiv = screen.getByText("Error").parentElement;
      expect(errorDiv).toHaveClass("text-red-600");
    });

    it("applies text size", () => {
      render(<FieldError error="Error" />);

      const errorDiv = screen.getByText("Error").parentElement;
      expect(errorDiv).toHaveClass("text-sm");
    });

    it("applies flex layout with gap", () => {
      render(<FieldError error="Error" />);

      const errorDiv = screen.getByText("Error").parentElement;
      expect(errorDiv).toHaveClass("flex", "items-center", "gap-1");
    });

    it("applies margin top", () => {
      render(<FieldError error="Error" />);

      const errorDiv = screen.getByText("Error").parentElement;
      expect(errorDiv).toHaveClass("mt-1");
    });
  });

  describe("Icon", () => {
    it("renders icon with correct size", () => {
      render(<FieldError error="Error" />);

      const icon = screen.getByTestId("alert-icon");
      expect(icon).toHaveClass("h-4", "w-4");
    });

    it("renders icon with flex-shrink-0", () => {
      render(<FieldError error="Error" />);

      const icon = screen.getByTestId("alert-icon");
      expect(icon).toHaveClass("flex-shrink-0");
    });
  });

  describe("Edge Cases", () => {
    it("handles very long error messages", () => {
      const longError = "A".repeat(500);
      render(<FieldError error={longError} />);

      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it("handles error with special characters", () => {
      render(<FieldError error="Error: Invalid <input> & 'quotes'" />);

      expect(
        screen.getByText("Error: Invalid <input> & 'quotes'")
      ).toBeInTheDocument();
    });

    it("handles multiline error messages", () => {
      render(<FieldError error="Line 1\nLine 2" />);

      // The component renders the text as-is (with literal \n)
      expect(
        screen.getByText((content) => content.includes("Line 1"))
      ).toBeInTheDocument();
    });
  });
});

describe("InputWrapper", () => {
  describe("Label Rendering", () => {
    it("renders label text", () => {
      render(
        <InputWrapper label="Email">
          <input type="text" />
        </InputWrapper>
      );

      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("shows required asterisk when required is true", () => {
      render(
        <InputWrapper label="Email" required={true}>
          <input type="text" />
        </InputWrapper>
      );

      const asterisk = screen.getByText("*");
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass("text-red-500");
    });

    it("does not show asterisk when required is false", () => {
      render(
        <InputWrapper label="Email" required={false}>
          <input type="text" />
        </InputWrapper>
      );

      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("applies label styling", () => {
      render(
        <InputWrapper label="Email">
          <input type="text" />
        </InputWrapper>
      );

      const label = screen.getByText("Email").closest("label");
      expect(label).toHaveClass(
        "block",
        "text-sm",
        "font-medium",
        "text-gray-700",
        "mb-1"
      );
    });
  });

  describe("Children Rendering", () => {
    it("renders child input element", () => {
      render(
        <InputWrapper label="Email">
          <input type="text" placeholder="Enter email" />
        </InputWrapper>
      );

      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    });

    it("renders multiple children", () => {
      render(
        <InputWrapper label="Name">
          <input type="text" placeholder="First name" />
          <input type="text" placeholder="Last name" />
        </InputWrapper>
      );

      expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Last name")).toBeInTheDocument();
    });

    it("renders complex child components", () => {
      render(
        <InputWrapper label="Custom">
          <div data-testid="custom-component">Complex input</div>
        </InputWrapper>
      );

      expect(screen.getByTestId("custom-component")).toBeInTheDocument();
    });
  });

  describe("Error Display", () => {
    it("shows error when provided", () => {
      render(
        <InputWrapper label="Email" error="Invalid email">
          <input type="text" />
        </InputWrapper>
      );

      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });

    it("does not show error when not provided", () => {
      render(
        <InputWrapper label="Email">
          <input type="text" />
        </InputWrapper>
      );

      expect(screen.queryByTestId("alert-icon")).not.toBeInTheDocument();
    });

    it("renders error with FieldError component", () => {
      render(
        <InputWrapper label="Email" error="Required field">
          <input type="text" />
        </InputWrapper>
      );

      expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
    });
  });

  describe("Hint Display", () => {
    it("shows hint when provided and no error", () => {
      render(
        <InputWrapper label="Email" hint="We'll never share your email">
          <input type="text" />
        </InputWrapper>
      );

      expect(
        screen.getByText("We'll never share your email")
      ).toBeInTheDocument();
    });

    it("does not show hint when error is present", () => {
      render(
        <InputWrapper
          label="Email"
          error="Invalid"
          hint="We'll never share your email"
        >
          <input type="text" />
        </InputWrapper>
      );

      expect(
        screen.queryByText("We'll never share your email")
      ).not.toBeInTheDocument();
      expect(screen.getByText("Invalid")).toBeInTheDocument();
    });

    it("applies hint styling", () => {
      render(
        <InputWrapper label="Email" hint="Helper text">
          <input type="text" />
        </InputWrapper>
      );

      const hint = screen.getByText("Helper text");
      expect(hint).toHaveClass("mt-1", "text-xs", "text-gray-500");
    });

    it("does not show hint when not provided", () => {
      const { container } = render(
        <InputWrapper label="Email">
          <input type="text" />
        </InputWrapper>
      );

      const hints = container.querySelectorAll("p");
      expect(hints.length).toBe(0);
    });
  });

  describe("Combined Props", () => {
    it("renders with all props provided", () => {
      render(
        <InputWrapper
          label="Password"
          required={true}
          hint="Must be 8 characters"
        >
          <input type="password" />
        </InputWrapper>
      );

      expect(screen.getByText("Password")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByText("Must be 8 characters")).toBeInTheDocument();
    });

    it("prioritizes error over hint", () => {
      render(
        <InputWrapper
          label="Email"
          error="Invalid email"
          hint="Enter your email"
        >
          <input type="text" />
        </InputWrapper>
      );

      expect(screen.getByText("Invalid email")).toBeInTheDocument();
      expect(screen.queryByText("Enter your email")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty label", () => {
      render(
        <InputWrapper label="">
          <input type="text" />
        </InputWrapper>
      );

      const label = screen
        .getByRole("textbox")
        .closest("div")
        ?.querySelector("label");
      expect(label).toBeInTheDocument();
    });

    it("handles very long labels", () => {
      const longLabel = "A".repeat(200);
      render(
        <InputWrapper label={longLabel}>
          <input type="text" />
        </InputWrapper>
      );

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("handles special characters in label", () => {
      render(
        <InputWrapper label="Email & Password">
          <input type="text" />
        </InputWrapper>
      );

      expect(screen.getByText("Email & Password")).toBeInTheDocument();
    });
  });
});
