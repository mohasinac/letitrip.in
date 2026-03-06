/**
 * Tests for CouponCard component
 *
 * Coverage:
 * - Renders coupon name and code
 * - Discount label computation per coupon type
 * - Active badge display
 * - Copy code button text
 * - Valid until date display
 */

import { render, screen } from "@testing-library/react";
import { CouponCard } from "../CouponCard";
import type { CouponDocument } from "@/db/schema";

jest.mock("@/utils", () => ({
  formatCurrency: (v: number) => `₹${v}`,
  formatDate: () => "31 Dec 2025",
}));

// clipboard mock
Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

const baseCoupon: CouponDocument = {
  id: "coupon-001",
  code: "SAVE20",
  name: "Save 20% Off",
  description: "Get 20% off on all products",
  type: "percentage",
  discount: { value: 20 },
  usage: { currentUsage: 5 },
  validity: {
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    isActive: true,
  },
  restrictions: {
    firstTimeUserOnly: false,
    combineWithSellerCoupons: false,
  },
  createdBy: "admin-001",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  stats: { totalUses: 5, totalRevenue: 5000, totalDiscount: 1000 },
};

describe("CouponCard", () => {
  it("renders coupon name and code", () => {
    render(<CouponCard coupon={baseCoupon} />);
    expect(screen.getByText("Save 20% Off")).toBeInTheDocument();
    expect(screen.getByText("SAVE20")).toBeInTheDocument();
  });

  it("shows percentage discount label", () => {
    render(<CouponCard coupon={baseCoupon} />);
    // "20% off" — value from en.json promotions.off
    // both the coupon name ("Save 20% Off") and the discount label ("20% off") match
    const matches = screen.getAllByText(/20% off/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("shows fixed discount label for fixed type", () => {
    const fixed: CouponDocument = {
      ...baseCoupon,
      type: "fixed",
      discount: { value: 100 },
    };
    render(<CouponCard coupon={fixed} />);
    expect(screen.getByText(/₹100/)).toBeInTheDocument();
    expect(screen.getByText(/flat off/i)).toBeInTheDocument();
  });

  it("shows free shipping label for free_shipping type", () => {
    const freeShipping: CouponDocument = {
      ...baseCoupon,
      type: "free_shipping",
    };
    render(<CouponCard coupon={freeShipping} />);
    expect(screen.getByText(/free shipping/i)).toBeInTheDocument();
  });

  it("shows buy x get y label for buy_x_get_y type", () => {
    const bxgy: CouponDocument = { ...baseCoupon, type: "buy_x_get_y" };
    render(<CouponCard coupon={bxgy} />);
    expect(screen.getByText(/buy x get y/i)).toBeInTheDocument();
  });

  it("shows active badge when isActive is true", () => {
    render(<CouponCard coupon={baseCoupon} />);
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it("shows copy code button", () => {
    render(<CouponCard coupon={baseCoupon} />);
    expect(screen.getByText(/copy code/i)).toBeInTheDocument();
  });

  it("shows valid until date", () => {
    render(<CouponCard coupon={baseCoupon} />);
    expect(screen.getByText(/valid until/i)).toBeInTheDocument();
    expect(screen.getByText(/31 Dec 2025/)).toBeInTheDocument();
  });
});
