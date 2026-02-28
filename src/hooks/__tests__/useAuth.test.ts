import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { SessionProvider, useAuth } from "@/contexts";
import { onAuthStateChanged } from "firebase/auth";

// TASK-21 compliance: @/lib/firebase/auth-helpers wraps firebase/auth functions.
// The global jest.setup.ts mock for firebase/auth covers the underlying calls.
// No direct firebase/auth or firebase/config imports in useAuth.ts.
jest.mock("@/lib/firebase/auth-helpers", () => ({
  signInWithGoogle: jest.fn(),
  signInWithApple: jest.fn(),
  resetPassword: jest.fn(),
  applyEmailVerificationCode: jest.fn(),
  getCurrentUser: jest.fn(),
  signInWithEmail: jest.fn(() => Promise.resolve({ user: { uid: "u1" } })),
  onAuthStateChanged: jest.fn((cb) => {
    cb(null);
    return jest.fn();
  }),
}));

describe("useAuth", () => {
  const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
    typeof onAuthStateChanged
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws without SessionProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useSession must be used within a SessionProvider",
    );
  });

  it("exposes user and loading from SessionProvider", async () => {
    mockOnAuthStateChanged.mockImplementation((_, callback) => {
      if (typeof callback === "function") callback(null);
      return jest.fn();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(SessionProvider, null, children);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  describe("Cleanup", () => {
    it("unsubscribes from auth state changes on unmount", () => {
      const unsubscribe = jest.fn();
      mockOnAuthStateChanged.mockReturnValue(unsubscribe);

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(SessionProvider, null, children);

      const { unmount } = renderHook(() => useAuth(), { wrapper });

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
