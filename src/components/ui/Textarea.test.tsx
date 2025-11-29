import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  describe("Basic Rendering", () => {
    it("renders textarea element", () => {
      render(<Textarea />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with label", () => {
      render(<Textarea label="Description" />);
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
    });

    it("renders with placeholder", () => {
      render(<Textarea placeholder="Enter text..." />);
      expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
    });

    it("renders with default value", () => {
      render(<Textarea defaultValue="Initial text" />);
      expect(screen.getByDisplayValue("Initial text")).toBeInTheDocument();
    });
  });

  describe("Label", () => {
    it("associates label with textarea via htmlFor", () => {
      render(<Textarea label="Comment" />);
      const label = screen.getByText("Comment");
      const textarea = screen.getByRole("textbox");
      expect(label).toHaveAttribute("for", textarea.id);
    });

    it("shows required asterisk when required", () => {
      render(<Textarea label="Message" required />);
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("generates id from label", () => {
      render(<Textarea label="User Comment" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("id", "user-comment");
    });

    it("uses custom id when provided", () => {
      render(<Textarea label="Comment" id="custom-id" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("id", "custom-id");
    });
  });

  describe("Error State", () => {
    it("displays error message", () => {
      render(<Textarea label="Text" error="This field is required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("applies error border when error exists", () => {
      render(<Textarea error="Invalid" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("border-red-500");
    });

    it("sets aria-invalid when error exists", () => {
      render(<Textarea error="Error" />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("associates error with textarea via aria-describedby", () => {
      render(<Textarea label="Text" error="Error message" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-describedby", "text-error");
    });

    it("hides helper text when error is shown", () => {
      render(<Textarea helperText="Helper" error="Error" />);
      expect(screen.queryByText("Helper")).not.toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  describe("Helper Text", () => {
    it("displays helper text", () => {
      render(<Textarea helperText="Max 500 characters" />);
      expect(screen.getByText("Max 500 characters")).toBeInTheDocument();
    });

    it("associates helper text with textarea", () => {
      render(<Textarea label="Text" helperText="Helper" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-describedby", "text-helper");
    });
  });

  describe("Character Count", () => {
    it("shows character count when enabled", () => {
      render(
        <Textarea
          showCharCount
          maxLength={100}
          value="Hello"
          onChange={() => {}}
        />,
      );
      expect(screen.getByText("5 / 100")).toBeInTheDocument();
    });

    it("does not show count when showCharCount is false", () => {
      render(<Textarea maxLength={100} value="Hello" onChange={() => {}} />);
      expect(screen.queryByText("5 / 100")).not.toBeInTheDocument();
    });

    it("requires maxLength to show count", () => {
      render(<Textarea showCharCount value="Hello" onChange={() => {}} />);
      expect(screen.queryByText(/\d+ \//)).not.toBeInTheDocument();
    });

    it("updates count when value changes", () => {
      const { rerender } = render(
        <Textarea
          showCharCount
          maxLength={100}
          value="Test"
          onChange={() => {}}
        />,
      );
      expect(screen.getByText("4 / 100")).toBeInTheDocument();

      rerender(
        <Textarea
          showCharCount
          maxLength={100}
          value="Test123"
          onChange={() => {}}
        />,
      );
      expect(screen.getByText("7 / 100")).toBeInTheDocument();
    });

    it("shows 0 count for empty value", () => {
      render(
        <Textarea showCharCount maxLength={100} value="" onChange={() => {}} />,
      );
      expect(screen.getByText("0 / 100")).toBeInTheDocument();
    });
  });

  describe("Width", () => {
    it("applies fullWidth by default", () => {
      const { container } = render(<Textarea />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("w-full");
    });

    it("can disable fullWidth", () => {
      const { container } = render(<Textarea fullWidth={false} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).not.toHaveClass("w-full");
    });
  });

  describe("Disabled State", () => {
    it("applies disabled attribute", () => {
      render(<Textarea disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("applies disabled styling", () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "disabled:bg-gray-100",
        "disabled:cursor-not-allowed",
      );
    });
  });

  describe("MaxLength", () => {
    it("applies maxLength attribute", () => {
      render(<Textarea maxLength={500} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "500");
    });

    it("enforces maxLength constraint", () => {
      render(<Textarea maxLength={10} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("maxLength", "10");
    });
  });

  describe("User Interaction", () => {
    it("calls onChange when text is entered", () => {
      const onChange = jest.fn();
      render(<Textarea onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "New text" } });

      expect(onChange).toHaveBeenCalled();
    });

    it("updates value on change", () => {
      const { rerender } = render(
        <Textarea value="Initial" onChange={() => {}} />,
      );
      expect(screen.getByDisplayValue("Initial")).toBeInTheDocument();

      rerender(<Textarea value="Updated" onChange={() => {}} />);
      expect(screen.getByDisplayValue("Updated")).toBeInTheDocument();
    });

    it("calls onFocus when focused", () => {
      const onFocus = jest.fn();
      render(<Textarea onFocus={onFocus} />);

      fireEvent.focus(screen.getByRole("textbox"));
      expect(onFocus).toHaveBeenCalled();
    });

    it("calls onBlur when blurred", () => {
      const onBlur = jest.fn();
      render(<Textarea onBlur={onBlur} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.focus(textarea);
      fireEvent.blur(textarea);
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe("Ref Forwarding", () => {
    it("forwards ref to textarea element", () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(ref.current?.tagName).toBe("TEXTAREA");
    });

    it("can focus via ref", () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);

      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });
  });

  describe("Custom Props", () => {
    it("applies custom className", () => {
      render(<Textarea className="custom-class" />);
      expect(screen.getByRole("textbox")).toHaveClass("custom-class");
    });

    it("passes through HTML attributes", () => {
      render(<Textarea rows={5} cols={50} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("rows", "5");
      expect(textarea).toHaveAttribute("cols", "50");
    });

    it("applies aria attributes", () => {
      render(<Textarea aria-label="Custom label" />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-label",
        "Custom label",
      );
    });
  });

  describe("Accessibility", () => {
    it("has accessible textarea role", () => {
      render(<Textarea />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("label has correct classes for accessibility", () => {
      render(<Textarea label="Description" />);
      const label = screen.getByText("Description");
      expect(label).toHaveClass("block", "text-sm", "font-medium");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty label", () => {
      render(<Textarea label="" />);
      expect(screen.queryByRole("label")).not.toBeInTheDocument();
    });

    it("handles very long error messages", () => {
      const longError = "This is a very long error message ".repeat(10);
      render(<Textarea error={longError} />);
      expect(
        screen.getByText(/This is a very long error message/),
      ).toBeInTheDocument();
    });

    it("handles special characters in value", () => {
      render(
        <Textarea value="<script>alert('test')</script>" onChange={() => {}} />,
      );
      expect(
        screen.getByDisplayValue("<script>alert('test')</script>"),
      ).toBeInTheDocument();
    });

    it("handles multiline text", () => {
      const multiline = "Line 1\nLine 2\nLine 3";
      render(<Textarea value={multiline} onChange={() => {}} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe(multiline);
    });

    it("handles label with multiple spaces", () => {
      render(<Textarea label="User   Comment" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("id", "user-comment");
    });
  });
});
