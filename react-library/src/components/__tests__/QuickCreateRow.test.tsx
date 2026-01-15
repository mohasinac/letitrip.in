import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { InlineField } from "../tables/InlineEditRow";
import { QuickCreateRow } from "../tables/QuickCreateRow";

describe("QuickCreateRow", () => {
  const defaultFields: InlineField[] = [
    { key: "name", type: "text", label: "Name", required: true },
    { key: "price", type: "number", label: "Price", min: 0 },
  ];

  it("renders collapsed by default", () => {
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    expect(
      screen.getByRole("button", { name: /add new item/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("expands when add button is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
  });

  it("uses custom resource name", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow
            fields={defaultFields}
            onSave={onSave}
            resourceName="product"
          />
        </tbody>
      </table>
    );

    expect(
      screen.getByRole("button", { name: /add new product/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add new product/i }));
    expect(
      screen.getByRole("button", { name: /create product/i })
    ).toBeInTheDocument();
  });

  it("handles text field input", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    const nameInput = screen.getByLabelText("Name");

    await user.type(nameInput, "Test Product");
    expect(nameInput).toHaveValue("Test Product");
  });

  it("handles number field input", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    const priceInput = screen.getByLabelText("Price");

    await user.type(priceInput, "99.99");
    expect(priceInput).toHaveValue(99.99);
  });

  it("calls onSave with form values", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    await user.type(screen.getByLabelText("Name"), "Test Product");
    await user.type(screen.getByLabelText("Price"), "99.99");
    await user.click(screen.getByRole("button", { name: /create item/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: "Test Product",
        price: 99.99,
      });
    });
  });

  it("resets form and collapses after successful save", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    await user.type(screen.getByLabelText("Name"), "Test Product");
    await user.click(screen.getByRole("button", { name: /create item/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add new item/i })
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    });
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    const nameInput = screen.getByLabelText("Name");

    // Touch the field by typing and clearing
    await user.type(nameInput, "test");
    await user.clear(nameInput);

    await user.click(screen.getByRole("button", { name: /create item/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });

  it("validates number min/max constraints", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    await user.type(screen.getByLabelText("Name"), "Test");

    const priceInput = screen.getByLabelText("Price");
    await user.type(priceInput, "-10");
    await user.click(screen.getByRole("button", { name: /create item/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Price must be at least 0")).toBeInTheDocument();
  });

  it("handles cancel button", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    await user.type(screen.getByLabelText("Name"), "Test Product");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(
      screen.getByRole("button", { name: /add new item/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("handles keyboard shortcuts - Enter to save", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    const nameInput = screen.getByLabelText("Name");
    await user.type(nameInput, "Test Product");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ name: "Test Product" });
    });
  });

  it("handles keyboard shortcuts - Escape to cancel", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    await user.type(screen.getByLabelText("Name"), "Test Product");
    await user.keyboard("{Escape}");

    expect(
      screen.getByRole("button", { name: /add new item/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("shows loading state", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} loading />
        </tbody>
      </table>
    );

    const addButton = screen.getByRole("button", { name: /add new item/i });
    expect(addButton).toBeDisabled();

    await user.click(addButton);
    // Should not expand when loading
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("disables fields in loading state", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const { rerender } = render(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));

    rerender(
      <table>
        <tbody>
          <QuickCreateRow fields={defaultFields} onSave={onSave} loading />
        </tbody>
      </table>
    );

    expect(screen.getByLabelText("Name")).toBeDisabled();
    expect(screen.getByLabelText("Price")).toBeDisabled();
  });

  it("handles select field", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const fields: InlineField[] = [
      {
        key: "category",
        type: "select",
        label: "Category",
        options: [
          { label: "Electronics", value: "electronics" },
          { label: "Clothing", value: "clothing" },
        ],
      },
    ];

    render(
      <table>
        <tbody>
          <QuickCreateRow fields={fields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    const select = screen.getByLabelText("Category");
    await user.selectOptions(select, "electronics");
    await user.click(screen.getByRole("button", { name: /create item/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ category: "electronics" });
    });
  });

  it("handles checkbox field", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const fields: InlineField[] = [
      { key: "active", type: "checkbox", label: "Active" },
      { key: "name", type: "text", label: "Name", required: true },
    ];

    render(
      <table>
        <tbody>
          <QuickCreateRow fields={fields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    await user.type(screen.getByLabelText("Name"), "Test");
    const checkbox = screen.getByLabelText("Active");
    await user.click(checkbox);
    await user.click(screen.getByRole("button", { name: /create item/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ name: "Test", active: true });
    });
  });

  it("handles date field", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const fields: InlineField[] = [
      { key: "startDate", type: "date", label: "Start Date" },
    ];

    render(
      <table>
        <tbody>
          <QuickCreateRow fields={fields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    const dateInput = screen.getByLabelText("Start Date");
    await user.type(dateInput, "2024-01-15");
    await user.click(screen.getByRole("button", { name: /create item/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ startDate: "2024-01-15" });
    });
  });

  it("handles textarea field", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const fields: InlineField[] = [
      { key: "description", type: "textarea", label: "Description", rows: 3 },
    ];

    render(
      <table>
        <tbody>
          <QuickCreateRow fields={fields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    await user.type(screen.getByLabelText("Description"), "Test description");
    await user.click(screen.getByRole("button", { name: /create item/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ description: "Test description" });
    });
  });

  it("uses default values", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <table>
        <tbody>
          <QuickCreateRow
            fields={defaultFields}
            onSave={onSave}
            defaultValues={{ name: "Default Name", price: 10 }}
          />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    expect(screen.getByLabelText("Name")).toHaveValue("Default Name");
    expect(screen.getByLabelText("Price")).toHaveValue(10);
  });

  it("handles custom validation function", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const fields: InlineField[] = [
      {
        key: "email",
        type: "email",
        label: "Email",
        validate: (value) =>
          value && !value.includes("@") ? "Invalid email" : null,
      },
    ];

    render(
      <table>
        <tbody>
          <QuickCreateRow fields={fields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "invalid");
    await user.click(screen.getByRole("button", { name: /create item/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("calls onError when save fails", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error("Save failed"));
    const onError = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow
            fields={defaultFields}
            onSave={onSave}
            onError={onError}
          />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    await user.type(screen.getByLabelText("Name"), "Test");
    await user.click(screen.getByRole("button", { name: /create item/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        "QuickCreateRow.handleCreate for item"
      );
    });
  });

  it("supports custom render function", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const fields: InlineField[] = [
      {
        key: "custom",
        type: "text",
        label: "Custom",
        render: ({ value, onChange }) => (
          <input
            data-testid="custom-field"
            value={value || ""}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
          />
        ),
      },
    ];

    render(
      <table>
        <tbody>
          <QuickCreateRow fields={fields} onSave={onSave} />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    await user.type(screen.getByTestId("custom-field"), "test");
    await user.click(screen.getByRole("button", { name: /create item/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ custom: "TEST" });
    });
  });

  it("uses custom icons", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const CustomPlusIcon = () => <span data-testid="custom-plus">+</span>;
    const CustomXIcon = () => <span data-testid="custom-x">×</span>;

    render(
      <table>
        <tbody>
          <QuickCreateRow
            fields={defaultFields}
            onSave={onSave}
            PlusIcon={CustomPlusIcon}
            XIcon={CustomXIcon}
          />
        </tbody>
      </table>
    );

    expect(screen.getByTestId("custom-plus")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add new item/i }));
    expect(screen.getByTestId("custom-x")).toBeInTheDocument();
  });

  it("uses custom classNames", () => {
    const onSave = vi.fn();
    render(
      <table>
        <tbody>
          <QuickCreateRow
            fields={defaultFields}
            onSave={onSave}
            collapsedRowClassName="custom-collapsed"
            expandedRowClassName="custom-expanded"
            cellClassName="custom-cell"
          />
        </tbody>
      </table>
    );

    const row = screen.getByRole("row");
    expect(row).toHaveClass("custom-collapsed");
  });
});
