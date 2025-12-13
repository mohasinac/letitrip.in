import { couponsService } from "@/services/coupons.service";
import type { CouponFE } from "@/types/frontend/coupon.types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CouponInlineForm } from "../CouponInlineForm";

// Mock dependencies
jest.mock("@/services/coupons.service", () => ({
  couponsService: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <span className={className} data-testid="loader-icon">
      Loading...
    </span>
  ),
}));

jest.mock("@/lib/date-utils", () => ({
  toDateInputValue: (date: Date) => date.toISOString().split("T")[0],
  getTodayDateInputValue: () => "2024-01-15",
}));

jest.mock("@/components/forms/FormSelect", () => ({
  __esModule: true,
  FormSelect: ({
    id,
    label,
    value,
    onChange,
    options,
    required,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Array<{ value: string; label: string }>;
    required?: boolean;
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={onChange} required={required}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

describe("CouponInlineForm", () => {
  let mockOnSuccess: jest.Mock;
  let mockOnCancel: jest.Mock;

  beforeEach(() => {
    mockOnSuccess = jest.fn();
    mockOnCancel = jest.fn();
    jest.clearAllMocks();
  });

  describe("Form Rendering", () => {
    it("renders all form fields for create mode", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole("textbox", { name: /coupon code/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /display name/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("combobox", { name: /discount type/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("spinbutton", { name: /discount value/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    it("renders Create Coupon button in create mode", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole("button", { name: /create coupon/i })
      ).toBeInTheDocument();
    });

    it("renders Update Coupon button in edit mode", () => {
      const coupon: CouponFE = {
        id: "coupon-1",
        code: "SUMMER2024",
        name: "Summer Sale",
        type: "percentage",
        discountValue: 20,
        minPurchaseAmount: 100,
        usageLimitPerUser: 1,
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-08-31"),
        shopId: "shop-123",
        applicability: "all",
        minQuantity: 1,
        firstOrderOnly: false,
        newUsersOnly: false,
        canCombineWithOtherCoupons: true,
        autoApply: false,
        isPublic: true,
        featured: false,
        currentUsageCount: 0,
        createdAt: new Date(),
      };

      render(
        <CouponInlineForm
          coupon={coupon}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole("button", { name: /update coupon/i })
      ).toBeInTheDocument();
    });

    it("renders Cancel button", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });
  });

  describe("Coupon Code Input", () => {
    it("converts code to uppercase", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "summer2024" } });

      expect((codeInput as HTMLInputElement).value).toBe("SUMMER2024");
    });

    it("disables code input in edit mode", () => {
      const coupon: CouponFE = {
        id: "coupon-1",
        code: "SUMMER2024",
        name: "Summer Sale",
        type: "percentage",
        discountValue: 20,
        minPurchaseAmount: 100,
        usageLimitPerUser: 1,
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-08-31"),
        shopId: "shop-123",
        applicability: "all",
        minQuantity: 1,
        firstOrderOnly: false,
        newUsersOnly: false,
        canCombineWithOtherCoupons: true,
        autoApply: false,
        isPublic: true,
        featured: false,
        currentUsageCount: 0,
        createdAt: new Date(),
      };

      render(
        <CouponInlineForm
          coupon={coupon}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      expect(codeInput).toBeDisabled();
    });
  });

  describe("Display Name Input", () => {
    it("allows entering display name", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Summer Sale 2024" } });

      expect((nameInput as HTMLInputElement).value).toBe("Summer Sale 2024");
    });
  });

  describe("Discount Type Select", () => {
    it("renders percentage and flat options", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const typeSelect = screen.getByRole("combobox", {
        name: /discount type/i,
      });
      expect(typeSelect).toBeInTheDocument();

      const options = Array.from((typeSelect as HTMLSelectElement).options);
      expect(options.map((opt) => opt.value)).toEqual(["percentage", "flat"]);
    });

    it("allows changing discount type", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const typeSelect = screen.getByRole("combobox", {
        name: /discount type/i,
      });
      fireEvent.change(typeSelect, { target: { value: "flat" } });

      expect((typeSelect as HTMLSelectElement).value).toBe("flat");
    });
  });

  describe("Discount Value Input", () => {
    it("allows entering discount value", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "25.50" } });

      expect((valueInput as HTMLInputElement).value).toBe("25.50");
    });
  });

  describe("Date Inputs", () => {
    it("renders start date with default value", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      expect((startDateInput as HTMLInputElement).value).toBe("2024-01-15");
    });

    it("allows changing start date", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      fireEvent.change(startDateInput, { target: { value: "2024-06-01" } });

      expect((startDateInput as HTMLInputElement).value).toBe("2024-06-01");
    });

    it("allows changing end date", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const endDateInput = screen.getByLabelText(/end date/i);
      fireEvent.change(endDateInput, { target: { value: "2024-12-31" } });

      expect((endDateInput as HTMLInputElement).value).toBe("2024-12-31");
    });
  });

  describe("Form Validation", () => {
    it("validates required coupon code", async () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill other required fields
      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Test Coupon" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "10" } });

      // Leave code empty
      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/coupon code is required/i)
        ).toBeInTheDocument();
      });
      expect(couponsService.create).not.toHaveBeenCalled();
    });

    it("validates required display name", async () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill code and value
      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "TEST2024" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "10" } });

      // Leave name empty
      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/display name is required/i)
        ).toBeInTheDocument();
      });
      expect(couponsService.create).not.toHaveBeenCalled();
    });

    it("validates discount value greater than 0", async () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "TEST2024" } });

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Test Coupon" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "0" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/discount value must be greater than 0/i)
        ).toBeInTheDocument();
      });
      expect(couponsService.create).not.toHaveBeenCalled();
    });

    it("validates percentage discount not exceeding 100%", async () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "TEST2024" } });

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Test Coupon" } });

      const typeSelect = screen.getByRole("combobox", {
        name: /discount type/i,
      });
      fireEvent.change(typeSelect, { target: { value: "percentage" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "150" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/percentage discount cannot exceed 100%/i)
        ).toBeInTheDocument();
      });
      expect(couponsService.create).not.toHaveBeenCalled();
    });

    it("allows flat discount above 100", async () => {
      (couponsService.create as jest.Mock).mockResolvedValueOnce({});

      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "TEST2024" } });

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Test Coupon" } });

      const typeSelect = screen.getByRole("combobox", {
        name: /discount type/i,
      });
      fireEvent.change(typeSelect, { target: { value: "flat" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "500" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(couponsService.create).toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission - Create Mode", () => {
    it("creates new coupon with valid data", async () => {
      (couponsService.create as jest.Mock).mockResolvedValueOnce({});

      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "SUMMER2024" } });

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Summer Sale" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "20" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(couponsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            code: "SUMMER2024",
            name: "Summer Sale",
            type: "percentage",
            discountValue: 20,
            shopId: "shop-123",
          })
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("shows loading state while creating", async () => {
      let resolveCreate: () => void;
      const createPromise = new Promise<void>((resolve) => {
        resolveCreate = resolve;
      });
      (couponsService.create as jest.Mock).mockReturnValueOnce(createPromise);

      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "TEST" } });

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Test" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "10" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      });

      resolveCreate!();
    });

    it("disables buttons while loading", async () => {
      let resolveCreate: () => void;
      const createPromise = new Promise<void>((resolve) => {
        resolveCreate = resolve;
      });
      (couponsService.create as jest.Mock).mockReturnValueOnce(createPromise);

      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "TEST" } });

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Test" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "10" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
      });

      resolveCreate!();
    });

    it("shows error message on submission failure", async () => {
      const error = new Error("Creation failed");
      (couponsService.create as jest.Mock).mockRejectedValueOnce(error);

      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "TEST" } });

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Test" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "10" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/creation failed/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it("validates shopId is required in create mode", async () => {
      render(
        <CouponInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "TEST" } });

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Test" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "10" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/shop id is required/i)).toBeInTheDocument();
      });
      expect(couponsService.create).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission - Edit Mode", () => {
    const existingCoupon: CouponFE = {
      id: "coupon-1",
      code: "SUMMER2024",
      name: "Summer Sale",
      type: "percentage",
      discountValue: 20,
      minPurchaseAmount: 100,
      usageLimitPerUser: 1,
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-08-31"),
      shopId: "shop-123",
      applicability: "all",
      minQuantity: 1,
      firstOrderOnly: false,
      newUsersOnly: false,
      canCombineWithOtherCoupons: true,
      autoApply: false,
      isPublic: true,
      featured: false,
      currentUsageCount: 0,
      createdAt: new Date(),
    };

    it("updates existing coupon", async () => {
      (couponsService.update as jest.Mock).mockResolvedValueOnce({});

      render(
        <CouponInlineForm
          coupon={existingCoupon}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Updated Summer Sale" } });

      const submitButton = screen.getByRole("button", {
        name: /update coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(couponsService.update).toHaveBeenCalledWith(
          "SUMMER2024",
          expect.objectContaining({
            name: "Updated Summer Sale",
          })
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("pre-fills form with existing coupon data", () => {
      render(
        <CouponInlineForm
          coupon={existingCoupon}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        (
          screen.getByRole("textbox", {
            name: /coupon code/i,
          }) as HTMLInputElement
        ).value
      ).toBe("SUMMER2024");
      expect(
        (
          screen.getByRole("textbox", {
            name: /display name/i,
          }) as HTMLInputElement
        ).value
      ).toBe("Summer Sale");
      expect(
        (
          screen.getByRole("combobox", {
            name: /discount type/i,
          }) as HTMLSelectElement
        ).value
      ).toBe("percentage");
      expect(
        (
          screen.getByRole("spinbutton", {
            name: /discount value/i,
          }) as HTMLInputElement
        ).value
      ).toBe("20");
    });

    it("shows error message on update failure", async () => {
      const error = new Error("Update failed");
      (couponsService.update as jest.Mock).mockRejectedValueOnce(error);

      render(
        <CouponInlineForm
          coupon={existingCoupon}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Updated Name" } });

      const submitButton = screen.getByRole("button", {
        name: /update coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Cancel Action", () => {
    it("calls onCancel when cancel button clicked", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("does not submit form when cancel clicked", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(couponsService.create).not.toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has proper form structure", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const form = screen
        .getByRole("textbox", { name: /coupon code/i })
        .closest("form");
      expect(form).toBeInTheDocument();
    });

    it("associates labels with inputs", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      const typeSelect = screen.getByRole("combobox", {
        name: /discount type/i,
      });

      expect(codeInput).toHaveAttribute("id");
      expect(nameInput).toHaveAttribute("id");
      expect(typeSelect).toHaveAttribute("id");
    });

    it("marks required fields", () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole("textbox", { name: /coupon code/i })
      ).toBeRequired();
      expect(
        screen.getByRole("textbox", { name: /display name/i })
      ).toBeRequired();
      expect(
        screen.getByRole("combobox", { name: /discount type/i })
      ).toBeRequired();
    });
  });

  describe("Error Clearing", () => {
    it("clears code error when user types", async () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Trigger code error
      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Test" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "10" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/coupon code is required/i)
        ).toBeInTheDocument();
      });

      // Clear error by typing
      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "TEST" } });

      await waitFor(() => {
        expect(
          screen.queryByText(/coupon code is required/i)
        ).not.toBeInTheDocument();
      });
    });

    it("clears name error when user types", async () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Trigger name error
      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "TEST" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "10" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/display name is required/i)
        ).toBeInTheDocument();
      });

      // Clear error by typing
      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Test Name" } });

      await waitFor(() => {
        expect(
          screen.queryByText(/display name is required/i)
        ).not.toBeInTheDocument();
      });
    });

    it("clears discount value error when user types", async () => {
      render(
        <CouponInlineForm
          shopId="shop-123"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      // Fill required fields and trigger value error
      const codeInput = screen.getByRole("textbox", { name: /coupon code/i });
      fireEvent.change(codeInput, { target: { value: "TEST" } });

      const nameInput = screen.getByRole("textbox", { name: /display name/i });
      fireEvent.change(nameInput, { target: { value: "Test" } });

      const valueInput = screen.getByRole("spinbutton", {
        name: /discount value/i,
      });
      fireEvent.change(valueInput, { target: { value: "0" } });

      const submitButton = screen.getByRole("button", {
        name: /create coupon/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/discount value must be greater than 0/i)
        ).toBeInTheDocument();
      });

      // Clear error by changing value
      fireEvent.change(valueInput, { target: { value: "10" } });

      await waitFor(() => {
        expect(
          screen.queryByText(/discount value must be greater than 0/i)
        ).not.toBeInTheDocument();
      });
    });
  });
});
