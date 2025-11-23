import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddressForm } from "./AddressForm";
import { addressService } from "@/services/address.service";

// Mock dependencies
jest.mock("@/services/address.service");
jest.mock("lucide-react", () => ({
  X: () => <svg data-testid="x-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
}));

// Mock window.alert
const mockAlert = jest.fn();
global.alert = mockAlert;

describe("AddressForm", () => {
  const mockOnClose = jest.fn();

  const mockExistingAddress = {
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
    addressType: "home" as const,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    formattedAddress: "123 Main St, Apt 4B, Mumbai, Maharashtra 400001, India",
    shortAddress: "Mumbai, Maharashtra",
    typeLabel: "Home",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
  });

  describe("Basic Rendering - Add Mode", () => {
    it("renders add mode with correct title", () => {
      render(<AddressForm onClose={mockOnClose} />);

      expect(screen.getByText("Add New Address")).toBeInTheDocument();
    });

    it("renders all required form fields", () => {
      render(<AddressForm onClose={mockOnClose} />);

      expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("9876543210")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        )
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Mumbai")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Maharashtra")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("400001")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("India")).toBeInTheDocument();
    });

    it("renders optional address line 2", () => {
      render(<AddressForm onClose={mockOnClose} />);

      expect(
        screen.getByPlaceholderText("Area, Street, Sector, Village")
      ).toBeInTheDocument();
      expect(screen.getByText("Address Line 2 (Optional)")).toBeInTheDocument();
    });

    it("renders default address checkbox", () => {
      render(<AddressForm onClose={mockOnClose} />);

      const checkbox = screen.getByLabelText("Set as default address");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it("renders add button", () => {
      render(<AddressForm onClose={mockOnClose} />);

      expect(
        screen.getByRole("button", { name: "Add Address" })
      ).toBeInTheDocument();
    });

    it("renders cancel button", () => {
      render(<AddressForm onClose={mockOnClose} />);

      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });

    it("renders close icon button", () => {
      render(<AddressForm onClose={mockOnClose} />);

      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    });
  });

  describe("Basic Rendering - Edit Mode", () => {
    beforeEach(() => {
      (addressService.getById as jest.Mock).mockResolvedValue(
        mockExistingAddress
      );
    });

    it("renders edit mode with correct title", async () => {
      render(<AddressForm addressId="addr-1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText("Edit Address")).toBeInTheDocument();
      });
    });

    it("shows loading state while fetching address", () => {
      render(<AddressForm addressId="addr-1" onClose={mockOnClose} />);

      expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    });

    it("fetches address data on mount", async () => {
      render(<AddressForm addressId="addr-1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(addressService.getById).toHaveBeenCalledWith("addr-1");
      });
    });

    it("populates form with existing address data", async () => {
      render(<AddressForm addressId="addr-1" onClose={mockOnClose} />);

      await waitFor(() => {
        const fullNameInput = screen.getByPlaceholderText("John Doe");
        expect(fullNameInput).toHaveValue("John Doe");
      });

      expect(screen.getByPlaceholderText("9876543210")).toHaveValue(
        "9876543210"
      );
      expect(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        )
      ).toHaveValue("123 Main St");
      expect(
        screen.getByPlaceholderText("Area, Street, Sector, Village")
      ).toHaveValue("Apt 4B");
      expect(screen.getByPlaceholderText("Mumbai")).toHaveValue("Mumbai");
      expect(screen.getByPlaceholderText("Maharashtra")).toHaveValue(
        "Maharashtra"
      );
      expect(screen.getByPlaceholderText("400001")).toHaveValue("400001");
      expect(screen.getByPlaceholderText("India")).toHaveValue("India");
    });

    it("populates default checkbox", async () => {
      render(<AddressForm addressId="addr-1" onClose={mockOnClose} />);

      await waitFor(() => {
        const checkbox = screen.getByLabelText("Set as default address");
        expect(checkbox).toBeChecked();
      });
    });

    it("renders update button in edit mode", async () => {
      render(<AddressForm addressId="addr-1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Update Address" })
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation", () => {
    it("shows error for empty full name", async () => {
      render(<AddressForm onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Name must be at least 2 characters")
        ).toBeInTheDocument();
      });
    });

    it("shows error for short full name", async () => {
      render(<AddressForm onClose={mockOnClose} />);

      const nameInput = screen.getByPlaceholderText("John Doe");
      fireEvent.change(nameInput, { target: { value: "A" } });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Name must be at least 2 characters")
        ).toBeInTheDocument();
      });
    });

    it("shows error for empty phone number", async () => {
      render(<AddressForm onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Phone must be at least 10 digits")
        ).toBeInTheDocument();
      });
    });

    it("shows error for short phone number", async () => {
      render(<AddressForm onClose={mockOnClose} />);

      const phoneInput = screen.getByPlaceholderText("9876543210");
      fireEvent.change(phoneInput, { target: { value: "123" } });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Phone must be at least 10 digits")
        ).toBeInTheDocument();
      });
    });

    it("shows error for empty address line 1", async () => {
      render(<AddressForm onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Address line 1 is required")
        ).toBeInTheDocument();
      });
    });

    it("shows error for short address line 1", async () => {
      render(<AddressForm onClose={mockOnClose} />);

      const addressInput = screen.getByPlaceholderText(
        "Flat, House no., Building, Company, Apartment"
      );
      fireEvent.change(addressInput, { target: { value: "123" } });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Address line 1 is required")
        ).toBeInTheDocument();
      });
    });

    it("shows error for empty city", async () => {
      render(<AddressForm onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("City is required")).toBeInTheDocument();
      });
    });

    it("shows error for empty state", async () => {
      render(<AddressForm onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("State is required")).toBeInTheDocument();
      });
    });

    it("shows error for invalid pincode format", async () => {
      render(<AddressForm onClose={mockOnClose} />);

      const pincodeInput = screen.getByPlaceholderText("400001");
      fireEvent.change(pincodeInput, { target: { value: "123" } });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Pincode must be 6 digits")
        ).toBeInTheDocument();
      });
    });

    it("shows error for non-numeric pincode", async () => {
      render(<AddressForm onClose={mockOnClose} />);

      const pincodeInput = screen.getByPlaceholderText("400001");
      fireEvent.change(pincodeInput, { target: { value: "ABCDEF" } });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Pincode must be 6 digits")
        ).toBeInTheDocument();
      });
    });

    it("accepts valid 6-digit pincode", async () => {
      (addressService.create as jest.Mock).mockResolvedValue({});

      render(<AddressForm onClose={mockOnClose} />);

      // Fill valid form
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "123456" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(addressService.create).toHaveBeenCalled();
      });
    });

    it("shows error for empty country", async () => {
      render(<AddressForm onClose={mockOnClose} />);

      const countryInput = screen.getByPlaceholderText("India");
      fireEvent.change(countryInput, { target: { value: "" } });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Country is required")).toBeInTheDocument();
      });
    });

    it("does not show error for empty address line 2", async () => {
      (addressService.create as jest.Mock).mockResolvedValue({});

      render(<AddressForm onClose={mockOnClose} />);

      // Fill valid form without address line 2
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "400001" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(addressService.create).toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission - Add Mode", () => {
    it("calls create service with form data", async () => {
      (addressService.create as jest.Mock).mockResolvedValue({});

      render(<AddressForm onClose={mockOnClose} />);

      // Fill form
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St" } }
      );
      fireEvent.change(
        screen.getByPlaceholderText("Area, Street, Sector, Village"),
        { target: { value: "Apt 4B" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "400001" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(addressService.create).toHaveBeenCalledWith({
          fullName: "John Doe",
          phoneNumber: "9876543210",
          addressLine1: "123 Main St",
          addressLine2: "Apt 4B",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "India",
          addressType: "home",
          isDefault: false,
        });
      });
    });

    it("closes form on successful submission", async () => {
      (addressService.create as jest.Mock).mockResolvedValue({});

      render(<AddressForm onClose={mockOnClose} />);

      // Fill and submit form
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "400001" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("includes isDefault when checkbox is checked", async () => {
      (addressService.create as jest.Mock).mockResolvedValue({});

      render(<AddressForm onClose={mockOnClose} />);

      // Fill form and check default
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "400001" },
      });

      const checkbox = screen.getByLabelText("Set as default address");
      fireEvent.click(checkbox);

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(addressService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            isDefault: true,
          })
        );
      });
    });

    it("shows loading state during submission", async () => {
      (addressService.create as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<AddressForm onClose={mockOnClose} />);

      // Fill and submit form
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "400001" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Adding...")).toBeInTheDocument();
        expect(screen.getAllByTestId("loader-icon").length).toBeGreaterThan(0);
      });
    });

    it("disables buttons during submission", async () => {
      (addressService.create as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<AddressForm onClose={mockOnClose} />);

      // Fill and submit form
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "400001" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const addingButton = screen.getByRole("button", { name: /Adding/i });
        expect(addingButton).toBeDisabled();

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        expect(cancelButton).toBeDisabled();
      });
    });
  });

  describe("Form Submission - Edit Mode", () => {
    beforeEach(() => {
      (addressService.getById as jest.Mock).mockResolvedValue(
        mockExistingAddress
      );
    });

    it("calls update service with form data", async () => {
      (addressService.update as jest.Mock).mockResolvedValue({});

      render(<AddressForm addressId="addr-1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("John Doe")).toHaveValue("John Doe");
      });

      // Modify city
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Delhi" },
      });

      const submitButton = screen.getByRole("button", {
        name: "Update Address",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(addressService.update).toHaveBeenCalledWith(
          "addr-1",
          expect.objectContaining({
            city: "Delhi",
          })
        );
      });
    });

    it("shows updating text during submission", async () => {
      (addressService.update as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<AddressForm addressId="addr-1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("John Doe")).toHaveValue("John Doe");
      });

      const submitButton = screen.getByRole("button", {
        name: "Update Address",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Updating...")).toBeInTheDocument();
      });
    });

    it("closes form on successful update", async () => {
      (addressService.update as jest.Mock).mockResolvedValue({});

      render(<AddressForm addressId="addr-1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("John Doe")).toHaveValue("John Doe");
      });

      const submitButton = screen.getByRole("button", {
        name: "Update Address",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("shows alert on create error", async () => {
      (addressService.create as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<AddressForm onClose={mockOnClose} />);

      // Fill and submit form
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "400001" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("Network error");
      });
    });

    it("shows alert on update error", async () => {
      (addressService.getById as jest.Mock).mockResolvedValue(
        mockExistingAddress
      );
      (addressService.update as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      render(<AddressForm addressId="addr-1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("John Doe")).toHaveValue("John Doe");
      });

      const submitButton = screen.getByRole("button", {
        name: "Update Address",
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("Update failed");
      });
    });

    it("shows generic error on error without message", async () => {
      (addressService.create as jest.Mock).mockRejectedValue(new Error());

      render(<AddressForm onClose={mockOnClose} />);

      // Fill and submit form
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "400001" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith("Something went wrong");
      });
    });

    it("logs error to console on fetch failure", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (addressService.getById as jest.Mock).mockRejectedValue(
        new Error("Fetch failed")
      );

      render(<AddressForm addressId="addr-1" onClose={mockOnClose} />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          "Failed to load address:",
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });

    it("does not close form on submission error", async () => {
      (addressService.create as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<AddressForm onClose={mockOnClose} />);

      // Fill and submit form
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "John Doe" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "400001" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Close Functionality", () => {
    it("closes on close icon click", () => {
      render(<AddressForm onClose={mockOnClose} />);

      const closeIcon = screen.getByTestId("x-icon").closest("button");
      fireEvent.click(closeIcon!);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("closes on cancel button click", () => {
      render(<AddressForm onClose={mockOnClose} />);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("does not close when clicking inside modal", () => {
      render(<AddressForm onClose={mockOnClose} />);

      const modal = screen.getByText("Add New Address").closest("div");
      fireEvent.click(modal!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Modal Styling", () => {
    it("renders modal with backdrop", () => {
      const { container } = render(<AddressForm onClose={mockOnClose} />);

      const backdrop = container.querySelector(".bg-black\\/50");
      expect(backdrop).toBeInTheDocument();
    });

    it("renders sticky header", () => {
      render(<AddressForm onClose={mockOnClose} />);

      const header = screen.getByText("Add New Address").closest("div");
      expect(header).toHaveClass("sticky");
    });

    it("renders form with proper spacing", () => {
      const { container } = render(<AddressForm onClose={mockOnClose} />);

      const form = container.querySelector("form");
      expect(form).toHaveClass("space-y-4");
    });
  });

  describe("Edge Cases", () => {
    it("handles very long names", async () => {
      (addressService.create as jest.Mock).mockResolvedValue({});

      render(<AddressForm onClose={mockOnClose} />);

      const longName = "A".repeat(200);
      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: longName },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "400001" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(addressService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: longName,
          })
        );
      });
    });

    it("handles special characters in address", async () => {
      (addressService.create as jest.Mock).mockResolvedValue({});

      render(<AddressForm onClose={mockOnClose} />);

      fireEvent.change(screen.getByPlaceholderText("John Doe"), {
        target: { value: "O'Connor & Associates" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(
        screen.getByPlaceholderText(
          "Flat, House no., Building, Company, Apartment"
        ),
        { target: { value: "123 Main St, Apt #4B" } }
      );
      fireEvent.change(screen.getByPlaceholderText("Mumbai"), {
        target: { value: "Mumbai" },
      });
      fireEvent.change(screen.getByPlaceholderText("Maharashtra"), {
        target: { value: "Maharashtra" },
      });
      fireEvent.change(screen.getByPlaceholderText("400001"), {
        target: { value: "400001" },
      });

      const submitButton = screen.getByRole("button", { name: "Add Address" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(addressService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: "O'Connor & Associates",
            addressLine1: "123 Main St, Apt #4B",
          })
        );
      });
    });

    it("handles maxLength for pincode", () => {
      render(<AddressForm onClose={mockOnClose} />);

      const pincodeInput = screen.getByPlaceholderText("400001");
      expect(pincodeInput).toHaveAttribute("maxLength", "6");
    });

    it("handles empty addressId", () => {
      render(<AddressForm addressId={null} onClose={mockOnClose} />);

      expect(screen.getByText("Add New Address")).toBeInTheDocument();
      expect(addressService.getById).not.toHaveBeenCalled();
    });
  });
});
