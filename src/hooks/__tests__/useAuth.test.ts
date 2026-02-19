import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { SessionProvider, useAuth } from "@/contexts";
import { onAuthStateChanged } from "firebase/auth";

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
