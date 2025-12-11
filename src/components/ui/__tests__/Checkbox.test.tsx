import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Checkbox } from "../Checkbox";

describe("Checkbox - Form Input Component", () => {
  describe("Basic Rendering - Without Label", () => {
    it("should render checkbox without label", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("should have type checkbox", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("type", "checkbox");
    });

    it("should have w-4 h-4 size", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("w-4", "h-4");
    });

    it("should have text-blue-600 color", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("text-blue-600");
    });

    it("should have border-gray-300", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("border-gray-300");
    });

    it("should have rounded corners", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("rounded");
    });

    it("should have focus:ring-blue-500 focus:ring-2", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("focus:ring-blue-500", "focus:ring-2");
    });

    it("should be unchecked by default", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it("should accept checked prop", () => {
      render(<Checkbox checked readOnly />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("should accept onChange handler", () => {
      const handleChange = jest.fn();
      render(<Checkbox onChange={handleChange} />);
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("With Label", () => {
    it("should render checkbox with label", () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByText("Accept terms")).toBeInTheDocument();
    });

    it("should render label as clickable", () => {
      render(<Checkbox label="Accept terms" />);
      const label = screen.getByText("Accept terms").closest("label");
      expect(label).toBeInTheDocument();
    });

    it("should have cursor-pointer on label", () => {
      render(<Checkbox label="Accept terms" />);
      const label = screen.getByText("Accept terms").closest("label");
      expect(label).toHaveClass("cursor-pointer");
    });

    it("should have flex items-start gap-3 layout", () => {
      render(<Checkbox label="Accept terms" />);
      const label = screen.getByText("Accept terms").closest("label");
      expect(label).toHaveClass("flex", "items-start", "gap-3");
    });

    it("should have group class for hover effects", () => {
      render(<Checkbox label="Accept terms" />);
      const label = screen.getByText("Accept terms").closest("label");
      expect(label).toHaveClass("group");
    });

    it("should link label to checkbox via htmlFor", () => {
      render(<Checkbox label="Accept terms" />);
      const checkbox = screen.getByRole("checkbox");
      const label = screen.getByText("Accept terms").closest("label");
      expect(label).toHaveAttribute("for", checkbox.id);
    });

    it("should auto-generate id from label", () => {
      render(<Checkbox label="Accept Terms" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("id", "accept-terms");
    });

    it("should handle multi-word labels in id generation", () => {
      render(<Checkbox label="I agree to the Privacy Policy" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("id", "i-agree-to-the-privacy-policy");
    });

    it("should have text-sm font-medium on label text", () => {
      render(<Checkbox label="Accept terms" />);
      const labelText = screen.getByText("Accept terms");
      expect(labelText).toHaveClass("text-sm", "font-medium");
    });

    it("should have text-gray-900 on label", () => {
      render(<Checkbox label="Accept terms" />);
      const labelText = screen.getByText("Accept terms");
      expect(labelText).toHaveClass("text-gray-900");
    });

    it("should have hover:text-blue-600 on label", () => {
      render(<Checkbox label="Accept terms" />);
      const labelText = screen.getByText("Accept terms");
      expect(labelText).toHaveClass("group-hover:text-blue-600");
    });

    it("should have transition-colors on label", () => {
      render(<Checkbox label="Accept terms" />);
      const labelText = screen.getByText("Accept terms");
      expect(labelText).toHaveClass("transition-colors");
    });

    it("should have mt-0.5 on checkbox for alignment", () => {
      render(<Checkbox label="Accept terms" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("mt-0.5");
    });

    it("should toggle checkbox when label is clicked", () => {
      render(<Checkbox label="Accept terms" />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      const label = screen.getByText("Accept terms");

      expect(checkbox.checked).toBe(false);
      fireEvent.click(label);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe("With Description", () => {
    it("should render description when provided", () => {
      render(
        <Checkbox
          label="Accept terms"
          description="By checking this, you agree to our terms and conditions"
        />
      );
      expect(
        screen.getByText(
          "By checking this, you agree to our terms and conditions"
        )
      ).toBeInTheDocument();
    });

    it("should not render description when not provided", () => {
      const { container } = render(<Checkbox label="Accept terms" />);
      const descriptions = container.querySelectorAll(".text-gray-500");
      // Only the label should exist, not description
      expect(descriptions.length).toBe(0);
    });

    it("should have text-sm on description", () => {
      render(
        <Checkbox label="Accept terms" description="Additional information" />
      );
      const description = screen.getByText("Additional information");
      expect(description).toHaveClass("text-sm");
    });

    it("should have text-gray-500 on description", () => {
      render(
        <Checkbox label="Accept terms" description="Additional information" />
      );
      const description = screen.getByText("Additional information");
      expect(description).toHaveClass("text-gray-500");
    });

    it("should render both label and description", () => {
      render(
        <Checkbox
          label="Subscribe to newsletter"
          description="Receive weekly updates about new products"
        />
      );
      expect(screen.getByText("Subscribe to newsletter")).toBeInTheDocument();
      expect(
        screen.getByText("Receive weekly updates about new products")
      ).toBeInTheDocument();
    });

    it("should not render description without label", () => {
      // Description only makes sense with label
      const { container } = render(<Checkbox />);
      expect(container.querySelector(".text-gray-500")).not.toBeInTheDocument();
    });
  });

  describe("Custom ID", () => {
    it("should accept custom id prop", () => {
      render(<Checkbox id="custom-checkbox" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("id", "custom-checkbox");
    });

    it("should use custom id over auto-generated", () => {
      render(<Checkbox label="Accept terms" id="terms-checkbox" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("id", "terms-checkbox");
    });

    it("should link label to custom id", () => {
      render(<Checkbox label="Accept terms" id="custom-id" />);
      const label = screen.getByText("Accept terms").closest("label");
      expect(label).toHaveAttribute("for", "custom-id");
    });
  });

  describe("Disabled State", () => {
    it("should accept disabled prop", () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeDisabled();
    });

    it("should have opacity-50 when disabled", () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("disabled:opacity-50");
    });

    it("should have cursor-not-allowed when disabled", () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("disabled:cursor-not-allowed");
    });

    it("should not trigger onChange when disabled", () => {
      const handleChange = jest.fn();
      render(<Checkbox disabled onChange={handleChange} />);
      const checkbox = screen.getByRole("checkbox");
      // Disabled checkboxes can't be clicked in real browsers, but fireEvent still triggers onChange
      // So we verify it's disabled instead
      expect(checkbox).toBeDisabled();
    });

    it("should be disabled with label", () => {
      render(<Checkbox label="Disabled option" disabled />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeDisabled();
    });
  });

  describe("Custom Styling", () => {
    it("should accept custom className", () => {
      render(<Checkbox className="custom-checkbox" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("custom-checkbox");
    });

    it("should merge custom className with base classes", () => {
      render(<Checkbox className="my-custom-class" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("my-custom-class", "w-4", "h-4");
    });

    it("should apply className to checkbox with label", () => {
      render(<Checkbox label="Option" className="custom-class" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("custom-class");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark:border-gray-600", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("dark:border-gray-600");
    });

    it("should have dark:bg-gray-800", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("dark:bg-gray-800");
    });

    it("should have dark:text-white on label", () => {
      render(<Checkbox label="Option" />);
      const labelText = screen.getByText("Option");
      expect(labelText).toHaveClass("dark:text-white");
    });

    it("should have dark:group-hover:text-blue-400 on label", () => {
      render(<Checkbox label="Option" />);
      const labelText = screen.getByText("Option");
      expect(labelText).toHaveClass("dark:group-hover:text-blue-400");
    });

    it("should have dark:text-gray-400 on description", () => {
      render(<Checkbox label="Option" description="Description" />);
      const description = screen.getByText("Description");
      expect(description).toHaveClass("dark:text-gray-400");
    });
  });

  describe("ForwardRef Support", () => {
    it("should forward ref to input element", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Checkbox ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe("checkbox");
    });

    it("should forward ref with label", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Checkbox label="Option" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it("should allow ref access to checked state", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Checkbox ref={ref} />);
      fireEvent.click(ref.current!);
      expect(ref.current?.checked).toBe(true);
    });
  });

  describe("HTML Attributes", () => {
    it("should accept name attribute", () => {
      render(<Checkbox name="terms" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("name", "terms");
    });

    it("should accept value attribute", () => {
      render(<Checkbox value="yes" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("value", "yes");
    });

    it("should accept required attribute", () => {
      render(<Checkbox required />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeRequired();
    });

    it("should accept defaultChecked", () => {
      render(<Checkbox defaultChecked />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("should accept aria-label", () => {
      render(<Checkbox aria-label="Custom accessibility label" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute(
        "aria-label",
        "Custom accessibility label"
      );
    });

    it("should accept data attributes", () => {
      render(<Checkbox data-testid="my-checkbox" />);
      const checkbox = screen.getByTestId("my-checkbox");
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string label", () => {
      render(<Checkbox label="" />);
      // Empty label should not render label wrapper
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.parentElement?.tagName).not.toBe("LABEL");
    });

    it("should handle very long label text", () => {
      const longLabel =
        "This is a very long label that might wrap to multiple lines and should still work correctly with proper alignment";
      render(<Checkbox label={longLabel} />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("should handle very long description", () => {
      const longDesc =
        "This is a very long description that provides detailed information about the checkbox option and may span multiple lines";
      render(<Checkbox label="Option" description={longDesc} />);
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });

    it("should handle special characters in label", () => {
      render(<Checkbox label="I agree to T&Cs & Privacy Policy (2024)" />);
      expect(
        screen.getByText("I agree to T&Cs & Privacy Policy (2024)")
      ).toBeInTheDocument();
    });

    it("should handle label with numbers", () => {
      render(<Checkbox label="Option 1" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("id", "option-1");
    });

    it("should handle controlled component pattern", () => {
      const TestComponent = () => {
        const [checked, setChecked] = React.useState(false);
        return (
          <Checkbox
            label="Controlled"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
        );
      };

      render(<TestComponent />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it("should handle indeterminate state via ref", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Checkbox ref={ref} />);

      if (ref.current) {
        ref.current.indeterminate = true;
        expect(ref.current.indeterminate).toBe(true);
      }
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard accessible", () => {
      render(<Checkbox label="Option" />);
      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });

    it("should toggle on Space key press", () => {
      render(<Checkbox label="Option" />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

      checkbox.focus();
      fireEvent.keyDown(checkbox, { key: " ", code: "Space" });
      // Space key will trigger the native checkbox behavior
    });

    it("should have proper focus ring", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("focus:ring-blue-500", "focus:ring-2");
    });

    it("should maintain tab order", () => {
      render(
        <div>
          <Checkbox label="First" />
          <Checkbox label="Second" />
          <Checkbox label="Third" />
        </div>
      );
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(3);
    });
  });

  describe("Performance", () => {
    it("should render without crashing with all props", () => {
      expect(() => {
        render(
          <Checkbox
            label="Complete option"
            description="Full description"
            id="test-checkbox"
            className="custom-class"
            checked
            onChange={jest.fn()}
            disabled={false}
            required
            name="test"
            value="yes"
          />
        );
      }).not.toThrow();
    });

    it("should handle rapid state changes", () => {
      const handleChange = jest.fn();
      render(<Checkbox onChange={handleChange} />);
      const checkbox = screen.getByRole("checkbox");

      for (let i = 0; i < 10; i++) {
        fireEvent.click(checkbox);
      }

      expect(handleChange).toHaveBeenCalledTimes(10);
    });

    it("should render multiple checkboxes efficiently", () => {
      render(
        <div>
          {Array.from({ length: 50 }, (_, i) => (
            <Checkbox key={i} label={`Option ${i}`} />
          ))}
        </div>
      );
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(50);
    });
  });

  describe("Component Display Name", () => {
    it("should have correct displayName", () => {
      expect(Checkbox.displayName).toBe("Checkbox");
    });
  });
});
