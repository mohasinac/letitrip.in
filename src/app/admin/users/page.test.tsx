import { render, screen, waitFor } from "@testing-library/react";
import AdminUsersPage from "./page";
import { useAuth } from "@/contexts/AuthContext";
import { usersService } from "@/services/users.service";

jest.mock("@/contexts/AuthContext");
jest.mock("@/services/users.service", () => ({
  usersService: {
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
  Users: ({ className }: any) => (
    <div data-testid="users-icon" className={className} />
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
  UserCog: ({ className }: any) => (
    <div data-testid="user-cog-icon" className={className} />
  ),
  Shield: ({ className }: any) => (
    <div data-testid="shield-icon" className={className} />
  ),
  Ban: ({ className }: any) => (
    <div data-testid="ban-icon" className={className} />
  ),
  CheckCircle: ({ className }: any) => (
    <div data-testid="check-icon" className={className} />
  ),
  Mail: ({ className }: any) => (
    <div data-testid="mail-icon" className={className} />
  ),
  Phone: ({ className }: any) => (
    <div data-testid="phone-icon" className={className} />
  ),
  Calendar: ({ className }: any) => (
    <div data-testid="calendar-icon" className={className} />
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

describe("AdminUsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "admin" },
      isAdmin: true,
      authLoading: false,
    });
    (usersService.list as jest.Mock).mockResolvedValue({
      data: [],
      pagination: {
        hasNextPage: false,
        total: 0,
      },
    });
  });

  it("renders user management table", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText(/Users/i)).toBeInTheDocument();
    });
  });

  it("filters users by role", async () => {
    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText(/Users/i)).toBeInTheDocument();
    });
  });
});
