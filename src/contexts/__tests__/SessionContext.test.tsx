/**
 * SessionContext Tests
 *
 * Verifies auth-state subscription via @/lib/firebase/auth-helpers (not firebase/auth directly).
 * TASK-22: SessionContext must NOT import from firebase/auth or @/lib/firebase/config.
 */

import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { SessionProvider, useSession } from "@/contexts";

const mockOnAuthStateChanged = jest.fn((cb: (user: null) => void) => {
  cb(null);
  return jest.fn();
});

jest.mock("@/lib/firebase/auth-helpers", () => ({
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
  signInWithEmail: jest.fn(),
  signInWithGoogle: jest.fn(),
  signInWithApple: jest.fn(),
  resetPassword: jest.fn(),
  applyEmailVerificationCode: jest.fn(),
  getCurrentUser: jest.fn(),
}));

jest.mock("@/services", () => ({
  sessionService: {
    create: jest.fn(),
    destroy: jest.fn(),
    updateActivity: jest.fn(),
    getProfile: jest.fn(() => Promise.resolve({ data: null, success: false })),
  },
  authService: {
    getProfile: jest.fn(() => Promise.resolve({ data: null, success: false })),
  },
}));

describe("SessionContext (TASK-22 compliance)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((cb) => {
      cb(null);
      return jest.fn();
    });
  });

  it("uses onAuthStateChanged from @/lib/firebase/auth-helpers, not firebase/auth", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(SessionProvider, null, children);

    renderHook(() => useSession(), { wrapper });

    // Should call auth-helpers onAuthStateChanged, not the global firebase/auth mock
    expect(mockOnAuthStateChanged).toHaveBeenCalled();
  });

  it("provides a null user when auth state is null", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(SessionProvider, null, children);

    const { result } = renderHook(() => useSession(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it("cleans up subscription on unmount", () => {
    const unsubscribe = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribe);

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(SessionProvider, null, children);

    const { unmount } = renderHook(() => useSession(), { wrapper });
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
