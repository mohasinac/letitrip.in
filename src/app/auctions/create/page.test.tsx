import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CreateAuctionPage from "@/app/auctions/create/page";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/app", () => ({
  app: {},
  database: {},
  analytics: null,
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock services
jest.mock("@/services/auctions.service");
jest.mock("@/services/shops.service", () => ({
  shopsService: {
    list: jest.fn(() =>
      Promise.resolve({
        data: [
          {
            id: "shop-1",
            name: "Test Shop",
            slug: "test-shop",
            logo: "/shop-logo.jpg",
            rating: 4.5,
            ratingDisplay: "4.5",
            totalProducts: 10,
            isVerified: true,
            urlPath: "/shops/test-shop",
            badges: ["Verified"],
          },
        ],
        count: 1,
        pagination: {
          limit: 50,
          hasNextPage: false,
          nextCursor: null,
          count: 1,
        },
      })
    ),
  },
}));
jest.mock("@/services/products.service");

// Mock contexts
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => ({ user: { id: "test-user" } })),
}));

// Mock components
jest.mock("@/components/admin/LoadingSpinner", () => ({
  LoadingSpinner: () => <div>Loading...</div>,
}));

jest.mock("@/components/common/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/seller/AuctionForm", () => ({
  default: () => <div>Auction Form</div>,
}));

jest.mock("@/components/ui", () => ({
  Card: ({ children, title }: any) => (
    <div>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  ),
}));

describe("CreateAuctionPage", () => {
  it("renders without crashing", async () => {
    render(<CreateAuctionPage />);

    await waitFor(() => {
      expect(screen.getByText("Create New Auction")).toBeInTheDocument();
    });
  });
});
