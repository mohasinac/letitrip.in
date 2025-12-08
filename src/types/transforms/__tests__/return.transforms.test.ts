/**
 * RETURN TRANSFORMATION TESTS
 *
 * Tests for return type transformations between Backend and Frontend
 */

import { Timestamp } from "firebase/firestore";
import { ReturnBE } from "../../backend/return.types";
import { ReturnFE, ReturnFormFE } from "../../frontend/return.types";
import { ReturnReason, ReturnStatus } from "../../shared/common.types";
import {
  returnBEtoCard,
  returnBEtoFE,
  returnFEtoBE,
  returnFormFEtoRequestBE,
} from "../return.transforms";

describe("Return Transformations", () => {
  const mockCreatedAt = Timestamp.fromDate(new Date("2024-01-10T10:00:00Z"));
  const mockUpdatedAt = Timestamp.fromDate(new Date("2024-01-15T09:00:00Z"));
  const mockRefundedAt = Timestamp.fromDate(new Date("2024-01-16T14:00:00Z"));

  const mockReturnBE: ReturnBE = {
    id: "return_123",
    orderId: "order_123",
    orderItemId: "item_123",
    customerId: "customer_123",
    shopId: "shop_123",
    reason: ReturnReason.DEFECTIVE,
    description: "Product is defective",
    media: ["image1.jpg", "image2.jpg"],
    status: ReturnStatus.REQUESTED,
    refundAmount: 1500,
    refundMethod: "original_payment",
    refundTransactionId: undefined,
    refundedAt: undefined,
    requiresAdminIntervention: false,
    adminNotes: undefined,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  };

  describe("returnBEtoFE", () => {
    it("should transform basic return fields", () => {
      const result = returnBEtoFE(mockReturnBE);

      expect(result.id).toBe("return_123");
      expect(result.orderId).toBe("order_123");
      expect(result.orderItemId).toBe("item_123");
      expect(result.customerId).toBe("customer_123");
      expect(result.shopId).toBe("shop_123");
    });

    it("should parse reason and status", () => {
      const result = returnBEtoFE(mockReturnBE);

      expect(result.reason).toBe(ReturnReason.DEFECTIVE);
      expect(result.status).toBe(ReturnStatus.REQUESTED);
    });

    it("should parse description and media", () => {
      const result = returnBEtoFE(mockReturnBE);

      expect(result.description).toBe("Product is defective");
      expect(result.media).toEqual(["image1.jpg", "image2.jpg"]);
    });

    it("should parse refund information", () => {
      const result = returnBEtoFE(mockReturnBE);

      expect(result.refundAmount).toBe(1500);
      expect(result.refundMethod).toBe("original_payment");
      expect(result.refundTransactionId).toBeUndefined();
      expect(result.refundedAt).toBeUndefined();
    });

    it("should parse dates correctly", () => {
      const result = returnBEtoFE(mockReturnBE);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should parse refunded date when present", () => {
      const refundedReturn = {
        ...mockReturnBE,
        refundedAt: mockRefundedAt,
      };
      const result = returnBEtoFE(refundedReturn);

      expect(result.refundedAt).toBeInstanceOf(Date);
    });

    it("should format status text", () => {
      const result = returnBEtoFE(mockReturnBE);

      expect(result.statusText).toBe("Requested");
    });

    it("should format reason text", () => {
      const result = returnBEtoFE(mockReturnBE);

      expect(result.reasonText).toBe("Defective Product");
    });

    it("should format refund amount", () => {
      const result = returnBEtoFE(mockReturnBE);

      expect(result.formattedRefundAmount).toContain("₹");
      expect(result.formattedRefundAmount).toContain("1,500");
    });

    it("should handle undefined refund amount", () => {
      const noRefundReturn = {
        ...mockReturnBE,
        refundAmount: undefined,
      };
      const result = returnBEtoFE(noRefundReturn);

      expect(result.formattedRefundAmount).toBeUndefined();
    });

    it("should provide isOpen helper for requested status", () => {
      const result = returnBEtoFE(mockReturnBE);

      expect(result.isOpen()).toBe(true);
    });

    it("should provide isOpen helper for approved status", () => {
      const approvedReturn = {
        ...mockReturnBE,
        status: ReturnStatus.APPROVED,
      };
      const result = returnBEtoFE(approvedReturn);

      expect(result.isOpen()).toBe(true);
    });

    it("should provide isOpen helper for completed status", () => {
      const completedReturn = {
        ...mockReturnBE,
        status: ReturnStatus.COMPLETED,
      };
      const result = returnBEtoFE(completedReturn);

      expect(result.isOpen()).toBe(false);
    });

    it("should provide isCompleted helper", () => {
      const completedReturn = {
        ...mockReturnBE,
        status: ReturnStatus.COMPLETED,
      };
      const result = returnBEtoFE(completedReturn);

      expect(result.isCompleted()).toBe(true);
    });

    it("should provide isCompleted helper for non-completed", () => {
      const result = returnBEtoFE(mockReturnBE);

      expect(result.isCompleted()).toBe(false);
    });

    it("should provide canCancel helper for requested status", () => {
      const result = returnBEtoFE(mockReturnBE);

      expect(result.canCancel()).toBe(true);
    });

    it("should provide canCancel helper for approved status", () => {
      const approvedReturn = {
        ...mockReturnBE,
        status: ReturnStatus.APPROVED,
      };
      const result = returnBEtoFE(approvedReturn);

      expect(result.canCancel()).toBe(false);
    });

    it("should handle admin intervention flag", () => {
      const adminReturn = {
        ...mockReturnBE,
        requiresAdminIntervention: true,
        adminNotes: "Needs review",
      };
      const result = returnBEtoFE(adminReturn);

      expect(result.requiresAdminIntervention).toBe(true);
      expect(result.adminNotes).toBe("Needs review");
    });

    it("should handle all status types", () => {
      const statuses = [
        { status: ReturnStatus.REQUESTED, text: "Requested" },
        { status: ReturnStatus.APPROVED, text: "Approved" },
        { status: ReturnStatus.REJECTED, text: "Rejected" },
        { status: ReturnStatus.ITEM_RECEIVED, text: "Item Received" },
        { status: ReturnStatus.REFUND_PROCESSED, text: "Refund Processed" },
        { status: ReturnStatus.COMPLETED, text: "Completed" },
        { status: ReturnStatus.ESCALATED, text: "Escalated" },
      ];

      statuses.forEach(({ status, text }) => {
        const returnWithStatus = { ...mockReturnBE, status };
        const result = returnBEtoFE(returnWithStatus);
        expect(result.statusText).toBe(text);
      });
    });

    it("should handle all reason types", () => {
      const reasons = [
        { reason: ReturnReason.DEFECTIVE, text: "Defective Product" },
        { reason: ReturnReason.WRONG_ITEM, text: "Wrong Item" },
        { reason: ReturnReason.NOT_AS_DESCRIBED, text: "Not as Described" },
        { reason: ReturnReason.DAMAGED, text: "Damaged" },
        { reason: ReturnReason.CHANGED_MIND, text: "Changed Mind" },
        { reason: ReturnReason.OTHER, text: "Other" },
      ];

      reasons.forEach(({ reason, text }) => {
        const returnWithReason = { ...mockReturnBE, reason };
        const result = returnBEtoFE(returnWithReason);
        expect(result.reasonText).toBe(text);
      });
    });

    it("should handle refund method types", () => {
      const methods = ["original_payment", "wallet", "bank_transfer"];

      methods.forEach((method) => {
        const returnWithMethod = { ...mockReturnBE, refundMethod: method };
        const result = returnBEtoFE(returnWithMethod);
        expect(result.refundMethod).toBe(method);
      });
    });

    it("should handle empty media array", () => {
      const noMediaReturn = {
        ...mockReturnBE,
        media: [],
      };
      const result = returnBEtoFE(noMediaReturn);

      expect(result.media).toEqual([]);
    });

    it("should handle undefined media", () => {
      const noMediaReturn = {
        ...mockReturnBE,
        media: undefined,
      };
      const result = returnBEtoFE(noMediaReturn);

      expect(result.media).toBeUndefined();
    });
  });

  describe("returnFEtoBE", () => {
    const mockReturnFE: ReturnFE = {
      id: "return_123",
      orderId: "order_123",
      orderItemId: "item_123",
      customerId: "customer_123",
      shopId: "shop_123",
      reason: ReturnReason.DEFECTIVE,
      description: "Product is defective",
      media: ["image1.jpg", "image2.jpg"],
      status: ReturnStatus.REQUESTED,
      refundAmount: 1500,
      refundMethod: "original_payment",
      refundTransactionId: undefined,
      refundedAt: undefined,
      requiresAdminIntervention: false,
      adminNotes: undefined,
      createdAt: new Date("2024-01-10T10:00:00Z"),
      updatedAt: new Date("2024-01-15T09:00:00Z"),
      isOpen: () => true,
      isCompleted: () => false,
      canCancel: () => true,
      statusText: "Requested",
      reasonText: "Defective Product",
      formattedRefundAmount: "₹1,500.00",
    };

    it("should transform basic return fields", () => {
      const result = returnFEtoBE(mockReturnFE);

      expect(result.id).toBe("return_123");
      expect(result.orderId).toBe("order_123");
      expect(result.orderItemId).toBe("item_123");
      expect(result.customerId).toBe("customer_123");
      expect(result.shopId).toBe("shop_123");
    });

    it("should transform reason and status", () => {
      const result = returnFEtoBE(mockReturnFE);

      expect(result.reason).toBe(ReturnReason.DEFECTIVE);
      expect(result.status).toBe(ReturnStatus.REQUESTED);
    });

    it("should transform description and media", () => {
      const result = returnFEtoBE(mockReturnFE);

      expect(result.description).toBe("Product is defective");
      expect(result.media).toEqual(["image1.jpg", "image2.jpg"]);
    });

    it("should transform refund information", () => {
      const result = returnFEtoBE(mockReturnFE);

      expect(result.refundAmount).toBe(1500);
      expect(result.refundMethod).toBe("original_payment");
    });

    it("should convert dates to timestamps", () => {
      const result = returnFEtoBE(mockReturnFE);

      expect(result.createdAt).toHaveProperty("_seconds");
      expect(result.updatedAt).toHaveProperty("_seconds");
    });

    it("should handle refunded date", () => {
      const refundedReturn = {
        ...mockReturnFE,
        refundedAt: new Date("2024-01-16T14:00:00Z"),
      };
      const result = returnFEtoBE(refundedReturn);

      expect(result.refundedAt).toHaveProperty("_seconds");
    });

    it("should handle undefined refunded date", () => {
      const result = returnFEtoBE(mockReturnFE);

      expect(result.refundedAt).toBeUndefined();
    });

    it("should handle admin intervention", () => {
      const adminReturn = {
        ...mockReturnFE,
        requiresAdminIntervention: true,
        adminNotes: "Needs review",
      };
      const result = returnFEtoBE(adminReturn);

      expect(result.requiresAdminIntervention).toBe(true);
      expect(result.adminNotes).toBe("Needs review");
    });
  });

  describe("returnBEtoCard", () => {
    it("should transform return to card", () => {
      const result = returnBEtoCard(mockReturnBE);

      expect(result.id).toBe("return_123");
      expect(result.orderId).toBe("order_123");
      expect(result.customerId).toBe("customer_123");
      expect(result.shopId).toBe("shop_123");
    });

    it("should include reason and status", () => {
      const result = returnBEtoCard(mockReturnBE);

      expect(result.reason).toBe(ReturnReason.DEFECTIVE);
      expect(result.status).toBe(ReturnStatus.REQUESTED);
    });

    it("should include refund amount", () => {
      const result = returnBEtoCard(mockReturnBE);

      expect(result.refundAmount).toBe(1500);
    });

    it("should parse created date", () => {
      const result = returnBEtoCard(mockReturnBE);

      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should include formatted status text", () => {
      const result = returnBEtoCard(mockReturnBE);

      expect(result.statusText).toBe("Requested");
    });

    it("should include formatted reason text", () => {
      const result = returnBEtoCard(mockReturnBE);

      expect(result.reasonText).toBe("Defective Product");
    });

    it("should handle different statuses", () => {
      const approvedReturn = {
        ...mockReturnBE,
        status: ReturnStatus.APPROVED,
      };
      const result = returnBEtoCard(approvedReturn);

      expect(result.statusText).toBe("Approved");
    });

    it("should handle different reasons", () => {
      const damagedReturn = {
        ...mockReturnBE,
        reason: ReturnReason.DAMAGED,
      };
      const result = returnBEtoCard(damagedReturn);

      expect(result.reasonText).toBe("Damaged");
    });
  });

  describe("returnFormFEtoRequestBE", () => {
    const mockFormData: ReturnFormFE = {
      orderId: "order_123",
      orderItemId: "item_123",
      reason: ReturnReason.DEFECTIVE,
      description: "Product is defective",
      media: ["image1.jpg", "image2.jpg"],
    };

    it("should transform form data to BE request", () => {
      const result = returnFormFEtoRequestBE(mockFormData);

      expect(result.orderId).toBe("order_123");
      expect(result.orderItemId).toBe("item_123");
      expect(result.reason).toBe(ReturnReason.DEFECTIVE);
      expect(result.description).toBe("Product is defective");
      expect(result.media).toEqual(["image1.jpg", "image2.jpg"]);
    });

    it("should handle all reason types", () => {
      const reasons = [
        ReturnReason.DEFECTIVE,
        ReturnReason.WRONG_ITEM,
        ReturnReason.NOT_AS_DESCRIBED,
        ReturnReason.DAMAGED,
        ReturnReason.CHANGED_MIND,
        ReturnReason.OTHER,
      ];

      reasons.forEach((reason) => {
        const formWithReason = { ...mockFormData, reason };
        const result = returnFormFEtoRequestBE(formWithReason);
        expect(result.reason).toBe(reason);
      });
    });

    it("should handle empty media array", () => {
      const formWithNoMedia = {
        ...mockFormData,
        media: [],
      };
      const result = returnFormFEtoRequestBE(formWithNoMedia);

      expect(result.media).toEqual([]);
    });

    it("should handle undefined media", () => {
      const formWithNoMedia = {
        ...mockFormData,
        media: undefined,
      };
      const result = returnFormFEtoRequestBE(formWithNoMedia);

      expect(result.media).toBeUndefined();
    });

    it("should handle long description", () => {
      const longDescription = "A".repeat(1000);
      const formWithLongDesc = {
        ...mockFormData,
        description: longDescription,
      };
      const result = returnFormFEtoRequestBE(formWithLongDesc);

      expect(result.description).toBe(longDescription);
    });

    it("should handle special characters in description", () => {
      const specialDesc = "Product has 😢 & @ issues!";
      const formWithSpecialDesc = {
        ...mockFormData,
        description: specialDesc,
      };
      const result = returnFormFEtoRequestBE(formWithSpecialDesc);

      expect(result.description).toBe(specialDesc);
    });
  });

  describe("Edge cases", () => {
    it("should handle return with zero refund amount", () => {
      const zeroRefundReturn = {
        ...mockReturnBE,
        refundAmount: 0,
      };
      const result = returnBEtoFE(zeroRefundReturn);

      expect(result.refundAmount).toBe(0);
      expect(result.formattedRefundAmount).toContain("₹");
      expect(result.formattedRefundAmount).toContain("0");
    });

    it("should handle return with very high refund amount", () => {
      const highRefundReturn = {
        ...mockReturnBE,
        refundAmount: 999999,
      };
      const result = returnBEtoFE(highRefundReturn);

      expect(result.refundAmount).toBe(999999);
      expect(result.formattedRefundAmount).toContain("9,99,999");
    });

    it("should handle return with transaction ID", () => {
      const refundedReturn = {
        ...mockReturnBE,
        status: ReturnStatus.REFUND_PROCESSED,
        refundTransactionId: "txn_123456",
        refundedAt: mockRefundedAt,
      };
      const result = returnBEtoFE(refundedReturn);

      expect(result.refundTransactionId).toBe("txn_123456");
      expect(result.statusText).toBe("Refund Processed");
    });

    it("should handle escalated return", () => {
      const escalatedReturn = {
        ...mockReturnBE,
        status: ReturnStatus.ESCALATED,
        requiresAdminIntervention: true,
      };
      const result = returnBEtoFE(escalatedReturn);

      expect(result.statusText).toBe("Escalated");
      expect(result.requiresAdminIntervention).toBe(true);
      expect(result.isOpen()).toBe(false);
    });

    it("should handle rejected return", () => {
      const rejectedReturn = {
        ...mockReturnBE,
        status: ReturnStatus.REJECTED,
        adminNotes: "Does not meet return criteria",
      };
      const result = returnBEtoFE(rejectedReturn);

      expect(result.statusText).toBe("Rejected");
      expect(result.adminNotes).toBe("Does not meet return criteria");
      expect(result.isOpen()).toBe(false);
      expect(result.canCancel()).toBe(false);
    });

    it("should handle return with multiple media files", () => {
      const multiMediaReturn = {
        ...mockReturnBE,
        media: Array(10)
          .fill(0)
          .map((_, i) => `image${i + 1}.jpg`),
      };
      const result = returnBEtoFE(multiMediaReturn);

      expect(result.media).toHaveLength(10);
    });

    it("should handle item received status", () => {
      const receivedReturn = {
        ...mockReturnBE,
        status: ReturnStatus.ITEM_RECEIVED,
      };
      const result = returnBEtoFE(receivedReturn);

      expect(result.statusText).toBe("Item Received");
      expect(result.isOpen()).toBe(false);
    });

    it("should handle wallet refund method", () => {
      const walletRefund = {
        ...mockReturnBE,
        refundMethod: "wallet",
      };
      const result = returnBEtoFE(walletRefund);

      expect(result.refundMethod).toBe("wallet");
    });

    it("should handle bank transfer refund method", () => {
      const bankTransferRefund = {
        ...mockReturnBE,
        refundMethod: "bank_transfer",
      };
      const result = returnBEtoFE(bankTransferRefund);

      expect(result.refundMethod).toBe("bank_transfer");
    });

    it("should handle Timestamp with _seconds format", () => {
      const timestampWithUnderscores = {
        _seconds: 1704884400,
        _nanoseconds: 123456789,
      };
      const returnWithTimestamp = {
        ...mockReturnBE,
        createdAt: timestampWithUnderscores as any,
      };
      const result = returnBEtoFE(returnWithTimestamp);

      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should handle Timestamp with seconds format", () => {
      const timestampWithoutUnderscores = {
        seconds: 1704884400,
        nanoseconds: 123456789,
      };
      const returnWithTimestamp = {
        ...mockReturnBE,
        createdAt: timestampWithoutUnderscores as any,
      };
      const result = returnBEtoFE(returnWithTimestamp);

      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });
});
