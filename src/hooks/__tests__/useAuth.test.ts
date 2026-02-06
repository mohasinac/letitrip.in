/**
 * Tests for useAuth hook
 *
 * Coverage:
 * - Authentication state management
 * - Firestore user data fetching
 * - User data merging (Auth + Firestore)
 * - Loading state
 * - Error handling
 * - Cleanup on unmount
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../useAuth";
import { onAuthStateChanged } from "@/lib/firebase/auth-helpers";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { USER_COLLECTION } from "@/db/schema/users";

// Mock Firebase
jest.mock("@/lib/firebase/config", () => ({
  db: {},
  auth: {},
  storage: {},
}));

jest.mock("@/lib/firebase/auth-helpers", () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

describe("useAuth", () => {
  const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
    typeof onAuthStateChanged
  >;
  const mockDoc = doc as jest.MockedFunction<typeof doc>;
  const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Initial State Tests
  // ============================================

  describe("Initial State", () => {
    it("starts with loading state", () => {
      mockOnAuthStateChanged.mockImplementation(() => jest.fn());

      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
    });
  });

  // ============================================
  // Authenticated User Tests
  // ============================================

  describe("Authenticated User", () => {
    it("fetches and merges user data from Firestore", async () => {
      const mockAuthUser = {
        uid: "test-user-id",
        email: "test@example.com",
        displayName: "Test User",
        emailVerified: false,
      };

      const mockFirestoreData = {
        role: "admin",
        phoneNumber: "1234567890",
        phoneVerified: true,
        disabled: false,
        createdAt: { seconds: 1234567890 },
        updatedAt: { seconds: 1234567890 },
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockAuthUser as any);
        return jest.fn();
      });

      mockDoc.mockReturnValue({ id: "test-user-id" } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockFirestoreData,
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual({
        ...mockAuthUser,
        ...mockFirestoreData,
        uid: mockAuthUser.uid, // Ensure auth uid is used
      });

      expect(mockDoc).toHaveBeenCalledWith(
        db,
        USER_COLLECTION,
        mockAuthUser.uid,
      );
      expect(mockGetDoc).toHaveBeenCalled();
    });

    it("uses only auth data if Firestore doc does not exist", async () => {
      const mockAuthUser = {
        uid: "test-user-id",
        email: "test@example.com",
        displayName: "Test User",
        emailVerified: false,
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockAuthUser as any);
        return jest.fn();
      });

      mockDoc.mockReturnValue({ id: "test-user-id" } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockAuthUser);
    });

    it("falls back to auth data if Firestore fetch fails", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const mockAuthUser = {
        uid: "test-user-id",
        email: "test@example.com",
        displayName: "Test User",
        emailVerified: false,
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockAuthUser as any);
        return jest.fn();
      });

      mockDoc.mockReturnValue({ id: "test-user-id" } as any);
      mockGetDoc.mockRejectedValue(new Error("Firestore error"));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockAuthUser);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching user profile:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  // ============================================
  // Unauthenticated User Tests
  // ============================================

  describe("Unauthenticated User", () => {
    it("sets user to null when not authenticated", async () => {
      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(mockGetDoc).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Loading State Tests
  // ============================================

  describe("Loading State", () => {
    it("sets loading to false after auth state determined", async () => {
      mockOnAuthStateChanged.mockImplementation((callback) => {
        // Fire callback synchronously (simulates immediate auth state)
        callback(null);
        return jest.fn();
      });

      const { result } = renderHook(() => useAuth());

      // The mock fires synchronously inside useEffect, so by the time
      // renderHook returns, React may have already batched the state update.
      // Just verify loading eventually becomes false.
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("maintains loading state while fetching Firestore data", async () => {
      const mockAuthUser = {
        uid: "test-user-id",
        email: "test@example.com",
      };

      let resolveGetDoc: any;
      const getDocPromise = new Promise((resolve) => {
        resolveGetDoc = resolve;
      });

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockAuthUser as any);
        return jest.fn();
      });

      mockDoc.mockReturnValue({ id: "test-user-id" } as any);
      mockGetDoc.mockReturnValue(getDocPromise as any);

      const { result } = renderHook(() => useAuth());

      // Should still be loading while Firestore fetch is pending
      expect(result.current.loading).toBe(true);

      // Resolve Firestore fetch
      resolveGetDoc({
        exists: () => false,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  // ============================================
  // Cleanup Tests
  // ============================================

  describe("Cleanup", () => {
    it("unsubscribes from auth state changes on unmount", () => {
      const unsubscribe = jest.fn();
      mockOnAuthStateChanged.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useAuth());

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it("only subscribes once with empty dependency array", () => {
      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return jest.fn();
      });

      const { rerender } = renderHook(() => useAuth());

      // Call count after initial render
      const initialCallCount = mockOnAuthStateChanged.mock.calls.length;

      // Rerender multiple times
      rerender();
      rerender();
      rerender();

      // Should not call again due to empty dependency array
      expect(mockOnAuthStateChanged.mock.calls.length).toBe(initialCallCount);
    });
  });

  // ============================================
  // Data Merging Tests
  // ============================================

  describe("Data Merging", () => {
    it("merges auth and Firestore data correctly", async () => {
      const mockAuthUser = {
        uid: "test-user-id",
        email: "auth@example.com",
        displayName: "Auth Name",
        emailVerified: false,
        photoURL: "https://auth-photo.jpg",
      };

      const mockFirestoreData = {
        email: "firestore@example.com", // Firestore email
        displayName: "Firestore Name", // Firestore name
        role: "admin",
        phoneNumber: "1234567890",
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockAuthUser as any);
        return jest.fn();
      });

      mockDoc.mockReturnValue({ id: "test-user-id" } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockFirestoreData,
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Firestore data should override auth data
      expect(result.current.user!.email).toBe("firestore@example.com");
      expect(result.current.user!.displayName).toBe("Firestore Name");
      expect(result.current.user!.role).toBe("admin");
      expect(result.current.user!.phoneNumber).toBe("1234567890");
      // Auth data should still be present
      expect(result.current.user!.photoURL).toBe("https://auth-photo.jpg");
      // UID should always be from auth
      expect(result.current.user!.uid).toBe("test-user-id");
    });

    it("preserves auth uid even if Firestore has different uid", async () => {
      const mockAuthUser = {
        uid: "auth-user-id",
        email: "test@example.com",
      };

      const mockFirestoreData = {
        uid: "firestore-user-id", // Different UID
        role: "admin",
      };

      mockOnAuthStateChanged.mockImplementation((callback) => {
        callback(mockAuthUser as any);
        return jest.fn();
      });

      mockDoc.mockReturnValue({ id: "auth-user-id" } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockFirestoreData,
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Auth UID should be used
      expect(result.current.user!.uid).toBe("auth-user-id");
    });
  });

  // ============================================
  // Auth State Changes Tests
  // ============================================

  describe("Auth State Changes", () => {
    it("updates user when auth state changes", async () => {
      let authCallback: any;
      mockOnAuthStateChanged.mockImplementation((callback) => {
        authCallback = callback;
        return jest.fn();
      });

      const { result } = renderHook(() => useAuth());

      // Initial state: not authenticated
      authCallback(null);
      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      // User logs in
      const mockAuthUser = {
        uid: "test-user-id",
        email: "test@example.com",
      };

      mockDoc.mockReturnValue({ id: "test-user-id" } as any);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      authCallback(mockAuthUser);
      await waitFor(() => {
        expect(result.current.user).toEqual(mockAuthUser);
      });

      // User logs out
      authCallback(null);
      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });
    });
  });
});
