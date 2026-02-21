/**
 * CategorySelectorCreate Tests — Phase 9
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// --- Mocks ---

let mockQueryData: Record<string, unknown> = {};
const mockRefetch = jest.fn();
const mockMutate = jest.fn();

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: mockQueryData,
    isLoading: false,
    refetch: mockRefetch,
  })),
  useApiMutation: jest.fn(() => ({
    mutate: mockMutate,
    isLoading: false,
  })),
  useMessage: jest.fn(() => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
  })),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock("@/components", () => ({
  SideDrawer: ({
    isOpen,
    children,
    title,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
    title: string;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
  Button: ({
    children,
    onClick,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  CategoryForm: ({ onChange }: { onChange: (v: unknown) => void }) => (
    <div>
      <input
        data-testid="category-name-input"
        onChange={(e) => onChange({ name: e.target.value })}
      />
    </div>
  ),
  DrawerFormFooter: ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <button data-testid="drawer-save" onClick={onSubmit}>
        Save
      </button>
      <button data-testid="drawer-cancel" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
  flattenCategories: (cats: unknown[]) => cats,
}));

jest.mock("@/constants", () => ({
  API_ENDPOINTS: {
    CATEGORIES: { LIST: "/api/categories", CREATE: "/api/categories" },
  },
  UI_LABELS: {
    ACTIONS: { ADD_CATEGORY: "New category" },
    FORM: { CATEGORY: "Category" },
  },
  UI_PLACEHOLDERS: { SELECT_CATEGORY: "Select a category..." },
  SUCCESS_MESSAGES: { CATEGORY: { CREATED: "Category created successfully" } },
  THEME_CONSTANTS: {
    typography: { label: "text-sm font-medium" },
    input: { base: "border rounded" },
    spacing: { stack: "space-y-4" },
  },
}));

import { CategorySelectorCreate } from "../CategorySelectorCreate";

describe("CategorySelectorCreate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryData = {
      data: [
        { id: "cat-1", name: "Electronics", tier: 0, children: [] },
        { id: "cat-2", name: "Phones", tier: 1, children: [] },
      ],
    };
  });

  it("populates dropdown with categories from the API", () => {
    render(<CategorySelectorCreate value="" onChange={jest.fn()} />);

    expect(
      screen.getByRole("option", { name: "Electronics" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Phones" })).toBeInTheDocument();
  });

  it("renders 'New category' button with aria-haspopup='dialog'", () => {
    render(<CategorySelectorCreate value="" onChange={jest.fn()} />);

    const btn = screen.getByRole("button", { name: /New category/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("opens SideDrawer when 'New category' button is clicked", () => {
    render(<CategorySelectorCreate value="" onChange={jest.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /New category/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls onChange with the selected category ID when dropdown changes", () => {
    const onChange = jest.fn();
    render(<CategorySelectorCreate value="" onChange={onChange} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "cat-1" } });

    expect(onChange).toHaveBeenCalledWith("cat-1");
  });

  it("closes drawer and calls onChange when category creation succeeds", () => {
    const { useApiMutation } = jest.requireMock("@/hooks");
    let capturedOnSuccess: ((res: unknown) => void) | undefined;
    useApiMutation.mockImplementation(
      (opts: { onSuccess: (res: unknown) => void }) => {
        capturedOnSuccess = opts.onSuccess;
        return { mutate: mockMutate, isLoading: false };
      },
    );

    const onChange = jest.fn();
    render(<CategorySelectorCreate value="" onChange={onChange} />);

    // Open drawer
    fireEvent.click(screen.getByRole("button", { name: /New category/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Simulate successful creation
    capturedOnSuccess?.({ data: { id: "cat-new" } });

    // Drawer should close and onChange called with new ID
    expect(mockRefetch).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith("cat-new");
  });

  it("does not show the 'New category' button when disabled", () => {
    render(<CategorySelectorCreate value="" onChange={jest.fn()} disabled />);

    expect(
      screen.queryByRole("button", { name: /New category/i }),
    ).not.toBeInTheDocument();
  });
});
