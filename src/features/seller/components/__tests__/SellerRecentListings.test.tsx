/**
 * SellerRecentListings tests
 * TASK-36: verifies UI_LABELS → useTranslations migration
 */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components/ui", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock("@/components/typography", () => ({
  Heading: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
  Text: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
}));

jest.mock("@/constants", () => ({
  ROUTES: {
    SELLER: {
      PRODUCTS: "/seller/products",
    },
  },
  THEME_CONSTANTS: {
    themed: { textPrimary: "text-primary", borderColor: "border-color" },
    spacing: { stack: "space-y-4" },
  },
}));

import { SellerRecentListings } from "../SellerRecentListings";
import type { ProductStatus } from "@/db/schema";

type MockProduct = {
  id: string;
  title: string;
  status: ProductStatus;
  isAuction: boolean;
  price: number;
  mainImage: string;
};

const mockProducts: MockProduct[] = [
  {
    id: "p1",
    title: "Trek Himalaya Red",
    status: "published",
    isAuction: false,
    price: 5000,
    mainImage: "",
  },
  {
    id: "p2",
    title: "Vintage Camera",
    status: "draft",
    isAuction: false,
    price: 3000,
    mainImage: "",
  },
  {
    id: "p3",
    title: "Road Bike Pro",
    status: "discontinued",
    isAuction: false,
    price: 8000,
    mainImage: "",
  },
];

describe("SellerRecentListings", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders nothing when loading", () => {
    const { container } = render(
      <SellerRecentListings products={mockProducts} loading={true} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when products list is empty", () => {
    const { container } = render(
      <SellerRecentListings products={[]} loading={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders heading and view-all button when products present", () => {
    render(<SellerRecentListings products={mockProducts} loading={false} />);
    expect(screen.getByText("recentListings")).toBeInTheDocument();
    expect(screen.getByText("viewAll")).toBeInTheDocument();
  });

  it("renders product titles", () => {
    render(<SellerRecentListings products={mockProducts} loading={false} />);
    expect(screen.getByText("Trek Himalaya Red")).toBeInTheDocument();
    expect(screen.getByText("Vintage Camera")).toBeInTheDocument();
  });

  it("navigates to products page when view-all is clicked", () => {
    render(<SellerRecentListings products={mockProducts} loading={false} />);
    fireEvent.click(screen.getByText("viewAll"));
    expect(mockPush).toHaveBeenCalledWith("/seller/products");
  });

  it("limits display to 5 products", () => {
    const manyProducts: MockProduct[] = Array.from({ length: 8 }, (_, i) => ({
      id: `p${i}`,
      title: `Product ${i}`,
      status: "published",
      isAuction: false,
      price: 100,
      mainImage: "",
    }));
    render(<SellerRecentListings products={manyProducts} loading={false} />);
    const titles = screen.getAllByText(/Product \d/);
    expect(titles.length).toBe(5);
  });
});
