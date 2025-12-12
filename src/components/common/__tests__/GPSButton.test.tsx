import { locationService } from "@/services/location.service";
import type {
  GeoCoordinates,
  GeolocationError,
  ReverseGeocodeResult,
} from "@/types/shared/location.types";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GPSButton } from "../GPSButton";

// Mock location service
jest.mock("@/services/location.service", () => ({
  locationService: {
    checkGeolocationPermission: jest.fn(),
    getCurrentPosition: jest.fn(),
    reverseGeocode: jest.fn(),
  },
}));

const mockLocationService = locationService as jest.Mocked<
  typeof locationService
>;

describe("GPSButton Component", () => {
  const mockCoords: GeoCoordinates = { latitude: 12.9716, longitude: 77.5946 };
  const mockAddress: ReverseGeocodeResult = {
    formattedAddress: "123 Main St, Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    postalCode: "560001",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Basic rendering
  describe("Basic Rendering", () => {
    it("renders GPS button", () => {
      render(<GPSButton />);
      expect(
        screen.getByRole("button", { name: /use current location/i })
      ).toBeInTheDocument();
    });

    it("has default button variant", () => {
      render(<GPSButton />);
      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Use current location");
    });

    it("renders MapPin icon by default", () => {
      const { container } = render(<GPSButton />);
      const icon = container.querySelector(".lucide-map-pin");
      expect(icon).toBeInTheDocument();
    });

    it("has blue background styling", () => {
      render(<GPSButton />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-blue-100", "text-blue-700");
    });

    it("has dark mode styling", () => {
      render(<GPSButton />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("dark:bg-blue-900/30", "dark:text-blue-300");
    });

    it("has rounded corners", () => {
      render(<GPSButton />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("rounded-lg");
    });

    it("has hover effect", () => {
      render(<GPSButton />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-blue-200");
    });

    it("has focus ring", () => {
      render(<GPSButton />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus:ring-2", "focus:ring-primary/50");
    });
  });

  // Variant rendering
  describe("Variant Rendering", () => {
    it("renders button variant with icon and text", () => {
      const { container } = render(<GPSButton variant="button" />);
      expect(screen.getByText("Use current location")).toBeInTheDocument();
      expect(container.querySelector(".lucide-map-pin")).toBeInTheDocument();
    });

    it("renders icon variant with only icon", () => {
      const { container } = render(<GPSButton variant="icon" />);
      expect(
        screen.queryByText("Use current location")
      ).not.toBeInTheDocument();
      expect(container.querySelector(".lucide-map-pin")).toBeInTheDocument();
    });

    it("renders text variant with expanded text states", () => {
      render(<GPSButton variant="text" />);
      expect(screen.getByText("Use my location")).toBeInTheDocument();
    });

    it("text variant shows detecting state text", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockImplementation(
        () => new Promise(() => {})
      );

      render(<GPSButton variant="text" />);
      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("Detecting...")).toBeInTheDocument();
      });
    });
  });

  // Size variants
  describe("Size Variants", () => {
    it("renders small size", () => {
      render(<GPSButton size="sm" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-2", "py-1", "text-sm");
    });

    it("renders medium size by default", () => {
      render(<GPSButton size="md" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-3", "py-2", "text-base");
    });

    it("renders large size", () => {
      render(<GPSButton size="lg" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-4", "py-3", "text-lg");
    });

    it("small size has w-4 h-4 icon", () => {
      const { container } = render(<GPSButton size="sm" />);
      const icon = container.querySelector(".lucide-map-pin");
      expect(icon).toHaveClass("w-4", "h-4");
    });

    it("medium size has w-5 h-5 icon", () => {
      const { container } = render(<GPSButton size="md" />);
      const icon = container.querySelector(".lucide-map-pin");
      expect(icon).toHaveClass("w-5", "h-5");
    });

    it("large size has w-6 h-6 icon", () => {
      const { container } = render(<GPSButton size="lg" />);
      const icon = container.querySelector(".lucide-map-pin");
      expect(icon).toHaveClass("w-6", "h-6");
    });
  });

  // Location detection success
  describe("Location Detection Success", () => {
    it("calls onLocationDetected with coordinates on success", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);

      const mockOnLocationDetected = jest.fn();

      render(
        <GPSButton
          onLocationDetected={mockOnLocationDetected}
          reverseGeocode={false}
        />
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockOnLocationDetected).toHaveBeenCalledWith(mockCoords);
      });
    });

    it("calls reverseGeocode when enabled", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);
      mockLocationService.reverseGeocode.mockResolvedValue(mockAddress);

      const mockOnAddressDetected = jest.fn();

      render(<GPSButton onAddressDetected={mockOnAddressDetected} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockLocationService.reverseGeocode).toHaveBeenCalledWith(
          mockCoords
        );
        expect(mockOnAddressDetected).toHaveBeenCalledWith(mockAddress);
      });
    });

    it("does not call reverseGeocode when disabled", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);

      render(<GPSButton reverseGeocode={false} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockLocationService.reverseGeocode).not.toHaveBeenCalled();
      });
    });

    it("shows success state after detection", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);

      const { container } = render(<GPSButton />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        const successIcon = container.querySelector(".lucide-circle-check-big");
        expect(successIcon).toBeInTheDocument();
      });
    });

    it("success state has green styling", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);

      render(<GPSButton />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveClass("bg-green-100", "text-green-700");
      });
    });

    it("resets to idle after 3 seconds on success", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);

      const { container } = render(<GPSButton />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(
          container.querySelector(".lucide-circle-check-big")
        ).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(container.querySelector(".lucide-map-pin")).toBeInTheDocument();
      });
    });
  });

  // Loading state
  describe("Loading State", () => {
    it("shows loading state during detection", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<GPSButton />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        const loadingIcon = container.querySelector(".lucide-loader-circle");
        expect(loadingIcon).toBeInTheDocument();
      });
    });

    it("button is disabled during loading", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockImplementation(
        () => new Promise(() => {})
      );

      render(<GPSButton />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it("shows detecting text in button variant", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockImplementation(
        () => new Promise(() => {})
      );

      render(<GPSButton variant="button" />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("Detecting...")).toBeInTheDocument();
      });
    });
  });

  // Error handling
  describe("Error Handling", () => {
    it("shows error state when permission denied", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      const { container } = render(<GPSButton />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        const errorIcon = container.querySelector(".lucide-x-circle");
        expect(errorIcon).toBeInTheDocument();
      });
    });

    it("calls onError when permission denied", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      const mockOnError = jest.fn();

      render(<GPSButton onError={mockOnError} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith({
          code: "PERMISSION_DENIED",
          message:
            "Location permission denied. Please enable in browser settings.",
        });
      });
    });

    it("shows error message when showStatus is true", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      render(<GPSButton showStatus={true} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Location permission denied. Please enable in browser settings."
          )
        ).toBeInTheDocument();
      });
    });

    it("does not show error message when showStatus is false", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      render(<GPSButton showStatus={false} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(
          screen.queryByText(
            "Location permission denied. Please enable in browser settings."
          )
        ).not.toBeInTheDocument();
      });
    });

    it("error message has red text", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      render(<GPSButton showStatus={true} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        const errorMsg = screen.getByText(/location permission denied/i);
        expect(errorMsg).toHaveClass("text-red-600", "dark:text-red-400");
      });
    });

    it("error state has red styling", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      render(<GPSButton />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveClass("bg-red-100", "text-red-700");
      });
    });

    it("shows try again text in text variant on error", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      render(<GPSButton variant="text" />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("Try again")).toBeInTheDocument();
      });
    });

    it("handles getCurrentPosition errors", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      const error: GeolocationError = {
        code: "POSITION_UNAVAILABLE",
        message: "Position unavailable",
      };
      mockLocationService.getCurrentPosition.mockRejectedValue(error);

      const mockOnError = jest.fn();

      render(<GPSButton onError={mockOnError} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(error);
      });
    });

    it("shows permission hint when denied", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      render(<GPSButton showStatus={true} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(
          screen.getByText("Enable location access in your browser settings")
        ).toBeInTheDocument();
      });
    });
  });

  // Disabled state
  describe("Disabled State", () => {
    it("button is disabled when disabled prop is true", () => {
      render(<GPSButton disabled={true} />);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("disabled button has opacity styling", () => {
      render(<GPSButton disabled={true} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed"
      );
    });

    it("does not trigger click when disabled", async () => {
      const mockOnLocationDetected = jest.fn();

      render(
        <GPSButton
          disabled={true}
          onLocationDetected={mockOnLocationDetected}
        />
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      expect(mockOnLocationDetected).not.toHaveBeenCalled();
    });

    it("does not trigger click when already loading", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockImplementation(
        () => new Promise(() => {})
      );

      render(<GPSButton />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      // Try to click again while loading
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockLocationService.getCurrentPosition).toHaveBeenCalledTimes(1);
      });
    });
  });

  // Custom className
  describe("Custom Styling", () => {
    it("accepts custom className", () => {
      const { container } = render(<GPSButton className="custom-gps" />);
      const wrapper = container.querySelector(".custom-gps");
      expect(wrapper).toBeInTheDocument();
    });
  });

  // Permission states
  describe("Permission States", () => {
    it("handles granted permission", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);

      const mockOnLocationDetected = jest.fn();

      render(
        <GPSButton
          onLocationDetected={mockOnLocationDetected}
          reverseGeocode={false}
        />
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockOnLocationDetected).toHaveBeenCalled();
      });
    });

    it("handles prompt permission", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "prompt"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);

      const mockOnLocationDetected = jest.fn();

      render(
        <GPSButton
          onLocationDetected={mockOnLocationDetected}
          reverseGeocode={false}
        />
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockOnLocationDetected).toHaveBeenCalled();
      });
    });
  });

  // Status messages
  describe("Status Messages", () => {
    it("error message has text-sm size", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      render(<GPSButton showStatus={true} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        const errorMsg = screen.getByText(/location permission denied/i);
        expect(errorMsg).toHaveClass("text-sm");
      });
    });

    it("permission hint has text-xs size", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      render(<GPSButton showStatus={true} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        const hint = screen.getByText(
          "Enable location access in your browser settings"
        );
        expect(hint).toHaveClass("text-xs");
      });
    });

    it("permission hint has gray color", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      render(<GPSButton showStatus={true} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        const hint = screen.getByText(
          "Enable location access in your browser settings"
        );
        expect(hint).toHaveClass("text-gray-500", "dark:text-gray-400");
      });
    });
  });

  // Edge cases
  describe("Edge Cases", () => {
    it("handles reverseGeocode returning null", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);
      mockLocationService.reverseGeocode.mockResolvedValue(null);

      const mockOnAddressDetected = jest.fn();

      render(<GPSButton onAddressDetected={mockOnAddressDetected} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockOnAddressDetected).not.toHaveBeenCalled();
      });
    });

    it("handles missing error message", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      const error: GeolocationError = { code: "UNKNOWN", message: "" };
      mockLocationService.getCurrentPosition.mockRejectedValue(error);

      render(<GPSButton showStatus={true} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("Failed to get location")).toBeInTheDocument();
      });
    });

    it("handles multiple rapid clicks", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);

      render(<GPSButton reverseGeocode={false} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);
      await userEvent.click(button);
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockLocationService.getCurrentPosition).toHaveBeenCalledTimes(1);
      });
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("button has aria-label", () => {
      render(<GPSButton />);
      const button = screen.getByRole("button", {
        name: /use current location/i,
      });
      expect(button).toHaveAttribute("aria-label", "Use current location");
    });

    it('button has type="button"', () => {
      render(<GPSButton />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("is keyboard accessible", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);

      const mockOnLocationDetected = jest.fn();

      render(
        <GPSButton
          onLocationDetected={mockOnLocationDetected}
          reverseGeocode={false}
        />
      );

      const button = screen.getByRole("button");
      button.focus();
      await userEvent.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockOnLocationDetected).toHaveBeenCalled();
      });
    });
  });

  // Icon variations
  describe("Icon Variations", () => {
    it("shows CheckCircle icon on success", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockResolvedValue(mockCoords);

      const { container } = render(<GPSButton />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        const icon = container.querySelector(".lucide-circle-check-big");
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass("text-green-500");
      });
    });

    it("shows XCircle icon on error", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "denied"
      );

      const { container } = render(<GPSButton />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        const icon = container.querySelector(".lucide-x-circle");
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass("text-red-500");
      });
    });

    it("shows Loader2 icon during loading", async () => {
      mockLocationService.checkGeolocationPermission.mockResolvedValue(
        "granted"
      );
      mockLocationService.getCurrentPosition.mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<GPSButton />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        const icon = container.querySelector(".lucide-loader-circle");
        expect(icon).toBeInTheDocument();
      });
    });
  });
});
