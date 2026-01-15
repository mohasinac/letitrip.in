import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InlineEditor } from "../tables/InlineEditor";

describe("InlineEditor", () => {
  it("renders in display mode by default", () => {
    const onSave = vi.fn();
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    expect(screen.getByText("Test Value")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows placeholder when value is empty", () => {
    const onSave = vi.fn();
    render(
      <InlineEditor value="" onSave={onSave} placeholder="Click to edit" />
    );

    expect(screen.getByText("Click to edit")).toBeInTheDocument();
  });

  it("switches to edit mode when clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("Test Value");
  });

  it("switches to edit mode with Enter key", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    const displayButton = screen.getByRole("button", {
      name: /click to edit/i,
    });
    displayButton.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("auto-focuses and selects text when entering edit mode", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));

    const input = screen.getByRole("textbox");
    expect(input).toHaveFocus();
  });

  it("allows editing the value", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "New Value");

    expect(input).toHaveValue("New Value");
  });

  it("calls onSave when save button is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "New Value");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("New Value");
    });
  });

  it("exits edit mode after successful save", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "New Value");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
  });

  it("cancels edit when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "New Value");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Test Value")).toBeInTheDocument();
  });

  it("calls onCancel callback when cancelled", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <InlineEditor value="Test Value" onSave={onSave} onCancel={onCancel} />
    );

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });

  it("saves on Enter key press", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "New Value");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("New Value");
    });
  });

  it("cancels on Escape key press", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "New Value");
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not save if value unchanged", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<InlineEditor value="Test Value" onSave={onSave} required />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("displays error message on save failure", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error("Save failed"));
    render(<InlineEditor value="Test Value" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "New Value");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText("Save failed")).toBeInTheDocument();
    });
  });

  it("calls onError callback on save failure", async () => {
    const user = userEvent.setup();
    const error = new Error("Save failed");
    const onSave = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    render(
      <InlineEditor value="Test Value" onSave={onSave} onError={onError} />
    );

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "New Value");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error, "InlineEditor.handleSave");
    });
  });

  it("supports number type", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<InlineEditor value="42" onSave={onSave} type="number" />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(42);
    await user.clear(input);
    await user.type(input, "100");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("100");
    });
  });

  it("supports textarea type", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<InlineEditor value="Line 1" onSave={onSave} type="textarea" />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "Line 1{Enter}Line 2");

    expect(textarea).toHaveValue("Line 1\nLine 2");
  });

  it("saves textarea on Ctrl+Enter", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<InlineEditor value="Test" onSave={onSave} type="textarea" />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "New text");
    await user.keyboard("{Control>}{Enter}{/Control}");

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("New text");
    });
  });

  it("does not save textarea on Enter alone", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<InlineEditor value="Test" onSave={onSave} type="textarea" />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "{Enter}");

    expect(onSave).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("Test\n");
  });

  it("supports select type", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const options = [
      { label: "Option 1", value: "opt1" },
      { label: "Option 2", value: "opt2" },
    ];
    render(
      <InlineEditor
        value="opt1"
        onSave={onSave}
        type="select"
        options={options}
      />
    );

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "opt2");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("opt2");
    });
  });

  it("disables interaction when disabled", () => {
    const onSave = vi.fn();
    render(<InlineEditor value="Test Value" onSave={onSave} disabled />);

    const displayButton = screen.getByRole("button", {
      name: /click to edit/i,
    });
    expect(displayButton).toHaveAttribute("tabindex", "-1");
    expect(displayButton).toHaveClass("cursor-not-allowed", "opacity-50");
  });

  it("respects maxLength", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<InlineEditor value="" onSave={onSave} maxLength={5} />);

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    const input = screen.getByRole("textbox");
    await user.type(input, "12345");

    expect(screen.getByText("5 / 5")).toBeInTheDocument();
  });

  it("uses custom displayRenderer", () => {
    const onSave = vi.fn();
    const displayRenderer = (value: string) => <strong>Custom: {value}</strong>;
    render(
      <InlineEditor
        value="Test"
        onSave={onSave}
        displayRenderer={displayRenderer}
      />
    );

    expect(screen.getByText("Custom: Test")).toBeInTheDocument();
  });

  it("uses custom icons", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const CustomEditIcon = () => <span data-testid="custom-edit">✏️</span>;
    const CustomSaveIcon = () => <span data-testid="custom-save">✓</span>;
    const CustomCancelIcon = () => <span data-testid="custom-cancel">✗</span>;

    render(
      <InlineEditor
        value="Test"
        onSave={onSave}
        EditIcon={CustomEditIcon}
        SaveIcon={CustomSaveIcon}
        CancelIcon={CustomCancelIcon}
      />
    );

    expect(screen.getByTestId("custom-edit")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /click to edit/i }));
    expect(screen.getByTestId("custom-save")).toBeInTheDocument();
    expect(screen.getByTestId("custom-cancel")).toBeInTheDocument();
  });

  it("uses custom classNames", () => {
    const onSave = vi.fn();
    render(
      <InlineEditor
        value="Test"
        onSave={onSave}
        className="custom-wrapper"
        displayClassName="custom-display"
        inputClassName="custom-input"
      />
    );

    const displayButton = screen.getByRole("button", {
      name: /click to edit/i,
    });
    expect(displayButton).toHaveClass("custom-display");
  });
});
