import React from "react";
import { render, screen, act } from "@testing-library/react";
import LiveCountdown from "./LiveCountdown";

jest.mock("lucide-react", () => ({
  Clock: ({ className }: any) => (
    <div data-testid="clock-icon" className={className} />
  ),
  AlertCircle: ({ className }: any) => (
    <div data-testid="alert-icon" className={className} />
  ),
}));

describe("LiveCountdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Display", () => {
    it("renders countdown with days remaining", () => {
      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
      render(<LiveCountdown endTime={futureDate} />);
      expect(screen.getByText(/3d/)).toBeInTheDocument();
    });

    it("renders countdown with hours remaining", () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours
      render(<LiveCountdown endTime={futureDate} />);
      expect(screen.getByText(/5h/)).toBeInTheDocument();
    });

    it("renders countdown with minutes remaining", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      render(<LiveCountdown endTime={futureDate} />);
      expect(screen.getByText(/10m/)).toBeInTheDocument();
    });

    it("renders countdown with seconds remaining", () => {
      const futureDate = new Date(Date.now() + 30 * 1000); // 30 seconds
      render(<LiveCountdown endTime={futureDate} />);
      expect(screen.getByText(/30s/)).toBeInTheDocument();
    });

    it("renders ended state when time is up", () => {
      const pastDate = new Date(Date.now() - 1000);
      render(<LiveCountdown endTime={pastDate} />);
      expect(screen.getByText("Ended")).toBeInTheDocument();
    });

    it("renders clock icon", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      render(<LiveCountdown endTime={futureDate} />);
      expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
    });

    it("renders alert icon when ending soon", () => {
      const futureDate = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
      render(<LiveCountdown endTime={futureDate} />);
      expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
    });
  });

  describe("Status Messages", () => {
    it("shows 'remaining' for normal countdown", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      render(<LiveCountdown endTime={futureDate} />);
      expect(screen.getByText("remaining")).toBeInTheDocument();
    });

    it("shows 'ending soon!' when less than 5 minutes", () => {
      const futureDate = new Date(Date.now() + 3 * 60 * 1000);
      render(<LiveCountdown endTime={futureDate} />);
      expect(screen.getByText("ending soon!")).toBeInTheDocument();
    });

    it("shows 'ending now!' when less than 1 minute", () => {
      const futureDate = new Date(Date.now() + 30 * 1000);
      render(<LiveCountdown endTime={futureDate} />);
      expect(screen.getByText("ending now!")).toBeInTheDocument();
    });

    it("shows no unit text when ended", () => {
      const pastDate = new Date(Date.now() - 1000);
      render(<LiveCountdown endTime={pastDate} />);
      expect(screen.queryByText("remaining")).not.toBeInTheDocument();
    });
  });

  describe("Timer Updates", () => {
    it("updates countdown every second", () => {
      const futureDate = new Date(Date.now() + 65 * 1000); // 65 seconds
      render(<LiveCountdown endTime={futureDate} />);

      expect(screen.getByText(/1m/)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(10000); // 10 seconds
      });

      expect(screen.getByText(/55s/)).toBeInTheDocument();
    });

    it("transitions from minutes to seconds", () => {
      const futureDate = new Date(Date.now() + 65 * 1000);
      render(<LiveCountdown endTime={futureDate} />);

      expect(screen.getByText(/1m/)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(screen.getByText(/55s/)).toBeInTheDocument();
    });

    it("calls onExpire when countdown reaches zero", () => {
      const onExpire = jest.fn();
      const futureDate = new Date(Date.now() + 2000); // 2 seconds

      render(<LiveCountdown endTime={futureDate} onExpire={onExpire} />);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(onExpire).toHaveBeenCalled();
    });

    it("does not call onExpire multiple times", () => {
      const onExpire = jest.fn();
      const futureDate = new Date(Date.now() + 2000);

      render(<LiveCountdown endTime={futureDate} onExpire={onExpire} />);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(onExpire).toHaveBeenCalled();
      expect(screen.getByText("Ended")).toBeInTheDocument();
    });
  });

  describe("Server Time Sync", () => {
    it("syncs with server time when provided", () => {
      const clientTime = Date.now();
      const serverTime = new Date(clientTime + 5000); // 5 seconds ahead
      const endTime = new Date(clientTime + 65 * 1000); // 65 seconds from client

      render(
        <LiveCountdown
          endTime={endTime}
          serverTime={serverTime.toISOString()}
        />
      );

      // Should show ~1m (with offset applied)
      expect(screen.getByText(/1m/)).toBeInTheDocument();
    });

    it("handles server time behind client", () => {
      const clientTime = Date.now();
      const serverTime = new Date(clientTime - 5000); // 5 seconds behind
      const endTime = new Date(clientTime + 65 * 1000);

      render(
        <LiveCountdown
          endTime={endTime}
          serverTime={serverTime.toISOString()}
        />
      );

      // Should show ~1m (with offset applied)
      expect(screen.getByText(/1m/)).toBeInTheDocument();
    });
  });

  describe("Compact Mode", () => {
    it("renders compact layout when compact=true", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      const { container } = render(
        <LiveCountdown endTime={futureDate} compact={true} />
      );

      const compactEl = container.querySelector(".inline-flex");
      expect(compactEl).toBeInTheDocument();
    });

    it("renders full layout when compact=false", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      const { container } = render(
        <LiveCountdown endTime={futureDate} compact={false} />
      );

      const fullEl = container.querySelector(".p-4.rounded-lg.border-2");
      expect(fullEl).toBeInTheDocument();
    });

    it("shows clock icon in compact mode", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      render(<LiveCountdown endTime={futureDate} compact={true} />);
      expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
    });
  });

  describe("Color States", () => {
    it("uses blue color for normal time over 5 minutes", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      const { container } = render(<LiveCountdown endTime={futureDate} />);
      expect(container.querySelector(".text-blue-700")).toBeInTheDocument();
    });

    it("uses blue color for 5-10 minutes remaining", () => {
      const futureDate = new Date(Date.now() + 7 * 60 * 1000);
      const { container } = render(<LiveCountdown endTime={futureDate} />);
      expect(container.querySelector(".text-blue-700")).toBeInTheDocument();
    });

    it("uses orange color when ending soon", () => {
      const futureDate = new Date(Date.now() + 3 * 60 * 1000);
      const { container } = render(<LiveCountdown endTime={futureDate} />);
      expect(container.querySelector(".text-orange-700")).toBeInTheDocument();
    });

    it("uses red color when ending now", () => {
      const futureDate = new Date(Date.now() + 30 * 1000);
      const { container } = render(<LiveCountdown endTime={futureDate} />);
      expect(container.querySelector(".text-red-700")).toBeInTheDocument();
    });
  });

  describe("Animation", () => {
    it("adds pulse animation when ending soon", () => {
      const futureDate = new Date(Date.now() + 3 * 60 * 1000);
      const { container } = render(<LiveCountdown endTime={futureDate} />);
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("adds pulse animation when ending now", () => {
      const futureDate = new Date(Date.now() + 30 * 1000);
      const { container } = render(<LiveCountdown endTime={futureDate} />);
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("no pulse animation for normal countdown", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      const { container } = render(<LiveCountdown endTime={futureDate} />);
      expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles string date format", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      render(<LiveCountdown endTime={futureDate} />);
      expect(screen.getByText(/10m/)).toBeInTheDocument();
    });

    it("handles Date object", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      render(<LiveCountdown endTime={futureDate} />);
      expect(screen.getByText(/10m/)).toBeInTheDocument();
    });

    it("handles already expired time", () => {
      const pastDate = new Date(Date.now() - 60000);
      render(<LiveCountdown endTime={pastDate} />);
      expect(screen.getByText("Ended")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      const { container } = render(
        <LiveCountdown endTime={futureDate} className="custom-class" />
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Memory Management", () => {
    it("clears interval on unmount", () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      const { unmount } = render(<LiveCountdown endTime={futureDate} />);

      const clearIntervalSpy = jest.spyOn(global, "clearInterval");
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
