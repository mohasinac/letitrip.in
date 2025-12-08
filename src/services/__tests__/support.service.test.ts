import { TICKET_ROUTES } from "@/constants/api-routes";
import type {
  SupportTicketBE,
  SupportTicketFiltersBE,
  SupportTicketMessageBE,
} from "@/types/backend/support-ticket.types";
import type {
  AssignTicketFormFE,
  ReplyToTicketFormFE,
  SupportTicketFE,
  SupportTicketFormFE,
  SupportTicketMessageFE,
  UpdateTicketFormFE,
} from "@/types/frontend/support-ticket.types";
import type { PaginatedResponseBE } from "@/types/shared/common.types";
import * as transforms from "@/types/transforms/support-ticket.transforms";
import { apiService } from "../api.service";
import { supportService } from "../support.service";

jest.mock("../api.service");
jest.mock("@/types/transforms/support-ticket.transforms");

describe("SupportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTicketBE: SupportTicketBE = {
    id: "ticket_123",
    subject: "Product not delivered",
    description: "Order shipped but not received",
    category: "order",
    priority: "high",
    status: "open",
    user_id: "user_123",
    shop_id: "shop_456",
    order_id: "order_789",
    assigned_to: "admin_123",
    created_at: "2024-12-08T10:00:00Z",
    updated_at: "2024-12-08T10:00:00Z",
  };

  const mockTicketFE: SupportTicketFE = {
    id: "ticket_123",
    subject: "Product not delivered",
    description: "Order shipped but not received",
    category: "order",
    priority: "high",
    status: "open",
    userId: "user_123",
    shopId: "shop_456",
    orderId: "order_789",
    assignedTo: "admin_123",
    createdAt: "2024-12-08T10:00:00Z",
    updatedAt: "2024-12-08T10:00:00Z",
  };

  const mockMessageBE: SupportTicketMessageBE = {
    id: "msg_123",
    ticket_id: "ticket_123",
    user_id: "user_123",
    message: "Still waiting for delivery",
    attachments: [],
    is_admin: false,
    created_at: "2024-12-08T11:00:00Z",
  };

  const mockMessageFE: SupportTicketMessageFE = {
    id: "msg_123",
    ticketId: "ticket_123",
    userId: "user_123",
    message: "Still waiting for delivery",
    attachments: [],
    isAdmin: false,
    createdAt: "2024-12-08T11:00:00Z",
  };

  describe("listTickets", () => {
    it("should list tickets without filters", async () => {
      const mockResponse: PaginatedResponseBE<SupportTicketBE> = {
        data: [mockTicketBE],
        count: 1,
        pagination: { page: 1, limit: 10, totalPages: 1 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTickets as jest.Mock).mockReturnValue([
        mockTicketFE,
      ]);

      const result = await supportService.listTickets();

      expect(apiService.get).toHaveBeenCalledWith(TICKET_ROUTES.LIST);
      expect(transforms.toFESupportTickets).toHaveBeenCalledWith([
        mockTicketBE,
      ]);
      expect(result).toEqual({
        data: [mockTicketFE],
        count: 1,
        pagination: { page: 1, limit: 10, totalPages: 1 },
      });
    });

    it("should list tickets with filters", async () => {
      const filters: Partial<SupportTicketFiltersBE> = {
        status: "open",
        category: "order",
        priority: "high",
      };

      const mockResponse: PaginatedResponseBE<SupportTicketBE> = {
        data: [mockTicketBE],
        count: 1,
        pagination: { page: 1, limit: 10, totalPages: 1 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTickets as jest.Mock).mockReturnValue([
        mockTicketFE,
      ]);

      const result = await supportService.listTickets(filters);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=open")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("category=order")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("priority=high")
      );
      expect(result.data).toEqual([mockTicketFE]);
    });

    it("should filter out undefined values", async () => {
      const filters: Partial<SupportTicketFiltersBE> = {
        status: "open",
        category: undefined,
        priority: undefined,
      };

      const mockResponse: PaginatedResponseBE<SupportTicketBE> = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 10, totalPages: 1 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTickets as jest.Mock).mockReturnValue([]);

      await supportService.listTickets(filters);

      const callUrl = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain("status=open");
      expect(callUrl).not.toContain("category");
      expect(callUrl).not.toContain("priority");
    });

    it("should handle pagination filters", async () => {
      const filters: Partial<SupportTicketFiltersBE> = {
        page: 2,
        limit: 20,
      };

      const mockResponse: PaginatedResponseBE<SupportTicketBE> = {
        data: [],
        count: 0,
        pagination: { page: 2, limit: 20, totalPages: 1 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTickets as jest.Mock).mockReturnValue([]);

      await supportService.listTickets(filters);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("page=2")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=20")
      );
    });
  });

  describe("getTicket", () => {
    it("should get ticket by ID", async () => {
      const mockResponse = { data: mockTicketBE };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTicket as jest.Mock).mockReturnValue(mockTicketFE);

      const result = await supportService.getTicket("ticket_123");

      expect(apiService.get).toHaveBeenCalledWith(
        TICKET_ROUTES.BY_ID("ticket_123")
      );
      expect(transforms.toFESupportTicket).toHaveBeenCalledWith(mockTicketBE);
      expect(result).toEqual(mockTicketFE);
    });

    it("should handle get ticket errors", async () => {
      const error = new Error("Ticket not found");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(supportService.getTicket("ticket_123")).rejects.toThrow(
        "Ticket not found"
      );
    });
  });

  describe("createTicket", () => {
    it("should create a new ticket", async () => {
      const formData: SupportTicketFormFE = {
        subject: "New issue",
        description: "Issue description",
        category: "technical",
        priority: "medium",
        orderId: "order_123",
      };

      const mockRequest = {
        subject: "New issue",
        description: "Issue description",
        category: "technical",
        priority: "medium",
        order_id: "order_123",
      };

      const mockResponse = { data: mockTicketBE };

      (transforms.toBECreateSupportTicketRequest as jest.Mock).mockReturnValue(
        mockRequest
      );
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTicket as jest.Mock).mockReturnValue(mockTicketFE);

      const result = await supportService.createTicket(formData);

      expect(transforms.toBECreateSupportTicketRequest).toHaveBeenCalledWith(
        formData
      );
      expect(apiService.post).toHaveBeenCalledWith(
        TICKET_ROUTES.LIST,
        mockRequest
      );
      expect(transforms.toFESupportTicket).toHaveBeenCalledWith(mockTicketBE);
      expect(result).toEqual(mockTicketFE);
    });

    it("should handle create ticket errors", async () => {
      const formData: SupportTicketFormFE = {
        subject: "New issue",
        description: "Issue description",
        category: "technical",
        priority: "medium",
      };

      const error = new Error("Creation failed");
      (transforms.toBECreateSupportTicketRequest as jest.Mock).mockReturnValue(
        {}
      );
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(supportService.createTicket(formData)).rejects.toThrow(
        "Creation failed"
      );
    });
  });

  describe("updateTicket", () => {
    it("should update ticket", async () => {
      const updates: UpdateTicketFormFE = {
        subject: "Updated subject",
        priority: "critical",
      };

      const mockRequest = {
        subject: "Updated subject",
        priority: "critical",
      };

      const mockResponse = { data: mockTicketBE };

      (transforms.toBEUpdateSupportTicketRequest as jest.Mock).mockReturnValue(
        mockRequest
      );
      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTicket as jest.Mock).mockReturnValue(mockTicketFE);

      const result = await supportService.updateTicket("ticket_123", updates);

      expect(transforms.toBEUpdateSupportTicketRequest).toHaveBeenCalledWith(
        updates
      );
      expect(apiService.patch).toHaveBeenCalledWith(
        TICKET_ROUTES.BY_ID("ticket_123"),
        mockRequest
      );
      expect(result).toEqual(mockTicketFE);
    });

    it("should handle update errors", async () => {
      const updates: UpdateTicketFormFE = {
        subject: "Updated",
      };

      const error = new Error("Update failed");
      (transforms.toBEUpdateSupportTicketRequest as jest.Mock).mockReturnValue(
        {}
      );
      (apiService.patch as jest.Mock).mockRejectedValue(error);

      await expect(
        supportService.updateTicket("ticket_123", updates)
      ).rejects.toThrow("Update failed");
    });
  });

  describe("closeTicket", () => {
    it("should close ticket", async () => {
      const mockResponse = {
        data: { ...mockTicketBE, status: "closed" },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTicket as jest.Mock).mockReturnValue({
        ...mockTicketFE,
        status: "closed",
      });

      const result = await supportService.closeTicket("ticket_123");

      expect(apiService.patch).toHaveBeenCalledWith(
        TICKET_ROUTES.BY_ID("ticket_123"),
        { status: "closed" }
      );
      expect(result.status).toBe("closed");
    });

    it("should handle close ticket errors", async () => {
      const error = new Error("Close failed");
      (apiService.patch as jest.Mock).mockRejectedValue(error);

      await expect(supportService.closeTicket("ticket_123")).rejects.toThrow(
        "Close failed"
      );
    });
  });

  describe("getMessages", () => {
    it("should get ticket messages without pagination", async () => {
      const mockResponse: PaginatedResponseBE<SupportTicketMessageBE> = {
        data: [mockMessageBE],
        count: 1,
        pagination: { page: 1, limit: 10, totalPages: 1 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTicketMessages as jest.Mock).mockReturnValue([
        mockMessageFE,
      ]);

      const result = await supportService.getMessages("ticket_123");

      expect(apiService.get).toHaveBeenCalledWith(
        "/support/tickets/ticket_123/messages"
      );
      expect(result).toEqual({
        data: [mockMessageFE],
        count: 1,
        pagination: { page: 1, limit: 10, totalPages: 1 },
      });
    });

    it("should get messages with pagination", async () => {
      const mockResponse: PaginatedResponseBE<SupportTicketMessageBE> = {
        data: [mockMessageBE],
        count: 1,
        pagination: { page: 2, limit: 20, totalPages: 1 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTicketMessages as jest.Mock).mockReturnValue([
        mockMessageFE,
      ]);

      await supportService.getMessages("ticket_123", 2, 20);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("page=2")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=20")
      );
    });

    it("should handle get messages errors", async () => {
      const error = new Error("Fetch failed");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(supportService.getMessages("ticket_123")).rejects.toThrow(
        "Fetch failed"
      );
    });
  });

  describe("replyToTicket", () => {
    it("should reply to ticket", async () => {
      const replyData: ReplyToTicketFormFE = {
        message: "This is a reply",
        attachments: ["file1.pdf"],
      };

      const mockRequest = {
        message: "This is a reply",
        attachments: ["file1.pdf"],
      };

      const mockResponse = { data: mockMessageBE };

      (transforms.toBEReplyToTicketRequest as jest.Mock).mockReturnValue(
        mockRequest
      );
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTicketMessage as jest.Mock).mockReturnValue(
        mockMessageFE
      );

      const result = await supportService.replyToTicket(
        "ticket_123",
        replyData
      );

      expect(transforms.toBEReplyToTicketRequest).toHaveBeenCalledWith(
        replyData
      );
      expect(apiService.post).toHaveBeenCalledWith(
        TICKET_ROUTES.REPLY("ticket_123"),
        mockRequest
      );
      expect(result).toEqual(mockMessageFE);
    });

    it("should handle reply errors", async () => {
      const replyData: ReplyToTicketFormFE = {
        message: "Reply",
      };

      const error = new Error("Reply failed");
      (transforms.toBEReplyToTicketRequest as jest.Mock).mockReturnValue({});
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(
        supportService.replyToTicket("ticket_123", replyData)
      ).rejects.toThrow("Reply failed");
    });
  });

  describe("assignTicket", () => {
    it("should assign ticket to admin", async () => {
      const assignData: AssignTicketFormFE = {
        assignedTo: "admin_456",
      };

      const mockRequest = {
        assigned_to: "admin_456",
      };

      (transforms.toBEAssignTicketRequest as jest.Mock).mockReturnValue(
        mockRequest
      );
      (apiService.post as jest.Mock).mockResolvedValue({});
      (apiService.get as jest.Mock).mockResolvedValue({ data: mockTicketBE });
      (transforms.toFESupportTicket as jest.Mock).mockReturnValue(mockTicketFE);

      const result = await supportService.assignTicket(
        "ticket_123",
        assignData
      );

      expect(transforms.toBEAssignTicketRequest).toHaveBeenCalledWith(
        assignData
      );
      expect(apiService.post).toHaveBeenCalledWith(TICKET_ROUTES.BULK, {
        action: "assign",
        ids: ["ticket_123"],
        updates: mockRequest,
      });
      expect(apiService.get).toHaveBeenCalledWith(
        TICKET_ROUTES.BY_ID("ticket_123")
      );
      expect(result).toEqual(mockTicketFE);
    });

    it("should handle assign ticket errors", async () => {
      const assignData: AssignTicketFormFE = {
        assignedTo: "admin_456",
      };

      const error = new Error("Assignment failed");
      (transforms.toBEAssignTicketRequest as jest.Mock).mockReturnValue({});
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(
        supportService.assignTicket("ticket_123", assignData)
      ).rejects.toThrow("Assignment failed");
    });
  });

  describe("escalateTicket", () => {
    it("should escalate ticket", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({});
      (apiService.get as jest.Mock).mockResolvedValue({ data: mockTicketBE });
      (transforms.toFESupportTicket as jest.Mock).mockReturnValue(mockTicketFE);

      const result = await supportService.escalateTicket("ticket_123");

      expect(apiService.post).toHaveBeenCalledWith(TICKET_ROUTES.BULK, {
        action: "escalate",
        ids: ["ticket_123"],
      });
      expect(apiService.get).toHaveBeenCalledWith(
        TICKET_ROUTES.BY_ID("ticket_123")
      );
      expect(result).toEqual(mockTicketFE);
    });

    it("should handle escalate errors", async () => {
      const error = new Error("Escalation failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(supportService.escalateTicket("ticket_123")).rejects.toThrow(
        "Escalation failed"
      );
    });
  });

  describe("bulkDelete", () => {
    it("should delete multiple tickets", async () => {
      const ids = ["ticket_1", "ticket_2", "ticket_3"];

      (apiService.post as jest.Mock).mockResolvedValue({});

      await supportService.bulkDelete(ids);

      expect(apiService.post).toHaveBeenCalledWith(TICKET_ROUTES.BULK, {
        action: "delete",
        ids,
      });
    });

    it("should handle bulk delete errors", async () => {
      const error = new Error("Delete failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(supportService.bulkDelete(["ticket_1"])).rejects.toThrow(
        "Delete failed"
      );
    });
  });

  describe("bulkUpdate", () => {
    it("should update multiple tickets", async () => {
      const ids = ["ticket_1", "ticket_2"];
      const updates: Partial<UpdateTicketFormFE> = {
        priority: "high",
        status: "in_progress",
      };

      (apiService.post as jest.Mock).mockResolvedValue({});

      await supportService.bulkUpdate(ids, updates);

      expect(apiService.post).toHaveBeenCalledWith(TICKET_ROUTES.BULK, {
        action: "update",
        ids,
        updates,
      });
    });

    it("should handle bulk update errors", async () => {
      const error = new Error("Update failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(supportService.bulkUpdate(["ticket_1"], {})).rejects.toThrow(
        "Update failed"
      );
    });
  });

  describe("bulkResolve", () => {
    it("should resolve multiple tickets", async () => {
      const ids = ["ticket_1", "ticket_2"];

      (apiService.post as jest.Mock).mockResolvedValue({});

      await supportService.bulkResolve(ids);

      expect(apiService.post).toHaveBeenCalledWith(TICKET_ROUTES.BULK, {
        action: "resolve",
        ids,
      });
    });

    it("should handle bulk resolve errors", async () => {
      const error = new Error("Resolve failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(supportService.bulkResolve(["ticket_1"])).rejects.toThrow(
        "Resolve failed"
      );
    });
  });

  describe("bulkClose", () => {
    it("should close multiple tickets", async () => {
      const ids = ["ticket_1", "ticket_2"];

      (apiService.post as jest.Mock).mockResolvedValue({});

      await supportService.bulkClose(ids);

      expect(apiService.post).toHaveBeenCalledWith(TICKET_ROUTES.BULK, {
        action: "close",
        ids,
      });
    });

    it("should handle bulk close errors", async () => {
      const error = new Error("Close failed");
      (apiService.post as jest.Mock).mockRejectedValue(error);

      await expect(supportService.bulkClose(["ticket_1"])).rejects.toThrow(
        "Close failed"
      );
    });
  });

  describe("uploadAttachment", () => {
    it("should upload attachment successfully", async () => {
      const mockFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      const mockResponse = { url: "https://example.com/file.pdf" };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await supportService.uploadAttachment(mockFile);

      expect(fetch).toHaveBeenCalledWith("/api/support/attachments", {
        method: "POST",
        body: expect.any(FormData),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle upload errors", async () => {
      const mockFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Upload failed" }),
      });

      await expect(supportService.uploadAttachment(mockFile)).rejects.toThrow(
        "Upload failed"
      );
    });

    it("should use default error message", async () => {
      const mockFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      await expect(supportService.uploadAttachment(mockFile)).rejects.toThrow(
        "Failed to upload attachment"
      );
    });
  });

  describe("getStats", () => {
    it("should get ticket statistics without filters", async () => {
      const mockStats = {
        totalTickets: 100,
        openTickets: 25,
        resolvedTickets: 70,
        averageResponseTime: 2.5,
        averageResolutionTime: 24,
        ticketsByCategory: {
          order: 40,
          technical: 30,
          billing: 20,
          general: 10,
        },
        ticketsByPriority: {
          low: 30,
          medium: 50,
          high: 15,
          critical: 5,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await supportService.getStats();

      expect(apiService.get).toHaveBeenCalledWith("/support/stats");
      expect(result).toEqual(mockStats);
    });

    it("should get statistics with filters", async () => {
      const filters = {
        shopId: "shop_123",
        startDate: "2024-12-01",
        endDate: "2024-12-31",
      };

      const mockStats = {
        totalTickets: 50,
        openTickets: 10,
        resolvedTickets: 40,
        averageResponseTime: 1.5,
        averageResolutionTime: 12,
        ticketsByCategory: {} as any,
        ticketsByPriority: {} as any,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      await supportService.getStats(filters);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("shopId=shop_123")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("startDate=2024-12-01")
      );
    });

    it("should handle get stats errors", async () => {
      const error = new Error("Fetch failed");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(supportService.getStats()).rejects.toThrow("Fetch failed");
    });
  });

  describe("getMyTickets", () => {
    it("should get user's tickets", async () => {
      const filters = {
        status: "open",
        category: "order",
      };

      const mockResponse: PaginatedResponseBE<SupportTicketBE> = {
        data: [mockTicketBE],
        count: 1,
        pagination: { page: 1, limit: 10, totalPages: 1 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTickets as jest.Mock).mockReturnValue([
        mockTicketFE,
      ]);

      const result = await supportService.getMyTickets(filters);

      expect(apiService.get).toHaveBeenCalled();
      expect(result.data).toEqual([mockTicketFE]);
    });

    it("should get tickets without filters", async () => {
      const mockResponse: PaginatedResponseBE<SupportTicketBE> = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 10, totalPages: 1 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);
      (transforms.toFESupportTickets as jest.Mock).mockReturnValue([]);

      await supportService.getMyTickets();

      expect(apiService.get).toHaveBeenCalledWith(TICKET_ROUTES.LIST);
    });
  });

  describe("getTicketCount", () => {
    it("should get ticket count without filters", async () => {
      const mockResponse = { count: 42 };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await supportService.getTicketCount();

      expect(apiService.get).toHaveBeenCalledWith("/support/count");
      expect(result).toEqual(mockResponse);
    });

    it("should get ticket count with filters", async () => {
      const filters = {
        status: "open",
        category: "technical",
      };

      const mockResponse = { count: 15 };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await supportService.getTicketCount(filters);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=open")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("category=technical")
      );
    });

    it("should handle get count errors", async () => {
      const error = new Error("Count failed");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(supportService.getTicketCount()).rejects.toThrow(
        "Count failed"
      );
    });
  });
});
