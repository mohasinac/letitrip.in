import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { useOrderTableColumns } from "@/components";
import type { OrderDocument } from "@/db/schema";

const mockOrder: OrderDocument = {
  id: "order-1",
  productId: "prod-1",
  productTitle: "Test Product",
  userId: "user-1",
  userName: "Test User",
  userEmail: "test@example.com",
  quantity: 2,
  unitPrice: 999,
  totalPrice: 1998,
  currency: "INR",
  status: "pending",
  paymentStatus: "pending",
  orderDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("useOrderTableColumns", () => {
  it("calls onView when view button is clicked", () => {
    const onView = jest.fn();

    function TestComponent() {
      const { columns } = useOrderTableColumns(onView);
      const actionsCol = columns.find((c) => c.key === "actions");
      return <div>{actionsCol?.render?.(mockOrder)}</div>;
    }

    render(<TestComponent />);
    fireEvent.click(screen.getByRole("button", { name: "view" }));
    expect(onView).toHaveBeenCalledWith(mockOrder);
  });

  it("returns 7 columns", () => {
    function TestComponent() {
      const { columns } = useOrderTableColumns(jest.fn());
      return <span data-testid="count">{columns.length}</span>;
    }
    render(<TestComponent />);
    expect(screen.getByTestId("count").textContent).toBe("7");
  });
});

