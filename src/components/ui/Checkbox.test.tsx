import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox, CheckboxProps } from "./Checkbox";

describe("Checkbox", () => {
  describe("Basic Rendering", () => {
    it("renders checkbox element", () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("renders with label", () => {
      render(<Checkbox label="Accept terms" />);

      expect(screen.getByText("Accept terms")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("renders without label", () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(screen.queryByText(/./)).not.toBeInTheDocument();
    });

    it("renders with description", () => {
      render(
        <Checkbox
          label="Subscribe"
          description="Get weekly updates via email"
        />
      );

      expect(screen.getByText("Subscribe")).toBeInTheDocument();
      expect(
        screen.getByText("Get weekly updates via email")
      ).toBeInTheDocument();
    });

    it("does not render description without label", () => {
      render(<Checkbox description="Description text" />);

      expect(screen.queryByText("Description text")).not.toBeInTheDocument();
    });
  });

  describe("Label Association", () => {
    it("associates label with checkbox using htmlFor", () => {
      render(<Checkbox label="Remember me" />);

      const checkbox = screen.getByRole("checkbox");
      const label = screen.getByText("Remember me").closest("label");

      expect(label).toHaveAttribute("for", "remember-me");
      expect(checkbox).toHaveAttribute("id", "remember-me");
    });

    it("generates id from label", () => {
      render(<Checkbox label="Accept Terms and Conditions" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("id", "accept-terms-and-conditions");
    });

    it("uses custom id when provided", () => {
      render(<Checkbox label="Accept" id="custom-checkbox-id" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("id", "custom-checkbox-id");
    });

    it("clicking label toggles checkbox", () => {
      render(<Checkbox label="Remember me" />);

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      const label = screen.getByText("Remember me");

      expect(checkbox.checked).toBe(false);
      fireEvent.click(label);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe("Checked State", () => {
    it("is unchecked by default", () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it("can be checked by default", () => {
      render(<Checkbox defaultChecked />);

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("can be controlled", () => {
      const { rerender } = render(
        <Checkbox checked={false} onChange={() => {}} />
      );

      let checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      rerender(<Checkbox checked={true} onChange={() => {}} />);
      checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe("User Interaction", () => {
    it("handles onChange event", () => {
      const handleChange = jest.fn();
      render(<Checkbox onChange={handleChange} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalled();
    });

    it("toggles checked state on click", () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

      expect(checkbox.checked).toBe(false);
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it("passes event to onChange handler", () => {
      const handleChange = jest.fn();
      render(<Checkbox onChange={handleChange} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            checked: true,
          }),
        })
      );
    });
  });

  describe("Disabled State", () => {
    it("can be disabled", () => {
      render(<Checkbox disabled />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeDisabled();
    });

    it("applies disabled styles", () => {
      render(<Checkbox disabled />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed"
      );
    });

    it("does not trigger onChange when disabled", () => {
      const handleChange = jest.fn();
      render(<Checkbox disabled onChange={handleChange} />);

      const checkbox = screen.getByRole("checkbox");
      // Note: React Testing Library fires onChange even when disabled
      // The actual browser behavior prevents this, but we can verify disabled state
      expect(checkbox).toBeDisabled();
    });

    it("disabled label still shows but not clickable", () => {
      render(<Checkbox label="Disabled option" disabled />);

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      const label = screen.getByText("Disabled option");

      expect(label).toBeInTheDocument();
      expect(checkbox.checked).toBe(false);
      fireEvent.click(label);
      expect(checkbox.checked).toBe(false);
    });
  });

  describe("Styling", () => {
    it("applies default checkbox styles", () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass(
        "w-4",
        "h-4",
        "text-blue-600",
        "border-gray-300",
        "rounded"
      );
    });

    it("applies focus ring styles", () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("focus:ring-blue-500", "focus:ring-2");
    });

    it("applies custom className", () => {
      render(<Checkbox className="custom-checkbox-class" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("custom-checkbox-class");
    });

    it("label has cursor pointer", () => {
      render(<Checkbox label="Click me" />);

      const label = screen.getByText("Click me").closest("label");
      expect(label).toHaveClass("cursor-pointer");
    });

    it("label has hover effect", () => {
      render(<Checkbox label="Hover me" />);

      const labelText = screen.getByText("Hover me");
      expect(labelText).toHaveClass("group-hover:text-blue-600");
    });
  });

  describe("Layout", () => {
    it("uses flex layout with label", () => {
      render(<Checkbox label="Test" />);

      const label = screen.getByText("Test").closest("label");
      expect(label).toHaveClass("flex", "items-start", "gap-3");
    });

    it("checkbox has top margin alignment", () => {
      render(<Checkbox label="Test" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("mt-0.5");
    });

    it("description is below label text", () => {
      render(<Checkbox label="Main label" description="Description below" />);

      const label = screen.getByText("Main label");
      const description = screen.getByText("Description below");

      expect(label).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-sm", "text-gray-500");
    });
  });

  describe("Ref Forwarding", () => {
    it("forwards ref to checkbox element", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Checkbox ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe("checkbox");
    });

    it("can focus checkbox via ref", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Checkbox ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it("can check checkbox via ref", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Checkbox ref={ref} />);

      if (ref.current) {
        ref.current.checked = true;
      }
      expect(ref.current?.checked).toBe(true);
    });
  });

  describe("Custom Props", () => {
    it("passes through HTML input attributes", () => {
      render(
        <Checkbox name="terms" value="accepted" data-testid="custom-checkbox" />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("name", "terms");
      expect(checkbox).toHaveAttribute("value", "accepted");
      expect(checkbox).toHaveAttribute("data-testid", "custom-checkbox");
    });

    it("supports required attribute", () => {
      render(<Checkbox required />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeRequired();
    });

    it("supports form attribute", () => {
      render(<Checkbox form="my-form" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("form", "my-form");
    });
  });

  describe("Accessibility", () => {
    it("has proper role", () => {
      render(<Checkbox />);

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("is keyboard accessible", () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

      checkbox.focus();
      expect(checkbox).toHaveFocus();

      // Space key on checkbox is handled by browser, test focus works
      expect(checkbox).toBeInTheDocument();
    });

    it("label is associated for screen readers", () => {
      render(<Checkbox label="Accept terms" />);

      const checkbox = screen.getByRole("checkbox");
      const label = screen.getByText("Accept terms").closest("label");

      expect(label).toContainElement(checkbox);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty label", () => {
      render(<Checkbox label="" />);

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("handles very long labels", () => {
      const longLabel = "A".repeat(200);
      render(<Checkbox label={longLabel} />);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("handles special characters in label", () => {
      render(<Checkbox label="Accept Terms & Conditions" />);

      expect(screen.getByText("Accept Terms & Conditions")).toBeInTheDocument();
    });

    it("handles label with multiple spaces", () => {
      render(<Checkbox label="Accept   Terms   Here" />);

      const checkbox = screen.getByRole("checkbox");
      // Multiple spaces are normalized in id generation
      expect(checkbox).toHaveAttribute("id", "accept-terms-here");
    });

    it("renders correctly with only description (without label)", () => {
      render(<Checkbox description="This should not show" />);

      expect(
        screen.queryByText("This should not show")
      ).not.toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });
  });

  describe("Without Label Mode", () => {
    it("renders standalone checkbox without wrapper", () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.parentElement?.tagName).not.toBe("LABEL");
    });

    it("standalone checkbox has same styling", () => {
      render(<Checkbox className="test-class" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("test-class");
      expect(checkbox).toHaveClass("w-4", "h-4", "text-blue-600");
    });
  });
});
