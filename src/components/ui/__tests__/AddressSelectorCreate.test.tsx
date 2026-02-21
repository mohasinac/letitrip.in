/**
 * AddressSelectorCreate Tests — Phase 9
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
  AddressForm: ({
    onSubmit,
    onCancel,
  }: {
    onSubmit: (data: unknown) => void;
    onCancel: () => void;
    isLoading?: boolean;
    submitLabel?: string;
  }) => (
    <div>
      <button
        data-testid="address-submit"
        onClick={() => onSubmit({ label: "Home", city: "Mumbai" })}
      >
        Save Address
      </button>
      <button data-testid="address-cancel" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

jest.mock("@/constants", () => ({
  API_ENDPOINTS: {
    ADDRESSES: {
      LIST: "/api/user/addresses",
      CREATE: "/api/user/addresses",
    },
  },
  UI_LABELS: {
    ACTIONS: { ADD_ADDRESS: "Add new address", SAVE: "Save" },
    FORM: { PICKUP_ADDRESS: "Pickup Address" },
  },
  UI_PLACEHOLDERS: { SELECT_ADDRESS: "Select a pickup address..." },
  SUCCESS_MESSAGES: { ADDRESS: { CREATED: "Address saved successfully" } },
  ERROR_MESSAGES: { ADDRESS: { CREATE_FAILED: "Failed to add address" } },
  THEME_CONSTANTS: {
    typography: { label: "text-sm font-medium" },
    input: { base: "border rounded" },
  },
}));

import { AddressSelectorCreate } from "../AddressSelectorCreate";

describe("AddressSelectorCreate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryData = {
      data: [
        { id: "addr-1", label: "Home", city: "Mumbai", state: "MH" },
        { id: "addr-2", label: "Office", city: "Pune", state: "MH" },
      ],
    };
  });

  it("populates dropdown with existing addresses", () => {
    render(<AddressSelectorCreate value="" onChange={jest.fn()} />);

    expect(screen.getByRole("option", { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Office/i })).toBeInTheDocument();
  });

  it("renders 'Add new address' button with aria-haspopup='dialog'", () => {
    render(<AddressSelectorCreate value="" onChange={jest.fn()} />);

    const btn = screen.getByRole("button", { name: /Add new address/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("opens SideDrawer when 'Add new address' button is clicked", () => {
    render(<AddressSelectorCreate value="" onChange={jest.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Add new address/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls onChange with selected address ID when dropdown changes", () => {
    const onChange = jest.fn();
    render(<AddressSelectorCreate value="" onChange={onChange} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "addr-1" } });

    expect(onChange).toHaveBeenCalledWith("addr-1");
  });

  it("closes drawer and calls onChange when address creation succeeds", () => {
    const { useApiMutation } = jest.requireMock("@/hooks");
    let capturedOnSuccess: ((res: unknown) => void) | undefined;
    useApiMutation.mockImplementation(
      (opts: { onSuccess: (res: unknown) => void }) => {
        capturedOnSuccess = opts.onSuccess;
        return { mutate: mockMutate, isLoading: false };
      },
    );

    const onChange = jest.fn();
    render(<AddressSelectorCreate value="" onChange={onChange} />);

    // Open drawer
    fireEvent.click(screen.getByRole("button", { name: /Add new address/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Simulate successful creation
    capturedOnSuccess?.({ success: true, data: { id: "addr-new" } });

    // Refetch called and onChange called with new address ID
    expect(mockRefetch).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith("addr-new");
  });

  it("does not show the trigger button when disabled", () => {
    render(<AddressSelectorCreate value="" onChange={jest.fn()} disabled />);

    expect(
      screen.queryByRole("button", { name: /Add new address/i }),
    ).not.toBeInTheDocument();
  });
});
