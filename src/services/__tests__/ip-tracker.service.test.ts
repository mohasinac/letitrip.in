/**
 * Unit Tests for IP Tracker Service
 * Tests API-based user activity tracking and rate limiting
 */

import { apiService } from "../api.service";
import { ipTrackerService } from "../ip-tracker.service";

// Mock apiService
jest.mock("../api.service");

describe("IPTrackerService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logActivity", () => {
    it("should log user activity with IP address", async () => {
      const mockActivity = {
        id: "activity_123",
        userId: "user_123",
        ipAddress: "192.168.1.1",
        action: "login",
        timestamp: new Date(),
      };

      mockApiService.post.mockResolvedValue(mockActivity);

      const result = await ipTrackerService.logActivity({
        userId: "user_123",
        action: "login",
        ipAddress: "192.168.1.1",
      });

      expect(mockApiService.post).toHaveBeenCalledWith("/user-activities/log", {
        userId: "user_123",
        action: "login",
        ipAddress: "192.168.1.1",
      });
      expect(result.id).toBe("activity_123");
    });

    it("should log activity without userId", async () => {
      const mockActivity = {
        id: "activity_123",
        userId: null,
        ipAddress: "192.168.1.1",
        action: "register",
        timestamp: new Date(),
      };

      mockApiService.post.mockResolvedValue(mockActivity);

      const result = await ipTrackerService.logActivity({
        action: "register",
        ipAddress: "192.168.1.1",
      });

      expect(mockApiService.post).toHaveBeenCalledWith("/user-activities/log", {
        action: "register",
        ipAddress: "192.168.1.1",
      });
      expect(result.userId).toBeNull();
    });
  });

  describe("checkRateLimit", () => {
    it("should allow action within rate limit", async () => {
      const mockResponse = {
        allowed: true,
        remainingAttempts: 5,
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await ipTrackerService.checkRateLimit({
        ipAddress: "192.168.1.1",
        action: "login",
        maxAttempts: 5,
        windowMs: 3600000,
      });

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(5);
    });

    it("should block action exceeding rate limit", async () => {
      const mockResponse = {
        allowed: false,
        remainingAttempts: 0,
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await ipTrackerService.checkRateLimit({
        ipAddress: "192.168.1.1",
        action: "login",
        maxAttempts: 5,
        windowMs: 3600000,
      });

      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
    });

    it("should use default parameters", async () => {
      const mockResponse = {
        allowed: true,
        remainingAttempts: 5,
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await ipTrackerService.checkRateLimit({
        ipAddress: "192.168.1.1",
        action: "login",
      });

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(5);
    });

    it("should allow on error", async () => {
      mockApiService.get.mockRejectedValue(new Error("Network error"));

      const result = await ipTrackerService.checkRateLimit({
        ipAddress: "192.168.1.1",
        action: "login",
      });

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(5);
    });
  });

  describe("getActivitiesByIP", () => {
    it("should fetch activities by IP address", async () => {
      const mockActivities = [
        {
          id: "activity_1",
          ipAddress: "192.168.1.1",
          action: "login",
          timestamp: new Date(),
        },
      ];

      mockApiService.get.mockResolvedValue(mockActivities);

      const result = await ipTrackerService.getActivitiesByIP(
        "192.168.1.1",
        10
      );

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/user-activities/by-ip/192.168.1.1?limit=10"
      );
      expect(result).toEqual(mockActivities);
    });
  });

  describe("getActivitiesByUser", () => {
    it("should fetch activities by user ID", async () => {
      const mockActivities = [
        {
          id: "activity_1",
          userId: "user_123",
          action: "login",
          timestamp: new Date(),
        },
      ];

      mockApiService.get.mockResolvedValue(mockActivities);

      const result = await ipTrackerService.getActivitiesByUser("user_123", 50);

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/user-activities/by-user/user_123?limit=50"
      );
      expect(result).toEqual(mockActivities);
    });

    it("should use default limit", async () => {
      const mockActivities: any[] = [];

      mockApiService.get.mockResolvedValue(mockActivities);

      await ipTrackerService.getActivitiesByUser("user_123");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/user-activities/by-user/user_123?limit=50"
      );
    });
  });

  describe("getUsersFromIP", () => {
    it("should return unique user IDs for an IP", async () => {
      const mockUsers = ["user_1", "user_2"];

      mockApiService.get.mockResolvedValue(mockUsers);

      const result = await ipTrackerService.getUsersFromIP("192.168.1.1");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/user-activities/users-from-ip/192.168.1.1"
      );
      expect(result).toEqual(mockUsers);
    });
  });

  describe("getSuspiciousActivityScore", () => {
    it("should calculate suspicious activity score", async () => {
      const mockScore = {
        score: 75,
        reasons: ["Multiple failed logins", "Account shared with others"],
      };

      mockApiService.get.mockResolvedValue(mockScore);

      const result = await ipTrackerService.getSuspiciousActivityScore(
        "192.168.1.1"
      );

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/user-activities/suspicious-activity/192.168.1.1"
      );
      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons.length).toBeGreaterThan(0);
    });
  });
});
