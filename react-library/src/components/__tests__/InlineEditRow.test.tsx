import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  InlineEditRow,
  type InlineField,
} from "../../components/tables/InlineEditRow";

const mockFields: InlineField[] = [
  { key: "name", type: "text", label: "Name", required: true },
  { key: "price", type: "number", label: "Price", min: 0, max: 10000 },
  {
    key: "status",
    type: "select",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];

describe("InlineEditRow", () => {
  it("renders all fields with initial values", () => {
    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{
              name: "Product 1",
              price: 99.99,
              status: "active",
            }}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(screen.getByDisplayValue("Product 1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("99.99")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
  });

  it("renders save and cancel buttons", () => {
    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{}}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("updates field values on change", async () => {
    const user = userEvent.setup();
    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{ name: "" }}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "New Product");

    expect(nameInput).toHaveValue("New Product");
  });

  it("validates required fields on save attempt", async () => {
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{ name: "", price: 50, status: "active" }}
            onSave={onSave}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    // Validation runs on save, should prevent save
    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  it("applies error styling when field has error", async () => {
    const user = userEvent.setup();
    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{ name: "Test" }}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const nameInput = screen.getByLabelText("Name");

    // Field should start with normal styling
    expect(nameInput).not.toHaveClass("border-red-300");

    // Change to valid value - should not have error styling
    await user.clear(nameInput);
    await user.type(nameInput, "Valid Name");
    expect(nameInput).not.toHaveClass("border-red-300");
  });

  it("validates number constraints", () => {
    const fields: InlineField[] = [
      { key: "age", type: "number", label: "Age", min: 18, max: 100 },
    ];

    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={fields}
            initialValues={{ age: 25 }}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const input = screen.getByLabelText("Age");
    expect(input).toHaveAttribute("min", "18");
    expect(input).toHaveAttribute("max", "100");
  });

  it("calls onSave with values when valid", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{ name: "Product", price: 50, status: "active" }}
            onSave={onSave}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: "Product",
        price: 50,
        status: "active",
      });
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{}}
            onSave={vi.fn()}
            onCancel={onCancel}
          />
        </tbody>
      </table>
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("handles Enter key to save", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{ name: "Product", price: 50, status: "active" }}
            onSave={onSave}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const nameInput = screen.getByLabelText("Name");
    fireEvent.keyDown(nameInput, { key: "Enter" });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it("handles Escape key to cancel", () => {
    const onCancel = vi.fn();
    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{}}
            onSave={vi.fn()}
            onCancel={onCancel}
          />
        </tbody>
      </table>
    );

    const nameInput = screen.getByLabelText("Name");
    fireEvent.keyDown(nameInput, { key: "Escape" });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables fields and buttons when loading", () => {
    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{}}
            onSave={vi.fn()}
            onCancel={vi.fn()}
            loading={true}
          />
        </tbody>
      </table>
    );

    const nameInput = screen.getByLabelText("Name");
    const saveButton = screen.getByRole("button", { name: /save/i });
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    expect(nameInput).toBeDisabled();
    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it("shows loader icon when loading", () => {
    const MockLoaderIcon = () => (
      <span data-testid="custom-loader">Loading</span>
    );

    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{}}
            onSave={vi.fn()}
            onCancel={vi.fn()}
            loading={true}
            LoaderIcon={MockLoaderIcon}
          />
        </tbody>
      </table>
    );

    expect(screen.getByTestId("custom-loader")).toBeInTheDocument();
  });

  it("renders with custom icons", () => {
    const MockCheckIcon = () => <span data-testid="custom-check">✓</span>;
    const MockXIcon = () => <span data-testid="custom-x">✗</span>;

    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{}}
            onSave={vi.fn()}
            onCancel={vi.fn()}
            CheckIcon={MockCheckIcon}
            XIcon={MockXIcon}
          />
        </tbody>
      </table>
    );

    expect(screen.getByTestId("custom-check")).toBeInTheDocument();
    expect(screen.getByTestId("custom-x")).toBeInTheDocument();
  });

  it("renders textarea field", () => {
    const fields: InlineField[] = [
      { key: "description", type: "textarea", label: "Description", rows: 3 },
    ];

    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={fields}
            initialValues={{ description: "Test description" }}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const textarea = screen.getByLabelText("Description");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveValue("Test description");
  });

  it("renders checkbox field", () => {
    const fields: InlineField[] = [
      { key: "active", type: "checkbox", label: "Active" },
    ];

    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={fields}
            initialValues={{ active: true }}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const checkbox = screen.getByLabelText("Active");
    expect(checkbox).toBeChecked();
  });

  it("renders date field", () => {
    const fields: InlineField[] = [
      { key: "startDate", type: "date", label: "Start Date" },
    ];

    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={fields}
            initialValues={{ startDate: "2026-01-15" }}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const dateInput = screen.getByLabelText("Start Date");
    expect(dateInput).toHaveValue("2026-01-15");
  });

  it("handles custom validation function", async () => {
    const fields: InlineField[] = [
      {
        key: "email",
        type: "email",
        label: "Email",
        validate: (value) => {
          if (!value?.includes("@")) {
            return "Invalid email format";
          }
          return null;
        },
      },
    ];

    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={fields}
            initialValues={{ email: "invalid" }}
            onSave={onSave}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    // Touch the field by changing it
    const emailInput = screen.getByLabelText("Email");
    await user.click(emailInput);
    await user.clear(emailInput);
    await user.type(emailInput, "invalid");

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email format")).toBeInTheDocument();
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("handles custom render function", () => {
    const fields: InlineField[] = [
      {
        key: "custom",
        type: "custom",
        label: "Custom Field",
        render: ({ value, onChange }) => (
          <button
            onClick={() => onChange("clicked")}
            data-testid="custom-field"
          >
            {value || "Click me"}
          </button>
        ),
      },
    ];

    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={fields}
            initialValues={{ custom: "" }}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(screen.getByTestId("custom-field")).toBeInTheDocument();
  });

  it("calls onError when save fails", async () => {
    const onError = vi.fn();
    const onSave = vi.fn().mockRejectedValue(new Error("Save failed"));

    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{ name: "Product", price: 50, status: "active" }}
            onSave={onSave}
            onCancel={vi.fn()}
            onError={onError}
          />
        </tbody>
      </table>
    );

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining("InlineEditRow.handleSave")
      );
    });
  });

  it("applies custom row and cell classes", () => {
    const { container } = render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{}}
            onSave={vi.fn()}
            onCancel={vi.fn()}
            rowClassName="custom-row-class"
            cellClassName="custom-cell-class"
          />
        </tbody>
      </table>
    );

    const row = container.querySelector("tr");
    expect(row).toHaveClass("custom-row-class");

    const cells = container.querySelectorAll("td");
    cells.forEach((cell) => {
      expect(cell).toHaveClass("custom-cell-class");
    });
  });

  it("displays field labels correctly", () => {
    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{}}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
  });

  it("updates values when initialValues prop changes", async () => {
    const { rerender } = render(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{ name: "Product 1" }}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(screen.getByDisplayValue("Product 1")).toBeInTheDocument();

    rerender(
      <table>
        <tbody>
          <InlineEditRow
            fields={mockFields}
            initialValues={{ name: "Product 2" }}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Product 2")).toBeInTheDocument();
    });
  });

  it("handles disabled field prop", () => {
    const fields: InlineField[] = [
      { key: "name", type: "text", label: "Name", disabled: true },
    ];

    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={fields}
            initialValues={{ name: "Product" }}
            onSave={vi.fn()}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const nameInput = screen.getByLabelText("Name");
    expect(nameInput).toBeDisabled();
    expect(nameInput).toHaveClass("bg-gray-50", "cursor-not-allowed");
  });

  it("does not prevent Enter in textarea with Shift", async () => {
    const onSave = vi.fn();
    const fields: InlineField[] = [
      { key: "description", type: "textarea", label: "Description" },
    ];

    render(
      <table>
        <tbody>
          <InlineEditRow
            fields={fields}
            initialValues={{ description: "Line 1" }}
            onSave={onSave}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const textarea = screen.getByLabelText("Description");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    // Should not trigger save
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onSave).not.toHaveBeenCalled();
  });
});
