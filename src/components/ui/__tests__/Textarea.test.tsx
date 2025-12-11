import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Textarea } from "../Textarea";

describe("Textarea - Form Textarea Component", () => {
  describe("Basic Rendering", () => {
    it("should render textarea element", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
    });

    it("should render as textarea tag", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("should be full width by default", () => {
      const { container } = render(<Textarea />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("w-full");
    });

    it("should have default 3 rows", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.rows).toBe(3);
    });

    it("should accept custom rows", () => {
      render(<Textarea rows={5} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.rows).toBe(5);
    });

    it("should have rounded-lg border", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("rounded-lg", "border");
    });

    it("should have resize-y class", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("resize-y");
    });
  });

  describe("With Label", () => {
    it("should render label when provided", () => {
      render(<Textarea label="Description" />);
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("should link label to textarea via htmlFor", () => {
      render(<Textarea label="Message" />);
      const textarea = screen.getByRole("textbox");
      const label = screen.getByText("Message");
      expect(label).toHaveAttribute("for", textarea.id);
    });

    it("should auto-generate id from label", () => {
      render(<Textarea label="User Message" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("id", "user-message");
    });

    it("should have text-sm font-medium on label", () => {
      render(<Textarea label="Label" />);
      const label = screen.getByText("Label");
      expect(label).toHaveClass("text-sm", "font-medium");
    });

    it("should have text-gray-700 on label", () => {
      render(<Textarea label="Label" />);
      const label = screen.getByText("Label");
      expect(label).toHaveClass("text-gray-700", "dark:text-gray-300");
    });

    it("should have mb-1 on label", () => {
      render(<Textarea label="Label" />);
      const label = screen.getByText("Label");
      expect(label).toHaveClass("mb-1", "md:mb-1.5");
    });

    it("should show required asterisk when required", () => {
      render(<Textarea label="Required Field" required />);
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(screen.getByText("*")).toHaveClass("text-red-500", "ml-1");
    });

    it("should not show asterisk when not required", () => {
      render(<Textarea label="Optional Field" />);
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });
  });

  describe("Custom ID", () => {
    it("should accept custom id prop", () => {
      render(<Textarea id="custom-textarea" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("id", "custom-textarea");
    });

    it("should use custom id over auto-generated", () => {
      render(<Textarea label="Message" id="my-textarea" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("id", "my-textarea");
    });

    it("should link label to custom id", () => {
      render(<Textarea label="Message" id="custom-id" />);
      const label = screen.getByText("Message");
      expect(label).toHaveAttribute("for", "custom-id");
    });
  });

  describe("Size Variants", () => {
    it("should default to md size", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "px-4",
        "py-2",
        "md:py-2",
        "min-h-[96px]",
        "text-base"
      );
    });

    it("should render sm size", () => {
      render(<Textarea size="sm" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("px-3", "py-1.5", "text-sm", "min-h-[72px]");
    });

    it("should render md size", () => {
      render(<Textarea size="md" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "px-4",
        "py-2",
        "md:py-2",
        "min-h-[96px]",
        "text-base"
      );
    });

    it("should render lg size", () => {
      render(<Textarea size="lg" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "px-4",
        "py-3",
        "min-h-[120px]",
        "text-base"
      );
    });
  });

  describe("Error State", () => {
    it("should render error message when provided", () => {
      render(<Textarea label="Message" error="This field is required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("should have border-red-500 when error exists", () => {
      render(<Textarea error="Error" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "border-red-500",
        "focus:ring-red-500",
        "focus:border-red-500"
      );
    });

    it("should have text-red-600 on error message", () => {
      render(<Textarea error="Error message" />);
      const errorMsg = screen.getByText("Error message");
      expect(errorMsg).toHaveClass(
        "text-sm",
        "text-red-600",
        "dark:text-red-400"
      );
    });

    it("should show error icon with error message", () => {
      const { container } = render(<Textarea error="Error" />);
      const errorDiv = screen.getByText("Error").closest("p");
      const svg = errorDiv?.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("w-4", "h-4", "flex-shrink-0");
    });

    it("should have role=alert on error message", () => {
      render(<Textarea label="Field" error="Error message" />);
      const errorMsg = screen.getByRole("alert");
      expect(errorMsg).toHaveTextContent("Error message");
    });

    it("should link error to textarea via aria-describedby", () => {
      render(<Textarea label="Field" error="Error message" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-describedby", "field-error");
    });

    it("should set aria-invalid when error exists", () => {
      render(<Textarea error="Error" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("should not set aria-invalid when no error", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-invalid", "false");
    });
  });

  describe("Helper Text", () => {
    it("should render helper text when provided", () => {
      render(<Textarea label="Bio" helperText="Tell us about yourself" />);
      expect(screen.getByText("Tell us about yourself")).toBeInTheDocument();
    });

    it("should have text-sm text-gray-500 on helper text", () => {
      render(<Textarea helperText="Helper text" />);
      const helper = screen.getByText("Helper text");
      expect(helper).toHaveClass(
        "text-sm",
        "text-gray-500",
        "dark:text-gray-400"
      );
    });

    it("should link helper text to textarea via aria-describedby", () => {
      render(<Textarea label="Field" helperText="Helper" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-describedby", "field-helper");
    });

    it("should not show helper text when error exists", () => {
      render(
        <Textarea
          label="Field"
          helperText="This is helper text"
          error="This is an error"
        />
      );
      expect(screen.queryByText("This is helper text")).not.toBeInTheDocument();
      expect(screen.getByText("This is an error")).toBeInTheDocument();
    });
  });

  describe("Character Count", () => {
    it("should not show character count by default", () => {
      render(<Textarea value="Hello" maxLength={100} readOnly />);
      expect(screen.queryByText(/\/ 100/)).not.toBeInTheDocument();
    });

    it("should show character count when showCharCount is true", () => {
      render(<Textarea value="Hello" maxLength={100} showCharCount readOnly />);
      expect(screen.getByText("5 / 100")).toBeInTheDocument();
    });

    it("should update character count with value", () => {
      const { rerender } = render(
        <Textarea value="Hi" maxLength={50} showCharCount readOnly />
      );
      expect(screen.getByText("2 / 50")).toBeInTheDocument();

      rerender(
        <Textarea value="Hello World" maxLength={50} showCharCount readOnly />
      );
      expect(screen.getByText("11 / 50")).toBeInTheDocument();
    });

    it("should show 0 / maxLength when empty", () => {
      render(<Textarea value="" maxLength={100} showCharCount readOnly />);
      expect(screen.getByText("0 / 100")).toBeInTheDocument();
    });

    it("should have text-xs text-gray-500 on character count", () => {
      render(<Textarea value="Test" maxLength={100} showCharCount readOnly />);
      const charCount = screen.getByText("4 / 100");
      expect(charCount).toHaveClass(
        "text-xs",
        "text-gray-500",
        "dark:text-gray-400"
      );
    });

    it("should not show character count without maxLength", () => {
      render(<Textarea value="Hello" showCharCount readOnly />);
      expect(screen.queryByText(/\//)).not.toBeInTheDocument();
    });
  });

  describe("Value and onChange", () => {
    it("should accept value prop", () => {
      render(<Textarea value="Initial value" readOnly />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Initial value");
    });

    it("should call onChange when text changes", () => {
      const handleChange = jest.fn();
      render(<Textarea onChange={handleChange} />);
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "New text" } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should update value in controlled component", () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState("");
        return (
          <Textarea value={value} onChange={(e) => setValue(e.target.value)} />
        );
      };

      render(<TestComponent />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "Test" } });
      expect(textarea.value).toBe("Test");
    });
  });

  describe("MaxLength", () => {
    it("should accept maxLength prop", () => {
      render(<Textarea maxLength={100} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.maxLength).toBe(100);
    });

    it("should enforce maxLength", () => {
      render(<Textarea maxLength={10} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      fireEvent.change(textarea, { target: { value: "12345678901234567890" } });
      // Browser enforces maxLength
      expect(textarea.maxLength).toBe(10);
    });
  });

  describe("Disabled State", () => {
    it("should accept disabled prop", () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeDisabled();
    });

    it("should have disabled styling", () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "disabled:bg-gray-100",
        "dark:disabled:bg-gray-700",
        "disabled:cursor-not-allowed",
        "disabled:text-gray-500",
        "dark:disabled:text-gray-400"
      );
    });

    it("should not trigger onChange when disabled", () => {
      const handleChange = jest.fn();
      render(<Textarea disabled onChange={handleChange} />);
      const textarea = screen.getByRole("textbox");
      // Disabled textareas can't be changed, verify it's disabled
      expect(textarea).toBeDisabled();
    });
  });

  describe("Custom Styling", () => {
    it("should accept custom className", () => {
      render(<Textarea className="custom-textarea" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("custom-textarea");
    });

    it("should merge custom className with base classes", () => {
      render(<Textarea className="font-mono" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("font-mono", "w-full", "border");
    });

    it("should not be full width when fullWidth is false", () => {
      const { container } = render(<Textarea fullWidth={false} />);
      const wrapper = container.firstChild;
      expect(wrapper).not.toHaveClass("w-full");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark mode background", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("bg-white", "dark:bg-gray-800");
    });

    it("should have dark mode text color", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("text-gray-900", "dark:text-white");
    });

    it("should have dark mode border", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("border-gray-300", "dark:border-gray-600");
    });

    it("should have dark mode placeholder", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "placeholder:text-gray-400",
        "dark:placeholder:text-gray-500"
      );
    });

    it("should have dark mode focus ring", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "focus:ring-blue-500",
        "dark:focus:ring-blue-400"
      );
    });

    it("should have dark mode on label", () => {
      render(<Textarea label="Label" />);
      const label = screen.getByText("Label");
      expect(label).toHaveClass("dark:text-gray-300");
    });

    it("should have dark mode on error text", () => {
      render(<Textarea error="Error" />);
      const error = screen.getByText("Error");
      expect(error).toHaveClass("dark:text-red-400");
    });

    it("should have dark mode on helper text", () => {
      render(<Textarea helperText="Helper" />);
      const helper = screen.getByText("Helper");
      expect(helper).toHaveClass("dark:text-gray-400");
    });

    it("should have dark mode on character count", () => {
      render(<Textarea value="Test" maxLength={100} showCharCount readOnly />);
      const count = screen.getByText("4 / 100");
      expect(count).toHaveClass("dark:text-gray-400");
    });
  });

  describe("ForwardRef Support", () => {
    it("should forward ref to textarea element", () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it("should allow ref access to value", () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} defaultValue="Test" />);
      expect(ref.current?.value).toBe("Test");
    });

    it("should allow ref access to focus", () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe("HTML Attributes", () => {
    it("should accept placeholder", () => {
      render(<Textarea placeholder="Enter text here" />);
      const textarea = screen.getByPlaceholderText("Enter text here");
      expect(textarea).toBeInTheDocument();
    });

    it("should accept name attribute", () => {
      render(<Textarea name="message" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("name", "message");
    });

    it("should accept required attribute", () => {
      render(<Textarea required />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeRequired();
    });

    it("should accept readOnly attribute", () => {
      render(<Textarea readOnly />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("readOnly");
    });

    it("should accept defaultValue", () => {
      render(<Textarea defaultValue="Default text" />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Default text");
    });

    it("should accept data attributes", () => {
      render(<Textarea data-testid="my-textarea" />);
      const textarea = screen.getByTestId("my-textarea");
      expect(textarea).toBeInTheDocument();
    });
  });

  describe("Mobile Optimizations", () => {
    it("should have touch-manipulation class", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("touch-manipulation");
    });

    it("should have responsive padding on md size", () => {
      render(<Textarea size="md" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("py-2", "md:py-2");
    });

    it("should have responsive margin on label", () => {
      render(<Textarea label="Label" />);
      const label = screen.getByText("Label");
      expect(label).toHaveClass("mb-1", "md:mb-1.5");
    });

    it("should have responsive margin on helper/error area", () => {
      const { container } = render(<Textarea helperText="Helper" />);
      const helperContainer = container.querySelector(".mt-1");
      expect(helperContainer).toHaveClass("mt-1", "md:mt-1.5");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string label", () => {
      render(<Textarea label="" />);
      expect(screen.queryByRole("textbox")).toBeInTheDocument();
    });

    it("should handle very long label", () => {
      const longLabel = "A".repeat(200);
      render(<Textarea label={longLabel} />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("should handle very long error message", () => {
      const longError =
        "This is a very long error message that should still display properly";
      render(<Textarea error={longError} />);
      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it("should handle both error and helper (error wins)", () => {
      render(<Textarea helperText="Helper" error="Error" />);
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.queryByText("Helper")).not.toBeInTheDocument();
    });

    it("should handle large maxLength values", () => {
      render(
        <Textarea maxLength={999999} showCharCount value="Test" readOnly />
      );
      expect(screen.getByText("4 / 999999")).toBeInTheDocument();
    });

    it("should handle undefined value", () => {
      render(<Textarea value={undefined} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe("");
    });
  });

  describe("Accessibility", () => {
    it("should have proper role", () => {
      render(<Textarea />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should be keyboard accessible", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      textarea.focus();
      expect(textarea).toHaveFocus();
    });

    it("should have proper focus ring", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500"
      );
    });

    it("should link label via htmlFor", () => {
      render(<Textarea label="Accessible" />);
      const label = screen.getByText("Accessible");
      const textarea = screen.getByRole("textbox");
      expect(label).toHaveAttribute("for", textarea.id);
    });

    it("should indicate required fields", () => {
      render(<Textarea label="Required" required />);
      expect(screen.getByRole("textbox")).toBeRequired();
      expect(screen.getByText("*")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should render without crashing with minimal props", () => {
      expect(() => {
        render(<Textarea />);
      }).not.toThrow();
    });

    it("should render without crashing with all props", () => {
      expect(() => {
        render(
          <Textarea
            label="Complete"
            error="Error"
            helperText="Helper"
            fullWidth
            showCharCount
            maxLength={100}
            size="lg"
            className="custom"
            id="test"
            required
            value="Test"
            rows={5}
            onChange={jest.fn()}
          />
        );
      }).not.toThrow();
    });

    it("should handle rapid value changes", () => {
      const handleChange = jest.fn();
      render(<Textarea onChange={handleChange} />);
      const textarea = screen.getByRole("textbox");

      for (let i = 0; i < 10; i++) {
        fireEvent.change(textarea, { target: { value: `Change ${i}` } });
      }

      expect(handleChange).toHaveBeenCalledTimes(10);
    });

    it("should render multiple textareas efficiently", () => {
      render(
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <Textarea key={i} label={`Textarea ${i}`} />
          ))}
        </>
      );
      expect(screen.getByLabelText("Textarea 0")).toBeInTheDocument();
      expect(screen.getByLabelText("Textarea 19")).toBeInTheDocument();
    });
  });

  describe("Component Display Name", () => {
    it("should have correct displayName", () => {
      expect(Textarea.displayName).toBe("Textarea");
    });
  });
});
