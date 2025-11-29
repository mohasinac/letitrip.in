"use client";

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import OrderDetailPage from "@/app/user/orders/[id]/page";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService } from "@/services/orders.service";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/services/orders.service", () => ({
  ordersService: {
    getById: jest.fn(),
    downloadInvoice: jest.fn(),
    cancel: jest.fn(),
  },
}));

jest.mock("@/lib/error-redirects", () => ({
  notFound: {
    order: jest.fn(() => "/404"),
  },
}));

jest.mock("@/components/common/StatusBadge", () => ({
  StatusBadge: ({ status }: any) => <span>{status}</span>,
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(),
};

const mockUser = {
  uid: "user-123",
  email: "test@example.com",
};

const mockOrder = {
  id: "order-123",
  orderId: "ORD-123456",
  status: "pending",
  paymentStatus: "pending",
  paymentMethod: "cod",
  createdAt: "2024-01-15T10:00:00Z",
  subtotal: 1000,
  discount: 100,
  shipping: 50,
  tax: 50,
  total: 1000,
  items: [
    {
      productName: "Test Product",
      quantity: 2,
      price: 500,
      imageUrl: "/test-image.jpg",
    },
  ],
  shippingAddress: {
    name: "John Doe",
    line1: "123 Test Street",
    line2: "Apt 4B",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    phone: "9876543210",
  },
};

describe("OrderDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it("redirects to login if user is not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    expect(mockRouter.push).toHaveBeenCalledWith(
      "/login?redirect=/user/orders",
    );
  });

  it("loads order data on mount", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue(mockOrder);

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(ordersService.getById).toHaveBeenCalledWith("order-123");
    });

    expect(screen.getByText("Order #order-12")).toBeInTheDocument(); // ID is sliced to first 8 chars
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    // ₹1,000 appears multiple times (item total + order total), so use getAllByText
    expect(screen.getAllByText("₹1,000").length).toBeGreaterThan(0);
  });

  it("shows loading state initially", () => {
    (ordersService.getById as jest.Mock).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    // Loading state shows Loader2 icon with animate-spin class
    const loader = document.querySelector(".animate-spin");
    expect(loader).toBeInTheDocument();
  });

  it("handles order load error", async () => {
    const error = new Error("Order not found");
    (ordersService.getById as jest.Mock).mockRejectedValue(error);

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/404");
    });
  });

  it("displays order information correctly", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue(mockOrder);

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    // Wait for complete order details to load including payment section
    await waitFor(() => {
      expect(screen.getByText("Order #order-12")).toBeInTheDocument(); // ID sliced to 8 chars
      expect(screen.getByText("Payment Method")).toBeInTheDocument(); // Wait for payment section
    });

    // Check order header
    expect(screen.getByText(/Placed on/)).toBeInTheDocument();

    // Check order items
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("Qty: 2")).toBeInTheDocument();
    expect(screen.getByText("₹500")).toBeInTheDocument();
    expect(screen.getByText("Total: ₹1,000")).toBeInTheDocument();

    // Check shipping address
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("123 Test Street")).toBeInTheDocument();
    expect(screen.getByText("Apt 4B")).toBeInTheDocument();
    expect(screen.getByText("Mumbai, Maharashtra 400001")).toBeInTheDocument();
    expect(screen.getByText("Phone: 9876543210")).toBeInTheDocument();

    // Check order summary - use getAllByText since amounts appear multiple times
    expect(screen.getAllByText("₹1,000").length).toBeGreaterThan(0); // Subtotal
    expect(screen.getByText("-₹100")).toBeInTheDocument(); // Discount
    expect(screen.getAllByText("₹50").length).toBeGreaterThan(0); // Shipping & Tax both ₹50
    // Payment method is uppercase in component, check for it
    const paymentMethodElements = screen.getAllByText(/cod/i);
    expect(paymentMethodElements.length).toBeGreaterThan(0);
  });

  it("shows cancel button for pending and confirmed orders", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      status: "pending",
    });

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Cancel Order")).toBeInTheDocument();
    });
  });

  it("hides cancel button for shipped orders", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      status: "shipped",
    });

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.queryByText("Cancel Order")).not.toBeInTheDocument();
    });
  });

  it("cancels order when cancel button is clicked and confirmed", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      status: "pending",
    });
    (ordersService.cancel as jest.Mock).mockResolvedValue({});
    jest.spyOn(window, "confirm").mockReturnValue(true);

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Cancel Order")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel Order"));

    await waitFor(() => {
      expect(ordersService.cancel).toHaveBeenCalledWith(
        "order-123",
        "Customer requested cancellation",
      );
    });

    expect(ordersService.getById).toHaveBeenCalledTimes(2); // Initial load + reload after cancel
  });

  it("does not cancel order when user cancels confirmation", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      status: "pending",
    });
    jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Cancel Order")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancel Order"));

    expect(ordersService.cancel).not.toHaveBeenCalled();
  });

  it("downloads invoice when download button is clicked", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue(mockOrder);
    (ordersService.downloadInvoice as jest.Mock).mockResolvedValue({});

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Invoice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Invoice"));

    expect(ordersService.downloadInvoice).toHaveBeenCalledWith("order-123");
  });

  it("navigates back when back button is clicked", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue(mockOrder);

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Back to Orders")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Back to Orders"));

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("displays order timeline correctly for pending status", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      status: "pending",
    });

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Order Placed")).toBeInTheDocument();
    });

    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("displays order timeline correctly for delivered status", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      status: "delivered",
    });

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Delivered")).toBeInTheDocument();
    });
  });

  it("displays cancelled status correctly", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      status: "cancelled",
    });

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Order Cancelled")).toBeInTheDocument();
    });

    expect(
      screen.getByText("This order has been cancelled"),
    ).toBeInTheDocument();
  });

  it("displays returned status correctly", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      status: "returned",
    });

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Order Returned")).toBeInTheDocument();
    });

    expect(
      screen.getByText("This order has been returned"),
    ).toBeInTheDocument();
  });

  it("handles free shipping correctly", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      shipping: 0,
    });

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("FREE")).toBeInTheDocument();
    });
  });

  it("handles missing optional address fields", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      shippingAddress: {
        name: "John Doe",
        line1: "123 Test Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        phone: "9876543210",
      },
    });

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.queryByText("Apt 4B")).not.toBeInTheDocument();
  });

  it("handles missing order items gracefully", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      items: [],
    });

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Items (0)")).toBeInTheDocument();
    });
  });

  it("handles missing image URL with placeholder", async () => {
    (ordersService.getById as jest.Mock).mockResolvedValue({
      ...mockOrder,
      items: [
        {
          productName: "Test Product",
          quantity: 1,
          price: 500,
        },
      ],
    });

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      const img = screen.getByAltText("Test Product");
      expect(img).toHaveAttribute("src", "/placeholder.png");
    });
  });

  // Success state tests - these will reveal the bug
  it("shows success message when success=true query param is present", async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "success") return "true";
      return null;
    });

    (ordersService.getById as jest.Mock).mockResolvedValue(mockOrder);

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Order #order-12")).toBeInTheDocument(); // ID sliced to 8 chars
    });

    // Check for success message
    expect(screen.getByText("Order placed successfully!")).toBeInTheDocument();
  });

  it("shows multi-order success message when multi=true query param is present", async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "success") return "true";
      if (key === "multi") return "true";
      return null;
    });

    (ordersService.getById as jest.Mock).mockResolvedValue(mockOrder);

    render(<OrderDetailPage params={Promise.resolve({ id: "order-123" })} />);

    await waitFor(() => {
      expect(screen.getByText("Order #order-12")).toBeInTheDocument(); // ID sliced to 8 chars
    });

    // Check for multi-order success message
    expect(screen.getByText("Orders placed successfully!")).toBeInTheDocument();
    expect(
      screen.getByText("You can view all your orders below."),
    ).toBeInTheDocument();
  });
});
