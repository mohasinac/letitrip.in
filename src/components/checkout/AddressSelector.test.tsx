import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddressSelector } from "./AddressSelector";
import { addressService } from "@/services/address.service";
import type { AddressFE } from "@/types/frontend/address.types";

// Mock address service
jest.mock("@/services/address.service");

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Plus: ({ className, ...props }: any) => (
    <svg data-testid="plus-icon" className={className} {...props} />
  ),
  MapPin: ({ className, ...props }: any) => (
    <svg data-testid="mappin-icon" className={className} {...props} />
  ),
  Edit2: ({ className, ...props }: any) => (
    <svg data-testid="edit-icon" className={className} {...props} />
  ),
  Trash2: ({ className, ...props }: any) => (
    <svg data-testid="trash-icon" className={className} {...props} />
  ),
  Check: ({ className, ...props }: any) => (
    <svg data-testid="check-icon" className={className} {...props} />
  ),
}));

// Mock Confirm Dialog
jest.mock("@/components/common/ConfirmDialog", () => ({
  ConfirmDialog: ({ isOpen, onClose, onConfirm, title, description }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="confirm-dialog">
        <h3>{title}</h3>
        <p>{description}</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm} data-testid="confirm-button">
          Confirm
        </button>
      </div>
    );
  },
}));

// Mock AddressForm
jest.mock("./AddressForm", () => ({
  AddressForm: ({ addressId, onClose }: any) => (
    <div data-testid="address-form">
      <p>Address Form {addressId ? `(Edit: ${addressId})` : "(New)"}</p>
      <button onClick={onClose}>Close Form</button>
    </div>
  ),
}));

const mockAddresses: AddressFE[] = [
  {
    id: "addr-1",
    userId: "user-1",
    fullName: "John Doe",
    phoneNumber: "9876543210",
    addressLine1: "123 Main St",
    addressLine2: "Apt 4B",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    addressType: "home",
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    formattedAddress: "123 Main St, Apt 4B, Mumbai, Maharashtra 400001, India",
    shortAddress: "Mumbai, Maharashtra",
    typeLabel: "Home",
  },
  {
    id: "addr-2",
    userId: "user-1",
    fullName: "Jane Smith",
    phoneNumber: "8765432109",
    addressLine1: "456 Park Ave",
    addressLine2: "",
    city: "Delhi",
    state: "Delhi",
    postalCode: "110001",
    country: "India",
    addressType: "work",
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    formattedAddress: "456 Park Ave, Delhi, Delhi 110001, India",
    shortAddress: "Delhi, Delhi",
    typeLabel: "Work",
  },
];

describe("AddressSelector", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (addressService.getAll as jest.Mock).mockResolvedValue(mockAddresses);
    (addressService.delete as jest.Mock).mockResolvedValue(undefined);
  });

  describe("Loading State", () => {
    it("renders loading skeleton", () => {
      (addressService.getAll as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      // Should render 2 skeleton items
      const skeletons = screen
        .getAllByRole("generic")
        .filter((el) => el.className.includes("animate-pulse"));
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("loads addresses on mount", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(addressService.getAll).toHaveBeenCalled();
      });
    });
  });

  describe("Basic Rendering", () => {
    it("renders shipping address header", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Shipping Address")).toBeInTheDocument();
      });
    });

    it("renders billing address header", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="billing"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Billing Address")).toBeInTheDocument();
      });
    });

    it("renders Add New button", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Add New")).toBeInTheDocument();
        expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
      });
    });

    it("renders all addresses", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      });
    });
  });

  describe("Address Display", () => {
    it("displays full address information", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("9876543210")).toBeInTheDocument();
        expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
        expect(screen.getByText(/Mumbai/)).toBeInTheDocument();
        expect(screen.getByText(/Maharashtra/)).toBeInTheDocument();
      });
    });

    it("displays default badge on default address", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Default")).toBeInTheDocument();
      });
    });

    it("does not show addressLine2 if empty", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const janeAddress = screen.getByText(/456 Park Ave/);
        expect(janeAddress.textContent).not.toContain(", ,");
      });
    });
  });

  describe("Address Selection", () => {
    it("auto-selects default address", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith("addr-1");
      });
    });

    it("auto-selects first address if no default", async () => {
      const noDefaultAddresses = mockAddresses.map((addr) => ({
        ...addr,
        isDefault: false,
      }));
      (addressService.getAll as jest.Mock).mockResolvedValue(
        noDefaultAddresses
      );

      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith("addr-1");
      });
    });

    it("displays check icon on selected address", async () => {
      render(
        <AddressSelector
          selectedId="addr-1"
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("check-icon")).toBeInTheDocument();
      });
    });

    it("calls onSelect when address is clicked", async () => {
      render(
        <AddressSelector
          selectedId="addr-1"
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const janeAddress = screen.getByText("Jane Smith").closest("div");
        fireEvent.click(janeAddress!);
      });

      expect(mockOnSelect).toHaveBeenCalledWith("addr-2");
    });

    it("applies selected styling to selected address", async () => {
      render(
        <AddressSelector
          selectedId="addr-1"
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        // Find the address card container (multiple nested divs, need the outer one with border)
        const addressCards = screen.getByText("John Doe").closest(".border-2");
        expect(addressCards).toHaveClass("border-primary");
      });
    });

    it("applies hover styling to non-selected addresses", async () => {
      render(
        <AddressSelector
          selectedId="addr-1"
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        // Find the address card container (multiple nested divs, need the outer one with border)
        const addressCard = screen.getByText("Jane Smith").closest(".border-2");
        expect(addressCard).toHaveClass("border-gray-200");
      });
    });
  });

  describe("Empty State", () => {
    it("renders empty state when no addresses", async () => {
      (addressService.getAll as jest.Mock).mockResolvedValue([]);

      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("No addresses saved")).toBeInTheDocument();
        expect(screen.getByTestId("mappin-icon")).toBeInTheDocument();
      });
    });

    it("renders Add Address button in empty state", async () => {
      (addressService.getAll as jest.Mock).mockResolvedValue([]);

      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Add Address")).toBeInTheDocument();
      });
    });
  });

  describe("Add New Address", () => {
    it("opens form when Add New is clicked", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const addButton = screen.getByText("Add New");
        fireEvent.click(addButton);
      });

      expect(screen.getByTestId("address-form")).toBeInTheDocument();
      expect(screen.getByText("Address Form (New)")).toBeInTheDocument();
    });

    it("reloads addresses when form is closed", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const addButton = screen.getByText("Add New");
        fireEvent.click(addButton);
      });

      // Close the form
      const closeButton = screen.getByText("Close Form");
      fireEvent.click(closeButton);

      await waitFor(() => {
        // getAll should be called again (2nd time)
        expect(addressService.getAll).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Edit Address", () => {
    it("renders Edit button for each address", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const editButtons = screen.getAllByText("Edit");
        expect(editButtons).toHaveLength(2);
      });
    });

    it("opens form with address ID when Edit is clicked", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const editButtons = screen.getAllByText("Edit");
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByTestId("address-form")).toBeInTheDocument();
      expect(
        screen.getByText("Address Form (Edit: addr-1)")
      ).toBeInTheDocument();
    });

    it("does not trigger onSelect when Edit is clicked", async () => {
      render(
        <AddressSelector
          selectedId="addr-2"
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const editButtons = screen.getAllByText("Edit");
        fireEvent.click(editButtons[0]);
      });

      // onSelect is not called during initial load, only on user selection
      // Since addr-2 is selected initially, no auto-selection happens
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe("Delete Address", () => {
    it("renders Delete button for each address", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("Delete");
        expect(deleteButtons).toHaveLength(2);
      });
    });

    it("opens confirmation dialog when Delete is clicked", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("Delete");
        fireEvent.click(deleteButtons[0]);
      });

      expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      expect(screen.getByText("Delete Address")).toBeInTheDocument();
    });

    it("deletes address when confirmed", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("Delete");
        fireEvent.click(deleteButtons[0]);
      });

      const confirmButton = screen.getByTestId("confirm-button");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(addressService.delete).toHaveBeenCalledWith("addr-1");
      });
    });

    it("reloads addresses after deletion", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("Delete");
        fireEvent.click(deleteButtons[0]);
      });

      const confirmButton = screen.getByTestId("confirm-button");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        // getAll should be called again after deletion
        expect(addressService.getAll).toHaveBeenCalledTimes(2);
      });
    });

    it("clears selection when deleting selected address", async () => {
      render(
        <AddressSelector
          selectedId="addr-1"
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("Delete");
        fireEvent.click(deleteButtons[0]);
      });

      const confirmButton = screen.getByTestId("confirm-button");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith("");
      });
    });

    it("does not trigger onSelect when Delete is clicked", async () => {
      render(
        <AddressSelector
          selectedId="addr-2"
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("Delete");
        fireEvent.click(deleteButtons[0]);
      });

      // onSelect is not called during initial load, only on user selection
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("handles load error gracefully", async () => {
      (addressService.getAll as jest.Mock).mockRejectedValue(
        new Error("Load failed")
      );
      console.error = jest.fn();

      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Failed to load addresses:",
          expect.any(Error)
        );
      });
    });

    it("handles delete error gracefully", async () => {
      (addressService.delete as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );
      console.error = jest.fn();

      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("Delete");
        fireEvent.click(deleteButtons[0]);
      });

      const confirmButton = screen.getByTestId("confirm-button");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe("Icons", () => {
    it("renders edit icon for edit buttons", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const editIcons = screen.getAllByTestId("edit-icon");
        expect(editIcons).toHaveLength(2);
      });
    });

    it("renders trash icon for delete buttons", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const trashIcons = screen.getAllByTestId("trash-icon");
        expect(trashIcons).toHaveLength(2);
      });
    });
  });

  describe("Accessibility", () => {
    it("renders addresses as clickable elements", async () => {
      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        const addressElements = screen.getAllByText(/John Doe|Jane Smith/);
        addressElements.forEach((el) => {
          // Find the address card container with cursor-pointer class
          const parent = el.closest(".cursor-pointer");
          expect(parent).toHaveClass("cursor-pointer");
        });
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles address with very long text", async () => {
      const longAddress = {
        ...mockAddresses[0],
        addressLine1: "A".repeat(200),
      };
      (addressService.getAll as jest.Mock).mockResolvedValue([longAddress]);

      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        // Long text might be wrapped/broken, so check that part of it exists
        const longText = "A".repeat(200);
        const element = screen.getByText(new RegExp("A{50,}"));
        expect(element).toBeInTheDocument();
      });
    });

    it("handles special characters in address", async () => {
      const specialAddress = {
        ...mockAddresses[0],
        addressLine1: "123 O'Connor St & #456",
      };
      (addressService.getAll as jest.Mock).mockResolvedValue([specialAddress]);

      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/123 O'Connor St & #456/)).toBeInTheDocument();
      });
    });

    it("handles missing optional fields", async () => {
      const minimalAddress = {
        ...mockAddresses[0],
        addressLine2: "",
        country: "",
      };
      (addressService.getAll as jest.Mock).mockResolvedValue([minimalAddress]);

      render(
        <AddressSelector
          selectedId={null}
          onSelect={mockOnSelect}
          type="shipping"
        />
      );

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });
    });
  });
});
