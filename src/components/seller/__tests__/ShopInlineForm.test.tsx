import { shopsService } from "@/services/shops.service";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { ShopInlineForm } from "../ShopInlineForm";

// Mock dependencies
jest.mock("@/services/shops.service", () => ({
  shopsService: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

jest.mock("@/components/common/SlugInput", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    sourceText,
  }: {
    value: string;
    onChange: (value: string) => void;
    sourceText?: string;
  }) => (
    <div>
      <label htmlFor="slug-input">Slug</label>
      <input
        id="slug-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="slug-input"
        data-sourcetext={sourceText}
      />
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <span className={className} data-testid="loader-icon">
      Loading...
    </span>
  ),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("ShopInlineForm", () => {
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
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(
        screen.getByRole("textbox", { name: /shop name/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId("slug-input")).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /description/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /email/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /phone/i })
      ).toBeInTheDocument();
    });

    it("renders Create Shop button in create mode", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(
        screen.getByRole("button", { name: /create shop/i })
      ).toBeInTheDocument();
    });

    it("renders Update Shop button in edit mode", () => {
      const shop = {
        id: "shop-1",
        name: "Existing Shop",
        slug: "existing-shop",
        description: "Description",
        email: "shop@example.com",
        phone: "1234567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(
        <ShopInlineForm
          shop={shop}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole("button", { name: /update shop/i })
      ).toBeInTheDocument();
    });

    it("renders Cancel button", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });
  });

  describe("Shop Name Input", () => {
    it("allows entering shop name", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByRole("textbox", { name: /shop name/i });
      fireEvent.change(nameInput, { target: { value: "My Shop" } });

      expect((nameInput as HTMLInputElement).value).toBe("My Shop");
    });

    it("passes shop name to SlugInput as sourceText", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByRole("textbox", { name: /shop name/i });
      fireEvent.change(nameInput, { target: { value: "My Shop" } });

      const slugInput = screen.getByTestId("slug-input");
      expect(slugInput).toHaveAttribute("data-sourcetext", "My Shop");
    });
  });

  describe("Slug Input", () => {
    it("renders SlugInput component", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      expect(screen.getByTestId("slug-input")).toBeInTheDocument();
    });

    it("allows entering slug value", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "my-shop" } });

      expect((slugInput as HTMLInputElement).value).toBe("my-shop");
    });
  });

  describe("Description Field", () => {
    it("renders description textarea", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const descriptionField = screen.getByRole("textbox", {
        name: /description/i,
      });
      expect(descriptionField.tagName).toBe("TEXTAREA");
    });

    it("allows entering description", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const descriptionField = screen.getByRole("textbox", {
        name: /description/i,
      });
      fireEvent.change(descriptionField, {
        target: { value: "Shop description" },
      });

      expect((descriptionField as HTMLTextAreaElement).value).toBe(
        "Shop description"
      );
    });
  });

  describe("Email Field", () => {
    it("renders email input", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const emailInput = screen.getByRole("textbox", { name: /email/i });
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("allows entering email", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const emailInput = screen.getByRole("textbox", { name: /email/i });
      fireEvent.change(emailInput, { target: { value: "shop@example.com" } });

      expect((emailInput as HTMLInputElement).value).toBe("shop@example.com");
    });
  });

  describe("Phone Field", () => {
    it("renders phone input", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const phoneInput = screen.getByRole("textbox", { name: /phone/i });
      expect(phoneInput).toHaveAttribute("type", "tel");
    });

    it("allows entering phone number", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const phoneInput = screen.getByRole("textbox", { name: /phone/i });
      fireEvent.change(phoneInput, { target: { value: "1234567890" } });

      expect((phoneInput as HTMLInputElement).value).toBe("1234567890");
    });
  });

  describe("Form Validation", () => {
    it("validates slug is required", async () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      // Fill required name field to bypass HTML5 validation
      const nameInput = screen.getByRole("textbox", { name: /shop name/i });
      fireEvent.change(nameInput, { target: { value: "Test Shop" } });

      // Leave slug empty to trigger validation
      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "" } });

      const submitButton = screen.getByRole("button", { name: /create shop/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Slug is required");
      });
      expect(shopsService.create).not.toHaveBeenCalled();
    });

    it("allows submission with valid slug", async () => {
      shopsService.create.mockResolvedValueOnce({});

      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByRole("textbox", { name: /shop name/i });
      const slugInput = screen.getByTestId("slug-input");

      fireEvent.change(nameInput, { target: { value: "Test Shop" } });
      fireEvent.change(slugInput, { target: { value: "test-shop" } });

      const submitButton = screen.getByRole("button", { name: /create shop/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(shopsService.create).toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission - Create Mode", () => {
    it("creates new shop with valid data", async () => {
      shopsService.create.mockResolvedValueOnce({});

      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /shop name/i }), {
        target: { value: "New Shop" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "new-shop" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
        target: { value: "Shop description" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
        target: { value: "shop@example.com" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: /phone/i }), {
        target: { value: "1234567890" },
      });

      const submitButton = screen.getByRole("button", { name: /create shop/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(shopsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "New Shop",
            slug: "new-shop",
            description: "Shop description",
            email: "shop@example.com",
            phone: "1234567890",
          })
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("shows loading state while creating", async () => {
      let resolveCreate: any;
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve;
      });
      shopsService.create.mockReturnValueOnce(createPromise);

      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /shop name/i }), {
        target: { value: "Shop" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "shop" },
      });

      const submitButton = screen.getByRole("button", { name: /create shop/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
      });

      resolveCreate({});

      await waitFor(() => {
        expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
      });
    });

    it("disables buttons while loading", async () => {
      let resolveCreate: any;
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve;
      });
      shopsService.create.mockReturnValueOnce(createPromise);

      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /shop name/i }), {
        target: { value: "Shop" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "shop" },
      });

      const submitButton = screen.getByRole("button", { name: /create shop/i });
      const cancelButton = screen.getByRole("button", { name: /cancel/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
      });

      resolveCreate({});
    });

    it("shows error toast on submission failure", async () => {
      const error = new Error("Creation failed");
      shopsService.create.mockRejectedValueOnce(error);

      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /shop name/i }), {
        target: { value: "Shop" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "shop" },
      });

      const submitButton = screen.getByRole("button", { name: /create shop/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to save shop");
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it("allows optional fields to be empty", async () => {
      shopsService.create.mockResolvedValueOnce({});

      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /shop name/i }), {
        target: { value: "Shop" },
      });
      fireEvent.change(screen.getByTestId("slug-input"), {
        target: { value: "shop" },
      });

      const submitButton = screen.getByRole("button", { name: /create shop/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(shopsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Shop",
            slug: "shop",
            description: "",
            email: "",
            phone: "",
          })
        );
      });
    });
  });

  describe("Form Submission - Edit Mode", () => {
    const existingShop = {
      id: "shop-1",
      name: "Existing Shop",
      slug: "existing-shop",
      description: "Old description",
      email: "old@example.com",
      phone: "9876543210",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("updates existing shop", async () => {
      shopsService.update.mockResolvedValueOnce({});

      render(
        <ShopInlineForm
          shop={existingShop}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /shop name/i }), {
        target: { value: "Updated Shop" },
      });

      const submitButton = screen.getByRole("button", { name: /update shop/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(shopsService.update).toHaveBeenCalledWith(
          "existing-shop",
          expect.objectContaining({
            name: "Updated Shop",
          })
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("pre-fills form with existing shop data", () => {
      render(
        <ShopInlineForm
          shop={existingShop}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(
        (
          screen.getByRole("textbox", {
            name: /shop name/i,
          }) as HTMLInputElement
        ).value
      ).toBe("Existing Shop");
      expect((screen.getByTestId("slug-input") as HTMLInputElement).value).toBe(
        "existing-shop"
      );
      expect(
        (
          screen.getByRole("textbox", {
            name: /description/i,
          }) as HTMLTextAreaElement
        ).value
      ).toBe("Old description");
      expect(
        (screen.getByRole("textbox", { name: /email/i }) as HTMLInputElement)
          .value
      ).toBe("old@example.com");
      expect(
        (screen.getByRole("textbox", { name: /phone/i }) as HTMLInputElement)
          .value
      ).toBe("9876543210");
    });

    it("shows error toast on update failure", async () => {
      const error = new Error("Update failed");
      shopsService.update.mockRejectedValueOnce(error);

      render(
        <ShopInlineForm
          shop={existingShop}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByRole("textbox", { name: /shop name/i }), {
        target: { value: "Updated" },
      });

      const submitButton = screen.getByRole("button", { name: /update shop/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to save shop");
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Cancel Action", () => {
    it("calls onCancel when cancel button clicked", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("does not submit form when cancel clicked", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(shopsService.create).not.toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has proper form structure", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("associates labels with inputs", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByRole("textbox", { name: /shop name/i });
      expect(nameInput).toHaveAttribute("id", "shop-name");

      const descriptionField = screen.getByRole("textbox", {
        name: /description/i,
      });
      expect(descriptionField).toHaveAttribute("id", "shop-description");

      const emailInput = screen.getByRole("textbox", { name: /email/i });
      expect(emailInput).toHaveAttribute("id", "shop-email");

      const phoneInput = screen.getByRole("textbox", { name: /phone/i });
      expect(phoneInput).toHaveAttribute("id", "shop-phone");
    });

    it("marks required fields", () => {
      render(
        <ShopInlineForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
      );

      const nameInput = screen.getByRole("textbox", { name: /shop name/i });
      expect(nameInput).toBeRequired();
    });
  });
});
