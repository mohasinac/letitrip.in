import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddressesPage from "./page";
import { addressService } from "@/services/address.service";
import type { AddressFE } from "@/types/frontend/address.types";

// Mock dependencies
jest.mock("@/services/address.service", () => ({
  addressService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    setDefault: jest.fn(),
  },
}));

jest.mock("@/components/auth/AuthGuard", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/common/ConfirmDialog", () => ({
  ConfirmDialog: ({
    isOpen,
    title,
    description,
    onConfirm,
    onClose,
    confirmLabel,
  }: {
    isOpen: boolean;
    title?: string;
    description?: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmLabel?: string;
  }) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        {title && <h2>{title}</h2>}
        {description && <p>{description}</p>}
        <button onClick={onConfirm}>{confirmLabel || "Confirm"}</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

jest.mock("@/components/common/FormModal", () => ({
  FormModal: ({
    isOpen,
    onClose,
    title,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="form-modal">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

const mockAddresses: AddressFE[] = [
  {
    id: "addr1",
    userId: "user123",
    fullName: "John Doe",
    phoneNumber: "+91 98765 43210",
    addressLine1: "123 Main Street",
    addressLine2: "Near Central Park",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    addressType: "home",
    isDefault: true,
    formattedAddress:
      "123 Main Street, Near Central Park, Mumbai, Maharashtra 400001",
    shortAddress: "Mumbai, Maharashtra",
    typeLabel: "Home",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "addr2",
    userId: "user123",
    fullName: "Jane Smith",
    phoneNumber: "+91 98765 12345",
    addressLine1: "456 Park Avenue",
    addressLine2: "",
    city: "Delhi",
    state: "Delhi",
    postalCode: "110001",
    country: "India",
    addressType: "work",
    isDefault: false,
    formattedAddress: "456 Park Avenue, Delhi, Delhi 110001",
    shortAddress: "Delhi, Delhi",
    typeLabel: "Work",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

describe("AddressesPage", () => {
  const mockGetAll = addressService.getAll as jest.Mock;
  const mockCreate = addressService.create as jest.Mock;
  const mockUpdate = addressService.update as jest.Mock;
  const mockDelete = addressService.delete as jest.Mock;
  const mockSetDefault = addressService.setDefault as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAll.mockResolvedValue(mockAddresses);
  });

  describe("Basic Rendering", () => {
    it("should render page title", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        expect(screen.getByText("My Addresses")).toBeInTheDocument();
      });
    });

    it("should render page description", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        expect(
          screen.getByText("Manage your shipping addresses for faster checkout")
        ).toBeInTheDocument();
      });
    });

    it("should render Add New Address button", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        const buttons = screen.getAllByText("Add New Address");
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it("should render MapPin icon in empty state", async () => {
      mockGetAll.mockResolvedValue([]);
      render(<AddressesPage />);
      await waitFor(() => {
        expect(screen.getByText("No addresses yet")).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner initially", () => {
      mockGetAll.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );
      render(<AddressesPage />);
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("should hide loading spinner after data loads", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        expect(document.querySelector(".animate-spin")).not.toBeInTheDocument();
      });
    });
  });

  describe("Address List Display", () => {
    it("should display all addresses", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      });
    });

    it("should display full address details", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        expect(screen.getByText("123 Main Street")).toBeInTheDocument();
        expect(screen.getByText("Near Central Park")).toBeInTheDocument();
        expect(
          screen.getByText("Mumbai, Maharashtra 400001")
        ).toBeInTheDocument();
      });
    });

    it("should display phone numbers", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        expect(screen.getByText("+91 98765 43210")).toBeInTheDocument();
        expect(screen.getByText("+91 98765 12345")).toBeInTheDocument();
      });
    });

    it("should show default badge on default address", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        expect(screen.getByText("Default")).toBeInTheDocument();
      });
    });

    it("should render addresses in grid layout", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        const grid = document.querySelector(".grid.md\\:grid-cols-2");
        expect(grid).toBeInTheDocument();
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no addresses", async () => {
      mockGetAll.mockResolvedValue([]);
      render(<AddressesPage />);
      await waitFor(() => {
        expect(screen.getByText("No addresses yet")).toBeInTheDocument();
      });
    });

    it("should show empty state description", async () => {
      mockGetAll.mockResolvedValue([]);
      render(<AddressesPage />);
      await waitFor(() => {
        expect(
          screen.getByText("Add your first address to make checkout easier")
        ).toBeInTheDocument();
      });
    });

    it("should show Add Address button in empty state", async () => {
      mockGetAll.mockResolvedValue([]);
      render(<AddressesPage />);
      await waitFor(() => {
        expect(screen.getByText("Add Address")).toBeInTheDocument();
      });
    });
  });

  describe("Add Address Form", () => {
    it("should open add address modal", async () => {
      const user = userEvent.setup();
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("My Addresses")).toBeInTheDocument();
      });

      const buttons = screen.getAllByText("Add New Address");
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getByTestId("form-modal")).toBeInTheDocument();
        const modal = screen.getByTestId("form-modal");
        expect(within(modal).getByText("Add New Address")).toBeInTheDocument();
      });
    });

    it("should display all form fields", async () => {
      const user = userEvent.setup();
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("My Addresses")).toBeInTheDocument();
      });

      const buttons = screen.getAllByText("Add New Address");
      await user.click(buttons[0]);

      await waitFor(() => {
        const modal = screen.getByTestId("form-modal");
        expect(
          within(modal).getByPlaceholderText("John Doe")
        ).toBeInTheDocument();
        expect(
          within(modal).getByPlaceholderText("+91 98765 43210")
        ).toBeInTheDocument();
        expect(
          within(modal).getByPlaceholderText("House/Flat No., Street Name")
        ).toBeInTheDocument();
      });
    });

    it("should submit new address", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({ id: "new-addr" });
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("My Addresses")).toBeInTheDocument();
      });

      const buttons = screen.getAllByText("Add New Address");
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getByTestId("form-modal")).toBeInTheDocument();
      });

      const modal = screen.getByTestId("form-modal");
      const nameInput = within(modal).getByPlaceholderText("John Doe");
      const phoneInput = within(modal).getByPlaceholderText("+91 98765 43210");
      const addressInput = within(modal).getByPlaceholderText(
        "House/Flat No., Street Name"
      );
      const cityInputs = within(modal).getAllByRole("textbox");
      const cityInput = cityInputs.find((input) =>
        input
          .closest("div")
          ?.querySelector("label")
          ?.textContent?.includes("City")
      );
      const stateInput = cityInputs.find((input) =>
        input
          .closest("div")
          ?.querySelector("label")
          ?.textContent?.includes("State")
      );
      const postalInput = cityInputs.find((input) =>
        input
          .closest("div")
          ?.querySelector("label")
          ?.textContent?.includes("Postal")
      );

      await user.clear(nameInput);
      await user.type(nameInput, "Test User");
      await user.clear(phoneInput);
      await user.type(phoneInput, "+91 99999 99999");
      await user.type(addressInput, "123 Test Street");
      if (cityInput) await user.type(cityInput, "Mumbai");
      if (stateInput) await user.type(stateInput, "Maharashtra");
      if (postalInput) await user.type(postalInput, "400001");

      const submitButton = within(modal).getByRole("button", {
        name: /add address/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalled();
      });
    });
  });

  describe("Edit Address", () => {
    it("should open edit modal with pre-filled data", async () => {
      const user = userEvent.setup();
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole("button");
      const editButton = editButtons.find((btn) => btn.querySelector("svg"));

      if (editButton) {
        await user.click(editButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId("form-modal")).toBeInTheDocument();
      });
    });

    it("should update existing address", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({ success: true });
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole("button");
      const editButton = editButtons.find(
        (btn) =>
          btn.className.includes("border-gray-300") && btn.querySelector("svg")
      );

      if (editButton) {
        await user.click(editButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId("form-modal")).toBeInTheDocument();
      });

      const modal = screen.getByTestId("form-modal");
      const submitButton = within(modal).getByRole("button", {
        name: /update address/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled();
      });
    });
  });

  describe("Delete Address", () => {
    it("should open delete confirmation dialog", async () => {
      const user = userEvent.setup();
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) =>
        btn.className.includes("border-red-300")
      );

      if (deleteButton) {
        await user.click(deleteButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      });
    });

    it("should delete address on confirmation", async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue({ success: true });
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) =>
        btn.className.includes("border-red-300")
      );

      if (deleteButton) {
        await user.click(deleteButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Delete");
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalled();
      });
    });

    it("should close dialog without deleting on cancel", async () => {
      const user = userEvent.setup();
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) =>
        btn.className.includes("border-red-300")
      );

      if (deleteButton) {
        await user.click(deleteButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      });

      const cancelButton = within(
        screen.getByTestId("confirm-dialog")
      ).getByText("Cancel");
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
      });
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe("Set Default Address", () => {
    it("should show Set as Default button for non-default addresses", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        expect(screen.getByText("Set as Default")).toBeInTheDocument();
      });
    });

    it("should not show Set as Default button for default address", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        const buttons = screen.queryAllByText("Set as Default");
        expect(buttons.length).toBe(1); // Only one non-default address
      });
    });

    it("should call setDefault when button clicked", async () => {
      const user = userEvent.setup();
      mockSetDefault.mockResolvedValue({ success: true });
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("Set as Default")).toBeInTheDocument();
      });

      const button = screen.getByText("Set as Default");
      await user.click(button);

      await waitFor(() => {
        expect(mockSetDefault).toHaveBeenCalledWith("addr2");
      });
    });

    it("should reload addresses after setting default", async () => {
      const user = userEvent.setup();
      mockSetDefault.mockResolvedValue({ success: true });
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("Set as Default")).toBeInTheDocument();
      });

      mockGetAll.mockClear();
      const button = screen.getByText("Set as Default");
      await user.click(button);

      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle load error gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockGetAll.mockRejectedValue(new Error("Load failed"));
      render(<AddressesPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to load addresses:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it("should handle create error", async () => {
      const user = userEvent.setup();
      const alertSpy = jest.spyOn(window, "alert").mockImplementation();
      mockCreate.mockRejectedValue(new Error("Create failed"));

      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("My Addresses")).toBeInTheDocument();
      });

      const buttons = screen.getAllByText("Add New Address");
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getByTestId("form-modal")).toBeInTheDocument();
      });

      const modal = screen.getByTestId("form-modal");
      const nameInput = within(modal).getByPlaceholderText("John Doe");
      const phoneInput = within(modal).getByPlaceholderText("+91 98765 43210");
      const addressInput = within(modal).getByPlaceholderText(
        "House/Flat No., Street Name"
      );
      const cityInputs = within(modal).getAllByRole("textbox");
      const cityInput = cityInputs.find((input) =>
        input
          .closest("div")
          ?.querySelector("label")
          ?.textContent?.includes("City")
      );
      const stateInput = cityInputs.find((input) =>
        input
          .closest("div")
          ?.querySelector("label")
          ?.textContent?.includes("State")
      );
      const postalInput = cityInputs.find((input) =>
        input
          .closest("div")
          ?.querySelector("label")
          ?.textContent?.includes("Postal")
      );

      await user.type(nameInput, "Test User");
      await user.type(phoneInput, "+91 99999 99999");
      await user.type(addressInput, "123 Test Street");
      if (cityInput) await user.type(cityInput, "Mumbai");
      if (stateInput) await user.type(stateInput, "Maharashtra");
      if (postalInput) await user.type(postalInput, "400001");

      const submitButton = within(modal).getByRole("button", {
        name: /add address/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          "Failed to save address. Please try again."
        );
      });

      alertSpy.mockRestore();
    });

    it("should handle delete error", async () => {
      const user = userEvent.setup();
      const alertSpy = jest.spyOn(window, "alert").mockImplementation();
      mockDelete.mockRejectedValue(new Error("Delete failed"));

      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) =>
        btn.className.includes("border-red-300")
      );

      if (deleteButton) {
        await user.click(deleteButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Delete");
      await user.click(confirmButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          "Failed to delete address. Please try again."
        );
      });

      alertSpy.mockRestore();
    });

    it("should handle setDefault error silently", async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockSetDefault.mockRejectedValue(new Error("SetDefault failed"));

      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("Set as Default")).toBeInTheDocument();
      });

      const button = screen.getByText("Set as Default");
      await user.click(button);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to set default address:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Address Type Badges", () => {
    it("should display address type in form", async () => {
      const user = userEvent.setup();
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("My Addresses")).toBeInTheDocument();
      });

      const buttons = screen.getAllByText("Add New Address");
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getByTestId("form-modal")).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation", () => {
    it("should show required fields", async () => {
      const user = userEvent.setup();
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("My Addresses")).toBeInTheDocument();
      });

      const buttons = screen.getAllByText("Add New Address");
      await user.click(buttons[0]);

      await waitFor(() => {
        const modal = screen.getByTestId("form-modal");
        const requiredMarkers = within(modal).getAllByText("*");
        expect(requiredMarkers.length).toBeGreaterThan(0);
      });
    });

    it("should set first address as default by default", async () => {
      const user = userEvent.setup();
      mockGetAll.mockResolvedValue([]);
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("No addresses yet")).toBeInTheDocument();
      });

      const button = screen.getByText("Add Address");
      await user.click(button);

      await waitFor(() => {
        const modal = screen.getByTestId("form-modal");
        const checkbox = within(modal).getByLabelText("Set as default address");
        expect(checkbox).toBeChecked();
      });
    });
  });

  describe("Styling & Layout", () => {
    it("should apply grid layout for addresses", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        const grid = document.querySelector(".grid.md\\:grid-cols-2");
        expect(grid).toBeInTheDocument();
      });
    });

    it("should highlight default address with ring", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        const cards = document.querySelectorAll(".ring-2.ring-blue-500");
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it("should render responsive container", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        expect(
          document.querySelector(".container.mx-auto")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Integration", () => {
    it("should call getAll on mount", async () => {
      render(<AddressesPage />);
      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalledTimes(1);
      });
    });

    it("should reload addresses after create", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({ id: "new-addr" });
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("My Addresses")).toBeInTheDocument();
      });

      mockGetAll.mockClear();

      const buttons = screen.getAllByText("Add New Address");
      await user.click(buttons[0]);

      await waitFor(() => {
        expect(screen.getByTestId("form-modal")).toBeInTheDocument();
      });

      const modal = screen.getByTestId("form-modal");
      const nameInput = within(modal).getByPlaceholderText("John Doe");
      const phoneInput = within(modal).getByPlaceholderText("+91 98765 43210");
      const addressInput = within(modal).getByPlaceholderText(
        "House/Flat No., Street Name"
      );
      const cityInputs = within(modal).getAllByRole("textbox");
      const cityInput = cityInputs.find((input) =>
        input
          .closest("div")
          ?.querySelector("label")
          ?.textContent?.includes("City")
      );
      const stateInput = cityInputs.find((input) =>
        input
          .closest("div")
          ?.querySelector("label")
          ?.textContent?.includes("State")
      );
      const postalInput = cityInputs.find((input) =>
        input
          .closest("div")
          ?.querySelector("label")
          ?.textContent?.includes("Postal")
      );

      await user.type(nameInput, "Test User");
      await user.type(phoneInput, "+91 99999 99999");
      await user.type(addressInput, "123 Test Street");
      if (cityInput) await user.type(cityInput, "Mumbai");
      if (stateInput) await user.type(stateInput, "Maharashtra");
      if (postalInput) await user.type(postalInput, "400001");

      const submitButton = within(modal).getByRole("button", {
        name: /add address/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalledTimes(1);
      });
    });

    it("should reload addresses after delete", async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue({ success: true });
      render(<AddressesPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      mockGetAll.mockClear();

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) =>
        btn.className.includes("border-red-300")
      );

      if (deleteButton) {
        await user.click(deleteButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Delete");
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalledTimes(1);
      });
    });
  });
});
