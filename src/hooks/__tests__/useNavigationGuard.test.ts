/**
 * Unit Tests for useNavigationGuard Hook
 *
 * Tests navigation prevention, cleanup callbacks, browser events,
 * and Next.js integration
 */

import { logError } from "@/lib/firebase-error-logger";
import { act, renderHook } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useNavigationGuard } from "../useNavigationGuard";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/lib/firebase-error-logger");

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;

describe("useNavigationGuard", () => {
  let mockRouter: any;
  let originalConfirm: any;
  let originalAddEventListener: any;
  let originalRemoveEventListener: any;
  let originalPushState: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
    };
    mockUseRouter.mockReturnValue(mockRouter);

    // Mock window.confirm
    originalConfirm = globalThis.confirm;
    globalThis.confirm = jest.fn();

    // Mock event listeners
    originalAddEventListener = globalThis.addEventListener;
    originalRemoveEventListener = globalThis.removeEventListener;
    globalThis.addEventListener = jest.fn();
    globalThis.removeEventListener = jest.fn();

    // Mock history
    originalPushState = globalThis.history?.pushState;
    if (globalThis.history) {
      globalThis.history.pushState = jest.fn();
    }
  });

  afterEach(() => {
    // Restore mocks in reverse order
    if (globalThis.history) {
      globalThis.history.pushState = originalPushState;
    }
    // Restore these before the test environment tries to use them
    if (originalAddEventListener) {
      globalThis.addEventListener = originalAddEventListener;
    }
    if (originalRemoveEventListener) {
      globalThis.removeEventListener = originalRemoveEventListener;
    }
    if (originalConfirm) {
      globalThis.confirm = originalConfirm;
    }
  });

  describe("Disabled State", () => {
    it("should not prevent navigation when disabled", () => {
      renderHook(() =>
        useNavigationGuard({
          enabled: false,
          message: "Test message",
        })
      );

      // Should not add event listeners when disabled
      expect(globalThis.addEventListener).not.toHaveBeenCalled();
    });

    it("should allow confirmNavigation without prompt when disabled", async () => {
      const { result } = renderHook(() =>
        useNavigationGuard({
          enabled: false,
        })
      );

      const mockCallback = jest.fn();

      await act(async () => {
        const allowed = await result.current.confirmNavigation(mockCallback);
        expect(allowed).toBe(true);
      });

      expect(mockCallback).toHaveBeenCalled();
      expect(globalThis.confirm).not.toHaveBeenCalled();
    });
  });

  describe("Enabled State", () => {
    it("should add beforeunload listener when enabled", () => {
      renderHook(() =>
        useNavigationGuard({
          enabled: true,
          message: "You have unsaved changes",
        })
      );

      expect(globalThis.addEventListener).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
    });

    it("should add popstate listener when enabled", () => {
      renderHook(() =>
        useNavigationGuard({
          enabled: true,
        })
      );

      expect(globalThis.addEventListener).toHaveBeenCalledWith(
        "popstate",
        expect.any(Function)
      );
    });

    it("should cleanup listeners on unmount", () => {
      const { unmount } = renderHook(() =>
        useNavigationGuard({
          enabled: true,
        })
      );

      unmount();

      expect(globalThis.removeEventListener).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      expect(globalThis.removeEventListener).toHaveBeenCalledWith(
        "popstate",
        expect.any(Function)
      );
    });
  });

  describe("beforeunload Event", () => {
    it("should prevent page unload with custom message", () => {
      const customMessage = "Custom unsaved changes message";

      renderHook(() =>
        useNavigationGuard({
          enabled: true,
          message: customMessage,
        })
      );

      // Get the beforeunload handler
      const beforeunloadCall = (
        globalThis.addEventListener as jest.Mock
      ).mock.calls.find((call) => call[0] === "beforeunload");
      const beforeunloadHandler = beforeunloadCall?.[1];

      expect(beforeunloadHandler).toBeDefined();

      // Simulate beforeunload event
      const mockEvent = {
        preventDefault: jest.fn(),
        returnValue: "",
      };

      beforeunloadHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.returnValue).toBe(customMessage);
    });
  });

  describe("popstate Event (Browser Back/Forward)", () => {
    it("should show confirmation dialog on browser back", () => {
      (globalThis.confirm as jest.Mock).mockReturnValue(true);

      renderHook(() =>
        useNavigationGuard({
          enabled: true,
          message: "Leave page?",
        })
      );

      // Get the popstate handler
      const popstateCall = (
        globalThis.addEventListener as jest.Mock
      ).mock.calls.find((call) => call[0] === "popstate");
      const popstateHandler = popstateCall?.[1];

      // Simulate popstate
      act(() => {
        popstateHandler?.({});
      });

      expect(globalThis.confirm).toHaveBeenCalledWith("Leave page?");
    });

    it("should call onNavigate when user confirms", async () => {
      (globalThis.confirm as jest.Mock).mockReturnValue(true);
      const onNavigate = jest.fn().mockResolvedValue(undefined);

      renderHook(() =>
        useNavigationGuard({
          enabled: true,
          onNavigate,
        })
      );

      const popstateCall = (
        globalThis.addEventListener as jest.Mock
      ).mock.calls.find((call) => call[0] === "popstate");
      const popstateHandler = popstateCall?.[1];

      await act(async () => {
        await popstateHandler?.({});
      });

      expect(onNavigate).toHaveBeenCalled();
    });

    it("should call onCancel when user declines", () => {
      (globalThis.confirm as jest.Mock).mockReturnValue(false);
      const onCancel = jest.fn();

      renderHook(() =>
        useNavigationGuard({
          enabled: true,
          onCancel,
        })
      );

      const popstateCall = (
        globalThis.addEventListener as jest.Mock
      ).mock.calls.find((call) => call[0] === "popstate");
      const popstateHandler = popstateCall?.[1];

      act(() => {
        popstateHandler?.({});
      });

      expect(onCancel).toHaveBeenCalled();
      expect(globalThis.history?.pushState).toHaveBeenCalled();
    });

    it("should handle async onNavigate errors", async () => {
      (globalThis.confirm as jest.Mock).mockReturnValue(true);
      const error = new Error("Cleanup failed");
      const onNavigate = jest.fn().mockRejectedValue(error);

      renderHook(() =>
        useNavigationGuard({
          enabled: true,
          onNavigate,
        })
      );

      const popstateCall = (
        globalThis.addEventListener as jest.Mock
      ).mock.calls.find((call) => call[0] === "popstate");
      const popstateHandler = popstateCall?.[1];

      await act(async () => {
        await popstateHandler?.({});
      });

      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "useNavigationGuard.onNavigate.beforeUnload",
      });
    });
  });

  describe("Manual confirmNavigation", () => {
    it("should show confirmation dialog for manual navigation", async () => {
      (globalThis.confirm as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() =>
        useNavigationGuard({
          enabled: true,
          message: "Leave?",
        })
      );

      const mockCallback = jest.fn();

      await act(async () => {
        const confirmed = await result.current.confirmNavigation(mockCallback);
        expect(confirmed).toBe(true);
      });

      expect(globalThis.confirm).toHaveBeenCalledWith("Leave?");
      expect(mockCallback).toHaveBeenCalled();
    });

    it("should not execute callback if user cancels", async () => {
      (globalThis.confirm as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() =>
        useNavigationGuard({
          enabled: true,
        })
      );

      const mockCallback = jest.fn();

      await act(async () => {
        const confirmed = await result.current.confirmNavigation(mockCallback);
        expect(confirmed).toBe(false);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should call onNavigate before callback", async () => {
      (globalThis.confirm as jest.Mock).mockReturnValue(true);
      const callOrder: string[] = [];
      const onNavigate = jest.fn(async () => {
        callOrder.push("onNavigate");
      });

      const { result } = renderHook(() =>
        useNavigationGuard({
          enabled: true,
          onNavigate,
        })
      );

      const mockCallback = jest.fn(() => {
        callOrder.push("callback");
      });

      await act(async () => {
        await result.current.confirmNavigation(mockCallback);
      });

      expect(callOrder).toEqual(["onNavigate", "callback"]);
    });

    it("should handle async callbacks", async () => {
      (globalThis.confirm as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() =>
        useNavigationGuard({
          enabled: true,
        })
      );

      const asyncCallback = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "done";
      });

      await act(async () => {
        await result.current.confirmNavigation(asyncCallback);
      });

      expect(asyncCallback).toHaveBeenCalled();
    });

    it("should handle onNavigate errors in confirmNavigation", async () => {
      (globalThis.confirm as jest.Mock).mockReturnValue(true);
      const error = new Error("Cleanup error");
      const onNavigate = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() =>
        useNavigationGuard({
          enabled: true,
          onNavigate,
        })
      );

      const mockCallback = jest.fn();

      await act(async () => {
        await result.current.confirmNavigation(mockCallback);
      });

      expect(mockLogError).toHaveBeenCalledWith(error, {
        component: "useNavigationGuard.onNavigate.confirmNavigation",
      });
      // Callback should still execute
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe("Default Messages", () => {
    it("should use default message when none provided", () => {
      renderHook(() =>
        useNavigationGuard({
          enabled: true,
        })
      );

      const beforeunloadCall = (
        globalThis.addEventListener as jest.Mock
      ).mock.calls.find((call) => call[0] === "beforeunload");
      const beforeunloadHandler = beforeunloadCall?.[1];

      const mockEvent = {
        preventDefault: jest.fn(),
        returnValue: "",
      };

      beforeunloadHandler(mockEvent);

      expect(mockEvent.returnValue).toBe(
        "You have unsaved changes. Do you want to leave this page?"
      );
    });
  });

  describe("Re-enabling Guard", () => {
    it("should add listeners when guard is re-enabled", () => {
      const { rerender } = renderHook(
        ({ enabled }) => useNavigationGuard({ enabled }),
        { initialProps: { enabled: false } }
      );

      expect(globalThis.addEventListener).not.toHaveBeenCalled();

      rerender({ enabled: true });

      expect(globalThis.addEventListener).toHaveBeenCalled();
    });

    it("should remove listeners when guard is disabled", () => {
      const { rerender } = renderHook(
        ({ enabled }) => useNavigationGuard({ enabled }),
        { initialProps: { enabled: true } }
      );

      expect(globalThis.addEventListener).toHaveBeenCalled();

      rerender({ enabled: false });

      expect(globalThis.removeEventListener).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing globalThis.confirm gracefully", async () => {
      (globalThis as any).confirm = undefined;

      const { result } = renderHook(() =>
        useNavigationGuard({
          enabled: true,
        })
      );

      const mockCallback = jest.fn();

      // Should default to true when confirm is undefined
      await act(async () => {
        const confirmed = await result.current.confirmNavigation(mockCallback);
        expect(confirmed).toBe(true);
      });

      expect(mockCallback).toHaveBeenCalled();
    });

    it("should handle missing history API gracefully", () => {
      const originalHistory = globalThis.history;
      (globalThis as any).history = undefined;

      expect(() => {
        renderHook(() =>
          useNavigationGuard({
            enabled: true,
          })
        );
      }).not.toThrow();

      (globalThis as any).history = originalHistory;
    });

    it("should not call onNavigate multiple times for same navigation", async () => {
      (globalThis.confirm as jest.Mock).mockReturnValue(true);
      const onNavigate = jest.fn().mockImplementation(() => {
        // Simulate async operation that takes time
        return new Promise((resolve) => setTimeout(resolve, 10));
      });

      renderHook(() =>
        useNavigationGuard({
          enabled: true,
          onNavigate,
        })
      );

      const popstateCall = (
        globalThis.addEventListener as jest.Mock
      ).mock.calls.find((call) => call[0] === "popstate");
      const popstateHandler = popstateCall?.[1];

      // Trigger multiple times rapidly without awaiting
      await act(async () => {
        popstateHandler?.({});
        popstateHandler?.({});
        popstateHandler?.({});
        // Wait for all to complete
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Should only call once due to isNavigatingRef guard
      expect(onNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
