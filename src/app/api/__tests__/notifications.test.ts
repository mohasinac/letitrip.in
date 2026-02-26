/**
 * @jest-environment node
 */

/**
 * Notifications API Tests
 *
 * GET    /api/notifications              — List user's notifications (auth required)
 * PATCH  /api/notifications/[id]         — Mark notification as read (auth required)
 * DELETE /api/notifications/[id]         — Delete a notification (auth required)
 * PATCH  /api/notifications/read-all     — Mark all as read (auth required)
 * GET    /api/notifications/unread-count — Get unread count (auth required)
 */

import {
  buildRequest,
  parseResponse,
  mockRegularUser,
  mockAdminUser,
} from "./helpers";

// ─── createApiHandler stub ────────────────────────────────────────────────────

jest.mock("@/lib/api/api-handler", () => ({
  createApiHandler: (opts: any) => {
    return async (req: any, ctx?: any) => {
      const { NextResponse } = require("next/server");
      const user = (global as any).__mockNotificationsUser ?? null;
      if (opts.auth && !user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
      const requiredRoles: string[] = opts.roles ?? [];
      if (requiredRoles.length && user && !requiredRoles.includes(user.role)) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
      let body: any = undefined;
      if (opts.schema) {
        try {
          const rawBody = await req.json().catch(() => ({}));
          const result = opts.schema.safeParse(rawBody);
          if (!result.success) {
            return NextResponse.json(
              { success: false, error: "Validation failed" },
              { status: 422 },
            );
          }
          body = result.data;
        } catch {
          body = undefined;
        }
      }
      try {
        return await opts.handler({ request: req, user, body }, ctx);
      } catch (error: any) {
        const status = error?.statusCode || 500;
        return NextResponse.json(
          { success: false, error: error?.message || "Internal error" },
          { status },
        );
      }
    };
  },
}));

// ─── Direct auth mock (for [id] route that uses getAuthenticatedUser directly)

const mockGetAuthenticatedUser = jest.fn();
jest.mock("@/lib/firebase/auth-server", () => ({
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));

// ─── Repositories mock ───────────────────────────────────────────────────────

const mockFindByUser = jest.fn();
const mockGetUnreadCount = jest.fn();
const mockCreateNotification = jest.fn();
const mockFindById = jest.fn();
const mockMarkAsRead = jest.fn();
const mockMarkAllAsRead = jest.fn();
const mockDeleteNotification = jest.fn();
const mockUserFindById = jest.fn();

jest.mock("@/repositories", () => ({
  notificationRepository: {
    findByUser: (...args: unknown[]) => mockFindByUser(...args),
    getUnreadCount: (...args: unknown[]) => mockGetUnreadCount(...args),
    create: (...args: unknown[]) => mockCreateNotification(...args),
    findById: (...args: unknown[]) => mockFindById(...args),
    markAsRead: (...args: unknown[]) => mockMarkAsRead(...args),
    markAllAsRead: (...args: unknown[]) => mockMarkAllAsRead(...args),
    delete: (...args: unknown[]) => mockDeleteNotification(...args),
  },
  userRepository: {
    findById: (...args: unknown[]) => mockUserFindById(...args),
  },
}));

// ─── Logger mock ─────────────────────────────────────────────────────────────

jest.mock("@/lib/server-logger", () => ({
  serverLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

// ─── Error classes ────────────────────────────────────────────────────────────

jest.mock("@/lib/errors", () => {
  class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(statusCode: number, message: string, code: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
  }
  class AuthenticationError extends AppError {
    constructor(m: string) {
      super(401, m, "AUTH_ERROR");
    }
  }
  class AuthorizationError extends AppError {
    constructor(m: string) {
      super(403, m, "FORBIDDEN");
    }
  }
  class NotFoundError extends AppError {
    constructor(m: string) {
      super(404, m, "NOT_FOUND");
    }
  }
  return { AppError, AuthenticationError, AuthorizationError, NotFoundError };
});

jest.mock("@/lib/errors/error-handler", () => ({
  handleApiError: (error: any) => {
    const { NextResponse } = require("next/server");
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: error?.statusCode || 500 },
    );
  },
}));

// ─── Route imports ────────────────────────────────────────────────────────────

import { GET, POST } from "../notifications/route";
import {
  PATCH as PATCH_ID,
  DELETE as DELETE_ID,
} from "../notifications/[id]/route";
import { PATCH as PATCH_READ_ALL } from "../notifications/read-all/route";
import { GET as GET_UNREAD_COUNT } from "../notifications/unread-count/route";

// ─── Test helpers ─────────────────────────────────────────────────────────────

const mockUser = mockRegularUser();
const mockAdmin = mockAdminUser();

const mockNotification = {
  id: "notif-1",
  userId: "user-uid-001",
  type: "order_placed",
  title: "Order Placed",
  message: "Your order has been placed",
  isRead: false,
  createdAt: new Date(),
};

// ─── GET /api/notifications ───────────────────────────────────────────────────

describe("GET /api/notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockNotificationsUser = null;
  });

  it("returns notifications for authenticated user", async () => {
    (global as any).__mockNotificationsUser = mockUser;
    mockFindByUser.mockResolvedValue([mockNotification]);
    mockGetUnreadCount.mockResolvedValue(1);

    const req = buildRequest("/api/notifications");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("notifications");
    expect(body.data).toHaveProperty("unreadCount");
  });

  it("returns 401 when not authenticated", async () => {
    const req = buildRequest("/api/notifications");
    const res = await GET(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns empty notifications list when user has none", async () => {
    (global as any).__mockNotificationsUser = mockUser;
    mockFindByUser.mockResolvedValue([]);
    mockGetUnreadCount.mockResolvedValue(0);

    const req = buildRequest("/api/notifications");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.data.notifications).toHaveLength(0);
    expect(body.data.unreadCount).toBe(0);
  });
});

// ─── PATCH /api/notifications/[id] ───────────────────────────────────────────

describe("PATCH /api/notifications/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks notification as read for the owning user", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ uid: "user-uid-001" });
    mockUserFindById.mockResolvedValue(mockUser);
    mockFindById.mockResolvedValue(mockNotification);
    mockMarkAsRead.mockResolvedValue({ ...mockNotification, isRead: true });

    const req = buildRequest("/api/notifications/notif-1", { method: "PATCH" });
    const res = await PATCH_ID(req, {
      params: Promise.resolve({ id: "notif-1" }),
    });
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("returns 401 when not authenticated", async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const req = buildRequest("/api/notifications/notif-1", { method: "PATCH" });
    const res = await PATCH_ID(req, {
      params: Promise.resolve({ id: "notif-1" }),
    });
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });

  it("returns 404 when notification does not exist", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ uid: "user-uid-001" });
    mockUserFindById.mockResolvedValue(mockUser);
    mockFindById.mockResolvedValue(null);

    const req = buildRequest("/api/notifications/nonexistent", {
      method: "PATCH",
    });
    const res = await PATCH_ID(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    const { status } = await parseResponse(res);

    expect(status).toBe(404);
  });

  it("returns 403 when user tries to mark another user's notification", async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ uid: "other-user" });
    mockUserFindById.mockResolvedValue({ ...mockUser, uid: "other-user" });
    mockFindById.mockResolvedValue(mockNotification); // owned by user-uid-001

    const req = buildRequest("/api/notifications/notif-1", { method: "PATCH" });
    const res = await PATCH_ID(req, {
      params: Promise.resolve({ id: "notif-1" }),
    });
    const { status } = await parseResponse(res);

    expect(status).toBe(403);
  });
});

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────

describe("PATCH /api/notifications/read-all", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockNotificationsUser = null;
  });

  it("marks all notifications as read and returns count", async () => {
    (global as any).__mockNotificationsUser = mockUser;
    mockMarkAllAsRead.mockResolvedValue(5);

    const req = buildRequest("/api/notifications/read-all", {
      method: "PATCH",
    });
    const res = await PATCH_READ_ALL(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("count");
    expect(body.data.count).toBe(5);
  });

  it("returns 401 when not authenticated", async () => {
    const req = buildRequest("/api/notifications/read-all", {
      method: "PATCH",
    });
    const res = await PATCH_READ_ALL(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});

// ─── GET /api/notifications/unread-count ─────────────────────────────────────

describe("GET /api/notifications/unread-count", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__mockNotificationsUser = null;
  });

  it("returns unread count for authenticated user", async () => {
    (global as any).__mockNotificationsUser = mockUser;
    mockGetUnreadCount.mockResolvedValue(3);

    const req = buildRequest("/api/notifications/unread-count");
    const res = await GET_UNREAD_COUNT(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("count");
    expect(body.data.count).toBe(3);
  });

  it("returns 401 when not authenticated", async () => {
    const req = buildRequest("/api/notifications/unread-count");
    const res = await GET_UNREAD_COUNT(req);
    const { status } = await parseResponse(res);

    expect(status).toBe(401);
  });
});
