import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductGrid } from "../ProductGrid";

jest.mock("@/components/feedback/Toast", () => ({
  useToast: () => ({ showToast: jest.fn(), hideToast: jest.fn() }),
  ToastProvider: ({ children }: any) => children,
}));

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  useAuth: () => ({ user: null, loading: false }),
  useMessage: () => ({
    message: null,
    showSuccess: jest.fn(),
    showError: jest.fn(),
    clearMessage: jest.fn(),
  }),
  useAddToCart: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/contexts", () => ({
  ...jest.requireActual("@/contexts"),
  useAuth: () => ({ user: null, loading: false }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}));

const mockProduct = {
  id: "p1",
  title: "Trek Boots",
  description: "Great hiking boots.",
  price: 2500,
  currency: "INR",
  mainImage: "/img.jpg",
  images: [] as string[],
  video: undefined as
    | { url: string; thumbnailUrl: string; duration: number }
    | undefined,
  status: "published" as const,
  featured: false,
  isAuction: false,
  currentBid: undefined,
  isPromoted: false,
  slug: "trek-boots",
};

describe("ProductGrid", () => {
  it("renders products when provided", () => {
    render(<ProductGrid products={[mockProduct]} />);
    expect(screen.getByText("Trek Boots")).toBeInTheDocument();
  });

  it("shows empty state when no products", () => {
    render(<ProductGrid products={[]} />);
    expect(screen.getByText("noProductsFound")).toBeInTheDocument();
    expect(screen.getByText("noProductsSubtitle")).toBeInTheDocument();
  });

  it("renders loading skeletons when loading", () => {
    const { container } = render(
      <ProductGrid products={[]} loading skeletonCount={3} />,
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
