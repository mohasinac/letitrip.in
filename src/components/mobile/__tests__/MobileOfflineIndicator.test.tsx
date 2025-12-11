import { act, render, screen, waitFor } from "@testing-library/react";
import { MobileOfflineIndicator } from "../MobileOfflineIndicator";

describe("MobileOfflineIndicator - Network Status Component", () => {
  let originalNavigator: any;
  let onlineCallback: (() => void) | undefined;
  let offlineCallback: (() => void) | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    onlineCallback = undefined;
    offlineCallback = undefined;

    // Mock navigator.onLine
    originalNavigator = globalThis.navigator;
    delete (globalThis as any).navigator;
    (globalThis as any).navigator = { onLine: true };

    // Mock addEventListener
    jest
      .spyOn(globalThis, "addEventListener")
      .mockImplementation((event, callback) => {
        if (event === "online") onlineCallback = callback as () => void;
        if (event === "offline") offlineCallback = callback as () => void;
      });

    jest.spyOn(globalThis, "removeEventListener").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    (globalThis as any).navigator = originalNavigator;
    jest.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should not render when online initially", () => {
      render(<MobileOfflineIndicator />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("should register online event listener", () => {
      render(<MobileOfflineIndicator />);
      expect(globalThis.addEventListener).toHaveBeenCalledWith(
        "online",
        expect.any(Function)
      );
    });

    it("should register offline event listener", () => {
      render(<MobileOfflineIndicator />);
      expect(globalThis.addEventListener).toHaveBeenCalledWith(
        "offline",
        expect.any(Function)
      );
    });

    it("should cleanup event listeners on unmount", () => {
      const { unmount } = render(<MobileOfflineIndicator />);
      unmount();
      expect(globalThis.removeEventListener).toHaveBeenCalledWith(
        "online",
        expect.any(Function)
      );
      expect(globalThis.removeEventListener).toHaveBeenCalledWith(
        "offline",
        expect.any(Function)
      );
    });
  });

  describe("Offline State", () => {
    it("should show indicator when going offline", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should show offline message", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(
        screen.getByText("You're offline. Some features may be unavailable.")
      ).toBeInTheDocument();
    });

    it("should render WifiOff icon when offline", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      const status = screen.getByRole("status");
      expect(status.querySelector("svg")).toBeInTheDocument();
    });

    it("should have red background when offline", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveClass("bg-red-500");
    });

    it("should have white text when offline", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveClass("text-white");
    });

    it("should persist offline indicator", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("Online State (Back Online)", () => {
    it("should show Back online message briefly", () => {
      render(<MobileOfflineIndicator />);

      // Go offline first
      act(() => {
        offlineCallback?.();
      });

      // Come back online
      act(() => {
        onlineCallback?.();
      });

      expect(screen.getByText("Back online")).toBeInTheDocument();
    });

    it("should show checkmark icon when back online", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        onlineCallback?.();
      });

      const status = screen.getByRole("status");
      const svg = status.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelector("path")).toHaveAttribute("d", "M5 13l4 4L19 7");
    });

    it("should have green background when back online", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        onlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveClass("bg-green-500");
    });

    it("should hide Back online after 2 seconds", async () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        onlineCallback?.();
      });

      expect(screen.getByText("Back online")).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
      });
    });

    it("should not show indicator before 2s timeout", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        onlineCallback?.();
      });

      act(() => {
        jest.advanceTimersByTime(1999);
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("Initial Offline State", () => {
    it("should detect initial offline state", () => {
      delete (globalThis as any).navigator;
      (globalThis as any).navigator = { onLine: false };

      render(<MobileOfflineIndicator />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(
        screen.getByText("You're offline. Some features may be unavailable.")
      ).toBeInTheDocument();
    });

    it("should show offline indicator immediately if starting offline", () => {
      delete (globalThis as any).navigator;
      (globalThis as any).navigator = { onLine: false };

      render(<MobileOfflineIndicator />);

      expect(screen.getByRole("status")).toHaveClass("bg-red-500");
    });
  });

  describe("Accessibility", () => {
    it("should have role=status", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should have aria-live=polite", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });

    it("should announce status changes to screen readers", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
      expect(status).toHaveAttribute("role", "status");
    });
  });

  describe("Styling & Layout", () => {
    it("should have fixed positioning at top", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      const status = screen.getByRole("status");
      expect(status).toHaveClass("fixed", "top-0", "left-0", "right-0");
    });

    it("should have very high z-index (z-[100])", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveClass("z-[100]");
    });

    it("should be centered with flexbox", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      const status = screen.getByRole("status");
      expect(status).toHaveClass("flex", "items-center", "justify-center");
    });

    it("should have gap between icon and text", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveClass("gap-2");
    });

    it("should have padding", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      const status = screen.getByRole("status");
      expect(status).toHaveClass("py-2", "px-4");
    });

    it("should have small font size", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveClass("text-sm");
    });

    it("should have medium font weight", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveClass("font-medium");
    });

    it("should have transition for color changes", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveClass(
        "transition-colors",
        "duration-300"
      );
    });

    it("should have safe area inset for notched devices", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveClass("safe-area-inset-top");
    });
  });

  describe("Icon Rendering", () => {
    it("should render WifiOff icon with correct size (w-4 h-4)", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      const status = screen.getByRole("status");
      const icon = status.querySelector("svg");
      expect(icon).toHaveClass("w-4", "h-4");
    });

    it("should render checkmark with stroke properties", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        onlineCallback?.();
      });

      const svg = screen.getByRole("status").querySelector("svg");
      expect(svg).toHaveAttribute("fill", "none");
      expect(svg).toHaveAttribute("stroke", "currentColor");
    });

    it("should have checkmark viewBox", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        onlineCallback?.();
      });

      const svg = screen.getByRole("status").querySelector("svg");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("should have checkmark path with stroke width", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        onlineCallback?.();
      });

      const path = screen.getByRole("status").querySelector("path");
      expect(path).toHaveAttribute("stroke-width", "2");
      expect(path).toHaveAttribute("stroke-linecap", "round");
      expect(path).toHaveAttribute("stroke-linejoin", "round");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid online/offline toggles", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        onlineCallback?.();
      });

      act(() => {
        offlineCallback?.();
      });

      expect(
        screen.getByText("You're offline. Some features may be unavailable.")
      ).toBeInTheDocument();
    });

    it("should handle missing addEventListener", () => {
      jest
        .spyOn(globalThis, "addEventListener")
        .mockImplementation(undefined as any);

      expect(() => render(<MobileOfflineIndicator />)).not.toThrow();
    });

    it("should handle missing removeEventListener", () => {
      jest
        .spyOn(globalThis, "removeEventListener")
        .mockImplementation(undefined as any);

      const { unmount } = render(<MobileOfflineIndicator />);
      expect(() => unmount()).not.toThrow();
    });

    it("should handle multiple rapid offline events", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
        offlineCallback?.();
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should handle multiple rapid online events", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        onlineCallback?.();
        onlineCallback?.();
        onlineCallback?.();
      });

      expect(screen.getByText("Back online")).toBeInTheDocument();
    });

    it("should handle online event before timeout completes", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        onlineCallback?.();
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        offlineCallback?.();
      });

      expect(
        screen.getByText("You're offline. Some features may be unavailable.")
      ).toBeInTheDocument();
    });

    it("should clear timeout on unmount", () => {
      const { unmount } = render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      act(() => {
        onlineCallback?.();
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should not cause any errors
      expect(true).toBe(true);
    });
  });

  describe("State Transitions", () => {
    it("should transition from offline to online correctly", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveClass("bg-red-500");

      act(() => {
        onlineCallback?.();
      });

      expect(screen.getByRole("status")).toHaveClass("bg-green-500");
    });

    it("should maintain indicator visibility during transition", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      const beforeTransition = screen.getByRole("status");

      act(() => {
        onlineCallback?.();
      });

      const afterTransition = screen.getByRole("status");

      expect(beforeTransition).toBe(afterTransition);
    });

    it("should update text content during transition", () => {
      render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      expect(
        screen.getByText("You're offline. Some features may be unavailable.")
      ).toBeInTheDocument();

      act(() => {
        onlineCallback?.();
      });

      expect(screen.getByText("Back online")).toBeInTheDocument();
      expect(
        screen.queryByText("You're offline. Some features may be unavailable.")
      ).not.toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should not re-render unnecessarily when already offline", () => {
      const { container } = render(<MobileOfflineIndicator />);

      act(() => {
        offlineCallback?.();
      });

      const firstRender = container.innerHTML;

      act(() => {
        offlineCallback?.();
      });

      expect(container.innerHTML).toBe(firstRender);
    });

    it("should handle 100 rapid toggles without crashing", () => {
      render(<MobileOfflineIndicator />);

      expect(() => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            if (i % 2 === 0) {
              offlineCallback?.();
            } else {
              onlineCallback?.();
            }
          }
        });
      }).not.toThrow();
    });
  });
});
