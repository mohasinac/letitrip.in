import { useShopSlugValidation } from "@/lib/validation/slug";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import ShopForm from "../ShopForm";

// Mock dependencies
jest.mock("@/lib/validation/slug");

jest.mock("@/components/common/SlugInput", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    sourceText,
    error,
    disabled,
    showPreview,
    allowManualEdit,
    baseUrl,
  }: {
    value: string;
    onChange: (value: string) => void;
    sourceText?: string;
    error?: string;
    disabled?: boolean;
    showPreview?: boolean;
    allowManualEdit?: boolean;
    baseUrl?: string;
  }) => (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid="slug-input"
        placeholder="shop-slug"
      />
      {error && <span className="error">{error}</span>}
      {showPreview && baseUrl && (
        <span className="preview">
          {baseUrl}/{value}
        </span>
      )}
    </div>
  ),
}));

jest.mock("@/components/common/RichTextEditor", () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    placeholder,
    minHeight,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
  }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid="rich-text-editor"
      style={{ minHeight }}
    />
  ),
}));

jest.mock("@/components/ui/Card", () => ({
  Card: ({
    title,
    children,
  }: {
    title?: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/Button", () => ({
  Button: ({
    children,
    type,
    variant,
    leftIcon,
    ...props
  }: {
    children: React.ReactNode;
    type?: string;
    variant?: string;
    leftIcon?: React.ReactNode;
  }) => (
    <button type={type as any} data-variant={variant} {...props}>
      {leftIcon}
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/FormActions", () => ({
  FormActions: ({
    submitLabel,
    isSubmitting,
    submitDisabled,
    additionalActions,
  }: {
    submitLabel: string;
    isSubmitting?: boolean;
    submitDisabled?: boolean;
    additionalActions?: React.ReactNode;
  }) => (
    <div data-testid="form-actions">
      <button type="submit" disabled={isSubmitting || submitDisabled}>
        {submitLabel}
      </button>
      {additionalActions}
    </div>
  ),
}));

jest.mock("@/components/forms/FormField", () => ({
  FormField: ({
    label,
    required,
    error,
    children,
  }: {
    label?: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
  }) => (
    <div>
      {label && (
        <label>
          {label}
          {required && " *"}
        </label>
      )}
      {children}
      {error && <span className="error">{error}</span>}
    </div>
  ),
}));

jest.mock("@/components/forms/FormInput", () => ({
  FormInput: ({
    value,
    onChange,
    placeholder,
    disabled,
    type,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
  }) => (
    <input
      type={type || "text"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
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

const mockUseShopSlugValidation = useShopSlugValidation as jest.MockedFunction<
  typeof useShopSlugValidation
>;

describe("ShopForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseShopSlugValidation.mockReturnValue({
      checking: false,
      available: true,
      error: null,
    });
  });

  describe("Form Rendering", () => {
    it("renders all form sections", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(screen.getByText("Basic Information")).toBeInTheDocument();
      expect(screen.getByText("Contact Information")).toBeInTheDocument();
    });

    it("renders all required fields in create mode", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(screen.getByText("Shop Name *")).toBeInTheDocument();
      expect(screen.getByText("Shop Slug *")).toBeInTheDocument();
      expect(screen.getByText("Shop Description *")).toBeInTheDocument();
    });

    it("renders create button in create mode", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const submitButtons = screen.getAllByText("Create Shop");
      expect(submitButtons.length).toBeGreaterThan(0);
      const submitButton = submitButtons.find(
        (btn) => btn.getAttribute("type") === "submit"
      );
      expect(submitButton).toBeInTheDocument();
    });

    it("renders save button in edit mode", () => {
      render(
        <ShopForm mode="edit" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const submitButtons = screen.getAllByText("Save Changes");
      expect(submitButtons.length).toBeGreaterThan(0);
      const submitButton = submitButtons.find(
        (btn) => btn.getAttribute("type") === "submit"
      );
      expect(submitButton).toBeInTheDocument();
    });

    it("shows upload hint in create mode", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(
        screen.getByText(
          /You'll be able to upload logo and banner after creating the shop/i
        )
      ).toBeInTheDocument();
    });

    it("does not show upload hint in edit mode", () => {
      render(
        <ShopForm mode="edit" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(
        screen.queryByText(/You'll be able to upload logo and banner/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Shop Name Input", () => {
    it("renders shop name input with placeholder", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const input = screen.getByPlaceholderText("Enter your shop name");
      expect(input).toBeInTheDocument();
    });

    it("allows entering shop name", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const input = screen.getByPlaceholderText(
        "Enter your shop name"
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "My Awesome Shop" } });

      expect(input.value).toBe("My Awesome Shop");
    });

    it("auto-generates slug from shop name in create mode", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "My Awesome Shop" } });

      const slugInput = screen.getByTestId("slug-input") as HTMLInputElement;
      expect(slugInput.value).toBe("my-awesome-shop");
    });

    it("removes special characters from auto-generated slug", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, {
        target: { value: "Shop @ 123 & More!" },
      });

      const slugInput = screen.getByTestId("slug-input") as HTMLInputElement;
      expect(slugInput.value).toBe("shop-123-more");
    });

    it("disables input when submitting", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={true} />
      );

      const input = screen.getByPlaceholderText("Enter your shop name");
      expect(input).toBeDisabled();
    });
  });

  describe("Slug Input", () => {
    it("renders slug input with SlugInput component", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(screen.getByTestId("slug-input")).toBeInTheDocument();
    });

    it("shows slug validation status when checking", () => {
      mockUseShopSlugValidation.mockReturnValue({
        checking: true,
        available: null,
        error: null,
      });

      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(screen.getByText("Checking availability…")).toBeInTheDocument();
    });

    it("shows available status when slug is available", () => {
      mockUseShopSlugValidation.mockReturnValue({
        checking: false,
        available: true,
        error: null,
      });

      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "Test Shop" } });

      expect(screen.getByText("✓ Slug is available")).toBeInTheDocument();
    });

    it("shows taken status when slug is unavailable", () => {
      mockUseShopSlugValidation.mockReturnValue({
        checking: false,
        available: false,
        error: null,
      });

      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "Test Shop" } });

      expect(screen.getByText("✗ Slug is already taken")).toBeInTheDocument();
    });

    it("shows preview with baseUrl", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "Test Shop" } });

      expect(
        screen.getByText("https://letitrip.in/shops/test-shop")
      ).toBeInTheDocument();
    });
  });

  describe("Description Field", () => {
    it("renders rich text editor for description", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
    });

    it("shows character count", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(screen.getByText("0 characters (minimum 50)")).toBeInTheDocument();
    });

    it("updates character count when typing", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const editor = screen.getByTestId("rich-text-editor");
      fireEvent.change(editor, { target: { value: "Test description" } });

      expect(
        screen.getByText("16 characters (minimum 50)")
      ).toBeInTheDocument();
    });
  });

  describe("Contact Information", () => {
    it("renders email input", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(
        screen.getByPlaceholderText("shop@example.com")
      ).toBeInTheDocument();
    });

    it("renders phone input", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(screen.getByPlaceholderText("9876543210")).toBeInTheDocument();
    });

    it("renders location input", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(screen.getByPlaceholderText("City, State")).toBeInTheDocument();
    });

    it("renders website input", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(
        screen.getByPlaceholderText("https://yourwebsite.com")
      ).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("validates required shop name", async () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText("Shop name is required")).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("validates minimum shop name length", async () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "AB" } });

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(
          screen.getByText("Shop name must be at least 3 characters")
        ).toBeInTheDocument();
      });
    });

    it("validates slug format", async () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const slugInput = screen.getByTestId("slug-input");
      fireEvent.change(slugInput, { target: { value: "Test_Shop" } });

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "Test Shop" } });

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Slug can only contain lowercase letters, numbers, and hyphens"
          )
        ).toBeInTheDocument();
      });
    });

    it("validates slug availability", async () => {
      mockUseShopSlugValidation.mockReturnValue({
        checking: false,
        available: false,
        error: null,
      });

      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "Test Shop" } });

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(
          screen.getByText("This slug is already taken")
        ).toBeInTheDocument();
      });
    });

    it("validates required description", async () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "Test Shop" } });

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(
          screen.getByText("Shop description is required")
        ).toBeInTheDocument();
      });
    });

    it("validates minimum description length", async () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "Test Shop" } });

      const descInput = screen.getByTestId("rich-text-editor");
      fireEvent.change(descInput, { target: { value: "Short desc" } });

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(
          screen.getByText("Description must be at least 50 characters")
        ).toBeInTheDocument();
      });
    });

    it("validates email format", async () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "Test Shop" } });

      const descInput = screen.getByTestId("rich-text-editor");
      fireEvent.change(descInput, {
        target: { value: "A".repeat(50) },
      });

      const emailInput = screen.getByPlaceholderText("shop@example.com");
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      });
    });

    it("validates phone number format", async () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "Test Shop" } });

      const descInput = screen.getByTestId("rich-text-editor");
      fireEvent.change(descInput, {
        target: { value: "A".repeat(50) },
      });

      const phoneInput = screen.getByPlaceholderText("9876543210");
      fireEvent.change(phoneInput, { target: { value: "123" } });

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(
          screen.getByText("Phone number must be 10 digits")
        ).toBeInTheDocument();
      });
    });

    it("validates website URL format", async () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "Test Shop" } });

      const descInput = screen.getByTestId("rich-text-editor");
      fireEvent.change(descInput, {
        target: { value: "A".repeat(50) },
      });

      const websiteInput = screen.getByPlaceholderText(
        "https://yourwebsite.com"
      );
      fireEvent.change(websiteInput, { target: { value: "invalid-url" } });

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(
          screen.getByText("Website must be a valid URL")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("submits valid form data", async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      fireEvent.change(nameInput, { target: { value: "My Test Shop" } });

      const descInput = screen.getByTestId("rich-text-editor");
      fireEvent.change(descInput, {
        target: { value: "A".repeat(50) },
      });

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "My Test Shop",
          slug: "my-test-shop",
          description: "A".repeat(50),
        });
      });
    });

    it("includes optional fields when provided", async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      fireEvent.change(screen.getByPlaceholderText("Enter your shop name"), {
        target: { value: "My Test Shop" },
      });
      fireEvent.change(screen.getByTestId("rich-text-editor"), {
        target: { value: "A".repeat(50) },
      });
      fireEvent.change(screen.getByPlaceholderText("shop@example.com"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("9876543210"), {
        target: { value: "9876543210" },
      });
      fireEvent.change(screen.getByPlaceholderText("City, State"), {
        target: { value: "Mumbai, Maharashtra" },
      });

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "My Test Shop",
          slug: "my-test-shop",
          description: "A".repeat(50),
          email: "test@example.com",
          phone: "9876543210",
          address: "Mumbai, Maharashtra",
        });
      });
    });

    it("disables submit button when slug is checking", () => {
      mockUseShopSlugValidation.mockReturnValue({
        checking: true,
        available: null,
        error: null,
      });

      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const submitButton = submitButtons[0];
      expect(submitButton).toBeDisabled();
    });

    it("disables submit button when slug is unavailable", () => {
      mockUseShopSlugValidation.mockReturnValue({
        checking: false,
        available: false,
        error: null,
      });

      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const submitButton = submitButtons[0];
      expect(submitButton).toBeDisabled();
    });

    it("disables submit button when submitting", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={true} />
      );

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const submitButton = submitButtons[0];
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Edit Mode", () => {
    const shopData = {
      id: "shop-123",
      name: "Existing Shop",
      slug: "existing-shop",
      description: "A".repeat(50),
      address: "Mumbai, Maharashtra",
      phone: "9876543210",
      email: "shop@example.com",
    };

    it("pre-fills form with shop data", () => {
      render(
        <ShopForm
          mode="edit"
          shop={shopData as any}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      expect(
        (
          screen.getByPlaceholderText(
            "Enter your shop name"
          ) as HTMLInputElement
        ).value
      ).toBe("Existing Shop");
      expect((screen.getByTestId("slug-input") as HTMLInputElement).value).toBe(
        "existing-shop"
      );
      expect(
        (screen.getByPlaceholderText("shop@example.com") as HTMLInputElement)
          .value
      ).toBe("shop@example.com");
      expect(
        (screen.getByPlaceholderText("9876543210") as HTMLInputElement).value
      ).toBe("9876543210");
      expect(
        (screen.getByPlaceholderText("City, State") as HTMLInputElement).value
      ).toBe("Mumbai, Maharashtra");
    });

    it("does not auto-generate slug in edit mode", () => {
      render(
        <ShopForm
          mode="edit"
          shop={shopData as any}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );

      const nameInput = screen.getByPlaceholderText("Enter your shop name");
      const initialSlug = (screen.getByTestId("slug-input") as HTMLInputElement)
        .value;

      fireEvent.change(nameInput, {
        target: { value: "New Shop Name" },
      });

      const slugInput = screen.getByTestId("slug-input") as HTMLInputElement;
      expect(slugInput.value).toBe(initialSlug);
    });
  });

  describe("Accessibility", () => {
    it("has proper form structure", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("marks required fields with asterisk", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      expect(screen.getByText("Shop Name *")).toBeInTheDocument();
      expect(screen.getByText("Shop Slug *")).toBeInTheDocument();
      expect(screen.getByText("Shop Description *")).toBeInTheDocument();
    });

    it("displays error messages for invalid inputs", async () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const submitButtons = screen.getAllByRole("button", {
        name: /Create Shop/i,
      });
      const form = submitButtons[0].closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        const errors = document.querySelectorAll(".error");
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Responsive Design", () => {
    it("applies grid layout for contact fields", () => {
      render(
        <ShopForm mode="create" onSubmit={mockOnSubmit} isSubmitting={false} />
      );

      const gridContainer = document.querySelector(
        ".grid.grid-cols-1.md\\:grid-cols-2"
      );
      expect(gridContainer).toBeInTheDocument();
    });
  });
});
