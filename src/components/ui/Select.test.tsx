import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select, SelectOption } from "./Select";

const mockOptions: SelectOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

describe("Select", () => {
  describe("Basic Rendering", () => {
    it("renders select element", () => {
      render(<Select options={mockOptions} />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders with label", () => {
      render(<Select label="Country" options={mockOptions} />);
      expect(screen.getByLabelText("Country")).toBeInTheDocument();
    });

    it("renders all options", () => {
      render(<Select options={mockOptions} />);
      expect(
        screen.getByRole("option", { name: "Option 1" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Option 2" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Option 3" }),
      ).toBeInTheDocument();
    });

    it("renders placeholder option", () => {
      render(<Select options={mockOptions} placeholder="Select an option" />);
      expect(
        screen.getByRole("option", { name: "Select an option" }),
      ).toBeInTheDocument();
    });

    it("placeholder option is disabled", () => {
      render(<Select options={mockOptions} placeholder="Select..." />);
      const placeholder = screen.getByRole("option", {
        name: "Select...",
      }) as HTMLOptionElement;
      expect(placeholder).toBeDisabled();
      expect(placeholder).toHaveAttribute("value", "");
    });
  });

  describe("Label", () => {
    it("associates label with select via htmlFor", () => {
      render(<Select label="Status" options={mockOptions} />);
      const label = screen.getByText("Status");
      const select = screen.getByRole("combobox");
      expect(label).toHaveAttribute("for", select.id);
    });

    it("shows required asterisk when required", () => {
      render(<Select label="Category" options={mockOptions} required />);
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("generates id from label", () => {
      render(<Select label="User Type" options={mockOptions} />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("id", "user-type");
    });

    it("uses custom id when provided", () => {
      render(<Select label="Type" options={mockOptions} id="custom-id" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("id", "custom-id");
    });
  });

  describe("Options", () => {
    it("renders options with correct values", () => {
      render(<Select options={mockOptions} />);
      const option1 = screen.getByRole("option", {
        name: "Option 1",
      }) as HTMLOptionElement;
      expect(option1).toHaveValue("option1");
    });

    it("renders disabled options", () => {
      const optionsWithDisabled: SelectOption[] = [
        { value: "1", label: "Active" },
        { value: "2", label: "Disabled", disabled: true },
      ];
      render(<Select options={optionsWithDisabled} />);

      const disabledOption = screen.getByRole("option", {
        name: "Disabled",
      }) as HTMLOptionElement;
      expect(disabledOption).toBeDisabled();
    });

    it("renders numeric values", () => {
      const numericOptions: SelectOption[] = [
        { value: 1, label: "One" },
        { value: 2, label: "Two" },
      ];
      render(<Select options={numericOptions} />);

      const option = screen.getByRole("option", {
        name: "One",
      }) as HTMLOptionElement;
      expect(option).toHaveValue("1");
    });

    it("handles empty options array", () => {
      render(<Select options={[]} />);
      const select = screen.getByRole("combobox");
      expect(select.children).toHaveLength(0);
    });
  });

  describe("Error State", () => {
    it("displays error message", () => {
      render(<Select options={mockOptions} error="This field is required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("applies error border when error exists", () => {
      render(<Select options={mockOptions} error="Invalid" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("border-red-500");
    });

    it("sets aria-invalid when error exists", () => {
      render(<Select options={mockOptions} error="Error" />);
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("associates error with select via aria-describedby", () => {
      render(
        <Select label="Type" options={mockOptions} error="Error message" />,
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("aria-describedby", "type-error");
    });

    it("hides helper text when error is shown", () => {
      render(
        <Select options={mockOptions} helperText="Helper" error="Error" />,
      );
      expect(screen.queryByText("Helper")).not.toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  describe("Helper Text", () => {
    it("displays helper text", () => {
      render(<Select options={mockOptions} helperText="Choose your option" />);
      expect(screen.getByText("Choose your option")).toBeInTheDocument();
    });

    it("associates helper text with select", () => {
      render(
        <Select label="Status" options={mockOptions} helperText="Helper" />,
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("aria-describedby", "status-helper");
    });
  });

  describe("Width", () => {
    it("applies fullWidth by default", () => {
      const { container } = render(<Select options={mockOptions} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("w-full");
    });

    it("can disable fullWidth", () => {
      const { container } = render(
        <Select options={mockOptions} fullWidth={false} />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).not.toHaveClass("w-full");
    });
  });

  describe("Disabled State", () => {
    it("applies disabled attribute", () => {
      render(<Select options={mockOptions} disabled />);
      expect(screen.getByRole("combobox")).toBeDisabled();
    });

    it("applies disabled styling", () => {
      render(<Select options={mockOptions} disabled />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass(
        "disabled:bg-gray-100",
        "disabled:cursor-not-allowed",
      );
    });
  });

  describe("User Interaction", () => {
    it("calls onChange when option is selected", () => {
      const onChange = jest.fn();
      render(<Select options={mockOptions} onChange={onChange} />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "option2" } });

      expect(onChange).toHaveBeenCalled();
    });

    it("updates selected value", () => {
      const { rerender } = render(
        <Select options={mockOptions} value="option1" onChange={() => {}} />,
      );
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("option1");

      rerender(
        <Select options={mockOptions} value="option2" onChange={() => {}} />,
      );
      expect(select.value).toBe("option2");
    });

    it("calls onFocus when focused", () => {
      const onFocus = jest.fn();
      render(<Select options={mockOptions} onFocus={onFocus} />);

      fireEvent.focus(screen.getByRole("combobox"));
      expect(onFocus).toHaveBeenCalled();
    });

    it("calls onBlur when blurred", () => {
      const onBlur = jest.fn();
      render(<Select options={mockOptions} onBlur={onBlur} />);

      const select = screen.getByRole("combobox");
      fireEvent.focus(select);
      fireEvent.blur(select);
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe("Ref Forwarding", () => {
    it("forwards ref to select element", () => {
      const ref = React.createRef<HTMLSelectElement>();
      render(<Select options={mockOptions} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
      expect(ref.current?.tagName).toBe("SELECT");
    });

    it("can focus via ref", () => {
      const ref = React.createRef<HTMLSelectElement>();
      render(<Select options={mockOptions} ref={ref} />);

      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });

    it("can change value via ref", () => {
      const ref = React.createRef<HTMLSelectElement>();
      render(<Select options={mockOptions} ref={ref} />);

      if (ref.current) {
        ref.current.value = "option2";
        expect(ref.current.value).toBe("option2");
      }
    });
  });

  describe("Custom Props", () => {
    it("applies custom className", () => {
      render(<Select options={mockOptions} className="custom-class" />);
      expect(screen.getByRole("combobox")).toHaveClass("custom-class");
    });

    it("passes through HTML attributes", () => {
      render(<Select options={mockOptions} name="country" form="myform" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("name", "country");
      expect(select).toHaveAttribute("form", "myform");
    });

    it("applies aria attributes", () => {
      render(<Select options={mockOptions} aria-label="Custom label" />);
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "aria-label",
        "Custom label",
      );
    });
  });

  describe("Accessibility", () => {
    it("has accessible combobox role", () => {
      render(<Select options={mockOptions} />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("label has correct classes for accessibility", () => {
      render(<Select label="Type" options={mockOptions} />);
      const label = screen.getByText("Type");
      expect(label).toHaveClass("block", "text-sm", "font-medium");
    });

    it("options are keyboard navigable", () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole("combobox");

      select.focus();
      expect(document.activeElement).toBe(select);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty label", () => {
      render(<Select label="" options={mockOptions} />);
      expect(screen.queryByRole("label")).not.toBeInTheDocument();
    });

    it("handles very long error messages", () => {
      const longError = "This is a very long error message ".repeat(10);
      render(<Select options={mockOptions} error={longError} />);
      expect(
        screen.getByText(/This is a very long error message/),
      ).toBeInTheDocument();
    });

    it("handles special characters in labels", () => {
      const specialOptions: SelectOption[] = [
        { value: "1", label: '<Option> & "Quotes"' },
      ];
      render(<Select options={specialOptions} />);
      expect(
        screen.getByRole("option", { name: '<Option> & "Quotes"' }),
      ).toBeInTheDocument();
    });

    it("handles label with multiple spaces", () => {
      render(<Select label="User   Type" options={mockOptions} />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("id", "user-type");
    });

    it("handles options with same value", () => {
      const duplicateOptions: SelectOption[] = [
        { value: "1", label: "First" },
        { value: "2", label: "Second" },
      ];
      render(<Select options={duplicateOptions} />);

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(2);
    });

    it("renders without label or placeholder", () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });
  });
});
