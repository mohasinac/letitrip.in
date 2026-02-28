import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { useBidTableColumns } from "@/components";
import type { BidDocument } from "@/db/schema";

const mockBid: BidDocument = {
  id: "bid-1",
  productId: "prod-1",
  productTitle: "Vintage Camera",
  userId: "user-1",
  userName: "Bidder One",
  userEmail: "bidder@example.com",
  bidAmount: 5000,
  currency: "INR",
  bidDate: new Date(),
  status: "active",
  isWinning: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("useBidTableColumns", () => {
  it("calls onView when view button is clicked", () => {
    const onView = jest.fn();

    function TestComponent() {
      const { columns } = useBidTableColumns(onView);
      const actionsCol = columns.find((c) => c.key === "actions");
      return <div>{actionsCol?.render?.(mockBid)}</div>;
    }

    render(<TestComponent />);
    fireEvent.click(screen.getByRole("button", { name: "view" }));
    expect(onView).toHaveBeenCalledWith(mockBid);
  });

  it("returns 6 columns", () => {
    function TestComponent() {
      const { columns } = useBidTableColumns(jest.fn());
      return <span data-testid="count">{columns.length}</span>;
    }
    render(<TestComponent />);
    expect(screen.getByTestId("count").textContent).toBe("6");
  });
});
