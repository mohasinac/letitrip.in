import React from "react";
import { render, screen } from "@testing-library/react";
import { RelatedProducts } from "../RelatedProducts";

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
jest.mock("@/hooks", () => ({
  useRelatedProducts: jest.fn(),
}));

import { useRelatedProducts } from "@/hooks";

const mockProduct = {
  id: "p2",
  title: "Camping Tent",
  price: 5000,
  currency: "INR",
  mainImage: "/tent.jpg",
  status: "published" as const,
  featured: false,
  isAuction: false,
  currentBid: null,
  isPromoted: false,
  slug: "camping-tent",
};

describe("RelatedProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders related products heading when products are loaded", () => {
    (useRelatedProducts as jest.Mock).mockReturnValue({
      data: { data: [mockProduct] },
      isLoading: false,
    });
    render(<RelatedProducts category="camping" excludeId="p99" />);
    expect(screen.getByText("relatedTitle")).toBeInTheDocument();
  });

  it("renders loading skeletons when loading", () => {
    (useRelatedProducts as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });
    const { container } = render(
      <RelatedProducts category="camping" excludeId="p1" />,
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders nothing when no products", () => {
    (useRelatedProducts as jest.Mock).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });
    const { container } = render(
      <RelatedProducts category="camping" excludeId="p1" />,
    );
    expect(container.firstChild).toBeNull();
  });
});
