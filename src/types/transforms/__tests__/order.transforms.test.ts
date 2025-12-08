/**
 * ORDER TRANSFORMATION TESTS
 *
 * Tests for order type transformations between Backend and Frontend
 */

import { Timestamp } from "firebase/firestore";
import {
  OrderBE,
  OrderItemBE,
  OrderListItemBE,
  ShippingAddressBE,
} from "../../backend/order.types";
import { CreateOrderFormFE } from "../../frontend/order.types";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingMethod,
} from "../../shared/common.types";
import {
  toBECreateOrderRequest,
  toBECreateShipmentRequest,
  toBEUpdateOrderStatusRequest,
  toFEOrder,
  toFEOrderCard,
  toFEOrderCards,
  toFEOrders,
} from "../order.transforms";

describe("Order Transformations", () => {
  const mockTimestamp = Timestamp.fromDate(new Date("2024-01-15T10:30:00Z"));
  const mockFutureTimestamp = Timestamp.fromDate(
    new Date("2024-01-20T10:30:00Z")
  );

  const mockShippingAddress: ShippingAddressBE = {
    fullName: "John Doe",
    phoneNumber: "+919876543210",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 4B",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
  };

  const mockOrderItem: OrderItemBE = {
    productId: "prod_123",
    productName: "Test Product",
    productSlug: "test-product",
    productImage: "https://example.com/product.jpg",
    variantId: "var_123",
    variantName: "Blue - Large",
    quantity: 2,
    price: 1000,
    discount: 100,
    tax: 180,
    subtotal: 2000,
    total: 2080,
  };

  const mockOrderBE: OrderBE = {
    id: "order_123",
    orderNumber: "ORD-20240115-001",
    userId: "user_123",
    userEmail: "john@example.com",
    userName: "John Doe",
    shopId: "shop_123",
    shopName: "Test Shop",
    sellerId: "seller_123",
    items: [mockOrderItem],
    itemCount: 2,
    subtotal: 2000,
    discount: 100,
    tax: 180,
    shippingCost: 100,
    total: 2180,
    couponId: "coupon_123",
    couponCode: "SAVE10",
    couponDiscount: 100,
    paymentMethod: PaymentMethod.ONLINE,
    paymentStatus: PaymentStatus.COMPLETED,
    paymentId: "pay_123",
    paymentGateway: "razorpay",
    paidAt: mockTimestamp,
    shippingMethod: ShippingMethod.EXPRESS,
    shippingAddress: mockShippingAddress,
    billingAddress: mockShippingAddress,
    trackingNumber: "TRACK123456",
    estimatedDelivery: mockFutureTimestamp,
    deliveredAt: null,
    shippingProvider: "Blue Dart",
    status: OrderStatus.SHIPPED,
    cancelledAt: null,
    cancelReason: null,
    refundAmount: 0,
    refundedAt: null,
    customerNotes: "Please deliver after 6 PM",
    adminNotes: "Priority order",
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
    metadata: { source: "web" },
  };

  describe("toFEOrder", () => {
    it("should transform basic order fields correctly", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.id).toBe("order_123");
      expect(result.orderNumber).toBe("ORD-20240115-001");
      expect(result.userId).toBe("user_123");
      expect(result.userEmail).toBe("john@example.com");
      expect(result.userName).toBe("John Doe");
      expect(result.shopId).toBe("shop_123");
      expect(result.shopName).toBe("Test Shop");
      expect(result.sellerId).toBe("seller_123");
    });

    it("should transform order items correctly", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.items).toHaveLength(1);
      expect(result.itemCount).toBe(2);

      const item = result.items[0];
      expect(item.productId).toBe("prod_123");
      expect(item.productName).toBe("Test Product");
      expect(item.variantName).toBe("Blue - Large");
      expect(item.quantity).toBe(2);
      expect(item.price).toBe(1000);
      expect(item.formattedPrice).toContain("1,000");
      expect(item.formattedSubtotal).toContain("2,000");
      expect(item.formattedTotal).toContain("2,080");
    });

    it("should format prices correctly", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.formattedSubtotal).toContain("2,000");
      expect(result.formattedDiscount).toContain("100");
      expect(result.formattedTax).toContain("180");
      expect(result.formattedShipping).toContain("100");
      expect(result.formattedTotal).toContain("2,180");
    });

    it("should handle coupon information", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.couponId).toBe("coupon_123");
      expect(result.couponCode).toBe("SAVE10");
      expect(result.couponDiscount).toBe(100);
      expect(result.formattedCouponDiscount).toContain("100");
      expect(result.hasCoupon).toBe(true);
    });

    it("should set hasCoupon to false when no coupon", () => {
      const orderWithoutCoupon = { ...mockOrderBE, couponCode: null };
      const result = toFEOrder(orderWithoutCoupon);

      expect(result.hasCoupon).toBe(false);
    });

    it("should transform payment information", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.paymentMethod).toBe(PaymentMethod.ONLINE);
      expect(result.paymentStatus).toBe(PaymentStatus.COMPLETED);
      expect(result.paymentId).toBe("pay_123");
      expect(result.paymentGateway).toBe("razorpay");
      expect(result.paidAt).toBeInstanceOf(Date);
    });

    it("should set payment status flags correctly", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.isPaid).toBe(true);
      expect(result.isPending).toBe(false);
      expect(result.isFailed).toBe(false);
      expect(result.isRefunded).toBe(false);
    });

    it("should handle pending payment status", () => {
      const pendingOrder = {
        ...mockOrderBE,
        paymentStatus: PaymentStatus.PENDING,
      };
      const result = toFEOrder(pendingOrder);

      expect(result.isPaid).toBe(false);
      expect(result.isPending).toBe(true);
    });

    it("should transform shipping information", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.shippingMethod).toBe(ShippingMethod.EXPRESS);
      expect(result.trackingNumber).toBe("TRACK123456");
      expect(result.hasTracking).toBe(true);
      expect(result.estimatedDelivery).toBeInstanceOf(Date);
    });

    it("should format shipping address correctly", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.shippingAddress.fullName).toBe("John Doe");
      expect(result.shippingAddress.phoneNumber).toBe("+919876543210");
      expect(result.shippingAddress.formattedAddress).toContain(
        "123 Main Street"
      );
      expect(result.shippingAddress.formattedAddress).toContain("Mumbai");
      expect(result.shippingAddress.formattedAddress).toContain("Maharashtra");
      expect(result.shippingAddress.shortAddress).toBe("Mumbai, Maharashtra");
    });

    it("should set order status flags correctly", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.status).toBe(OrderStatus.SHIPPED);
      expect(result.isPendingOrder).toBe(false);
      expect(result.isConfirmed).toBe(false);
      expect(result.isProcessing).toBe(false);
      expect(result.isShipped).toBe(true);
      expect(result.isDelivered).toBe(false);
      expect(result.isCancelled).toBe(false);
    });

    it("should set canCancel flag for pending orders", () => {
      const pendingOrder = { ...mockOrderBE, status: OrderStatus.PENDING };
      const result = toFEOrder(pendingOrder);

      expect(result.canCancel).toBe(true);
    });

    it("should set canCancel flag for confirmed orders", () => {
      const confirmedOrder = { ...mockOrderBE, status: OrderStatus.CONFIRMED };
      const result = toFEOrder(confirmedOrder);

      expect(result.canCancel).toBe(true);
    });

    it("should not allow cancel for shipped orders", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.canCancel).toBe(false);
    });

    it("should set canTrack flag when tracking is available", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.canTrack).toBe(true);
    });

    it("should not allow tracking for non-shipped orders", () => {
      const processingOrder = {
        ...mockOrderBE,
        status: OrderStatus.PROCESSING,
      };
      const result = toFEOrder(processingOrder);

      expect(result.canTrack).toBe(false);
    });

    it("should format order date and time", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.orderDate).toContain("Jan");
      expect(result.orderDate).toContain("15");
      expect(result.orderDate).toContain("2024");
      expect(result.orderTime).toMatch(/\d+:\d+/);
    });

    it("should calculate progress percentage", () => {
      const pendingOrder = { ...mockOrderBE, status: OrderStatus.PENDING };
      const confirmedOrder = { ...mockOrderBE, status: OrderStatus.CONFIRMED };
      const processingOrder = {
        ...mockOrderBE,
        status: OrderStatus.PROCESSING,
      };
      const shippedOrder = { ...mockOrderBE, status: OrderStatus.SHIPPED };
      const deliveredOrder = { ...mockOrderBE, status: OrderStatus.DELIVERED };

      expect(toFEOrder(pendingOrder).progressPercentage).toBe(10);
      expect(toFEOrder(confirmedOrder).progressPercentage).toBe(25);
      expect(toFEOrder(processingOrder).progressPercentage).toBe(50);
      expect(toFEOrder(shippedOrder).progressPercentage).toBe(75);
      expect(toFEOrder(deliveredOrder).progressPercentage).toBe(100);
    });

    it("should generate progress steps for normal order", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.progressSteps).toHaveLength(5);
      expect(result.progressSteps[0].label).toBe("Order Placed");
      expect(result.progressSteps[1].label).toBe("Confirmed");
      expect(result.progressSteps[2].label).toBe("Processing");
      expect(result.progressSteps[3].label).toBe("Shipped");
      expect(result.progressSteps[4].label).toBe("Delivered");
    });

    it("should generate progress steps for cancelled order", () => {
      const cancelledOrder = {
        ...mockOrderBE,
        status: OrderStatus.CANCELLED,
        cancelledAt: mockTimestamp,
        cancelReason: "Customer request",
      };
      const result = toFEOrder(cancelledOrder);

      expect(result.progressSteps).toHaveLength(2);
      expect(result.progressSteps[0].label).toBe("Order Placed");
      expect(result.progressSteps[1].label).toBe("Cancelled");
      expect(result.progressSteps[1].description).toBe("Customer request");
    });

    it("should set current step index", () => {
      const pendingOrder = { ...mockOrderBE, status: OrderStatus.PENDING };
      const shippedOrder = { ...mockOrderBE, status: OrderStatus.SHIPPED };

      expect(toFEOrder(pendingOrder).currentStep).toBe(0);
      expect(toFEOrder(shippedOrder).currentStep).toBe(3);
    });

    it("should generate order badges", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.badges).toContain("Express");
    });

    it("should add COD badge for cash on delivery", () => {
      const codOrder = { ...mockOrderBE, paymentMethod: PaymentMethod.COD };
      const result = toFEOrder(codOrder);

      expect(result.badges).toContain("COD");
    });

    it("should add coupon badge when coupon applied", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.badges).toContain("Coupon Applied");
    });

    it("should add cancelled badge for cancelled orders", () => {
      const cancelledOrder = { ...mockOrderBE, status: OrderStatus.CANCELLED };
      const result = toFEOrder(cancelledOrder);

      expect(result.badges).toContain("Cancelled");
    });

    it("should handle null dates gracefully", () => {
      const orderWithNullDates = {
        ...mockOrderBE,
        paidAt: null,
        estimatedDelivery: null,
        deliveredAt: null,
        cancelledAt: null,
        refundedAt: null,
      };
      const result = toFEOrder(orderWithNullDates);

      expect(result.paidAt).toBeNull();
      expect(result.estimatedDelivery).toBeNull();
      expect(result.deliveredAt).toBeNull();
      expect(result.cancelledAt).toBeNull();
      expect(result.refundedAt).toBeNull();
    });

    it("should include backwards compatibility fields", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.customerId).toBe("user_123");
      expect(result.internalNotes).toBe("Priority order");
      expect(result.shipping).toBe(100);
      expect(result.shippingProvider).toBe("Blue Dart");
      expect(result.billingAddress).toBeDefined();
    });

    it("should handle missing optional fields", () => {
      const minimalOrder: OrderBE = {
        ...mockOrderBE,
        couponId: null,
        couponCode: null,
        couponDiscount: 0,
        trackingNumber: null,
        estimatedDelivery: null,
        customerNotes: null,
        adminNotes: null,
        billingAddress: null,
        shippingProvider: null,
      };
      const result = toFEOrder(minimalOrder);

      expect(result.hasCoupon).toBe(false);
      expect(result.hasTracking).toBe(false);
      expect(result.billingAddress).toBeNull();
      expect(result.shippingProvider).toBeNull();
    });

    it("should format delivery status correctly", () => {
      const deliveredOrder = {
        ...mockOrderBE,
        status: OrderStatus.DELIVERED,
        deliveredAt: mockTimestamp,
      };
      const result = toFEOrder(deliveredOrder);

      expect(result.deliveryStatus).toContain("Delivered on");
    });

    it("should show in transit for shipped orders", () => {
      const result = toFEOrder(mockOrderBE);

      expect(result.deliveryStatus).toBe("In transit");
    });
  });

  describe("toFEOrderCard", () => {
    const mockOrderListItem: OrderListItemBE = {
      id: "order_123",
      orderNumber: "ORD-20240115-001",
      shopName: "Test Shop",
      itemCount: 2,
      total: 2180,
      status: OrderStatus.SHIPPED,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: PaymentMethod.ONLINE,
      shippingAddress: mockShippingAddress,
      createdAt: mockTimestamp,
    };

    it("should transform order list item to card", () => {
      const result = toFEOrderCard(mockOrderListItem);

      expect(result.id).toBe("order_123");
      expect(result.orderNumber).toBe("ORD-20240115-001");
      expect(result.shopName).toBe("Test Shop");
      expect(result.itemCount).toBe(2);
      expect(result.total).toBe(2180);
      expect(result.formattedTotal).toContain("2,180");
      expect(result.status).toBe(OrderStatus.SHIPPED);
      expect(result.paymentStatus).toBe(PaymentStatus.COMPLETED);
    });

    it("should format order date", () => {
      const result = toFEOrderCard(mockOrderListItem);

      expect(result.orderDate).toContain("Jan");
      expect(result.orderDate).toContain("15");
    });

    it("should set payment flags", () => {
      const result = toFEOrderCard(mockOrderListItem);

      expect(result.isPaid).toBe(true);
    });

    it("should set canCancel flag for pending orders", () => {
      const pendingOrder = {
        ...mockOrderListItem,
        status: OrderStatus.PENDING,
      };
      const result = toFEOrderCard(pendingOrder);

      expect(result.canCancel).toBe(true);
    });

    it("should add cancelled badge", () => {
      const cancelledOrder = {
        ...mockOrderListItem,
        status: OrderStatus.CANCELLED,
      };
      const result = toFEOrderCard(cancelledOrder);

      expect(result.badges).toContain("Cancelled");
    });

    it("should include backwards compatibility fields", () => {
      const result = toFEOrderCard(mockOrderListItem);

      expect(result.shippingAddress).toBeDefined();
      expect(result.shippingAddress?.name).toBe("John Doe");
      expect(result.shippingAddress?.phone).toBe("+919876543210");
      expect(result.items).toEqual([]);
      expect(result.paymentMethod).toBe(PaymentMethod.ONLINE);
    });

    it("should handle missing shipping address", () => {
      const orderWithoutAddress = {
        ...mockOrderListItem,
        shippingAddress: null,
      };
      const result = toFEOrderCard(orderWithoutAddress);

      expect(result.shippingAddress).toBeUndefined();
    });
  });

  describe("toBECreateOrderRequest", () => {
    const mockFormData: CreateOrderFormFE = {
      items: [
        {
          productId: "prod_123",
          variantId: "var_123",
          quantity: 2,
        },
      ],
      shippingAddressId: "addr_123",
      paymentMethod: PaymentMethod.ONLINE,
      shippingMethod: ShippingMethod.STANDARD,
      couponCode: "SAVE10",
      customerNotes: "Please deliver after 6 PM",
    };

    it("should transform form data to BE request", () => {
      const result = toBECreateOrderRequest(mockFormData);

      expect(result.items).toEqual(mockFormData.items);
      expect(result.shippingAddressId).toBe("addr_123");
      expect(result.paymentMethod).toBe(PaymentMethod.ONLINE);
      expect(result.shippingMethod).toBe(ShippingMethod.STANDARD);
      expect(result.couponCode).toBe("SAVE10");
      expect(result.customerNotes).toBe("Please deliver after 6 PM");
    });

    it("should set empty userId", () => {
      const result = toBECreateOrderRequest(mockFormData);

      expect(result.userId).toBe("");
    });

    it("should handle optional fields", () => {
      const minimalForm: CreateOrderFormFE = {
        items: [{ productId: "prod_123", variantId: null, quantity: 1 }],
        shippingAddressId: "addr_123",
        paymentMethod: PaymentMethod.COD,
        shippingMethod: ShippingMethod.STANDARD,
      };
      const result = toBECreateOrderRequest(minimalForm);

      expect(result.couponCode).toBeUndefined();
      expect(result.customerNotes).toBeUndefined();
    });
  });

  describe("Batch transformations", () => {
    it("should transform multiple orders", () => {
      const orders = [mockOrderBE, { ...mockOrderBE, id: "order_456" }];
      const result = toFEOrders(orders);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("order_123");
      expect(result[1].id).toBe("order_456");
    });

    it("should transform multiple order cards", () => {
      const mockListItem: OrderListItemBE = {
        id: "order_123",
        orderNumber: "ORD-001",
        shopName: "Test Shop",
        itemCount: 2,
        total: 2180,
        status: OrderStatus.SHIPPED,
        paymentStatus: PaymentStatus.COMPLETED,
        paymentMethod: PaymentMethod.ONLINE,
        shippingAddress: mockShippingAddress,
        createdAt: mockTimestamp,
      };
      const orders = [mockListItem, { ...mockListItem, id: "order_456" }];
      const result = toFEOrderCards(orders);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("order_123");
      expect(result[1].id).toBe("order_456");
    });

    it("should handle empty arrays", () => {
      expect(toFEOrders([])).toEqual([]);
      expect(toFEOrderCards([])).toEqual([]);
    });
  });

  describe("toBEUpdateOrderStatusRequest", () => {
    it("should create status update request", () => {
      const result = toBEUpdateOrderStatusRequest(
        OrderStatus.SHIPPED,
        "Shipped via Blue Dart"
      );

      expect(result.status).toBe(OrderStatus.SHIPPED);
      expect(result.notes).toBe("Shipped via Blue Dart");
    });

    it("should handle missing notes", () => {
      const result = toBEUpdateOrderStatusRequest(OrderStatus.CONFIRMED);

      expect(result.status).toBe(OrderStatus.CONFIRMED);
      expect(result.notes).toBeUndefined();
    });
  });

  describe("toBECreateShipmentRequest", () => {
    it("should create shipment request", () => {
      const estimatedDelivery = new Date("2024-01-20");
      const result = toBECreateShipmentRequest(
        "TRACK123456",
        "Blue Dart",
        estimatedDelivery
      );

      expect(result.trackingNumber).toBe("TRACK123456");
      expect(result.carrier).toBe("Blue Dart");
      expect(result.eta).toBeTruthy();
    });

    it("should handle missing estimated delivery", () => {
      const result = toBECreateShipmentRequest("TRACK123456", "Blue Dart");

      expect(result.trackingNumber).toBe("TRACK123456");
      expect(result.carrier).toBe("Blue Dart");
      expect(result.eta).toBeUndefined();
    });
  });

  describe("Edge cases", () => {
    it("should handle orders with multiple items", () => {
      const multiItemOrder = {
        ...mockOrderBE,
        items: [
          mockOrderItem,
          { ...mockOrderItem, productId: "prod_456" },
          { ...mockOrderItem, productId: "prod_789" },
        ],
        itemCount: 6,
      };
      const result = toFEOrder(multiItemOrder);

      expect(result.items).toHaveLength(3);
      expect(result.itemCount).toBe(6);
    });

    it("should handle orders with special characters in notes", () => {
      const orderWithSpecialChars = {
        ...mockOrderBE,
        customerNotes: "Deliver to: 'John's Place' @ 6 PM",
        adminNotes: "Handle with care & fragile items",
      };
      const result = toFEOrder(orderWithSpecialChars);

      expect(result.customerNotes).toContain("'John's Place'");
      expect(result.adminNotes).toContain("&");
    });

    it("should handle overnight shipping method", () => {
      const overnightOrder = {
        ...mockOrderBE,
        shippingMethod: ShippingMethod.OVERNIGHT,
      };
      const result = toFEOrder(overnightOrder);

      expect(result.badges).toContain("Overnight");
    });

    it("should handle refunded orders", () => {
      const refundedOrder = {
        ...mockOrderBE,
        status: OrderStatus.REFUNDED,
        paymentStatus: PaymentStatus.REFUNDED,
        refundAmount: 2180,
        refundedAt: mockTimestamp,
      };
      const result = toFEOrder(refundedOrder);

      expect(result.isRefunded).toBe(true);
      expect(result.badges).toContain("Refunded");
      expect(result.refundAmount).toBe(2180);
    });
  });
});
