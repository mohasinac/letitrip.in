import { logError } from "@/lib/firebase-error-logger";
import { couponsService } from "@/services/coupons.service";
import { CouponType } from "@/types/shared/common.types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { toast } from "sonner";
import CouponForm from "../CouponForm";

// Mock dependencies
jest.mock("@/services/coupons.service");
jest.mock("@/lib/firebase-error-logger");
jest.mock("sonner");

jest.mock("@/components/common/DateTimePicker", () => ({
  __esModule: true,
  default: ({
    label,
    value,
    onChange,
    minDate,
    required,
  }: {
    label?: string;
    value: Date;
    onChange: (date: Date) => void;
    minDate?: Date;
    required?: boolean;
  }) => (
    <div>
      {label && <label>{label}</label>}
      <input
        type="datetime-local"
        value={value.toISOString().slice(0, 16)}
        onChange={(e) => onChange(new Date(e.target.value))}
        required={required}
        data-testid={
          label
            ? `date-picker-${label.toLowerCase().replace(/\s+/g, "-")}`
            : "date-picker"
        }
      />
    </div>
  ),
}));

jest.mock("@/components/common/TagInput", () => ({
  __esModule: true,
  default: ({
    tags,
    onAdd,
    onRemove,
    placeholder,
  }: {
    tags: string[];
    onAdd: (tag: string) => void;
    onRemove: (tag: string) => void;
    placeholder?: string;
  }) => (
    <div data-testid="tag-input">
      {tags.map((tag) => (
        <span key={tag}>
          {tag}
          <button onClick={() => onRemove(tag)}>Remove {tag}</button>
        </span>
      ))}
      <input
        type="text"
        placeholder={placeholder}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = "";
          }
        }}
      />
    </div>
  ),
}));

jest.mock("@/components/forms/FormLabel", () => ({
  FormLabel: ({
    children,
    htmlFor,
    required,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
    required?: boolean;
  }) => (
    <label htmlFor={htmlFor}>
      {children}
      {required && " *"}
    </label>
  ),
}));

const mockCouponsService = couponsService as jest.Mocked<typeof couponsService>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe("CouponForm", () => {
  const mockOnSubmit = jest.fn();
  const defaultShopId = "shop-123";

  beforeEach(() => {
    jest.clearAllMocks();
    mockCouponsService.validateCode.mockResolvedValue({
      available: true,
      suggestions: [],
    });
  });

  describe("Form Rendering", () => {
    it("renders all form sections in create mode", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText("Basic Information")).toBeInTheDocument();
      expect(screen.getByText("Discount Configuration")).toBeInTheDocument();
      expect(screen.getByText("Applicability")).toBeInTheDocument();
      expect(screen.getByText("Usage Limits")).toBeInTheDocument();
      expect(screen.getByText("Validity Period")).toBeInTheDocument();
      expect(screen.getByText("Restrictions")).toBeInTheDocument();
    });

    it("renders all required fields", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByLabelText("Coupon Code *")).toBeInTheDocument();
      expect(screen.getByLabelText("Display Name *")).toBeInTheDocument();
      expect(screen.getByText("Discount Type *")).toBeInTheDocument();
    });

    it("shows create button in create mode", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      expect(
        screen.getByRole("button", { name: /Create Coupon/i })
      ).toBeInTheDocument();
    });

    it("shows update button in edit mode", () => {
      render(
        <CouponForm
          mode="edit"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
          initialData={{ code: "SUMMER2024" }}
        />
      );

      expect(
        screen.getByRole("button", { name: /Update Coupon/i })
      ).toBeInTheDocument();
    });
  });

  describe("Coupon Code Input", () => {
    it("renders coupon code input", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("placeholder", "SUMMER2024");
      expect(input).toHaveAttribute("maxlength", "20");
    });

    it("auto-uppercases input", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "summer2024" } });

      expect(input.value).toBe("SUMMER2024");
    });

    it("removes invalid characters", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "SUMMER@2024!" } });

      expect(input.value).toBe("SUMMER2024");
    });

    it("allows hyphens in code", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "SUMMER-2024" } });

      expect(input.value).toBe("SUMMER-2024");
    });

    it("disables code input in edit mode", () => {
      render(
        <CouponForm
          mode="edit"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
          initialData={{ code: "SUMMER2024" }}
        />
      );

      const input = screen.getByLabelText("Coupon Code *");
      expect(input).toBeDisabled();
      expect(input).toHaveClass("cursor-not-allowed");
    });
  });

  describe("Code Validation", () => {
    it("validates code after typing", async () => {
      jest.useFakeTimers();
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *");
      fireEvent.change(input, { target: { value: "TESTCODE" } });

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockCouponsService.validateCode).toHaveBeenCalledWith(
          "TESTCODE",
          defaultShopId
        );
      });

      jest.useRealTimers();
    });

    it("shows error when code is unavailable", async () => {
      mockCouponsService.validateCode.mockResolvedValueOnce({
        available: false,
        suggestions: ["TESTCODE2"],
      });

      jest.useFakeTimers();
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *");
      fireEvent.change(input, { target: { value: "TESTCODE" } });

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(
          screen.getByText("This coupon code is already in use")
        ).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it("shows loading spinner during validation", async () => {
      mockCouponsService.validateCode.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ available: true, suggestions: [] }),
              1000
            )
          )
      );

      jest.useFakeTimers();
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *");
      fireEvent.change(input, { target: { value: "TESTCODE" } });

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        const spinner = document.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it("does not validate code in edit mode if unchanged", async () => {
      jest.useFakeTimers();
      render(
        <CouponForm
          mode="edit"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
          initialData={{ code: "SUMMER2024" }}
        />
      );

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockCouponsService.validateCode).not.toHaveBeenCalled();
      });

      jest.useRealTimers();
    });

    it("handles validation error gracefully", async () => {
      const error = new Error("Network error");
      mockCouponsService.validateCode.mockRejectedValueOnce(error);

      jest.useFakeTimers();
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *");
      fireEvent.change(input, { target: { value: "TESTCODE" } });

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockLogError).toHaveBeenCalledWith(error, {
          component: "CouponForm.validateCouponCode",
          metadata: { code: "TESTCODE", shopId: defaultShopId },
        });
      });

      jest.useRealTimers();
    });
  });

  describe("Discount Types", () => {
    it("renders all discount type options", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText("Percentage")).toBeInTheDocument();
      expect(screen.getByText("Flat Amount")).toBeInTheDocument();
      expect(screen.getByText("BOGO")).toBeInTheDocument();
      expect(screen.getByText("Tiered")).toBeInTheDocument();
      expect(screen.getByText("Free Shipping")).toBeInTheDocument();
    });

    it("selects percentage by default", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const percentageRadio = screen.getByRole("radio", {
        name: /Percentage/i,
      });
      expect(percentageRadio).toBeChecked();
    });

    it("allows changing discount type", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const flatRadio = screen.getByRole("radio", { name: /Flat Amount/i });
      fireEvent.click(flatRadio);

      expect(flatRadio).toBeChecked();
    });

    it("highlights selected discount type", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const percentageLabel = screen
        .getByRole("radio", { name: /Percentage/i })
        .closest("label");

      expect(percentageLabel).toHaveClass("border-blue-500");
      expect(percentageLabel).toHaveClass("bg-blue-50");
    });
  });

  describe("Form Submission", () => {
    it("submits form with valid data", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.change(screen.getByLabelText("Coupon Code *"), {
        target: { value: "SUMMER2024" },
      });
      fireEvent.change(screen.getByLabelText("Display Name *"), {
        target: { value: "Summer Sale" },
      });

      fireEvent.submit(screen.getByRole("button", { name: /Create Coupon/i }));

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it("prevents submission if code has error", async () => {
      mockCouponsService.validateCode.mockResolvedValueOnce({
        available: false,
        suggestions: [],
      });

      jest.useFakeTimers();
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *");
      fireEvent.change(input, { target: { value: "TESTCODE" } });
      fireEvent.change(screen.getByLabelText("Display Name *"), {
        target: { value: "Test Coupon" },
      });

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(
          screen.getByText("This coupon code is already in use")
        ).toBeInTheDocument();
      });

      fireEvent.submit(screen.getByRole("button", { name: /Create Coupon/i }));

      expect(mockToast.error).toHaveBeenCalledWith(
        "Please fix validation errors"
      );
      expect(mockOnSubmit).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it("requires coupon code", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.change(screen.getByLabelText("Display Name *"), {
        target: { value: "Test Coupon" },
      });

      fireEvent.submit(screen.getByRole("button", { name: /Create Coupon/i }));

      expect(mockToast.error).toHaveBeenCalledWith("Coupon code is required");
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("requires shop ID", () => {
      render(<CouponForm mode="create" onSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByLabelText("Coupon Code *"), {
        target: { value: "TESTCODE" },
      });
      fireEvent.change(screen.getByLabelText("Display Name *"), {
        target: { value: "Test Coupon" },
      });

      fireEvent.submit(screen.getByRole("button", { name: /Create Coupon/i }));

      expect(mockToast.error).toHaveBeenCalledWith("Shop ID is required");
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("disables submit button when submitting", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByRole("button", {
        name: /Create Coupon/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("disables submit button when code has error", async () => {
      mockCouponsService.validateCode.mockResolvedValueOnce({
        available: false,
        suggestions: [],
      });

      jest.useFakeTimers();
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *");
      fireEvent.change(input, { target: { value: "TESTCODE" } });

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: /Create Coupon/i,
        });
        expect(submitButton).toBeDisabled();
      });

      jest.useRealTimers();
    });
  });

  describe("Initial Data Loading", () => {
    it("loads initial data in edit mode", () => {
      const initialData = {
        code: "SUMMER2024",
        name: "Summer Sale",
        description: "Big summer discount",
        type: CouponType.PERCENTAGE,
        discountValue: 20,
      };

      render(
        <CouponForm
          mode="edit"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
          initialData={initialData}
        />
      );

      const codeInput = screen.getByLabelText(
        "Coupon Code *"
      ) as HTMLInputElement;
      const nameInput = screen.getByLabelText(
        "Display Name *"
      ) as HTMLInputElement;
      const descInput = screen.getByLabelText(
        "Description"
      ) as HTMLTextAreaElement;

      expect(codeInput.value).toBe("SUMMER2024");
      expect(nameInput.value).toBe("Summer Sale");
      expect(descInput.value).toBe("Big summer discount");
    });

    it("uses default values when no initial data provided", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const codeInput = screen.getByLabelText(
        "Coupon Code *"
      ) as HTMLInputElement;
      const nameInput = screen.getByLabelText(
        "Display Name *"
      ) as HTMLInputElement;

      expect(codeInput.value).toBe("");
      expect(nameInput.value).toBe("");
    });
  });

  describe("Restrictions", () => {
    it("renders first order only checkbox", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const checkbox = screen.getByRole("checkbox", {
        name: /First order only/i,
      });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it("allows toggling first order only", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const checkbox = screen.getByRole("checkbox", {
        name: /First order only/i,
      });

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to form sections", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const heading = screen.getByText("Basic Information");
      expect(heading).toHaveClass("dark:text-white");
    });

    it("applies dark mode classes to inputs", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *");
      expect(input).toHaveClass("dark:bg-gray-800");
      expect(input).toHaveClass("dark:text-white");
    });

    it("applies dark mode classes to error message", async () => {
      mockCouponsService.validateCode.mockResolvedValueOnce({
        available: false,
        suggestions: [],
      });

      jest.useFakeTimers();
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByLabelText("Coupon Code *");
      fireEvent.change(input, { target: { value: "TESTCODE" } });

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        const errorMsg = screen.getByText("This coupon code is already in use");
        expect(errorMsg).toHaveClass("dark:text-red-400");
      });

      jest.useRealTimers();
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive grid to discount types", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const discountTypeGroup = document.querySelector(".grid");
      expect(discountTypeGroup).toHaveClass("grid-cols-1");
      expect(discountTypeGroup).toHaveClass("sm:grid-cols-2");
    });
  });

  describe("Accessibility", () => {
    it("has proper form structure", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("associates labels with inputs", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const codeInput = screen.getByLabelText("Coupon Code *");
      expect(codeInput).toHaveAttribute("id", "coupon-code");

      const nameInput = screen.getByLabelText("Display Name *");
      expect(nameInput).toHaveAttribute("id", "coupon-name");
    });

    it("marks required fields with asterisk", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText("Coupon Code *")).toBeInTheDocument();
      expect(screen.getByText("Display Name *")).toBeInTheDocument();
      expect(screen.getByText("Discount Type *")).toBeInTheDocument();
    });

    it("has submit button with proper type", () => {
      render(
        <CouponForm
          mode="create"
          shopId={defaultShopId}
          onSubmit={mockOnSubmit}
        />
      );

      const button = screen.getByRole("button", { name: /Create Coupon/i });
      expect(button).toHaveAttribute("type", "submit");
    });
  });
});
