/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { GET, PATCH, DELETE } from "./route";
import * as rbacAuth from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import * as rbacPermissions from "@/lib/rbac-permissions";

jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/admin");
jest.mock("@/lib/rbac-permissions");

const Collections = {
  support_tickets: jest.fn(),
  users: jest.fn(),
};

(getFirestoreAdmin as jest.Mock).mockReturnValue({
  collection: (name: string) => Collections[name as keyof typeof Collections]?.() || jest.fn(),
  batch: jest.fn(),
});

describe("GET /api/tickets/[id]", () => {
  const mockRequireAuth = rbacAuth.requireAuth as jest.Mock;
  const mockCanReadResource = rbacPermissions.canReadResource as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockResolvedValue({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123");
    const response = await GET(request, { params: Promise.resolve({ id: "ticket123" }) });

    expect(response.status).toBe(401);
  });

  it("should return 404 for non-existent ticket", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });

    const mockGet = jest.fn().mockResolvedValue({ exists: false });
    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue({ get: mockGet }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123");
    const response = await GET(request, { params: Promise.resolve({ id: "ticket123" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Ticket not found");
  });

  it("should allow user to view own ticket", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanReadResource.mockReturnValue(true);

    const ticketData = {
      userId: "user123",
      subject: "Test ticket",
      status: "open",
    };

    const mockMessagesGet = jest.fn().mockResolvedValue({
      docs: [
        {
          id: "msg1",
          data: () => ({
            message: "Test message",
            isInternal: false,
            createdAt: new Date(),
          }),
        },
      ],
    });

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: "ticket123",
        data: () => ticketData,
      }),
      collection: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          get: mockMessagesGet,
        }),
      }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123");
    const response = await GET(request, { params: Promise.resolve({ id: "ticket123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.id).toBe("ticket123");
    expect(data.data.messages).toHaveLength(1);
  });

  it("should prevent user from viewing another user's ticket", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanReadResource.mockReturnValue(false);

    const ticketData = {
      userId: "user456",
      subject: "Test ticket",
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ticketData,
        }),
      }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123");
    const response = await GET(request, { params: Promise.resolve({ id: "ticket123" }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("permission");
  });

  it("should filter internal messages for non-admin users", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanReadResource.mockReturnValue(true);

    const ticketData = { userId: "user123", status: "open" };

    const mockMessagesGet = jest.fn().mockResolvedValue({
      docs: [
        {
          id: "msg1",
          data: () => ({
            message: "Public message",
            isInternal: false,
            createdAt: new Date(),
          }),
        },
        {
          id: "msg2",
          data: () => ({
            message: "Internal note",
            isInternal: true,
            createdAt: new Date(),
          }),
        },
      ],
    });

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: "ticket123",
        data: () => ticketData,
      }),
      collection: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          get: mockMessagesGet,
        }),
      }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123");
    const response = await GET(request, { params: Promise.resolve({ id: "ticket123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.messages).toHaveLength(1);
    expect(data.data.messages[0].message).toBe("Public message");
  });

  it("should show internal messages to admin", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanReadResource.mockReturnValue(true);

    const ticketData = { userId: "user123", status: "open" };

    const mockMessagesGet = jest.fn().mockResolvedValue({
      docs: [
        {
          id: "msg1",
          data: () => ({
            message: "Public message",
            isInternal: false,
            createdAt: new Date(),
          }),
        },
        {
          id: "msg2",
          data: () => ({
            message: "Internal note",
            isInternal: true,
            createdAt: new Date(),
          }),
        },
      ],
    });

    const mockUserDoc = {
      exists: true,
      id: "user123",
      data: () => ({
        name: "Test User",
        email: "test@example.com",
      }),
    };

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: "ticket123",
        data: () => ticketData,
      }),
      collection: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnValue({
          get: mockMessagesGet,
        }),
      }),
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    Collections.users.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserDoc),
      }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123");
    const response = await GET(request, { params: Promise.resolve({ id: "ticket123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.messages).toHaveLength(2);
    expect(data.data.user).toBeDefined();
    expect(data.data.user.email).toBe("test@example.com");
  });
});

describe("PATCH /api/tickets/[id]", () => {
  const mockRequireAuth = rbacAuth.requireAuth as jest.Mock;
  const mockCanWriteResource = rbacPermissions.canWriteResource as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockResolvedValue({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123", {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket123" }) });

    expect(response.status).toBe(401);
  });

  it("should return 404 for non-existent ticket", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: false }),
      }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123", {
      method: "PATCH",
      body: JSON.stringify({ subject: "Updated" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket123" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Ticket not found");
  });

  it("should allow admin to update all fields", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanWriteResource.mockReturnValue(true);

    const ticketData = { userId: "user123", status: "open" };
    const mockUpdate = jest.fn().mockResolvedValue(undefined);

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ticketData,
        }),
        update: mockUpdate,
      }),
    });

    const updates = {
      status: "in-progress",
      assignedTo: "admin123",
      priority: "urgent",
    };

    const request = new NextRequest("http://localhost/api/tickets/ticket123", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket123" }) });

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "in-progress",
        assignedTo: "admin123",
        priority: "urgent",
      })
    );
  });

  it("should set resolvedAt when status is resolved", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanWriteResource.mockReturnValue(true);

    const ticketData = { userId: "user123", status: "open" };
    const mockUpdate = jest.fn().mockResolvedValue(undefined);

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ticketData,
        }),
        update: mockUpdate,
      }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123", {
      method: "PATCH",
      body: JSON.stringify({ status: "resolved" }),
    });
    await PATCH(request, { params: Promise.resolve({ id: "ticket123" }) });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        resolvedAt: expect.any(Date),
      })
    );
  });

  it("should allow user to update subject/description on open tickets", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanWriteResource.mockReturnValue(true);

    const ticketData = { userId: "user123", status: "open" };
    const mockUpdate = jest.fn().mockResolvedValue(undefined);

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ticketData,
        }),
        update: mockUpdate,
      }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123", {
      method: "PATCH",
      body: JSON.stringify({
        subject: "Updated subject",
        description: "Updated description",
      }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket123" }) });

    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Updated subject",
        description: "Updated description",
      })
    );
  });

  it("should prevent user from updating closed ticket", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanWriteResource.mockReturnValue(true);

    const ticketData = { userId: "user123", status: "closed" };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ticketData,
        }),
      }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123", {
      method: "PATCH",
      body: JSON.stringify({ subject: "Updated" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket123" }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("open tickets");
  });

  it("should prevent non-owner from updating ticket", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanWriteResource.mockReturnValue(false);

    const ticketData = { userId: "user456", status: "open" };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ticketData,
        }),
      }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123", {
      method: "PATCH",
      body: JSON.stringify({ subject: "Updated" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket123" }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("permission");
  });
});

describe("DELETE /api/tickets/[id]", () => {
  const mockRequireRole = rbacAuth.requireRole as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should require admin role", async () => {
    mockRequireRole.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123", {
      method: "DELETE",
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: "ticket123" }) });

    expect(response.status).toBe(403);
  });

  it("should return 404 for non-existent ticket", async () => {
    mockRequireRole.mockResolvedValue({});

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: false }),
      }),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123", {
      method: "DELETE",
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: "ticket123" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Ticket not found");
  });

  it("should delete ticket and all messages", async () => {
    mockRequireRole.mockResolvedValue({});

    const mockBatchDelete = jest.fn();
    const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
    const mockBatch = {
      delete: mockBatchDelete,
      commit: mockBatchCommit,
    };

    const mockMessagesSnapshot = {
      docs: [
        { ref: "msgRef1" },
        { ref: "msgRef2" },
      ],
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
      collection: (name: string) => Collections[name as keyof typeof Collections]?.() || jest.fn(),
      batch: jest.fn().mockReturnValue(mockBatch),
    });

    const request = new NextRequest("http://localhost/api/tickets/ticket123", {
      method: "DELETE",
    });
    const response = await DELETE(request, { params: Promise.resolve({ id: "ticket123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
