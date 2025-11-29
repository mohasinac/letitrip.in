import { render, screen, fireEvent } from "@testing-library/react";
import { CartItem } from "./CartItem";

describe("CartItem", () => {
  const mockItem = {
    id: "item1",
    productId: "prod1",
    productName: "Test Product",
    productSlug: "test-product",
    productImage: "",
    variantId: null,
    variantName: null,
    sku: "SKU1",
    price: 100,
    quantity: 2,
    maxQuantity: 10,
    subtotal: 200,
    discount: 20,
    total: 180,
    shopId: null,
    shopName: null,
    isAvailable: true,
    addedAt: new Date(),
    formattedPrice: "₹100",
    formattedSubtotal: "₹200",
    formattedTotal: "₹180",
    isOutOfStock: false,
    isLowStock: false,
    canIncrement: true,
    canDecrement: true,
    hasDiscount: true,
    addedTimeAgo: "Added just now",
    originalPrice: 120,
    stockCount: 10,
  };
  const mockUpdate = jest.fn().mockResolvedValue(undefined);
  const mockRemove = jest.fn().mockResolvedValue(undefined);

  it("renders product name and quantity", () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockUpdate}
        onRemove={mockRemove}
      />
    );
    // Both mobile and desktop views render, so use getAllByText
    expect(screen.getAllByText(/Test Product/i).length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getAllByDisplayValue("2").length).toBeGreaterThanOrEqual(1);
  });

  it("calls onUpdateQuantity when quantity changes", async () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockUpdate}
        onRemove={mockRemove}
      />
    );
    // Get the first quantity input (mobile view)
    const quantityInputs = screen.getAllByDisplayValue("2");
    fireEvent.change(quantityInputs[0], { target: { value: "3" } });
    expect(mockUpdate).toHaveBeenCalledWith("item1", 3);
  });

  it("calls onRemove when remove button clicked", async () => {
    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockUpdate}
        onRemove={mockRemove}
      />
    );
    // Get the desktop remove button (visible one)
    const removeButtons = screen.getAllByLabelText(/Remove/i);
    fireEvent.click(removeButtons[0]);
    // ConfirmDialog opens, now click the confirm button
    const confirmButtons = screen.getAllByRole("button", { name: /Remove/i });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);
    expect(mockRemove).toHaveBeenCalledWith("item1");
  });
});
