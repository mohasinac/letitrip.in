/// <reference types="@testing-library/jest-dom" />

import { renderHook, act } from "@testing-library/react";
import { useNavigationGuard } from "./useNavigationGuard";

// Mock window methods
const mockConfirm = jest.fn();
const mockPushState = jest.fn();

Object.defineProperty(window, "confirm", {
  writable: true,
  value: mockConfirm,
});

Object.defineProperty(window.history, "pushState", {
  writable: true,
  value: mockPushState,
});

// Mock event listeners
const eventListeners: { [key: string]: any } = {};

const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

window.addEventListener = jest.fn((event: string, handler: any) => {
  eventListeners[event] = handler;
  originalAddEventListener.call(window, event, handler);
});

window.removeEventListener = jest.fn((event: string, handler: any) => {
  if (eventListeners[event] === handler) {
    delete eventListeners[event];
  }
  originalRemoveEventListener.call(window, event, handler);
});

describe("useNavigationGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it("returns confirmNavigation function", () => {
    const { result } = renderHook(() =>
      useNavigationGuard({ enabled: false, message: "Test message" }),
    );

    expect(typeof result.current.confirmNavigation).toBe("function");
    expect(result.current.isNavigating).toBe(false);
  });

  it("does not set up guards when disabled", () => {
    renderHook(() =>
      useNavigationGuard({ enabled: false, message: "Test message" }),
    );

    expect(window.addEventListener).not.toHaveBeenCalled();
  });

  it("sets up beforeunload handler when enabled", () => {
    renderHook(() =>
      useNavigationGuard({ enabled: true, message: "Test message" }),
    );

    expect(window.addEventListener).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
  });

  it("prevents unload with custom message", () => {
    const message = "Custom leave message";
    renderHook(() => useNavigationGuard({ enabled: true, message }));

    const event = { preventDefault: jest.fn(), returnValue: "" };
    eventListeners["beforeunload"](event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.returnValue).toBe(message);
  });

  it("sets up popstate handler when enabled", () => {
    renderHook(() =>
      useNavigationGuard({ enabled: true, message: "Test message" }),
    );

    expect(window.addEventListener).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
  });

  it("calls onNavigate when user confirms navigation on popstate", () => {
    const onNavigate = jest.fn();
    renderHook(() =>
      useNavigationGuard({
        enabled: true,
        message: "Test message",
        onNavigate,
      }),
    );

    mockConfirm.mockReturnValue(true);
    const popstateEvent = {};
    eventListeners["popstate"](popstateEvent);

    expect(mockConfirm).toHaveBeenCalledWith("Test message");
    expect(onNavigate).toHaveBeenCalled();
  });

  it("calls onCancel when user cancels navigation on popstate", () => {
    const onCancel = jest.fn();
    renderHook(() =>
      useNavigationGuard({
        enabled: true,
        message: "Test message",
        onCancel,
      }),
    );

    mockConfirm.mockReturnValue(false);
    const popstateEvent = {};
    eventListeners["popstate"](popstateEvent);

    expect(mockConfirm).toHaveBeenCalledWith("Test message");
    expect(onCancel).toHaveBeenCalled();
    expect(mockPushState).toHaveBeenCalledWith(null, "", window.location.href);
  });

  it("confirmNavigation returns true when user confirms", async () => {
    const onNavigate = jest.fn();
    const { result } = renderHook(() =>
      useNavigationGuard({
        enabled: true,
        message: "Test message",
        onNavigate,
      }),
    );

    mockConfirm.mockReturnValue(true);
    const callback = jest.fn();

    let returnValue: boolean;
    await act(async () => {
      returnValue = await result.current.confirmNavigation(callback);
    });

    expect(returnValue).toBe(true);
    expect(mockConfirm).toHaveBeenCalledWith("Test message");
    expect(onNavigate).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  it("confirmNavigation returns false when user cancels", async () => {
    const onCancel = jest.fn();
    const { result } = renderHook(() =>
      useNavigationGuard({
        enabled: true,
        message: "Test message",
        onCancel,
      }),
    );

    mockConfirm.mockReturnValue(false);
    const callback = jest.fn();

    let returnValue: boolean;
    await act(async () => {
      returnValue = await result.current.confirmNavigation(callback);
    });

    expect(returnValue).toBe(false);
    expect(mockConfirm).toHaveBeenCalledWith("Test message");
    expect(onCancel).toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it("confirmNavigation does not show confirm when disabled", async () => {
    const { result } = renderHook(() =>
      useNavigationGuard({ enabled: false, message: "Test message" }),
    );

    const callback = jest.fn();

    let returnValue: boolean;
    await act(async () => {
      returnValue = await result.current.confirmNavigation(callback);
    });

    expect(returnValue).toBe(true);
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  it("cleans up event listeners on unmount", () => {
    const { unmount } = renderHook(() =>
      useNavigationGuard({ enabled: true, message: "Test message" }),
    );

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
  });
});
