/**
 * Tests for FormField component
 *
 * Coverage:
 * - Renders all input types
 * - Label and help text display
 * - Error state handling
 * - Required field indicator
 * - Disabled state
 * - Value changes
 * - Accessibility
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormField } from "../FormField";
import { UI_LABELS } from "@/constants";

describe("FormField Component", () => {
  describe("Rendering", () => {
    it("renders text input by default", () => {
      render(<FormField name="test" label="Test Field" />);

      const input = screen.getByLabelText("Test Field");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
    });

    it("renders email input", () => {
      render(<FormField name="email" label="Email" type="email" />);

      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("type", "email");
    });

    it("renders password input", () => {
      render(<FormField name="password" label="Password" type="password" />);

      const input = screen.getByLabelText("Password");
      expect(input).toHaveAttribute("type", "password");
    });

    it("renders textarea", () => {
      render(<FormField name="message" label="Message" type="textarea" />);

      const textarea = screen.getByLabelText("Message");
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("renders select dropdown", () => {
      const options = [
        { value: "1", label: "Option 1" },
        { value: "2", label: "Option 2" },
      ];
      render(
        <FormField
          name="select"
          label="Select Option"
          type="select"
          options={options}
        />,
      );

      const select = screen.getByLabelText("Select Option");
      expect(select.tagName).toBe("SELECT");
    });
  });

  describe("Label and Help Text", () => {
    it("renders label correctly", () => {
      render(<FormField name="test" label="Test Label" />);
      expect(screen.getByText("Test Label")).toBeInTheDocument();
    });

    it("shows required indicator for required fields", () => {
      render(<FormField name="test" label="Required Field" required />);
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("renders help text when provided", () => {
      render(<FormField name="test" label="Field" helpText="Help message" />);
      expect(screen.getByText("Help message")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("displays error message when error prop is provided", () => {
      render(
        <FormField name="test" label="Field" error="This field is required" />,
      );
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("applies error styling when error exists", () => {
      const { container } = render(
        <FormField name="test" label="Field" error="Error message" />,
      );
      const input = container.querySelector("input");
      expect(input).toHaveClass("border-red-500");
    });
  });

  describe("Disabled State", () => {
    it("disables input when disabled prop is true", () => {
      render(<FormField name="test" label="Disabled Field" disabled />);
      const input = screen.getByLabelText("Disabled Field");
      expect(input).toBeDisabled();
    });

    it("disables textarea when disabled prop is true", () => {
      render(
        <FormField
          name="test"
          label="Disabled Textarea"
          type="textarea"
          disabled
        />,
      );
      const textarea = screen.getByLabelText("Disabled Textarea");
      expect(textarea).toBeDisabled();
    });

    it("disables select when disabled prop is true", () => {
      const options = [{ value: "1", label: "Option 1" }];
      render(
        <FormField
          name="test"
          label="Disabled Select"
          type="select"
          options={options}
          disabled
        />,
      );
      const select = screen.getByLabelText("Disabled Select");
      expect(select).toBeDisabled();
    });
  });

  describe("Value Handling", () => {
    it("accepts initial value", () => {
      render(
        <FormField
          name="test"
          label="Field"
          value="Initial value"
          onChange={() => {}}
        />,
      );
      const input = screen.getByLabelText("Field") as HTMLInputElement;
      expect(input.value).toBe("Initial value");
    });

    it("calls onChange when value changes", () => {
      const handleChange = jest.fn();
      render(<FormField name="test" label="Field" onChange={handleChange} />);

      const input = screen.getByLabelText("Field");
      fireEvent.change(input, { target: { value: "new value" } });

      expect(handleChange).toHaveBeenCalled();
    });

    it("calls onChange for textarea", () => {
      const handleChange = jest.fn();
      render(
        <FormField
          name="message"
          label="Message"
          type="textarea"
          onChange={handleChange}
        />,
      );

      const textarea = screen.getByLabelText("Message");
      fireEvent.change(textarea, { target: { value: "text content" } });

      expect(handleChange).toHaveBeenCalled();
    });

    it("calls onChange for select", () => {
      const handleChange = jest.fn();
      const options = [
        { value: "1", label: "Option 1" },
        { value: "2", label: "Option 2" },
      ];
      render(
        <FormField
          name="select"
          label="Select"
          type="select"
          options={options}
          onChange={handleChange}
        />,
      );

      const select = screen.getByLabelText("Select");
      fireEvent.change(select, { target: { value: "2" } });

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe("Placeholder", () => {
    it("renders placeholder for text input", () => {
      render(<FormField name="test" label="Field" placeholder="Enter text" />);
      const input = screen.getByPlaceholderText("Enter text");
      expect(input).toBeInTheDocument();
    });

    it("renders placeholder for textarea", () => {
      render(
        <FormField
          name="message"
          label="Message"
          type="textarea"
          placeholder="Enter message"
        />,
      );
      const textarea = screen.getByPlaceholderText("Enter message");
      expect(textarea).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("associates label with input via id", () => {
      render(<FormField name="test" label="Test Field" />);
      const input = screen.getByLabelText("Test Field");
      expect(input).toHaveAttribute("id");
    });

    it("sets aria-required for required fields", () => {
      render(<FormField name="test" label="Required Field" required />);
      const input = screen.getByLabelText(/Required Field/);
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("sets aria-invalid for fields with errors", () => {
      render(<FormField name="test" label="Field" error="Error message" />);
      const input = screen.getByLabelText("Field");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("associates error message with input via aria-describedby", () => {
      render(<FormField name="test" label="Field" error="Error message" />);
      const input = screen.getByLabelText("Field");
      expect(input).toHaveAttribute("aria-describedby");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty options array for select", () => {
      render(
        <FormField name="select" label="Select" type="select" options={[]} />,
      );
      const select = screen.getByLabelText("Select");
      expect(select.childNodes.length).toBe(0); // No options rendered
    });

    it("renders with minimal props", () => {
      render(<FormField name="minimal" />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("handles both error and help text", () => {
      render(
        <FormField
          name="test"
          label="Field"
          helpText="Help text"
          error="Error message"
        />,
      );

      // Error takes precedence
      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.queryByText("Help text")).not.toBeInTheDocument();
    });
  });
});
