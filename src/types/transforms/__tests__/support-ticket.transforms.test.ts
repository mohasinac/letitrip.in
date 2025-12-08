/**
 * SUPPORT TICKET TRANSFORMATION TESTS
 *
 * Tests for support ticket type transformations between Backend and Frontend
 */

import { Timestamp } from "firebase/firestore";
import {
  SupportTicketBE,
  SupportTicketMessageBE,
} from "../../backend/support-ticket.types";
import {
  AssignTicketFormFE,
  EscalateTicketFormFE,
  ReplyToTicketFormFE,
  SupportTicketFormFE,
  UpdateTicketFormFE,
} from "../../frontend/support-ticket.types";
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  UserRole,
} from "../../shared/common.types";
import {
  toBEAssignTicketRequest,
  toBECreateSupportTicketRequest,
  toBEEscalateTicketRequest,
  toBEReplyToTicketRequest,
  toBEUpdateSupportTicketRequest,
  toFESupportTicket,
  toFESupportTicketCard,
  toFESupportTicketCards,
  toFESupportTicketMessage,
  toFESupportTicketMessages,
  toFESupportTickets,
} from "../support-ticket.transforms";

describe("Support Ticket Transformations", () => {
  const mockCreatedAt = Timestamp.fromDate(new Date("2024-01-10T10:00:00Z"));
  const mockUpdatedAt = Timestamp.fromDate(new Date("2024-01-11T14:00:00Z"));
  const mockResolvedAt = Timestamp.fromDate(new Date("2024-01-12T16:00:00Z"));

  const mockTicketBE: SupportTicketBE = {
    id: "ticket_123",
    userId: "user_123",
    shopId: "shop_123",
    orderId: "order_123",
    category: TicketCategory.ORDER_ISSUE,
    priority: TicketPriority.MEDIUM,
    subject: "Order not delivered",
    description: "I haven't received my order yet",
    attachments: ["image1.jpg", "image2.jpg"],
    status: TicketStatus.OPEN,
    assignedTo: undefined,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
    resolvedAt: undefined,
  };

  const mockMessageBE: SupportTicketMessageBE = {
    id: "message_123",
    ticketId: "ticket_123",
    senderId: "user_123",
    senderRole: UserRole.USER,
    message: "Can you help me with this?",
    attachments: ["file1.pdf"],
    isInternal: false,
    createdAt: mockCreatedAt,
  };

  describe("toFESupportTicket", () => {
    it("should transform basic ticket fields", () => {
      const result = toFESupportTicket(mockTicketBE);

      expect(result.id).toBe("ticket_123");
      expect(result.userId).toBe("user_123");
      expect(result.shopId).toBe("shop_123");
      expect(result.orderId).toBe("order_123");
      expect(result.category).toBe(TicketCategory.ORDER_ISSUE);
      expect(result.priority).toBe(TicketPriority.MEDIUM);
      expect(result.subject).toBe("Order not delivered");
      expect(result.description).toBe("I haven't received my order yet");
    });

    it("should parse dates correctly", () => {
      const result = toFESupportTicket(mockTicketBE);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.resolvedAt).toBeUndefined();
    });

    it("should parse resolved date when present", () => {
      const resolvedTicket = {
        ...mockTicketBE,
        status: TicketStatus.RESOLVED,
        resolvedAt: mockResolvedAt,
      };
      const result = toFESupportTicket(resolvedTicket);

      expect(result.resolvedAt).toBeInstanceOf(Date);
    });

    it("should format dates", () => {
      const result = toFESupportTicket(mockTicketBE);

      expect(result.formattedCreatedAt).toBeTruthy();
      expect(result.formattedUpdatedAt).toBeTruthy();
    });

    it("should format resolved date when present", () => {
      const resolvedTicket = {
        ...mockTicketBE,
        status: TicketStatus.RESOLVED,
        resolvedAt: mockResolvedAt,
      };
      const result = toFESupportTicket(resolvedTicket);

      expect(result.formattedResolvedAt).toBeTruthy();
    });

    it("should calculate isOpen flag", () => {
      const result = toFESupportTicket(mockTicketBE);

      expect(result.isOpen).toBe(true);
      expect(result.isResolved).toBe(false);
      expect(result.isClosed).toBe(false);
      expect(result.isEscalated).toBe(false);
    });

    it("should calculate isResolved flag", () => {
      const resolvedTicket = {
        ...mockTicketBE,
        status: TicketStatus.RESOLVED,
      };
      const result = toFESupportTicket(resolvedTicket);

      expect(result.isOpen).toBe(false);
      expect(result.isResolved).toBe(true);
    });

    it("should calculate isClosed flag", () => {
      const closedTicket = {
        ...mockTicketBE,
        status: TicketStatus.CLOSED,
      };
      const result = toFESupportTicket(closedTicket);

      expect(result.isClosed).toBe(true);
      expect(result.canReply).toBe(false);
    });

    it("should calculate isEscalated flag", () => {
      const escalatedTicket = {
        ...mockTicketBE,
        status: TicketStatus.ESCALATED,
      };
      const result = toFESupportTicket(escalatedTicket);

      expect(result.isEscalated).toBe(true);
    });

    it("should calculate canReply flag", () => {
      const result = toFESupportTicket(mockTicketBE);

      expect(result.canReply).toBe(true);
    });

    it("should calculate canClose flag for open ticket", () => {
      const result = toFESupportTicket(mockTicketBE);

      expect(result.canClose).toBe(true);
    });

    it("should calculate canClose flag for resolved ticket", () => {
      const resolvedTicket = {
        ...mockTicketBE,
        status: TicketStatus.RESOLVED,
      };
      const result = toFESupportTicket(resolvedTicket);

      expect(result.canClose).toBe(true);
    });

    it("should format category label", () => {
      const result = toFESupportTicket(mockTicketBE);

      expect(result.categoryLabel).toBe("Order Issue");
    });

    it("should format priority label", () => {
      const result = toFESupportTicket(mockTicketBE);

      expect(result.priorityLabel).toBe("Medium");
    });

    it("should generate status badge", () => {
      const result = toFESupportTicket(mockTicketBE);

      expect(result.statusBadge.text).toBe("Open");
      expect(result.statusBadge.variant).toBe("info");
    });

    it("should generate priority badge", () => {
      const result = toFESupportTicket(mockTicketBE);

      expect(result.priorityBadge.text).toBe("Medium");
      expect(result.priorityBadge.variant).toBe("info");
    });

    it("should handle all ticket categories", () => {
      const categories = [
        { category: TicketCategory.ORDER_ISSUE, label: "Order Issue" },
        { category: TicketCategory.RETURN_REFUND, label: "Return & Refund" },
        {
          category: TicketCategory.PRODUCT_QUESTION,
          label: "Product Question",
        },
        { category: TicketCategory.ACCOUNT, label: "Account" },
        { category: TicketCategory.PAYMENT, label: "Payment" },
        { category: TicketCategory.OTHER, label: "Other" },
      ];

      categories.forEach(({ category, label }) => {
        const ticketWithCategory = { ...mockTicketBE, category };
        const result = toFESupportTicket(ticketWithCategory);
        expect(result.categoryLabel).toBe(label);
      });
    });

    it("should handle all ticket priorities", () => {
      const priorities = [
        { priority: TicketPriority.LOW, label: "Low", variant: "success" },
        { priority: TicketPriority.MEDIUM, label: "Medium", variant: "info" },
        { priority: TicketPriority.HIGH, label: "High", variant: "warning" },
        { priority: TicketPriority.URGENT, label: "Urgent", variant: "error" },
      ];

      priorities.forEach(({ priority, label, variant }) => {
        const ticketWithPriority = { ...mockTicketBE, priority };
        const result = toFESupportTicket(ticketWithPriority);
        expect(result.priorityLabel).toBe(label);
        expect(result.priorityBadge.variant).toBe(variant);
      });
    });

    it("should handle all ticket statuses", () => {
      const statuses = [
        { status: TicketStatus.OPEN, label: "Open", variant: "info" },
        {
          status: TicketStatus.IN_PROGRESS,
          label: "In Progress",
          variant: "warning",
        },
        {
          status: TicketStatus.RESOLVED,
          label: "Resolved",
          variant: "success",
        },
        { status: TicketStatus.CLOSED, label: "Closed", variant: "default" },
        {
          status: TicketStatus.ESCALATED,
          label: "Escalated",
          variant: "error",
        },
      ];

      statuses.forEach(({ status, label, variant }) => {
        const ticketWithStatus = { ...mockTicketBE, status };
        const result = toFESupportTicket(ticketWithStatus);
        expect(result.statusBadge.text).toBe(label);
        expect(result.statusBadge.variant).toBe(variant);
      });
    });

    it("should handle attachments", () => {
      const result = toFESupportTicket(mockTicketBE);

      expect(result.attachments).toEqual(["image1.jpg", "image2.jpg"]);
    });

    it("should handle assigned tickets", () => {
      const assignedTicket = {
        ...mockTicketBE,
        assignedTo: "admin_123",
      };
      const result = toFESupportTicket(assignedTicket);

      expect(result.assignedTo).toBe("admin_123");
    });

    it("should calculate response time for responded tickets", () => {
      const respondedTicket = {
        ...mockTicketBE,
        status: TicketStatus.IN_PROGRESS,
      };
      const result = toFESupportTicket(respondedTicket);

      expect(result.responseTime).toBeTruthy();
    });

    it("should calculate resolution time for resolved tickets", () => {
      const resolvedTicket = {
        ...mockTicketBE,
        status: TicketStatus.RESOLVED,
        resolvedAt: mockResolvedAt,
      };
      const result = toFESupportTicket(resolvedTicket);

      expect(result.resolutionTime).toBeTruthy();
      expect(result.resolutionTime).toContain("Resolved in");
    });

    it("should handle ticket without order ID", () => {
      const ticketWithoutOrder = {
        ...mockTicketBE,
        orderId: undefined,
      };
      const result = toFESupportTicket(ticketWithoutOrder);

      expect(result.orderId).toBeUndefined();
    });

    it("should handle ticket without shop ID", () => {
      const ticketWithoutShop = {
        ...mockTicketBE,
        shopId: undefined,
      };
      const result = toFESupportTicket(ticketWithoutShop);

      expect(result.shopId).toBeUndefined();
    });

    it("should handle empty attachments", () => {
      const ticketWithoutAttachments = {
        ...mockTicketBE,
        attachments: [],
      };
      const result = toFESupportTicket(ticketWithoutAttachments);

      expect(result.attachments).toEqual([]);
    });
  });

  describe("toFESupportTicketCard", () => {
    it("should transform ticket to card", () => {
      const result = toFESupportTicketCard(mockTicketBE);

      expect(result.id).toBe("ticket_123");
      expect(result.subject).toBe("Order not delivered");
      expect(result.category).toBe(TicketCategory.ORDER_ISSUE);
      expect(result.priority).toBe(TicketPriority.MEDIUM);
      expect(result.status).toBe(TicketStatus.OPEN);
    });

    it("should parse dates", () => {
      const result = toFESupportTicketCard(mockTicketBE);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should format dates", () => {
      const result = toFESupportTicketCard(mockTicketBE);

      expect(result.formattedCreatedAt).toBeTruthy();
      expect(result.formattedUpdatedAt).toBeTruthy();
    });

    it("should include labels and badges", () => {
      const result = toFESupportTicketCard(mockTicketBE);

      expect(result.categoryLabel).toBe("Order Issue");
      expect(result.priorityLabel).toBe("Medium");
      expect(result.statusBadge.text).toBe("Open");
      expect(result.priorityBadge.text).toBe("Medium");
    });
  });

  describe("toFESupportTicketMessage", () => {
    it("should transform basic message fields", () => {
      const result = toFESupportTicketMessage(mockMessageBE);

      expect(result.id).toBe("message_123");
      expect(result.ticketId).toBe("ticket_123");
      expect(result.senderId).toBe("user_123");
      expect(result.senderRole).toBe(UserRole.USER);
      expect(result.message).toBe("Can you help me with this?");
    });

    it("should parse message date", () => {
      const result = toFESupportTicketMessage(mockMessageBE);

      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should format message date", () => {
      const result = toFESupportTicketMessage(mockMessageBE);

      expect(result.formattedCreatedAt).toBeTruthy();
      expect(result.timeAgo).toBeTruthy();
    });

    it("should identify customer messages", () => {
      const result = toFESupportTicketMessage(mockMessageBE);

      expect(result.isCustomer).toBe(true);
      expect(result.isStaff).toBe(false);
    });

    it("should identify staff messages", () => {
      const staffMessage = {
        ...mockMessageBE,
        senderId: "admin_123",
        senderRole: UserRole.ADMIN,
      };
      const result = toFESupportTicketMessage(staffMessage);

      expect(result.isStaff).toBe(true);
      expect(result.isCustomer).toBe(false);
    });

    it("should identify seller messages", () => {
      const sellerMessage = {
        ...mockMessageBE,
        senderId: "seller_123",
        senderRole: UserRole.SELLER,
      };
      const result = toFESupportTicketMessage(sellerMessage);

      expect(result.isCustomer).toBe(true);
      expect(result.isStaff).toBe(false);
    });

    it("should format role label for staff", () => {
      const staffMessage = {
        ...mockMessageBE,
        senderId: "admin_123",
        senderRole: UserRole.ADMIN,
      };
      const result = toFESupportTicketMessage(staffMessage);

      expect(result.roleLabel).toBe("Support Agent");
    });

    it("should format role label for customer", () => {
      const result = toFESupportTicketMessage(mockMessageBE);

      expect(result.roleLabel).toBe("Customer");
    });

    it("should format role label for seller", () => {
      const sellerMessage = {
        ...mockMessageBE,
        senderId: "seller_123",
        senderRole: UserRole.SELLER,
      };
      const result = toFESupportTicketMessage(sellerMessage);

      expect(result.roleLabel).toBe("Seller");
    });

    it("should handle internal messages", () => {
      const internalMessage = {
        ...mockMessageBE,
        isInternal: true,
      };
      const result = toFESupportTicketMessage(internalMessage);

      expect(result.isInternal).toBe(true);
    });

    it("should handle message attachments", () => {
      const result = toFESupportTicketMessage(mockMessageBE);

      expect(result.attachments).toEqual(["file1.pdf"]);
    });

    it("should handle messages without attachments", () => {
      const messageWithoutAttachments = {
        ...mockMessageBE,
        attachments: [],
      };
      const result = toFESupportTicketMessage(messageWithoutAttachments);

      expect(result.attachments).toEqual([]);
    });
  });

  describe("toBECreateSupportTicketRequest", () => {
    const mockFormData: SupportTicketFormFE = {
      category: TicketCategory.ORDER_ISSUE,
      priority: TicketPriority.MEDIUM,
      subject: "Order not delivered",
      description: "I haven't received my order yet",
      attachments: ["image1.jpg"],
      shopId: "shop_123",
      orderId: "order_123",
    };

    it("should transform form data to BE request", () => {
      const result = toBECreateSupportTicketRequest(mockFormData);

      expect(result.category).toBe(TicketCategory.ORDER_ISSUE);
      expect(result.priority).toBe(TicketPriority.MEDIUM);
      expect(result.subject).toBe("Order not delivered");
      expect(result.description).toBe("I haven't received my order yet");
      expect(result.attachments).toEqual(["image1.jpg"]);
      expect(result.shopId).toBe("shop_123");
      expect(result.orderId).toBe("order_123");
    });

    it("should handle all ticket categories", () => {
      const categories = [
        TicketCategory.ORDER_ISSUE,
        TicketCategory.RETURN_REFUND,
        TicketCategory.PRODUCT_QUESTION,
        TicketCategory.ACCOUNT,
        TicketCategory.PAYMENT,
        TicketCategory.OTHER,
      ];

      categories.forEach((category) => {
        const formWithCategory = { ...mockFormData, category };
        const result = toBECreateSupportTicketRequest(formWithCategory);
        expect(result.category).toBe(category);
      });
    });

    it("should handle all priority levels", () => {
      const priorities = [
        TicketPriority.LOW,
        TicketPriority.MEDIUM,
        TicketPriority.HIGH,
        TicketPriority.URGENT,
      ];

      priorities.forEach((priority) => {
        const formWithPriority = { ...mockFormData, priority };
        const result = toBECreateSupportTicketRequest(formWithPriority);
        expect(result.priority).toBe(priority);
      });
    });

    it("should handle optional fields", () => {
      const minimalForm = {
        category: TicketCategory.OTHER,
        priority: TicketPriority.LOW,
        subject: "Question",
        description: "I have a question",
        attachments: [],
        shopId: undefined,
        orderId: undefined,
      };
      const result = toBECreateSupportTicketRequest(minimalForm);

      expect(result.shopId).toBeUndefined();
      expect(result.orderId).toBeUndefined();
    });
  });

  describe("toBEUpdateSupportTicketRequest", () => {
    it("should transform update form data", () => {
      const formData: UpdateTicketFormFE = {
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.HIGH,
        subject: "Updated subject",
      };
      const result = toBEUpdateSupportTicketRequest(formData);

      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
      expect(result.priority).toBe(TicketPriority.HIGH);
      expect(result.subject).toBe("Updated subject");
    });

    it("should handle partial updates", () => {
      const formData: UpdateTicketFormFE = {
        status: TicketStatus.RESOLVED,
        priority: undefined,
        subject: undefined,
      };
      const result = toBEUpdateSupportTicketRequest(formData);

      expect(result.status).toBe(TicketStatus.RESOLVED);
      expect(result.priority).toBeUndefined();
      expect(result.subject).toBeUndefined();
    });
  });

  describe("toBEReplyToTicketRequest", () => {
    it("should transform reply form data", () => {
      const formData: ReplyToTicketFormFE = {
        message: "Thank you for contacting us",
        attachments: ["response.pdf"],
        isInternal: false,
      };
      const result = toBEReplyToTicketRequest(formData);

      expect(result.message).toBe("Thank you for contacting us");
      expect(result.attachments).toEqual(["response.pdf"]);
      expect(result.isInternal).toBe(false);
    });

    it("should handle internal notes", () => {
      const formData: ReplyToTicketFormFE = {
        message: "Internal note",
        attachments: [],
        isInternal: true,
      };
      const result = toBEReplyToTicketRequest(formData);

      expect(result.isInternal).toBe(true);
    });

    it("should handle replies without attachments", () => {
      const formData: ReplyToTicketFormFE = {
        message: "Reply without attachments",
        attachments: [],
        isInternal: false,
      };
      const result = toBEReplyToTicketRequest(formData);

      expect(result.attachments).toEqual([]);
    });
  });

  describe("toBEAssignTicketRequest", () => {
    it("should transform assign form data", () => {
      const formData: AssignTicketFormFE = {
        assignedTo: "admin_123",
        notes: "Assigning to senior agent",
      };
      const result = toBEAssignTicketRequest(formData);

      expect(result.assignedTo).toBe("admin_123");
      expect(result.notes).toBe("Assigning to senior agent");
    });

    it("should handle assignment without notes", () => {
      const formData: AssignTicketFormFE = {
        assignedTo: "admin_456",
        notes: undefined,
      };
      const result = toBEAssignTicketRequest(formData);

      expect(result.assignedTo).toBe("admin_456");
      expect(result.notes).toBeUndefined();
    });
  });

  describe("toBEEscalateTicketRequest", () => {
    it("should transform escalate form data", () => {
      const formData: EscalateTicketFormFE = {
        reason: "Customer is unhappy with response",
        notes: "Needs manager attention",
      };
      const result = toBEEscalateTicketRequest(formData);

      expect(result.reason).toBe("Customer is unhappy with response");
      expect(result.notes).toBe("Needs manager attention");
    });

    it("should handle escalation without notes", () => {
      const formData: EscalateTicketFormFE = {
        reason: "High priority issue",
        notes: undefined,
      };
      const result = toBEEscalateTicketRequest(formData);

      expect(result.reason).toBe("High priority issue");
      expect(result.notes).toBeUndefined();
    });
  });

  describe("Batch transformations", () => {
    it("should transform multiple tickets", () => {
      const tickets = [
        mockTicketBE,
        { ...mockTicketBE, id: "ticket_456", subject: "Another issue" },
      ];
      const result = toFESupportTickets(tickets);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("ticket_123");
      expect(result[1].id).toBe("ticket_456");
    });

    it("should transform multiple ticket cards", () => {
      const tickets = [mockTicketBE, { ...mockTicketBE, id: "ticket_789" }];
      const result = toFESupportTicketCards(tickets);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("ticket_123");
      expect(result[1].id).toBe("ticket_789");
    });

    it("should transform multiple messages", () => {
      const messages = [
        mockMessageBE,
        { ...mockMessageBE, id: "message_456", message: "Another message" },
      ];
      const result = toFESupportTicketMessages(messages);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("message_123");
      expect(result[1].id).toBe("message_456");
    });

    it("should handle empty arrays", () => {
      expect(toFESupportTickets([])).toEqual([]);
      expect(toFESupportTicketCards([])).toEqual([]);
      expect(toFESupportTicketMessages([])).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should handle long subjects", () => {
      const longSubject = "A".repeat(500);
      const ticketWithLongSubject = {
        ...mockTicketBE,
        subject: longSubject,
      };
      const result = toFESupportTicket(ticketWithLongSubject);

      expect(result.subject).toBe(longSubject);
    });

    it("should handle special characters in subject", () => {
      const specialSubject = "Order #123 & Payment 💰 Issue!";
      const ticketWithSpecialSubject = {
        ...mockTicketBE,
        subject: specialSubject,
      };
      const result = toFESupportTicket(ticketWithSpecialSubject);

      expect(result.subject).toContain("&");
      expect(result.subject).toContain("💰");
    });

    it("should handle multiple attachments", () => {
      const manyAttachments = Array(20)
        .fill(0)
        .map((_, i) => `file${i}.jpg`);
      const ticketWithManyAttachments = {
        ...mockTicketBE,
        attachments: manyAttachments,
      };
      const result = toFESupportTicket(ticketWithManyAttachments);

      expect(result.attachments).toHaveLength(20);
    });

    it("should handle urgent priority", () => {
      const urgentTicket = {
        ...mockTicketBE,
        priority: TicketPriority.URGENT,
      };
      const result = toFESupportTicket(urgentTicket);

      expect(result.priorityBadge.variant).toBe("error");
    });

    it("should handle low priority", () => {
      const lowPriorityTicket = {
        ...mockTicketBE,
        priority: TicketPriority.LOW,
      };
      const result = toFESupportTicket(lowPriorityTicket);

      expect(result.priorityBadge.variant).toBe("success");
    });

    it("should handle in-progress status", () => {
      const inProgressTicket = {
        ...mockTicketBE,
        status: TicketStatus.IN_PROGRESS,
      };
      const result = toFESupportTicket(inProgressTicket);

      expect(result.canClose).toBe(true);
      expect(result.statusBadge.variant).toBe("warning");
    });

    it("should handle long messages", () => {
      const longMessage = "A".repeat(5000);
      const messageWithLongText = {
        ...mockMessageBE,
        message: longMessage,
      };
      const result = toFESupportTicketMessage(messageWithLongText);

      expect(result.message).toBe(longMessage);
    });

    it("should handle guest messages", () => {
      const guestMessage = {
        ...mockMessageBE,
        senderRole: UserRole.GUEST,
      };
      const result = toFESupportTicketMessage(guestMessage);

      expect(result.roleLabel).toBe("Guest");
    });
  });
});
