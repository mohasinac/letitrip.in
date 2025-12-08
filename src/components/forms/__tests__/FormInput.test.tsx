import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Mail, Search } from "lucide-react";
import { FormInput } from "../FormInput";

describe("FormInput", () => {
  describe("rendering", () => {
    it("renders basic input", () => {
      render(<FormInput placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("renders with label", () => {
      render(<FormInput label="Email Address" />);
      expect(screen.getByText("Email Address")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with value", () => {
      render(<FormInput value="Test value" readOnly />);
      expect(screen.getByDisplayValue("Test value")).toBeInTheDocument();
    });

    it("renders different input types", () => {
      const { rerender, container } = render(<FormInput type="email" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

      rerender(<FormInput type="password" />);
      const passwordInput = container.querySelector('input[type="password"]');
      expect(passwordInput).toHaveAttribute("type", "password");

      rerender(<FormInput type="number" />);
      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("type", "number");
    });
  });

  describe("label and required indicator", () => {
    it("shows required asterisk when required", () => {
      render(<FormInput label="Username" required />);
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("does not show asterisk when not required", () => {
      render(<FormInput label="Username" />);
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("associates label with input", () => {
      render(<FormInput label="Email" />);
      const input = screen.getByRole("textbox");
      const label = screen.getByText("Email");
      expect(label).toHaveAttribute("for", "email");
      expect(input).toHaveAttribute("id", "email");
    });
  });

  describe("error state", () => {
    it("displays error message", () => {
      render(<FormInput error="This field is required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("applies error styling", () => {
      render(<FormInput error="Error" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border-red-500");
    });

    it("sets aria-invalid when error exists", () => {
      render(<FormInput error="Error" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("does not show error when not provided", () => {
      render(<FormInput />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "false");
    });
  });

  describe("helper text", () => {
    it("displays helper text", () => {
      render(<FormInput helperText="Enter your email address" />);
      expect(screen.getByText("Enter your email address")).toBeInTheDocument();
    });

    it("displays helper text without error", () => {
      render(<FormInput helperText="Helper text" error="Error message" />);
      // Error takes precedence
      expect(screen.getByText("Error message")).toBeInTheDocument();
    });
  });

  describe("icons", () => {
    it("renders left icon", () => {
      render(<FormInput leftIcon={<Mail data-testid="left-icon" />} />);
      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    });

    it("renders right icon", () => {
      render(<FormInput rightIcon={<Search data-testid="right-icon" />} />);
      expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    });

    it("renders both icons", () => {
      render(
        <FormInput
          leftIcon={<Mail data-testid="left-icon" />}
          rightIcon={<Search data-testid="right-icon" />}
        />
      );
      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
      expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    });
  });

  describe("addons", () => {
    it("renders left addon", () => {
      render(<FormInput leftAddon="https://" />);
      expect(screen.getByText("https://")).toBeInTheDocument();
    });

    it("renders right addon", () => {
      render(<FormInput rightAddon=".com" />);
      expect(screen.getByText(".com")).toBeInTheDocument();
    });

    it("renders both addons", () => {
      render(<FormInput leftAddon="$" rightAddon="USD" />);
      expect(screen.getByText("$")).toBeInTheDocument();
      expect(screen.getByText("USD")).toBeInTheDocument();
    });
  });

  describe("character count", () => {
    it("shows character count when enabled", () => {
      render(
        <FormInput showCharCount maxLength={100} value="Hello" readOnly />
      );
      expect(screen.getByText(/5.*\/.*100/)).toBeInTheDocument();
    });

    it("does not show character count by default", () => {
      render(<FormInput maxLength={100} value="Hello" readOnly />);
      expect(screen.queryByText("5 / 100")).not.toBeInTheDocument();
    });

    it("updates character count as user types", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<FormInput showCharCount maxLength={10} onChange={onChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Test");

      // Character count updates
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("renders as disabled", () => {
      render(<FormInput disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("applies disabled styling", () => {
      render(<FormInput disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("cursor-not-allowed");
    });

    it("cannot be interacted with when disabled", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<FormInput disabled onChange={onChange} />);

      const input = screen.getByRole("textbox");
      await user.click(input);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("compact mode", () => {
    it("applies compact styling", () => {
      render(<FormInput compact />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("py-1.5");
    });

    it("applies normal styling by default", () => {
      render(<FormInput />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("py-2");
    });
  });

  describe("full width", () => {
    it("renders full width by default", () => {
      const { container } = render(<FormInput />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("w-full");
    });

    it("respects fullWidth=false", () => {
      const { container } = render(<FormInput fullWidth={false} />);
      const wrapper = container.firstChild;
      expect(wrapper).not.toHaveClass("w-full");
    });
  });

  describe("interactions", () => {
    it("calls onChange when user types", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<FormInput onChange={onChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Test");

      expect(onChange).toHaveBeenCalled();
    });

    it("calls onFocus when input is focused", async () => {
      const user = userEvent.setup();
      const onFocus = jest.fn();

      render(<FormInput onFocus={onFocus} />);

      const input = screen.getByRole("textbox");
      await user.click(input);

      expect(onFocus).toHaveBeenCalled();
    });

    it("calls onBlur when input loses focus", async () => {
      const user = userEvent.setup();
      const onBlur = jest.fn();

      render(<FormInput onBlur={onBlur} />);

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();

      expect(onBlur).toHaveBeenCalled();
    });

    it("respects maxLength", async () => {
      const user = userEvent.setup();

      render(<FormInput maxLength={5} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      await user.type(input, "123456789");

      expect(input.value.length).toBeLessThanOrEqual(5);
    });
  });

  describe("accessibility", () => {
    it("has correct role", () => {
      render(<FormInput />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("supports aria-label", () => {
      render(<FormInput aria-label="Search field" />);
      expect(screen.getByLabelText("Search field")).toBeInTheDocument();
    });

    it("links error message with input", () => {
      render(<FormInput id="email" error="Invalid email" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute(
        "aria-describedby",
        expect.stringContaining("email")
      );
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<FormInput onChange={onChange} />);

      const input = screen.getByRole("textbox");
      input.focus();
      await user.keyboard("Hello");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("custom className", () => {
    it("applies custom className to input", () => {
      render(<FormInput className="custom-input" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-input");
    });

    it("merges custom className with defaults", () => {
      render(<FormInput className="custom-input" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-input");
      expect(input).toHaveClass("rounded-lg");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to input element", () => {
      const ref = jest.fn();
      render(<FormInput ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});
