import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SellerCreateProductView } from "../SellerCreateProductView";

const mockPush = jest.fn();
const mockMutate = jest.fn();
let mockIsLoading = false;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({
      createProduct: "Create Product",
      createProductSubtitle: "Fill in the details below",
      createSuccess: "Product created successfully",
      saving: "Saving...",
      saveListing: "Save Listing",
      saveFailed: "Failed to save product",
      cancel: "Cancel",
      addProduct: "Add New Listing",
    })[key] ?? key,
}));

jest.mock("@/hooks", () => ({
  useApiMutation: ({ onSuccess, onError }: any) => ({
    mutate: (...args: any[]) => mockMutate(onSuccess, onError, ...args),
    isLoading: mockIsLoading,
  }),
  useMessage: () => ({ showMessage: jest.fn() }),
}));

jest.mock("@/services", () => ({
  sellerService: {
    createProduct: jest.fn(() => Promise.resolve({ id: "p-1" })),
  },
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    SELLER: {
      PRODUCTS: "/seller/products",
      PRODUCTS_NEW: "/seller/products/new",
    },
  },
  THEME_CONSTANTS: {
    spacing: { stack: "space-y-4", padding: { lg: "p-6" } },
    themed: { bgPrimary: "bg-white", bgSecondary: "bg-gray-50" },
    borderRadius: { xl: "rounded-xl" },
  },
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title, subtitle }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
  Button: ({ children, onClick, type, disabled }: any) => (
    <button onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  ),
  ProductForm: ({ product, onChange }: any) => (
    <div data-testid="product-form">
      <input
        data-testid="title-input"
        value={product.title || ""}
        onChange={(e) => onChange({ ...product, title: e.target.value })}
      />
    </div>
  ),
}));

describe("SellerCreateProductView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
  });

  it("renders page header and product form", () => {
    render(<SellerCreateProductView />);
    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByTestId("product-form")).toBeInTheDocument();
  });

  it("renders Save Listing button", () => {
    render(<SellerCreateProductView />);
    expect(screen.getByText("Save Listing")).toBeInTheDocument();
  });

  it("renders Cancel button that navigates back", () => {
    render(<SellerCreateProductView />);
    const cancelBtn = screen.getByText("Cancel");
    fireEvent.click(cancelBtn);
    expect(mockPush).toHaveBeenCalledWith("/seller/products");
  });

  it("submit is disabled when title is empty", () => {
    render(<SellerCreateProductView />);
    const submitBtn = screen.getByText("Save Listing");
    expect(submitBtn).toBeDisabled();
  });

  it("submit calls createProduct when title is filled", () => {
    render(<SellerCreateProductView />);
    const input = screen.getByTestId("title-input");
    fireEvent.change(input, { target: { value: "Trek Pack" } });
    const form = screen.getByTestId("product-form").closest("form");
    if (form) fireEvent.submit(form);
    expect(mockMutate).toHaveBeenCalled();
  });

  it("shows Saving... when loading", () => {
    mockIsLoading = true;
    render(<SellerCreateProductView />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });
});
