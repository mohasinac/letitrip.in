/**
 * ProductForm Tests — Phase 9
 *
 * Verifies that CategorySelectorCreate and AddressSelectorCreate
 * are rendered in place of the old plain-text inputs.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// --- Mocks ---

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    refetch: jest.fn(),
  })),
  useApiMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useMessage: jest.fn(() => ({ showSuccess: jest.fn(), showError: jest.fn() })),
}));

jest.mock("@/lib/api-client", () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}));

jest.mock("@/features/user", () => ({
  AddressSelectorCreate: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (id: string) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="address-selector">
      <label>{label}</label>
      <select
        data-testid="address-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select address</option>
        <option value="addr-1">Home — Mumbai</option>
      </select>
    </div>
  ),
}));

jest.mock("@/components", () => ({
  FormField: ({
    name,
    label,
    value,
    onChange,
    disabled,
  }: {
    name: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    type?: string;
    placeholder?: string;
    rows?: number;
    options?: unknown[];
  }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`field-${name}`}
      />
    </div>
  ),
  CategorySelectorCreate: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (id: string) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="category-selector">
      <label>{label}</label>
      <select
        data-testid="category-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select category</option>
        <option value="cat-1">Electronics</option>
      </select>
    </div>
  ),
  Checkbox: ({
    label,
    checked,
    onChange,
    disabled,
  }: {
    label?: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
  }) => (
    <label>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={onChange}
        disabled={disabled}
        data-testid={`checkbox-${label?.toLowerCase().replace(/\s+/g, "-")}`}
      />
      {label}
    </label>
  ),
  ImageUpload: ({
    currentImage,
    onUpload,
    label,
  }: {
    currentImage?: string;
    onUpload: (url: string) => void;
    folder?: string;
    label?: string;
    helperText?: string;
  }) => (
    <div data-testid="image-upload">
      {label && <span>{label}</span>}
      <input
        data-testid="image-upload-input"
        defaultValue={currentImage}
        onChange={(e) => onUpload(e.target.value)}
      />
    </div>
  ),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4" },
    themed: { textPrimary: "text-gray-900" },
  },
}));

import { ProductForm } from "../ProductForm";

describe("ProductForm", () => {
  const baseProduct = {
    id: "prod-1",
    title: "My Product",
    description: "",
    category: "",
    categoryId: "",
    price: 0,
    currency: "INR",
    stockQuantity: 0,
    availableQuantity: 0,
    mainImage: "",
    images: [],
    status: "draft" as const,
    sellerId: "",
    sellerName: "",
    sellerEmail: "",
    featured: false,
    tags: [],
    createdAt: "",
    updatedAt: "",
  };

  it("renders CategorySelectorCreate in place of plain category text input", () => {
    render(<ProductForm product={baseProduct} onChange={jest.fn()} />);

    expect(screen.getByTestId("category-selector")).toBeInTheDocument();
    // Plain text input for category should NOT be present
    expect(screen.queryByTestId("field-category")).not.toBeInTheDocument();
  });

  it("renders AddressSelectorCreate for pickup address field", () => {
    render(<ProductForm product={baseProduct} onChange={jest.fn()} />);

    expect(screen.getByTestId("address-selector")).toBeInTheDocument();
  });

  it("CategorySelectorCreate is wired to form state via onChange", () => {
    const onChange = jest.fn();
    render(<ProductForm product={baseProduct} onChange={onChange} />);

    const select = screen.getByTestId("category-select");
    fireEvent.change(select, { target: { value: "cat-1" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: "cat-1", category: "cat-1" }),
    );
  });

  it("AddressSelectorCreate is wired to form state via onChange", () => {
    const onChange = jest.fn();
    render(<ProductForm product={baseProduct} onChange={onChange} />);

    const select = screen.getByTestId("address-select");
    fireEvent.change(select, { target: { value: "addr-1" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ pickupAddressId: "addr-1" }),
    );
  });

  it("renders Checkbox components for featured, isPromoted, isAuction", () => {
    render(<ProductForm product={baseProduct} onChange={jest.fn()} />);
    expect(screen.getByText("formFeatured")).toBeInTheDocument();
    expect(screen.getByText("formIsPromoted")).toBeInTheDocument();
    expect(screen.getByText("formIsAuction")).toBeInTheDocument();
    // No raw input[type=checkbox] outside the Checkbox mock
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThanOrEqual(3);
  });

  it("Checkbox onChange updates featured state", () => {
    const onChange = jest.fn();
    render(<ProductForm product={baseProduct} onChange={onChange} />);
    const featuredCheckbox = screen.getByTestId("checkbox-formfeatured");
    fireEvent.click(featuredCheckbox);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ featured: true }),
    );
  });

  it("renders ImageUpload for mainImage in edit mode", () => {
    render(<ProductForm product={baseProduct} onChange={jest.fn()} />);
    expect(screen.getByTestId("image-upload")).toBeInTheDocument();
  });

  it("hides ImageUpload and shows readonly field when isReadonly", () => {
    const productWithImage = {
      ...baseProduct,
      mainImage: "https://example.com/img.jpg",
    };
    render(
      <ProductForm
        product={productWithImage}
        onChange={jest.fn()}
        isReadonly
      />,
    );
    expect(screen.queryByTestId("image-upload")).not.toBeInTheDocument();
    expect(
      screen.getByDisplayValue("https://example.com/img.jpg"),
    ).toBeInTheDocument();
  });
});
