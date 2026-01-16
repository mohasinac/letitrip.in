

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SmartAddressForm, {
  type AddressFormData,
  type GPSService,
  type PincodeService,
} from "../SmartAddressForm";

describe("SmartAddressForm", () => {
  const mockPincodeService: PincodeService = {
    lookup: vi.fn(),
  };

  const mockGPSService: GPSService = {
    getCurrentPosition: vi.fn(),
  };

  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render in inline mode", () => {
      render(
        <SmartAddressForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="inline"
        />
      );

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pincode/i)).toBeInTheDocument();
    });

    it("should render in modal mode with title", () => {
      render(
        <SmartAddressForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          mode="modal"
          title="Add New Address"
        />
      );

      expect(screen.getByText("Add New Address")).toBeInTheDocument();
    });

    it("should render with initial data", () => {
      const initialData: AddressFormData = {
        fullName: "John Doe",
        mobileNumber: "9876543210",
        pincode: "560001",
        addressLine1: "123 Main St",
        addressType: "home",
      };

      render(
        <SmartAddressForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={initialData}
        />
      );

      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("9876543210")).toBeInTheDocument();
      expect(screen.getByDisplayValue("560001")).toBeInTheDocument();
      expect(screen.getByDisplayValue("123 Main St")).toBeInTheDocument();
    });
  });

  describe("Form validation", () => {
    it("should show validation errors for required fields", async () => {
      const user = userEvent.setup();

      render(
        <SmartAddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const submitButton = screen.getByRole("button", {
        name: /save address/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
        expect(
          screen.getByText(/mobile number is required/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/pincode is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should validate mobile number length", async () => {
      const user = userEvent.setup();

      render(
        <SmartAddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const mobileInput = screen.getByLabelText(/mobile number/i);
      await user.type(mobileInput, "12345");

      const submitButton = screen.getByRole("button", {
        name: /save address/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/mobile number must be 10 digits/i)
        ).toBeInTheDocument();
      });
    });

    it("should validate pincode format", async () => {
      const user = userEvent.setup();

      render(
        <SmartAddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const pincodeInput = screen.getByLabelText(/pincode/i);
      await user.type(pincodeInput, "12345");

      const submitButton = screen.getByRole("button", {
        name: /save address/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/pincode must be 6 digits/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Pincode lookup", () => {
    it("should trigger pincode lookup when 6 digits entered", async () => {
      const user = userEvent.setup();

      (mockPincodeService.lookup as jest.Mock).mockResolvedValue({
        city: "Bangalore",
        state: "Karnataka",
        district: "Bangalore Urban",
        areas: ["Koramangala", "HSR Layout"],
      });

      render(
        <SmartAddressForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          pincodeService={mockPincodeService}
        />
      );

      const pincodeInput = screen.getByLabelText(/pincode/i);
      await user.type(pincodeInput, "560001");

      await waitFor(() => {
        expect(mockPincodeService.lookup).toHaveBeenCalledWith("560001");
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue("Bangalore")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Karnataka")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Bangalore Urban")).toBeInTheDocument();
      });
    });

    it("should show area dropdown when multiple areas available", async () => {
      const user = userEvent.setup();

      (mockPincodeService.lookup as jest.Mock).mockResolvedValue({
        city: "Bangalore",
        state: "Karnataka",
        district: "Bangalore Urban",
        areas: ["Koramangala", "HSR Layout", "BTM Layout"],
      });

      render(
        <SmartAddressForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          pincodeService={mockPincodeService}
        />
      );

      const pincodeInput = screen.getByLabelText(/pincode/i);
      await user.type(pincodeInput, "560001");

      await waitFor(() => {
        expect(screen.getByLabelText(/area/i)).toBeInTheDocument();
      });
    });

    it("should auto-select area when only one available", async () => {
      const user = userEvent.setup();

      (mockPincodeService.lookup as jest.Mock).mockResolvedValue({
        city: "Bangalore",
        state: "Karnataka",
        district: "Bangalore Urban",
        areas: ["Koramangala"],
      });

      render(
        <SmartAddressForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          pincodeService={mockPincodeService}
        />
      );

      const pincodeInput = screen.getByLabelText(/pincode/i);
      await user.type(pincodeInput, "560001");

      await waitFor(() => {
        expect(screen.getByDisplayValue("Koramangala")).toBeInTheDocument();
      });
    });

    it("should handle pincode lookup error", async () => {
      const user = userEvent.setup();
      const mockOnError = vi.fn();

      (mockPincodeService.lookup as jest.Mock).mockRejectedValue(
        new Error("Invalid pincode")
      );

      render(
        <SmartAddressForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          pincodeService={mockPincodeService}
          onError={mockOnError}
        />
      );

      const pincodeInput = screen.getByLabelText(/pincode/i);
      await user.type(pincodeInput, "999999");

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith("Failed to lookup pincode");
      });
    });
  });

  describe("GPS functionality", () => {
    it("should render GPS button when showGPS is true", () => {
      render(
        <SmartAddressForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          showGPS
          gpsService={mockGPSService}
        />
      );

      expect(
        screen.getByLabelText(/use current location/i)
      ).toBeInTheDocument();
    });

    it("should get GPS coordinates when button clicked", async () => {
      const user = userEvent.setup();

      (mockGPSService.getCurrentPosition as jest.Mock).mockResolvedValue({
        latitude: 12.9716,
        longitude: 77.5946,
      });

      render(
        <SmartAddressForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          showGPS
          gpsService={mockGPSService}
        />
      );

      const gpsButton = screen.getByLabelText(/use current location/i);
      await user.click(gpsButton);

      await waitFor(() => {
        expect(mockGPSService.getCurrentPosition).toHaveBeenCalled();
      });
    });

    it("should handle GPS error", async () => {
      const user = userEvent.setup();
      const mockOnError = vi.fn();

      (mockGPSService.getCurrentPosition as jest.Mock).mockRejectedValue(
        new Error("GPS not available")
      );

      render(
        <SmartAddressForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          showGPS
          gpsService={mockGPSService}
          onError={mockOnError}
        />
      );

      const gpsButton = screen.getByLabelText(/use current location/i);
      await user.click(gpsButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith("Failed to get GPS location");
      });
    });
  });

  describe("Address type selection", () => {
    it("should allow selecting home address type", async () => {
      const user = userEvent.setup();

      render(
        <SmartAddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const homeButton = screen.getByLabelText(/home/i);
      await user.click(homeButton);

      expect(homeButton.parentElement).toHaveClass("border-blue-600");
    });

    it("should allow selecting work address type", async () => {
      const user = userEvent.setup();

      render(
        <SmartAddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const workButton = screen.getByLabelText(/work/i);
      await user.click(workButton);

      expect(workButton.parentElement).toHaveClass("border-blue-600");
    });

    it("should allow selecting other address type", async () => {
      const user = userEvent.setup();

      render(
        <SmartAddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const otherButton = screen.getByLabelText(/other/i);
      await user.click(otherButton);

      expect(otherButton.parentElement).toHaveClass("border-blue-600");
    });
  });

  describe("Form submission", () => {
    it("should submit valid form data", async () => {
      const user = userEvent.setup();

      render(
        <SmartAddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      await user.type(screen.getByLabelText(/full name/i), "John Doe");
      await user.type(screen.getByLabelText(/mobile number/i), "9876543210");
      await user.type(screen.getByLabelText(/pincode/i), "560001");
      await user.type(screen.getByLabelText(/address line 1/i), "123 Main St");

      const submitButton = screen.getByRole("button", {
        name: /save address/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: "John Doe",
            mobileNumber: "9876543210",
            countryCode: "+91",
            pincode: "560001",
            addressLine1: "123 Main St",
            addressType: "home",
          })
        );
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();

      render(
        <SmartAddressForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading
        />
      );

      const submitButton = screen.getByRole("button", { name: /saving/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Form cancellation", () => {
    it("should call onCancel when cancel button clicked", async () => {
      const user = userEvent.setup();

      render(
        <SmartAddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe("Default address checkbox", () => {
    it("should toggle default address checkbox", async () => {
      const user = userEvent.setup();

      render(
        <SmartAddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const checkbox = screen.getByLabelText(/set as default address/i);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("Dark mode", () => {
    it("should have dark mode classes", () => {
      render(
        <SmartAddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      const form = screen.getByLabelText(/full name/i).closest("form");
      expect(form).toHaveClass("dark:bg-gray-800");
    });
  });
});
