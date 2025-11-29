import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input, InputProps } from "./Input";

describe("Input", () => {
  describe("Basic Rendering", () => {
    it("renders input element", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("renders with label", () => {
      render(<Input label="Email" />);

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders without label", () => {
      render(<Input placeholder="Enter text" />);

      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
      expect(screen.queryByRole("label")).not.toBeInTheDocument();
    });

    it("renders with placeholder", () => {
      render(<Input placeholder="Enter email" />);

      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    });

    it("renders with default value", () => {
      render(<Input defaultValue="test@example.com" />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("test@example.com");
    });
  });

  describe("Label", () => {
    it("associates label with input using htmlFor", () => {
      render(<Input label="Username" />);

      const label = screen.getByText("Username");
      const input = screen.getByRole("textbox");
      expect(label).toHaveAttribute("for", "username");
      expect(input).toHaveAttribute("id", "username");
    });

    it("shows required asterisk when required", () => {
      render(<Input label="Email" required />);

      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByLabelText(/required/i)).toBeInTheDocument();
    });

    it("does not show asterisk when not required", () => {
      render(<Input label="Email" />);

      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("uses custom id when provided", () => {
      render(<Input label="Email" id="custom-email-id" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "custom-email-id");
    });

    it("generates id from label", () => {
      render(<Input label="Full Name" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "full-name");
    });
  });

  describe("Icons", () => {
    it("renders left icon", () => {
      render(<Input leftIcon={<span data-testid="left-icon">🔍</span>} />);

      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    });

    it("renders right icon", () => {
      render(<Input rightIcon={<span data-testid="right-icon">✓</span>} />);

      expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    });

    it("renders both icons", () => {
      render(
        <Input
          leftIcon={<span data-testid="left-icon">🔍</span>}
          rightIcon={<span data-testid="right-icon">✓</span>}
        />,
      );

      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
      expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    });

    it("applies left padding when left icon present", () => {
      render(<Input leftIcon={<span>🔍</span>} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("pl-10");
    });

    it("applies right padding when right icon present", () => {
      render(<Input rightIcon={<span>✓</span>} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("pr-10");
    });

    it("sets aria-hidden on icons", () => {
      const { container } = render(
        <Input leftIcon={<span>🔍</span>} rightIcon={<span>✓</span>} />,
      );

      const iconContainers = container.querySelectorAll('[aria-hidden="true"]');
      expect(iconContainers.length).toBe(2);
    });
  });

  describe("Error State", () => {
    it("renders error message", () => {
      render(<Input label="Email" error="Invalid email" />);

      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });

    it("applies error border color", () => {
      render(<Input error="Invalid" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border-red-500");
    });

    it("sets aria-invalid when error present", () => {
      render(<Input error="Invalid" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("associates error with input using aria-describedby", () => {
      render(<Input label="Email" error="Invalid email" />);

      const input = screen.getByRole("textbox");
      const errorId = `${input.id}-error`;
      expect(input).toHaveAttribute("aria-describedby", errorId);
    });

    it("error has role alert", () => {
      render(<Input error="Invalid" />);

      const error = screen.getByRole("alert");
      expect(error).toHaveTextContent("Invalid");
    });

    it("does not show helper text when error present", () => {
      render(<Input error="Invalid" helperText="Helper text" />);

      expect(screen.getByText("Invalid")).toBeInTheDocument();
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
    });
  });

  describe("Helper Text", () => {
    it("renders helper text", () => {
      render(<Input helperText="Enter your email address" />);

      expect(screen.getByText("Enter your email address")).toBeInTheDocument();
    });

    it("does not render when not provided", () => {
      const { container } = render(<Input />);

      const helperText = container.querySelector(".form-hint-accessible");
      expect(helperText).not.toBeInTheDocument();
    });

    it("associates helper text with input", () => {
      render(<Input label="Email" helperText="We'll never share your email" />);

      const input = screen.getByRole("textbox");
      const helperId = `${input.id}-helper`;
      expect(input).toHaveAttribute("aria-describedby", helperId);
    });
  });

  describe("Width", () => {
    it("renders full width by default", () => {
      const { container } = render(<Input />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("w-full");
    });

    it("does not apply full width when fullWidth is false", () => {
      const { container } = render(<Input fullWidth={false} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).not.toHaveClass("w-full");
    });
  });

  describe("Disabled State", () => {
    it("disables input when disabled prop is true", () => {
      render(<Input disabled />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("applies disabled styles", () => {
      render(<Input disabled />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass(
        "disabled:bg-gray-100",
        "disabled:cursor-not-allowed",
      );
    });
  });

  describe("Input Types", () => {
    it("renders as text input by default", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      // Type defaults to text but may not be explicitly set in HTML
    });

    it("renders as password input", () => {
      render(<Input type="password" />);

      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it("renders as email input", () => {
      render(<Input type="email" />);

      const input = document.querySelector('input[type="email"]');
      expect(input).toBeInTheDocument();
    });

    it("renders as number input", () => {
      render(<Input type="number" />);

      const input = screen.getByRole("spinbutton");
      expect(input).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    it("handles onChange event", () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "test" } });

      expect(handleChange).toHaveBeenCalled();
    });

    it("updates value on input", () => {
      render(<Input />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "new value" } });

      expect(input.value).toBe("new value");
    });

    it("handles onFocus event", () => {
      const handleFocus = jest.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole("textbox");
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it("handles onBlur event", () => {
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole("textbox");
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe("Ref Forwarding", () => {
    it("forwards ref to input element", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe("INPUT");
    });

    it("can focus input via ref", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe("Custom Props", () => {
    it("applies custom className", () => {
      render(<Input className="custom-class" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class");
    });

    it("passes through HTML input attributes", () => {
      render(
        <Input
          name="email"
          maxLength={50}
          pattern="[a-z]+"
          autoComplete="email"
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("name", "email");
      expect(input).toHaveAttribute("maxLength", "50");
      expect(input).toHaveAttribute("pattern", "[a-z]+");
      expect(input).toHaveAttribute("autoComplete", "email");
    });

    it("sets aria-required when required", () => {
      render(<Input required />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-required", "true");
    });
  });

  describe("Accessibility", () => {
    it("has accessible label classes", () => {
      render(<Input label="Email" />);

      const label = screen.getByText("Email");
      expect(label).toHaveClass("form-label-accessible");
    });

    it("has accessible input classes", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("form-input-accessible");
    });

    it("has accessible error classes", () => {
      render(<Input error="Invalid" />);

      const error = screen.getByRole("alert");
      expect(error).toHaveClass("form-error-accessible");
    });

    it("has accessible helper text classes", () => {
      render(<Input helperText="Helper" />);

      const helper = screen.getByText("Helper");
      expect(helper).toHaveClass("form-hint-accessible");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty label", () => {
      render(<Input label="" />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("handles very long error messages", () => {
      const longError = "A".repeat(500);
      render(<Input error={longError} />);

      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it("handles special characters in label", () => {
      render(<Input label="Email & Username" />);

      expect(screen.getByText("Email & Username")).toBeInTheDocument();
    });

    it("handles label with spaces", () => {
      render(<Input label="Full Name Address" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "full-name-address");
    });
  });
});
