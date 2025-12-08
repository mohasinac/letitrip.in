import { adminDb as db } from "@/app/api/lib/firebase/config";
import { logError } from "@/lib/firebase-error-logger";
import { ipTrackerService } from "../ip-tracker.service";

jest.mock("@/app/api/lib/firebase/config", () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("IPTrackerService", () => {
  let mockCollectionRef: any;
  let mockDocRef: any;
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    mockDocRef = {
      id: "doc_123",
      set: jest.fn(),
    };

    mockCollectionRef = {
      doc: jest.fn(() => mockDocRef),
      where: jest.fn(() => mockQuery),
    };

    (db.collection as jest.Mock).mockReturnValue(mockCollectionRef);
  });

  describe("logActivity", () => {
    it("should log user activity with IP address", async () => {
      await ipTrackerService.logActivity({
        userId: "user_123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        action: "login",
        metadata: { device: "desktop" },
      });

      expect(db.collection).toHaveBeenCalledWith("user_activities");
      expect(mockDocRef.set).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "doc_123",
          userId: "user_123",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          action: "login",
          metadata: { device: "desktop" },
        })
      );
    });

    it("should log activity without userId", async () => {
      await ipTrackerService.logActivity({
        ipAddress: "192.168.1.1",
        action: "register",
      });

      expect(mockDocRef.set).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
          ipAddress: "192.168.1.1",
          action: "register",
        })
      );
    });

    it("should not throw on error", async () => {
      mockDocRef.set.mockRejectedValue(new Error("Database error"));

      await expect(
        ipTrackerService.logActivity({
          ipAddress: "192.168.1.1",
          action: "login",
        })
      ).resolves.not.toThrow();

      expect(logError).toHaveBeenCalled();
    });
  });

  describe("checkRateLimit", () => {
    it("should allow action within rate limit", async () => {
      mockQuery.get.mockResolvedValue({ size: 2 });

      const result = await ipTrackerService.checkRateLimit(
        "192.168.1.1",
        "login",
        5,
        15
      );

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(3);
      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "ipAddress",
        "==",
        "192.168.1.1"
      );
      expect(mockQuery.where).toHaveBeenCalledWith("action", "==", "login");
      expect(mockQuery.where).toHaveBeenCalledWith(
        "timestamp",
        ">=",
        expect.any(Date)
      );
    });

    it("should block action exceeding rate limit", async () => {
      mockQuery.get.mockResolvedValue({ size: 5 });

      const result = await ipTrackerService.checkRateLimit(
        "192.168.1.1",
        "login",
        5,
        15
      );

      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
    });

    it("should use default parameters", async () => {
      mockQuery.get.mockResolvedValue({ size: 1 });

      const result = await ipTrackerService.checkRateLimit(
        "192.168.1.1",
        "login"
      );

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(4);
    });

    it("should allow on error", async () => {
      mockQuery.get.mockRejectedValue(new Error("Database error"));

      const result = await ipTrackerService.checkRateLimit(
        "192.168.1.1",
        "login"
      );

      expect(result.allowed).toBe(true);
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("getActivitiesByIP", () => {
    it("should fetch activities by IP address", async () => {
      const mockDocs = [
        {
          data: () => ({ id: "1", ipAddress: "192.168.1.1", action: "login" }),
        },
        {
          data: () => ({
            id: "2",
            ipAddress: "192.168.1.1",
            action: "order_placed",
          }),
        },
      ];

      mockQuery.get.mockResolvedValue({ docs: mockDocs });

      const result = await ipTrackerService.getActivitiesByIP(
        "192.168.1.1",
        50
      );

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "ipAddress",
        "==",
        "192.168.1.1"
      );
      expect(mockQuery.limit).toHaveBeenCalledWith(50);
      expect(result).toHaveLength(2);
    });

    it("should return empty array on error", async () => {
      mockQuery.get.mockRejectedValue(new Error("Database error"));

      const result = await ipTrackerService.getActivitiesByIP("192.168.1.1");

      expect(result).toEqual([]);
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("getActivitiesByUser", () => {
    it("should fetch activities by user ID", async () => {
      const mockDocs = [
        { data: () => ({ id: "1", userId: "user_123", action: "login" }) },
        { data: () => ({ id: "2", userId: "user_123", action: "bid_placed" }) },
      ];

      mockQuery.get.mockResolvedValue({ docs: mockDocs });

      const result = await ipTrackerService.getActivitiesByUser("user_123", 50);

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "userId",
        "==",
        "user_123"
      );
      expect(mockQuery.limit).toHaveBeenCalledWith(50);
      expect(result).toHaveLength(2);
    });

    it("should use default limit", async () => {
      mockQuery.get.mockResolvedValue({ docs: [] });

      await ipTrackerService.getActivitiesByUser("user_123");

      expect(mockQuery.limit).toHaveBeenCalledWith(50);
    });
  });

  describe("getUsersFromIP", () => {
    it("should return unique user IDs for an IP", async () => {
      const mockDocs = [
        { data: () => ({ userId: "user_1" }) },
        { data: () => ({ userId: "user_2" }) },
        { data: () => ({ userId: "user_1" }) },
      ];

      mockQuery.get.mockResolvedValue({
        docs: mockDocs,
        forEach: (callback: any) => mockDocs.forEach(callback),
      });

      const result = await ipTrackerService.getUsersFromIP("192.168.1.1");

      expect(result).toEqual(["user_1", "user_2"]);
      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "ipAddress",
        "==",
        "192.168.1.1"
      );
    });

    it("should return empty array on error", async () => {
      mockQuery.get.mockRejectedValue(new Error("Database error"));

      const result = await ipTrackerService.getUsersFromIP("192.168.1.1");

      expect(result).toEqual([]);
    });
  });

  describe("getSuspiciousActivityScore", () => {
    it("should calculate suspicious activity score", async () => {
      mockQuery.get.mockResolvedValue({ size: 5 });

      const result = await ipTrackerService.getSuspiciousActivityScore(
        "192.168.1.1"
      );

      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it("should return zero score on error", async () => {
      mockQuery.get.mockRejectedValue(new Error("Database error"));

      const result = await ipTrackerService.getSuspiciousActivityScore(
        "192.168.1.1"
      );

      expect(result.score).toBe(0);
      expect(result.reasons).toEqual([]);
    });
  });

  describe("getIPFromRequest", () => {
    it("should extract IP from cf-connecting-ip header", () => {
      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === "cf-connecting-ip") return "192.168.1.1";
            return null;
          }),
        },
      } as any;

      const ip = ipTrackerService.getIPFromRequest(mockRequest);

      expect(ip).toBe("192.168.1.1");
    });

    it("should extract IP from x-forwarded-for header", () => {
      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === "x-forwarded-for") return "192.168.1.1, 10.0.0.1";
            return null;
          }),
        },
      } as any;

      const ip = ipTrackerService.getIPFromRequest(mockRequest);

      expect(ip).toBe("192.168.1.1");
    });

    it("should extract IP from x-real-ip header", () => {
      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === "x-real-ip") return "192.168.1.1";
            return null;
          }),
        },
      } as any;

      const ip = ipTrackerService.getIPFromRequest(mockRequest);

      expect(ip).toBe("192.168.1.1");
    });

    it("should return unknown if no IP headers", () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      } as any;

      const ip = ipTrackerService.getIPFromRequest(mockRequest);

      expect(ip).toBe("unknown");
    });
  });

  describe("getUserAgentFromRequest", () => {
    it("should extract user agent from headers", () => {
      const mockRequest = {
        headers: {
          get: jest.fn((key) => {
            if (key === "user-agent") return "Mozilla/5.0";
            return null;
          }),
        },
      } as any;

      const userAgent = ipTrackerService.getUserAgentFromRequest(mockRequest);

      expect(userAgent).toBe("Mozilla/5.0");
    });

    it("should return unknown if no user agent", () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
      } as any;

      const userAgent = ipTrackerService.getUserAgentFromRequest(mockRequest);

      expect(userAgent).toBe("unknown");
    });
  });
});
