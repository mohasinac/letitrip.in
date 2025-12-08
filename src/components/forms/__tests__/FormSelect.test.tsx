import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormSelect } from "../FormSelect";

const mockOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

describe("FormSelect", () => {
  describe("rendering", () => {
    it("renders basic select", () => {
      render(<FormSelect options={mockOptions} />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders with label", () => {
      render(<FormSelect label="Country" options={mockOptions} />);
      expect(screen.getByText("Country")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders all options", () => {
      render(<FormSelect options={mockOptions} />);
      const select = screen.getByRole("combobox");
      const options = select.querySelectorAll("option");
      expect(options).toHaveLength(3);
    });

    it("renders placeholder when provided", () => {
      render(
        <FormSelect options={mockOptions} placeholder="Select an option" />
      );
      expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("renders with default value", () => {
      render(<FormSelect options={mockOptions} value="option2" readOnly />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("option2");
    });
  });

  describe("label and required indicator", () => {
    it("shows required asterisk when required", () => {
      render(<FormSelect label="Category" options={mockOptions} required />);
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("does not show asterisk when not required", () => {
      render(<FormSelect label="Category" options={mockOptions} />);
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("associates label with select", () => {
      render(<FormSelect label="Country" options={mockOptions} />);
      const select = screen.getByRole("combobox");
      const label = screen.getByText("Country");
      expect(label).toHaveAttribute("for", "country");
      expect(select).toHaveAttribute("id", "country");
    });
  });

  describe("error state", () => {
    it("displays error message", () => {
      render(
        <FormSelect options={mockOptions} error="This field is required" />
      );
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("applies error styling", () => {
      render(<FormSelect options={mockOptions} error="Error" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("border-red-500");
    });

    it("sets aria-invalid when error exists", () => {
      render(<FormSelect options={mockOptions} error="Error" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("aria-invalid", "true");
    });

    it("does not show error when not provided", () => {
      render(<FormSelect options={mockOptions} />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("aria-invalid", "false");
    });
  });

  describe("helper text", () => {
    it("displays helper text", () => {
      render(
        <FormSelect options={mockOptions} helperText="Select your country" />
      );
      expect(screen.getByText("Select your country")).toBeInTheDocument();
    });

    it("shows error instead of helper text when both provided", () => {
      render(
        <FormSelect
          options={mockOptions}
          helperText="Helper text"
          error="Error message"
        />
      );
      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("renders as disabled", () => {
      render(<FormSelect options={mockOptions} disabled />);
      const select = screen.getByRole("combobox");
      expect(select).toBeDisabled();
    });

    it("applies disabled styling", () => {
      render(<FormSelect options={mockOptions} disabled />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("cursor-not-allowed");
    });

    it("cannot be interacted with when disabled", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<FormSelect options={mockOptions} disabled onChange={onChange} />);

      const select = screen.getByRole("combobox");
      await user.click(select);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("disabled options", () => {
    it("renders disabled options", () => {
      const optionsWithDisabled = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2", disabled: true },
        { value: "option3", label: "Option 3" },
      ];

      render(<FormSelect options={optionsWithDisabled} />);
      const select = screen.getByRole("combobox");
      const disabledOption = select.querySelector(
        'option[value="option2"]'
      ) as HTMLOptionElement;
      expect(disabledOption.disabled).toBe(true);
    });
  });

  describe("compact mode", () => {
    it("applies compact styling", () => {
      render(<FormSelect options={mockOptions} compact />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("py-1.5");
    });

    it("applies normal styling by default", () => {
      render(<FormSelect options={mockOptions} />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("py-2");
    });
  });

  describe("full width", () => {
    it("renders full width by default", () => {
      const { container } = render(<FormSelect options={mockOptions} />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("w-full");
    });

    it("respects fullWidth=false", () => {
      const { container } = render(
        <FormSelect options={mockOptions} fullWidth={false} />
      );
      const wrapper = container.firstChild;
      expect(wrapper).not.toHaveClass("w-full");
    });
  });

  describe("interactions", () => {
    it("calls onChange when selection changes", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<FormSelect options={mockOptions} onChange={onChange} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "option2");

      expect(onChange).toHaveBeenCalled();
    });

    it("calls onFocus when select is focused", async () => {
      const user = userEvent.setup();
      const onFocus = jest.fn();

      render(<FormSelect options={mockOptions} onFocus={onFocus} />);

      const select = screen.getByRole("combobox");
      await user.click(select);

      expect(onFocus).toHaveBeenCalled();
    });

    it("calls onBlur when select loses focus", async () => {
      const user = userEvent.setup();
      const onBlur = jest.fn();

      render(<FormSelect options={mockOptions} onBlur={onBlur} />);

      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.tab();

      expect(onBlur).toHaveBeenCalled();
    });

    it("updates selected value", async () => {
      const user = userEvent.setup();

      render(<FormSelect options={mockOptions} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      await user.selectOptions(select, "option3");

      expect(select.value).toBe("option3");
    });
  });

  describe("accessibility", () => {
    it("has correct role", () => {
      render(<FormSelect options={mockOptions} />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("supports aria-label", () => {
      render(
        <FormSelect options={mockOptions} aria-label="Country selector" />
      );
      expect(screen.getByLabelText("Country selector")).toBeInTheDocument();
    });

    it("links error message with select", () => {
      render(
        <FormSelect id="country" options={mockOptions} error="Required" />
      );
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute(
        "aria-describedby",
        expect.stringContaining("country")
      );
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<FormSelect options={mockOptions} onChange={onChange} />);

      const select = screen.getByRole("combobox");
      select.focus();
      await user.keyboard("{ArrowDown}");

      expect(document.activeElement).toBe(select);
    });
  });

  describe("custom className", () => {
    it("applies custom className to select", () => {
      render(<FormSelect options={mockOptions} className="custom-select" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("custom-select");
    });

    it("merges custom className with defaults", () => {
      render(<FormSelect options={mockOptions} className="custom-select" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("custom-select");
      expect(select).toHaveClass("rounded-lg");
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to select element", () => {
      const ref = jest.fn();
      render(<FormSelect options={mockOptions} ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("chevron icon", () => {
    it("renders chevron icon", () => {
      const { container } = render(<FormSelect options={mockOptions} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });
});
