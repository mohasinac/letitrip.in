import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileFormSelect } from "./MobileFormSelect";

const mockOptions = [
  { value: "opt1", label: "Option 1" },
  { value: "opt2", label: "Option 2" },
  { value: "opt3", label: "Option 3", disabled: true },
];

describe("MobileFormSelect", () => {
  it("renders with label", () => {
    render(<MobileFormSelect label="Country" options={mockOptions} />);
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
  });

  it("shows required indicator when required", () => {
    render(<MobileFormSelect label="Country" options={mockOptions} required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(<MobileFormSelect label="Country" options={mockOptions} />);

    expect(
      screen.getByRole("option", { name: "Option 1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Option 2" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Option 3" })
    ).toBeInTheDocument();
  });

  it("shows placeholder option", () => {
    render(
      <MobileFormSelect
        label="Country"
        options={mockOptions}
        placeholder="Select a country"
      />
    );
    expect(
      screen.getByRole("option", { name: "Select a country" })
    ).toBeInTheDocument();
  });

  it("shows error message when error prop is provided", () => {
    render(
      <MobileFormSelect
        label="Country"
        options={mockOptions}
        error="Please select a country"
      />
    );
    expect(screen.getByText("Please select a country")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows helper text when provided", () => {
    render(
      <MobileFormSelect
        label="Country"
        options={mockOptions}
        helperText="Select your country of residence"
      />
    );
    expect(
      screen.getByText("Select your country of residence")
    ).toBeInTheDocument();
  });

  it("prioritizes error over helper text", () => {
    render(
      <MobileFormSelect
        label="Country"
        options={mockOptions}
        error="Invalid selection"
        helperText="Select your country"
      />
    );
    expect(screen.getByText("Invalid selection")).toBeInTheDocument();
    expect(screen.queryByText("Select your country")).not.toBeInTheDocument();
  });

  it("applies disabled styles when disabled", () => {
    render(<MobileFormSelect label="Country" options={mockOptions} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.getByRole("combobox")).toHaveClass("bg-gray-100");
  });

  it("marks options as disabled", () => {
    render(<MobileFormSelect label="Country" options={mockOptions} />);
    expect(screen.getByRole("option", { name: "Option 3" })).toBeDisabled();
  });

  it("sets aria-invalid when error is present", () => {
    render(
      <MobileFormSelect label="Country" options={mockOptions} error="Invalid" />
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("has minimum height of 48px for touch target", () => {
    render(<MobileFormSelect label="Country" options={mockOptions} />);
    expect(screen.getByRole("combobox")).toHaveClass("min-h-[48px]");
  });

  it("renders chevron icon", () => {
    render(<MobileFormSelect label="Country" options={mockOptions} />);
    // Chevron is in a div that's pointer-events-none
    const chevronContainer = document.querySelector(".pointer-events-none");
    expect(chevronContainer).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(
      <MobileFormSelect label="Country" options={mockOptions} ref={ref} />
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("handles onChange correctly", async () => {
    const handleChange = jest.fn();
    render(
      <MobileFormSelect
        label="Country"
        options={mockOptions}
        onChange={handleChange}
      />
    );

    await userEvent.selectOptions(screen.getByRole("combobox"), "opt2");
    expect(handleChange).toHaveBeenCalled();
  });
});
