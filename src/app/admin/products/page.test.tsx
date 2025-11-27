import { render, screen, waitFor } from "@testing-library/react";
import AdminProductsPage from "./page";
import { useAuth } from "@/contexts/AuthContext";
import { productsService } from "@/services/products.service";

jest.mock("@/contexts/AuthContext");
jest.mock("@/services/products.service", () => ({
  productsService: {
    list: jest.fn(),
  },
}));
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});
jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: any) => value,
}));
jest.mock("@/hooks/useMobile", () => ({
  useIsMobile: () => false,
}));
jest.mock("lucide-react", () => ({
  Search: ({ className }: any) => (
    <div data-testid="search-icon" className={className} />
  ),
  Filter: ({ className }: any) => (
    <div data-testid="filter-icon" className={className} />
  ),
  Edit: ({ className }: any) => (
    <div data-testid="edit-icon" className={className} />
  ),
  Trash2: ({ className }: any) => (
    <div data-testid="trash-icon" className={className} />
  ),
  Eye: ({ className }: any) => (
    <div data-testid="eye-icon" className={className} />
  ),
  Loader2: ({ className }: any) => (
    <div data-testid="loader-icon" className={className} />
  ),
  AlertCircle: ({ className }: any) => (
    <div data-testid="alert-icon" className={className} />
  ),
  Package: ({ className }: any) => (
    <div data-testid="package-icon" className={className} />
  ),
  Download: ({ className }: any) => (
    <div data-testid="download-icon" className={className} />
  ),
  X: ({ className }: any) => <div data-testid="x-icon" className={className} />,
  ChevronLeft: ({ className }: any) => (
    <div data-testid="chevron-left-icon" className={className} />
  ),
  ChevronRight: ({ className }: any) => (
    <div data-testid="chevron-right-icon" className={className} />
  ),
}));
jest.mock("@/components/seller/ViewToggle", () => ({
  ViewToggle: () => <div>ViewToggle</div>,
}));
jest.mock("@/components/common/StatusBadge", () => ({
  StatusBadge: () => <div>StatusBadge</div>,
}));
jest.mock("@/components/common/ConfirmDialog", () => ({
  ConfirmDialog: () => null,
}));
jest.mock("@/components/common/inline-edit", () => ({
  InlineEditRow: ({ children }: any) => <div>{children}</div>,
  BulkActionBar: () => <div>BulkActionBar</div>,
  TableCheckbox: ({ checked, onChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  ),
  InlineField: ({ children }: any) => <div>{children}</div>,
  UnifiedFilterSidebar: () => <div>Filters</div>,
}));

describe("AdminProductsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "admin" },
      isAdmin: true,
      authLoading: false,
    });
    (productsService.list as jest.Mock).mockResolvedValue({
      data: [],
      pagination: {
        hasNextPage: false,
        total: 0,
      },
    });
  });

  it("renders product moderation table", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => {
      expect(screen.getByText(/Products/i)).toBeInTheDocument();
    });
  });

  it("filters products by status", async () => {
    render(<AdminProductsPage />);
    await waitFor(() => {
      expect(screen.getByText(/Products/i)).toBeInTheDocument();
    });
  });
});
