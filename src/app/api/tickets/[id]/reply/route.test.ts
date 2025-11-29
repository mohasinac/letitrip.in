/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { POST } from "./route";
import * as rbacAuth from "@/app/api/middleware/rbac-auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import * as rbacPermissions from "@/lib/rbac-permissions";

jest.mock("@/app/api/middleware/rbac-auth");
jest.mock("@/app/api/lib/firebase/admin");
jest.mock("@/lib/rbac-permissions");

const Collections = {
  support_tickets: jest.fn(),
};

describe("POST /api/tickets/[id]/reply", () => {
  const mockRequireAuth = rbacAuth.requireAuth as jest.Mock;
  const mockCanReadResource = rbacPermissions.canReadResource as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Re-setup getFirestoreAdmin mock after clearAll
    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: (name: string) =>
        Collections[name as keyof typeof Collections]?.() || jest.fn(),
      batch: jest.fn(),
    });
  });

  it("should require authentication", async () => {
    mockRequireAuth.mockResolvedValue({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const request = new NextRequest(
      "http://localhost/api/tickets/ticket123/reply",
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: "ticket123" }),
    });

    expect(response.status).toBe(401);
  });

  it("should require message", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });

    const request = new NextRequest(
      "http://localhost/api/tickets/ticket123/reply",
      {
        method: "POST",
        body: JSON.stringify({ message: "" }),
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: "ticket123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errors.message).toBeDefined();
  });

  it("should return 404 for non-existent ticket", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: false }),
      }),
    });

    const request = new NextRequest(
      "http://localhost/api/tickets/ticket123/reply",
      {
        method: "POST",
        body: JSON.stringify({ message: "Test reply" }),
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: "ticket123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Ticket not found");
  });

  it("should add reply to ticket", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanReadResource.mockReturnValue(true);

    const ticketData = { userId: "user123", status: "open" };
    const mockAdd = jest.fn().mockResolvedValue({ id: "msg123" });
    const mockUpdate = jest.fn().mockResolvedValue(undefined);

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ticketData,
      }),
      collection: jest.fn().mockReturnValue({
        add: mockAdd,
      }),
      update: mockUpdate,
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    (getFirestoreAdmin as jest.Mock).mockReturnValue({
      collection: () => ({
        doc: () => mockTicketRef,
      }),
    });

    const request = new NextRequest(
      "http://localhost/api/tickets/ticket123/reply",
      {
        method: "POST",
        body: JSON.stringify({
          message: "This is my reply",
          attachments: ["file1.pdf"],
        }),
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: "ticket123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "ticket123",
        senderId: "user123",
        message: "This is my reply",
        attachments: ["file1.pdf"],
        isInternal: false,
      }),
    );
  });

  it("should allow admin to send internal messages", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanReadResource.mockReturnValue(true);

    const ticketData = { userId: "user123", status: "open" };
    const mockAdd = jest.fn().mockResolvedValue({ id: "msg123" });
    const mockUpdate = jest.fn().mockResolvedValue(undefined);

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ticketData,
      }),
      collection: jest.fn().mockReturnValue({
        add: mockAdd,
      }),
      update: mockUpdate,
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    const request = new NextRequest(
      "http://localhost/api/tickets/ticket123/reply",
      {
        method: "POST",
        body: JSON.stringify({
          message: "Internal note",
          isInternal: true,
        }),
      },
    );
    await POST(request, { params: Promise.resolve({ id: "ticket123" }) });

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        isInternal: true,
        senderRole: "admin",
      }),
    );
  });

  it("should prevent non-admin from sending internal messages", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanReadResource.mockReturnValue(true);

    const ticketData = { userId: "user123", status: "open" };
    const mockAdd = jest.fn().mockResolvedValue({ id: "msg123" });
    const mockUpdate = jest.fn().mockResolvedValue(undefined);

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ticketData,
      }),
      collection: jest.fn().mockReturnValue({
        add: mockAdd,
      }),
      update: mockUpdate,
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    const request = new NextRequest(
      "http://localhost/api/tickets/ticket123/reply",
      {
        method: "POST",
        body: JSON.stringify({
          message: "Test message",
          isInternal: true,
        }),
      },
    );
    await POST(request, { params: Promise.resolve({ id: "ticket123" }) });

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        isInternal: false, // Should be forced to false
      }),
    );
  });

  it("should change status to in-progress when admin responds to open ticket", async () => {
    const mockUser = { uid: "admin123", role: "admin" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanReadResource.mockReturnValue(true);

    const ticketData = { userId: "user123", status: "open" };
    const mockAdd = jest.fn().mockResolvedValue({ id: "msg123" });
    const mockUpdate = jest.fn().mockResolvedValue(undefined);

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ticketData,
      }),
      collection: jest.fn().mockReturnValue({
        add: mockAdd,
      }),
      update: mockUpdate,
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    const request = new NextRequest(
      "http://localhost/api/tickets/ticket123/reply",
      {
        method: "POST",
        body: JSON.stringify({ message: "We're looking into this" }),
      },
    );
    await POST(request, { params: Promise.resolve({ id: "ticket123" }) });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "in-progress",
      }),
    );
  });

  it("should reopen ticket when user responds to resolved ticket", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanReadResource.mockReturnValue(true);

    const ticketData = { userId: "user123", status: "resolved" };
    const mockAdd = jest.fn().mockResolvedValue({ id: "msg123" });
    const mockUpdate = jest.fn().mockResolvedValue(undefined);

    const mockTicketRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ticketData,
      }),
      collection: jest.fn().mockReturnValue({
        add: mockAdd,
      }),
      update: mockUpdate,
    };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockTicketRef),
    });

    const request = new NextRequest(
      "http://localhost/api/tickets/ticket123/reply",
      {
        method: "POST",
        body: JSON.stringify({ message: "Issue is still happening" }),
      },
    );
    await POST(request, { params: Promise.resolve({ id: "ticket123" }) });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "open",
        resolvedAt: null,
      }),
    );
  });

  it("should prevent unauthorized user from replying", async () => {
    const mockUser = { uid: "user123", role: "user" };
    mockRequireAuth.mockResolvedValue({ user: mockUser });
    mockCanReadResource.mockReturnValue(false);

    const ticketData = { userId: "user456", status: "open" };

    Collections.support_tickets.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ticketData,
        }),
      }),
    });

    const request = new NextRequest(
      "http://localhost/api/tickets/ticket123/reply",
      {
        method: "POST",
        body: JSON.stringify({ message: "Test reply" }),
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: "ticket123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("permission");
  });
});
