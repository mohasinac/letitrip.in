import { render, screen, waitFor } from "@testing-library/react";
import AdminDashboardPage from "./page";
import { useAuth } from "@/contexts/AuthContext";
import { analyticsService } from "@/services/analytics.service";

jest.mock("@/contexts/AuthContext");
jest.mock("@/services/analytics.service", () => ({
  analyticsService: {
    getOverview: jest.fn(),
  },
}));
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});
jest.mock("lucide-react", () => ({
  Users: ({ className }: any) => (
    <div data-testid="users-icon" className={className} />
  ),
  FolderTree: ({ className }: any) => (
    <div data-testid="folder-icon" className={className} />
  ),
  Store: ({ className }: any) => (
    <div data-testid="store-icon" className={className} />
  ),
  Package: ({ className }: any) => (
    <div data-testid="package-icon" className={className} />
  ),
  ShoppingCart: ({ className }: any) => (
    <div data-testid="cart-icon" className={className} />
  ),
  TrendingUp: ({ className }: any) => (
    <div data-testid="trending-icon" className={className} />
  ),
  ArrowRight: ({ className }: any) => (
    <div data-testid="arrow-icon" className={className} />
  ),
  Loader2: ({ className }: any) => (
    <div data-testid="loader-icon" className={className} />
  ),
}));

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: "admin" },
      isAdmin: true,
    });
    (analyticsService.getOverview as jest.Mock).mockResolvedValue({
      totalUsers: 100,
      totalCustomers: 100,
      totalSellers: 50,
      totalShops: 30,
      totalCategories: 20,
      totalProducts: 200,
      totalOrders: 150,
      activeUsers: 80,
      pendingOrders: 10,
    });
  });

  it("renders loading spinner when loading", () => {
    render(<AdminDashboardPage />);
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
  });

  it("renders dashboard stats after loading", async () => {
    render(<AdminDashboardPage />);
    await waitFor(
      () => {
        expect(screen.getByText("Total Users")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
