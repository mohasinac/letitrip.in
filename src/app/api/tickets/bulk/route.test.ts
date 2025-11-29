/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { POST } from "./route";
import * as rbacAuth from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/admin");

const Collections = {
  support_tickets: jest.fn(),
};

(getFirestoreAdmin as jest.Mock).mockReturnValue({
  collection: (name: string) =>
    Collections[name as keyof typeof Collections]?.() || jest.fn(),
  batch: jest.fn(),
});

describe("POST /api/tickets/bulk", () => {
  const mockRequireRole = rbacAuth.requireRole as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require admin role", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    });

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it("should require action parameter", async () => {
    mockRequireRole.mockResolvedValue({});

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({ ids: ["ticket1"] }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.action).toBeDefined();
  });

  it("should require ids array", async () => {
    mockRequireRole.mockResolvedValue({});

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({ action: "delete" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.ids).toBeDefined();
  });

  it("should require valid action", async () => {
    mockRequireRole.mockResolvedValue({});

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "invalid-action",
        ids: ["ticket1"],
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.action).toContain("Invalid action");
  });

  it("should delete tickets and messages", async () => {
    mockRequireRole.mockResolvedValue({});

    const mockBatchDelete = jest.fn();
    const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
    const mockBatch = {
      delete: mockBatchDelete,
      commit: mockBatchCommit,
    };

    const mockMessagesSnapshot = {
      docs: [{ ref: "msgRef1" }, { ref: "msgRef2" }],
    };

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({ exists: true }),
      collection: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockMessagesSnapshot),
      }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: () => Collections.support_tickets(),
      batch: () => mockBatch,
    });

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "delete",
        ids: ["ticket1", "ticket2"],
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.success).toHaveLength(2);
  });

  it("should update tickets with provided data", async () => {
    mockRequireRole.mockResolvedValue({});

    const mockBatchUpdate = jest.fn();
    const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
    const mockBatch = {
      update: mockBatchUpdate,
      commit: mockBatchCommit,
    };

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({ exists: true }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: () => Collections.support_tickets(),
      batch: () => mockBatch,
    });

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "update",
        ids: ["ticket1"],
        updates: { priority: "urgent" },
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockBatchUpdate).toHaveBeenCalled();
  });

  it("should assign tickets to user", async () => {
    mockRequireRole.mockResolvedValue({});

    const mockBatchUpdate = jest.fn();
    const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
    const mockBatch = {
      update: mockBatchUpdate,
      commit: mockBatchCommit,
    };

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({ exists: true }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: () => Collections.support_tickets(),
      batch: () => mockBatch,
    });

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "assign",
        ids: ["ticket1"],
        updates: { assignedTo: "admin123" },
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockBatchUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        assignedTo: "admin123",
        status: "in-progress",
      }),
    );
  });

  it("should resolve tickets", async () => {
    mockRequireRole.mockResolvedValue({});

    const mockBatchUpdate = jest.fn();
    const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
    const mockBatch = {
      update: mockBatchUpdate,
      commit: mockBatchCommit,
    };

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({ exists: true }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: () => Collections.support_tickets(),
      batch: () => mockBatch,
    });

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "resolve",
        ids: ["ticket1"],
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockBatchUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: "resolved",
        resolvedAt: expect.any(Date),
      }),
    );
  });

  it("should close tickets", async () => {
    mockRequireRole.mockResolvedValue({});

    const mockBatchUpdate = jest.fn();
    const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
    const mockBatch = {
      update: mockBatchUpdate,
      commit: mockBatchCommit,
    };

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({ exists: true }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: () => Collections.support_tickets(),
      batch: () => mockBatch,
    });

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "close",
        ids: ["ticket1"],
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockBatchUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: "closed",
      }),
    );
  });

  it("should escalate tickets", async () => {
    mockRequireRole.mockResolvedValue({});

    const mockBatchUpdate = jest.fn();
    const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
    const mockBatch = {
      update: mockBatchUpdate,
      commit: mockBatchCommit,
    };

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({ exists: true }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: () => Collections.support_tickets(),
      batch: () => mockBatch,
    });

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "escalate",
        ids: ["ticket1"],
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockBatchUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: "escalated",
        priority: "urgent",
      }),
    );
  });

  it("should handle partial failures", async () => {
    mockRequireRole.mockResolvedValue({});

    const mockBatchUpdate = jest.fn();
    const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
    const mockBatch = {
      update: mockBatchUpdate,
      commit: mockBatchCommit,
    };

    let callCount = 0;
    const mockTicketRef = {
      get: jest.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({ exists: callCount === 1 }); // First exists, second doesn't
      }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: () => Collections.support_tickets(),
      batch: () => mockBatch,
    });

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "resolve",
        ids: ["ticket1", "ticket2"],
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.success).toHaveLength(1);
    expect(data.data.failed).toHaveLength(1);
    expect(data.data.failed[0].error).toBe("Ticket not found");
  });

  it("should require updates object for update action", async () => {
    mockRequireRole.mockResolvedValue({});

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({ exists: true }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    const mockBatch = {
      commit: jest.fn().mockResolvedValue(undefined),
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: () => Collections.support_tickets(),
      batch: () => mockBatch,
    });

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "update",
        ids: ["ticket1"],
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.failed).toHaveLength(1);
    expect(data.data.failed[0].error).toBe("Updates object required");
  });

  it("should require assignedTo for assign action", async () => {
    mockRequireRole.mockResolvedValue({});

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({ exists: true }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    const mockBatch = {
      commit: jest.fn().mockResolvedValue(undefined),
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: () => Collections.support_tickets(),
      batch: () => mockBatch,
    });

    const request = new NextRequest("http://localhost/api/tickets/bulk", {
      method: "POST",
      body: JSON.stringify({
        action: "assign",
        ids: ["ticket1"],
        updates: {},
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.failed).toHaveLength(1);
    expect(data.data.failed[0].error).toBe("assignedTo field required");
  });
});
