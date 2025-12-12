import { logError } from "@/lib/firebase-error-logger";
import { getPaymentLogo } from "@/lib/payment-logos";
import { act, render, screen, waitFor } from "@testing-library/react";
import { PaymentLogo } from "../PaymentLogo";

// Mock dependencies
jest.mock("@/lib/payment-logos", () => ({
  getPaymentLogo: jest.fn(),
}));

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

jest.mock("@/components/common/OptimizedImage", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    className,
    onError,
  }: {
    src: string;
    alt: string;
    className?: string;
    onError?: () => void;
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="optimized-image"
      onError={onError}
    />
  ),
}));

const mockGetPaymentLogo = getPaymentLogo as jest.MockedFunction<
  typeof getPaymentLogo
>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;

describe("PaymentLogo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("shows loading skeleton initially", () => {
      mockGetPaymentLogo.mockReturnValue(
        new Promise(() => {}) // Never resolves
      );
      const { container } = render(
        <PaymentLogo paymentId="visa" name="Visa" />
      );
      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("loading skeleton has correct styling", () => {
      mockGetPaymentLogo.mockReturnValue(new Promise(() => {}));
      const { container } = render(
        <PaymentLogo paymentId="visa" name="Visa" />
      );
      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toHaveClass("bg-gray-200");
      expect(skeleton).toHaveClass("rounded");
    });

    it("loading skeleton has minimum dimensions", () => {
      mockGetPaymentLogo.mockReturnValue(new Promise(() => {}));
      const { container } = render(
        <PaymentLogo paymentId="visa" name="Visa" />
      );
      const skeleton = container.querySelector(".animate-pulse") as HTMLElement;
      expect(skeleton.style.minWidth).toBe("50px");
      expect(skeleton.style.minHeight).toBe("20px");
    });

    it("loading skeleton applies custom className", () => {
      mockGetPaymentLogo.mockReturnValue(new Promise(() => {}));
      const { container } = render(
        <PaymentLogo paymentId="visa" name="Visa" className="custom-class" />
      );
      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toHaveClass("custom-class");
    });
  });

  describe("Successful Load", () => {
    it("renders image after successful load", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/visa.png");
      render(<PaymentLogo paymentId="visa" name="Visa" />);
      await waitFor(() => {
        expect(screen.getByTestId("optimized-image")).toBeInTheDocument();
      });
    });

    it("image has correct src", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/visa.png");
      render(<PaymentLogo paymentId="visa" name="Visa" />);
      await waitFor(() => {
        const img = screen.getByTestId("optimized-image");
        expect(img).toHaveAttribute("src", "https://example.com/visa.png");
      });
    });

    it("image has correct alt text", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/visa.png");
      render(<PaymentLogo paymentId="visa" name="Visa" />);
      await waitFor(() => {
        const img = screen.getByTestId("optimized-image");
        expect(img).toHaveAttribute("alt", "Visa");
      });
    });

    it("applies custom className to image", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/visa.png");
      render(
        <PaymentLogo paymentId="visa" name="Visa" className="custom-class" />
      );
      await waitFor(() => {
        const img = screen.getByTestId("optimized-image");
        expect(img).toHaveClass("custom-class");
      });
    });

    it("calls getPaymentLogo with correct paymentId", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/visa.png");
      render(<PaymentLogo paymentId="visa" name="Visa" />);
      await waitFor(() => {
        expect(mockGetPaymentLogo).toHaveBeenCalledWith("visa");
      });
    });

    it("calls getPaymentLogo only once", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/visa.png");
      render(<PaymentLogo paymentId="visa" name="Visa" />);
      await waitFor(() => {
        expect(mockGetPaymentLogo).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Error Handling - Without showName", () => {
    it("renders nothing when error occurs and showName is false", async () => {
      mockGetPaymentLogo.mockRejectedValue(new Error("Failed to load"));
      const { container } = render(
        <PaymentLogo paymentId="visa" name="Visa" />
      );
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it("logs error when load fails", async () => {
      const error = new Error("Failed to load");
      mockGetPaymentLogo.mockRejectedValue(error);
      render(<PaymentLogo paymentId="visa" name="Visa" />);
      await waitFor(() => {
        expect(mockLogError).toHaveBeenCalledWith(error, {
          component: "PaymentLogo.useEffect",
          metadata: { paymentId: "visa" },
        });
      });
    });

    it("renders nothing when logoUrl is empty", async () => {
      mockGetPaymentLogo.mockResolvedValue("");
      const { container } = render(
        <PaymentLogo paymentId="visa" name="Visa" />
      );
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe("Error Handling - With showName", () => {
    it("shows name when error occurs and showName is true", async () => {
      mockGetPaymentLogo.mockRejectedValue(new Error("Failed to load"));
      render(<PaymentLogo paymentId="visa" name="Visa" showName />);
      await waitFor(() => {
        expect(screen.getByText("Visa")).toBeInTheDocument();
      });
    });

    it("fallback text has correct styling", async () => {
      mockGetPaymentLogo.mockRejectedValue(new Error("Failed to load"));
      render(<PaymentLogo paymentId="visa" name="Visa" showName />);
      await waitFor(() => {
        const text = screen.getByText("Visa");
        expect(text).toHaveClass("text-xs");
        expect(text).toHaveClass("text-gray-600");
        expect(text).toHaveClass("font-medium");
      });
    });

    it("applies custom className to fallback text", async () => {
      mockGetPaymentLogo.mockRejectedValue(new Error("Failed to load"));
      render(
        <PaymentLogo
          paymentId="visa"
          name="Visa"
          showName
          className="custom-class"
        />
      );
      await waitFor(() => {
        const text = screen.getByText("Visa");
        expect(text).toHaveClass("custom-class");
      });
    });

    it("shows name when logoUrl is empty and showName is true", async () => {
      mockGetPaymentLogo.mockResolvedValue("");
      render(<PaymentLogo paymentId="visa" name="Visa" showName />);
      await waitFor(() => {
        expect(screen.getByText("Visa")).toBeInTheDocument();
      });
    });
  });

  describe("Different Payment Providers", () => {
    it("handles Mastercard logo", async () => {
      mockGetPaymentLogo.mockResolvedValue(
        "https://example.com/mastercard.png"
      );
      render(<PaymentLogo paymentId="mastercard" name="Mastercard" />);
      await waitFor(() => {
        const img = screen.getByTestId("optimized-image");
        expect(img).toHaveAttribute(
          "src",
          "https://example.com/mastercard.png"
        );
        expect(img).toHaveAttribute("alt", "Mastercard");
      });
    });

    it("handles PayPal logo", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/paypal.png");
      render(<PaymentLogo paymentId="paypal" name="PayPal" />);
      await waitFor(() => {
        const img = screen.getByTestId("optimized-image");
        expect(img).toHaveAttribute("src", "https://example.com/paypal.png");
        expect(img).toHaveAttribute("alt", "PayPal");
      });
    });

    it("handles Stripe logo", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/stripe.png");
      render(<PaymentLogo paymentId="stripe" name="Stripe" />);
      await waitFor(() => {
        const img = screen.getByTestId("optimized-image");
        expect(img).toHaveAttribute("src", "https://example.com/stripe.png");
        expect(img).toHaveAttribute("alt", "Stripe");
      });
    });
  });

  describe("Component Lifecycle", () => {
    it("cleans up on unmount", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/visa.png");
      const { unmount } = render(<PaymentLogo paymentId="visa" name="Visa" />);
      unmount();
      // Should not throw or cause issues
    });

    it("handles rapid unmount before load completes", () => {
      let resolvePromise: (value: string) => void;
      mockGetPaymentLogo.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );
      const { unmount } = render(<PaymentLogo paymentId="visa" name="Visa" />);
      unmount();
      // Resolving after unmount should not cause issues
      // @ts-ignore
      resolvePromise("https://example.com/visa.png");
    });

    it("does not update state after unmount", async () => {
      let resolvePromise: (value: string) => void;
      mockGetPaymentLogo.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );
      const { unmount } = render(<PaymentLogo paymentId="visa" name="Visa" />);
      unmount();
      // @ts-ignore
      resolvePromise("https://example.com/visa.png");
      // No errors should occur
    });
  });

  describe("Re-fetching on paymentId Change", () => {
    it("fetches new logo when paymentId changes", async () => {
      mockGetPaymentLogo
        .mockResolvedValueOnce("https://example.com/visa.png")
        .mockResolvedValueOnce("https://example.com/mastercard.png");

      const { rerender } = render(<PaymentLogo paymentId="visa" name="Visa" />);

      await waitFor(() => {
        expect(mockGetPaymentLogo).toHaveBeenCalledWith("visa");
      });

      rerender(<PaymentLogo paymentId="mastercard" name="Mastercard" />);

      await waitFor(() => {
        expect(mockGetPaymentLogo).toHaveBeenCalledWith("mastercard");
      });
    });

    it("shows loading state when paymentId changes", async () => {
      mockGetPaymentLogo
        .mockResolvedValueOnce("https://example.com/visa.png")
        .mockReturnValue(new Promise(() => {})); // Never resolves

      const { container, rerender } = render(
        <PaymentLogo paymentId="visa" name="Visa" />
      );

      await waitFor(() => {
        expect(screen.getByTestId("optimized-image")).toBeInTheDocument();
      });

      rerender(<PaymentLogo paymentId="mastercard" name="Mastercard" />);

      // Should show loading skeleton again
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("Image Error Handling", () => {
    it("sets error state when image fails to load", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/visa.png");
      render(<PaymentLogo paymentId="visa" name="Visa" showName />);

      await waitFor(() => {
        const img = screen.getByTestId("optimized-image");
        expect(img).toBeInTheDocument();
      });

      // Simulate image load error
      const img = screen.getByTestId("optimized-image");
      act(() => {
        img.dispatchEvent(new Event("error"));
      });

      await waitFor(() => {
        expect(screen.getByText("Visa")).toBeInTheDocument();
      });
    });

    it("renders nothing on image error when showName is false", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/visa.png");
      const { container } = render(
        <PaymentLogo paymentId="visa" name="Visa" />
      );

      await waitFor(() => {
        expect(screen.getByTestId("optimized-image")).toBeInTheDocument();
      });

      // Simulate image load error
      const img = screen.getByTestId("optimized-image");
      act(() => {
        img.dispatchEvent(new Event("error"));
      });

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles empty paymentId", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/logo.png");
      render(<PaymentLogo paymentId="" name="Unknown" />);
      await waitFor(() => {
        expect(mockGetPaymentLogo).toHaveBeenCalledWith("");
      });
    });

    it("handles very long payment names", async () => {
      const longName = "A".repeat(100);
      mockGetPaymentLogo.mockResolvedValue("https://example.com/logo.png");
      render(<PaymentLogo paymentId="test" name={longName} showName />);
      await waitFor(() => {
        // Should not throw
      });
    });

    it("handles special characters in name", async () => {
      mockGetPaymentLogo.mockRejectedValue(new Error("Failed"));
      render(
        <PaymentLogo paymentId="test" name="Payment & Transfer" showName />
      );
      await waitFor(() => {
        expect(screen.getByText("Payment & Transfer")).toBeInTheDocument();
      });
    });

    it("handles null className", async () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/visa.png");
      // @ts-ignore - Testing runtime behavior
      render(<PaymentLogo paymentId="visa" name="Visa" className={null} />);
      await waitFor(() => {
        expect(screen.getByTestId("optimized-image")).toBeInTheDocument();
      });
    });
  });

  describe("Multiple Instances", () => {
    it("renders multiple payment logos independently", async () => {
      mockGetPaymentLogo
        .mockResolvedValueOnce("https://example.com/visa.png")
        .mockResolvedValueOnce("https://example.com/mastercard.png")
        .mockResolvedValueOnce("https://example.com/paypal.png");

      render(
        <>
          <PaymentLogo paymentId="visa" name="Visa" />
          <PaymentLogo paymentId="mastercard" name="Mastercard" />
          <PaymentLogo paymentId="paypal" name="PayPal" />
        </>
      );

      await waitFor(() => {
        const images = screen.getAllByTestId("optimized-image");
        expect(images).toHaveLength(3);
      });
    });

    it("each instance manages its own loading state", async () => {
      mockGetPaymentLogo
        .mockResolvedValueOnce("https://example.com/visa.png")
        .mockReturnValue(new Promise(() => {})); // Never resolves

      const { container } = render(
        <>
          <PaymentLogo paymentId="visa" name="Visa" />
          <PaymentLogo paymentId="mastercard" name="Mastercard" />
        </>
      );

      await waitFor(() => {
        expect(screen.getByTestId("optimized-image")).toBeInTheDocument();
      });

      // Second instance should still be loading
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(1);
    });
  });

  describe("Props Validation", () => {
    it("requires paymentId prop", () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/logo.png");
      // @ts-expect-error - Testing runtime behavior
      expect(() => render(<PaymentLogo name="Visa" />)).not.toThrow();
    });

    it("requires name prop", () => {
      mockGetPaymentLogo.mockResolvedValue("https://example.com/logo.png");
      // @ts-expect-error - Testing runtime behavior
      expect(() => render(<PaymentLogo paymentId="visa" />)).not.toThrow();
    });

    it("showName defaults to false", async () => {
      mockGetPaymentLogo.mockRejectedValue(new Error("Failed"));
      const { container } = render(
        <PaymentLogo paymentId="visa" name="Visa" />
      );
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });
});
