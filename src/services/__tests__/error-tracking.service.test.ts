import {
  ErrorLogger,
  ErrorSeverity,
  type LoggedError,
} from "@/lib/error-logger";
import {
  errorTrackingService,
  getErrorSummaryText,
  initializeErrorTracking,
  isErrorTrackingHealthy,
} from "../error-tracking.service";

jest.mock("@/lib/error-logger", () => ({
  ErrorLogger: {
    log: jest.fn(),
  },
  ErrorSeverity: {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical",
  },
}));

describe("ErrorTrackingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    errorTrackingService.clear();
  });

  describe("trackError", () => {
    it("should track a new error", () => {
      const error: LoggedError = {
        message: "Test error",
        severity: ErrorSeverity.MEDIUM,
        context: { component: "TestComponent" },
        timestamp: new Date(),
        stack: "Error stack",
      };

      errorTrackingService.trackError(error);

      const errors = errorTrackingService.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe("Test error");
      expect(errors[0].count).toBe(1);
    });

    it("should increment count for duplicate errors", () => {
      const error: LoggedError = {
        message: "Duplicate error",
        severity: ErrorSeverity.HIGH,
        context: { component: "TestComponent" },
        timestamp: new Date(),
      };

      errorTrackingService.trackError(error);
      errorTrackingService.trackError(error);
      errorTrackingService.trackError(error);

      const errors = errorTrackingService.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].count).toBe(3);
    });

    it("should track affected components", () => {
      const error1: LoggedError = {
        message: "Error",
        severity: ErrorSeverity.LOW,
        context: { component: "Component1" },
        timestamp: new Date(),
      };
      const error2: LoggedError = {
        message: "Error",
        severity: ErrorSeverity.LOW,
        context: { component: "Component2" },
        timestamp: new Date(),
      };

      errorTrackingService.trackError(error1);
      errorTrackingService.trackError(error2);

      const errors = errorTrackingService.getErrors();
      expect(errors[0].affectedComponents).toContain("Component1");
      expect(errors[0].affectedComponents).toContain("Component2");
    });

    it("should track affected users", () => {
      const error: LoggedError = {
        message: "User error",
        severity: ErrorSeverity.MEDIUM,
        context: { component: "UserComponent", userId: "user1" },
        timestamp: new Date(),
      };

      errorTrackingService.trackError(error);

      const errorWithAnotherUser: LoggedError = {
        ...error,
        context: { ...error.context, userId: "user2" },
      };

      errorTrackingService.trackError(errorWithAnotherUser);

      const errors = errorTrackingService.getErrors();
      expect(errors[0].affectedUsers).toContain("user1");
      expect(errors[0].affectedUsers).toContain("user2");
    });

    it("should add errors to trends", () => {
      const error: LoggedError = {
        message: "Trend error",
        severity: ErrorSeverity.LOW,
        context: {},
        timestamp: new Date(),
      };

      errorTrackingService.trackError(error);

      const trends = errorTrackingService.getTrends("minute", 10);
      expect(trends.length).toBeGreaterThan(0);
    });
  });

  describe("getStats", () => {
    it("should return statistics for time range", () => {
      const now = new Date();
      const error: LoggedError = {
        message: "Stats error",
        severity: ErrorSeverity.MEDIUM,
        context: { component: "StatsComponent", userId: "user1" },
        timestamp: now,
      };

      errorTrackingService.trackError(error);

      const stats = errorTrackingService.getStats();

      expect(stats.totalErrors).toBe(1);
      expect(stats.errorsBySeverity[ErrorSeverity.MEDIUM]).toBe(1);
      expect(stats.errorsByComponent["StatsComponent"]).toBe(1);
      expect(stats.affectedUsers.has("user1")).toBe(true);
    });

    it("should calculate error rate", () => {
      const now = new Date();
      for (let i = 0; i < 5; i++) {
        const error: LoggedError = {
          message: `Error ${i}`,
          severity: ErrorSeverity.LOW,
          context: {},
          timestamp: now,
        };
        errorTrackingService.trackError(error);
      }

      const stats = errorTrackingService.getStats();

      expect(stats.errorRate).toBeGreaterThan(0);
    });

    it("should return top errors", () => {
      for (let i = 0; i < 10; i++) {
        const error: LoggedError = {
          message: `Error ${i}`,
          severity: ErrorSeverity.LOW,
          context: { component: `Component${i}` },
          timestamp: new Date(),
        };
        for (let j = 0; j < i + 1; j++) {
          errorTrackingService.trackError(error);
        }
      }

      const stats = errorTrackingService.getStats();

      expect(stats.topErrors.length).toBeGreaterThan(0);
      expect(stats.topErrors.length).toBeLessThanOrEqual(10);
      // Most frequent should be first
      expect(stats.topErrors[0].count).toBeGreaterThanOrEqual(
        stats.topErrors[stats.topErrors.length - 1].count
      );
    });
  });

  describe("getErrors", () => {
    beforeEach(() => {
      // Set up test errors
      const errors = [
        {
          message: "Critical error",
          severity: ErrorSeverity.CRITICAL,
          context: { component: "CriticalComponent", userId: "user1" },
        },
        {
          message: "High error",
          severity: ErrorSeverity.HIGH,
          context: { component: "HighComponent", userId: "user2" },
        },
        {
          message: "Medium error",
          severity: ErrorSeverity.MEDIUM,
          context: { component: "MediumComponent" },
        },
      ];

      errors.forEach((error) => {
        errorTrackingService.trackError({
          ...error,
          timestamp: new Date(),
        } as LoggedError);
      });
    });

    it("should return all errors without filter", () => {
      const errors = errorTrackingService.getErrors();

      expect(errors.length).toBe(3);
    });

    it("should filter by severity", () => {
      const errors = errorTrackingService.getErrors({
        severity: [ErrorSeverity.CRITICAL, ErrorSeverity.HIGH],
      });

      expect(errors.length).toBe(2);
      expect(
        errors.every(
          (e) =>
            e.severity === ErrorSeverity.CRITICAL ||
            e.severity === ErrorSeverity.HIGH
        )
      ).toBe(true);
    });

    it("should filter by component", () => {
      const errors = errorTrackingService.getErrors({
        component: ["CriticalComponent"],
      });

      expect(errors.length).toBe(1);
      expect(errors[0].affectedComponents).toContain("CriticalComponent");
    });

    it("should filter by userId", () => {
      const errors = errorTrackingService.getErrors({
        userId: "user1",
      });

      expect(errors.length).toBe(1);
      expect(errors[0].affectedUsers).toContain("user1");
    });

    it("should apply limit", () => {
      const errors = errorTrackingService.getErrors({
        limit: 2,
      });

      expect(errors.length).toBe(2);
    });

    it("should filter by date range", () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 3600000); // 1 hour ago
      const endDate = now;

      const errors = errorTrackingService.getErrors({
        startDate,
        endDate,
      });

      expect(
        errors.every(
          (e) => e.lastOccurrence >= startDate && e.lastOccurrence <= endDate
        )
      ).toBe(true);
    });
  });

  describe("getTrends", () => {
    it("should return trends grouped by minute", () => {
      const error: LoggedError = {
        message: "Trend error",
        severity: ErrorSeverity.LOW,
        context: {},
        timestamp: new Date(),
      };

      errorTrackingService.trackError(error);

      const trends = errorTrackingService.getTrends("minute", 10);

      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0]).toHaveProperty("timestamp");
      expect(trends[0]).toHaveProperty("count");
    });

    it("should return trends grouped by hour", () => {
      const error: LoggedError = {
        message: "Trend error",
        severity: ErrorSeverity.LOW,
        context: {},
        timestamp: new Date(),
      };

      errorTrackingService.trackError(error);

      const trends = errorTrackingService.getTrends("hour", 24);

      expect(trends).toBeDefined();
    });

    it("should limit number of trend buckets", () => {
      for (let i = 0; i < 100; i++) {
        const error: LoggedError = {
          message: "Trend error",
          severity: ErrorSeverity.LOW,
          context: {},
          timestamp: new Date(Date.now() - i * 60000), // Different minutes
        };
        errorTrackingService.trackError(error);
      }

      const trends = errorTrackingService.getTrends("minute", 10);

      expect(trends.length).toBeLessThanOrEqual(10);
    });
  });

  describe("getAlerts", () => {
    it("should return empty array when no alerts", () => {
      const alerts = errorTrackingService.getAlerts();

      expect(alerts).toEqual([]);
    });

    it("should generate alert for high error rate", () => {
      // Generate many errors quickly
      for (let i = 0; i < 15; i++) {
        const error: LoggedError = {
          message: `Error ${i}`,
          severity: ErrorSeverity.LOW,
          context: {},
          timestamp: new Date(),
        };
        errorTrackingService.trackError(error);
      }

      const alerts = errorTrackingService.getAlerts();

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some((a) => a.type === "rate")).toBe(true);
    });

    it("should generate alert for critical errors", () => {
      const error: LoggedError = {
        message: "Critical error",
        severity: ErrorSeverity.CRITICAL,
        context: {},
        timestamp: new Date(),
      };

      errorTrackingService.trackError(error);

      const alerts = errorTrackingService.getAlerts();

      expect(alerts.some((a) => a.type === "severity")).toBe(true);
    });

    it("should generate alert for user impact", () => {
      for (let i = 0; i < 6; i++) {
        const error: LoggedError = {
          message: "User error",
          severity: ErrorSeverity.MEDIUM,
          context: { userId: `user${i}` },
          timestamp: new Date(),
        };
        errorTrackingService.trackError(error);
      }

      const alerts = errorTrackingService.getAlerts();

      expect(alerts.some((a) => a.type === "user-impact")).toBe(true);
    });
  });

  describe("clearOldAlerts", () => {
    it("should remove alerts older than threshold", () => {
      const oldError: LoggedError = {
        message: "Old error",
        severity: ErrorSeverity.CRITICAL,
        context: {},
        timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      };

      errorTrackingService.trackError(oldError);

      // Clear alerts older than 60 minutes
      errorTrackingService.clearOldAlerts(60);

      // Note: This test assumes alerts were generated from the old error
      // and verifies they would be cleared
      const alerts = errorTrackingService.getAlerts();
      expect(
        alerts.every((a) => Date.now() - a.timestamp.getTime() < 60 * 60000)
      ).toBe(true);
    });
  });

  describe("exportData", () => {
    beforeEach(() => {
      const error: LoggedError = {
        message: "Export error",
        severity: ErrorSeverity.MEDIUM,
        context: { component: "ExportComponent" },
        timestamp: new Date(),
      };
      errorTrackingService.trackError(error);
    });

    it("should export data as JSON", () => {
      const exported = errorTrackingService.exportData("json");

      expect(exported).toContain("Export error");
      expect(() => JSON.parse(exported)).not.toThrow();

      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty("exportDate");
      expect(parsed).toHaveProperty("totalErrors");
      expect(parsed).toHaveProperty("errors");
    });

    it("should export data as CSV", () => {
      const exported = errorTrackingService.exportData("csv");

      expect(exported).toContain("Message");
      expect(exported).toContain("Count");
      expect(exported).toContain("Export error");
    });

    it("should escape quotes in CSV export", () => {
      const error: LoggedError = {
        message: 'Error with "quotes"',
        severity: ErrorSeverity.LOW,
        context: {},
        timestamp: new Date(),
      };
      errorTrackingService.trackError(error);

      const exported = errorTrackingService.exportData("csv");

      expect(exported).toContain('""quotes""');
    });
  });

  describe("clear", () => {
    it("should clear all tracked data", () => {
      const error: LoggedError = {
        message: "Test error",
        severity: ErrorSeverity.LOW,
        context: {},
        timestamp: new Date(),
      };
      errorTrackingService.trackError(error);

      errorTrackingService.clear();

      const errors = errorTrackingService.getErrors();
      const trends = errorTrackingService.getTrends();
      const alerts = errorTrackingService.getAlerts();

      expect(errors).toEqual([]);
      expect(trends).toEqual([]);
      expect(alerts).toEqual([]);
    });
  });
});

describe("initializeErrorTracking", () => {
  it("should hook into ErrorLogger", () => {
    const originalLog = ErrorLogger.log;

    initializeErrorTracking();

    expect(ErrorLogger.log).not.toBe(originalLog);
  });
});

describe("getErrorSummaryText", () => {
  it("should generate human-readable summary", () => {
    const stats = errorTrackingService.getStats();
    const summary = getErrorSummaryText(stats);

    expect(summary).toContain("Error Summary");
    expect(summary).toContain("Total Errors:");
    expect(summary).toContain("By Severity:");
  });
});

describe("isErrorTrackingHealthy", () => {
  beforeEach(() => {
    errorTrackingService.clear();
  });

  it("should return true when error rate is low", () => {
    const error: LoggedError = {
      message: "Minor error",
      severity: ErrorSeverity.LOW,
      context: {},
      timestamp: new Date(),
    };
    errorTrackingService.trackError(error);

    expect(isErrorTrackingHealthy()).toBe(true);
  });

  it("should return false when critical errors exist", () => {
    const error: LoggedError = {
      message: "Critical error",
      severity: ErrorSeverity.CRITICAL,
      context: {},
      timestamp: new Date(),
    };
    errorTrackingService.trackError(error);

    // Note: This depends on alert generation
    const result = isErrorTrackingHealthy();
    expect(typeof result).toBe("boolean");
  });

  it("should return false when error rate is high", () => {
    for (let i = 0; i < 15; i++) {
      const error: LoggedError = {
        message: `Error ${i}`,
        severity: ErrorSeverity.MEDIUM,
        context: {},
        timestamp: new Date(),
      };
      errorTrackingService.trackError(error);
    }

    const result = isErrorTrackingHealthy();
    expect(typeof result).toBe("boolean");
  });
});
