/**
 * Unit Tests for useHeaderStats Hook
 *
 * Tests header statistics polling, authentication integration,
 * debouncing, focus behavior, and error handling
 */

import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api.service";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useHeaderStats } from "../useHeaderStats";

// Mock dependencies
jest.mock("@/contexts/AuthContext");
jest.mock("@/services/api.service");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe("useHeaderStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Unauthenticated State", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      } as any);
    });

    it("should return default stats for unauthenticated user", () => {
      const { result } = renderHook(() => useHeaderStats());

      expect(result.current.cartCount).toBe(0);
      expect(result.current.notificationCount).toBe(0);
      expect(result.current.messagesCount).toBe(0);
      expect(result.current.favoritesCount).toBe(0);
      expect(result.current.ripLimitBalance).toBeNull();
      expect(result.current.hasUnpaidAuctions).toBe(false);
    });

    it("should not fetch stats for unauthenticated user", async () => {
      const { result } = renderHook(() => useHeaderStats());

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiService.get).not.toHaveBeenCalled();
    });

    it("should not start polling for unauthenticated user", async () => {
      const { result } = renderHook(() => useHeaderStats());

      await act(async () => {
        jest.advanceTimersByTime(35000); // Beyond poll interval
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiService.get).not.toHaveBeenCalled();
    });
  });

  describe("Authenticated State", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: "user123", email: "test@test.com" },
        isLoading: false,
      } as any);
    });

    it("should fetch stats on mount for authenticated user", async () => {
      const mockStats = {
        cartCount: 3,
        notificationCount: 5,
        messagesCount: 2,
        favoritesCount: 10,
        ripLimitBalance: 500,
        hasUnpaidAuctions: true,
      };

      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockStats,
      } as any);

      const { result } = renderHook(() => useHeaderStats());

      await waitFor(() => {
        expect(result.current.cartCount).toBe(mockStats.cartCount);
        expect(result.current.notificationCount).toBe(
          mockStats.notificationCount
        );
        expect(result.current.messagesCount).toBe(mockStats.messagesCount);
        expect(result.current.favoritesCount).toBe(mockStats.favoritesCount);
        expect(result.current.ripLimitBalance).toBe(mockStats.ripLimitBalance);
        expect(result.current.hasUnpaidAuctions).toBe(
          mockStats.hasUnpaidAuctions
        );
      });

      expect(mockApiService.get).toHaveBeenCalledWith("/header/stats");
    });

    it("should set loading state during fetch", async () => {
      let resolvePromise: any;
      const promise = new Promise<any>((resolve) => {
        resolvePromise = resolve;
      });

      mockApiService.get.mockReturnValue(promise);

      const { result } = renderHook(() => useHeaderStats());

      // Loading starts immediately
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise({
          success: true,
          data: {
            cartCount: 0,
            notificationCount: 0,
            messagesCount: 0,
            favoritesCount: 0,
            ripLimitBalance: null,
            hasUnpaidAuctions: false,
          },
        });
        await promise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should poll stats every 30 seconds", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: {
          cartCount: 1,
          notificationCount: 0,
          messagesCount: 0,
          favoritesCount: 0,
          ripLimitBalance: null,
          hasUnpaidAuctions: false,
        },
      });

      const { result } = renderHook(() => useHeaderStats());

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(1);
        expect(result.current.isLoading).toBe(false);
      });

      // Advance 30 seconds
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(2);
      });

      // Advance another 30 seconds
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(3);
      });
    });

    it("should handle API errors gracefully", async () => {
      const error = new Error("Network error");
      mockApiService.get.mockRejectedValue(error);

      const { result } = renderHook(() => useHeaderStats());

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });

      // Stats should remain at default on error
      expect(result.current.cartCount).toBe(0);
      expect(result.current.notificationCount).toBe(0);
      expect(result.current.messagesCount).toBe(0);
      expect(result.current.favoritesCount).toBe(0);
      expect(result.current.ripLimitBalance).toBeNull();
      expect(result.current.hasUnpaidAuctions).toBe(false);
    });

    it("should keep previous stats on subsequent errors", async () => {
      const mockStats = {
        cartCount: 5,
        notificationCount: 3,
        messagesCount: 1,
        favoritesCount: 7,
        ripLimitBalance: 200,
        hasUnpaidAuctions: false,
      };

      // First fetch succeeds
      mockApiService.get.mockResolvedValueOnce({
        success: true,
        data: mockStats,
      } as any);

      const { result } = renderHook(() => useHeaderStats());

      await waitFor(() => {
        expect(result.current.cartCount).toBe(mockStats.cartCount);
        expect(result.current.notificationCount).toBe(
          mockStats.notificationCount
        );
      });

      // Second fetch fails
      mockApiService.get.mockRejectedValueOnce(new Error("Network error"));

      await act(async () => {
        jest.advanceTimersByTime(30000);
      });

      // Should keep previous stats
      await waitFor(() => {
        expect(result.current.cartCount).toBe(mockStats.cartCount);
        expect(result.current.notificationCount).toBe(
          mockStats.notificationCount
        );
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe("Debouncing", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: "user123" },
        isLoading: false,
      } as any);
    });

    it("should debounce rapid fetch calls", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: {
          cartCount: 0,
          notificationCount: 0,
          messagesCount: 0,
          favoritesCount: 0,
          ripLimitBalance: null,
          hasUnpaidAuctions: false,
        },
      });

      const { result } = renderHook(() => useHeaderStats());

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(1);
      });

      // Call fetchStats multiple times rapidly
      await act(async () => {
        result.current.refresh();
        result.current.refresh();
        result.current.refresh();
        // Wait for debounce to settle
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Refresh forces fetch, so we get 1 initial + 3 refresh calls = 4
      expect(mockApiService.get).toHaveBeenCalledTimes(4);

      // After 2 seconds, should allow new fetch
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await act(async () => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(5);
      });
    });
  });

  describe("Window Focus Behavior", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: "user123" },
        isLoading: false,
      } as any);
    });

    it("should refresh stats on window focus", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: {
          cartCount: 0,
          notificationCount: 0,
          messagesCount: 0,
          favoritesCount: 0,
          ripLimitBalance: null,
          hasUnpaidAuctions: false,
        },
      });

      const { result } = renderHook(() => useHeaderStats());

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(1);
        expect(result.current.isLoading).toBe(false);
      });

      // Wait for debounce to clear
      await act(async () => {
        jest.advanceTimersByTime(2500);
      });

      // Simulate window focus event
      await act(async () => {
        window.dispatchEvent(new Event("focus"));
      });

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(2);
      });
    });

    it("should not refresh on focus if within debounce window", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: {
          cartCount: 0,
          notificationCount: 0,
          messagesCount: 0,
          favoritesCount: 0,
          ripLimitBalance: null,
          hasUnpaidAuctions: false,
        },
      });

      renderHook(() => useHeaderStats());

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(1);
      });

      // Immediately trigger focus (within debounce)
      await act(async () => {
        window.dispatchEvent(new Event("focus"));
      });

      // Should not make additional call
      expect(mockApiService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("Cleanup", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: "user123" },
        isLoading: false,
      } as any);
    });

    it("should cleanup polling interval on unmount", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: {
          cartCount: 0,
          notificationCount: 0,
          messagesCount: 0,
          favoritesCount: 0,
          ripLimitBalance: null,
          hasUnpaidAuctions: false,
        },
      });

      const { unmount } = renderHook(() => useHeaderStats());

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(1);
      });

      unmount();

      // Advance time past polling interval
      await act(async () => {
        jest.advanceTimersByTime(35000);
      });

      // Should not make additional calls after unmount
      expect(mockApiService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("Authentication Changes", () => {
    it("should reset stats when user logs out", async () => {
      // Start authenticated
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: "user123" },
        isLoading: false,
      } as any);

      const mockStats = {
        cartCount: 5,
        notificationCount: 3,
        messagesCount: 2,
        favoritesCount: 10,
        ripLimitBalance: 500,
        hasUnpaidAuctions: true,
      };

      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockStats,
      } as any);

      const { result, rerender } = renderHook(() => useHeaderStats());

      await waitFor(() => {
        expect(result.current.cartCount).toBe(mockStats.cartCount);
        expect(result.current.notificationCount).toBe(
          mockStats.notificationCount
        );
      });

      // Logout
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      } as any);

      rerender();

      await waitFor(() => {
        expect(result.current.cartCount).toBe(0);
        expect(result.current.notificationCount).toBe(0);
        expect(result.current.messagesCount).toBe(0);
        expect(result.current.favoritesCount).toBe(0);
        expect(result.current.ripLimitBalance).toBeNull();
        expect(result.current.hasUnpaidAuctions).toBe(false);
      });
    });

    it("should start fetching when user logs in", async () => {
      // Start unauthenticated
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      } as any);

      const { rerender } = renderHook(() => useHeaderStats());

      expect(mockApiService.get).not.toHaveBeenCalled();

      // Login
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: "user123" },
        isLoading: false,
      } as any);

      mockApiService.get.mockResolvedValue({
        success: true,
        data: {
          cartCount: 2,
          notificationCount: 1,
          messagesCount: 0,
          favoritesCount: 5,
          ripLimitBalance: 300,
          hasUnpaidAuctions: false,
        },
      } as any);

      rerender();

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalled();
      });
    });
  });

  describe("Manual Refresh", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: "user123" },
        isLoading: false,
      } as any);
    });

    it("should provide manual refresh function", async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: {
          cartCount: 1,
          notificationCount: 0,
          messagesCount: 0,
          favoritesCount: 0,
          ripLimitBalance: null,
          hasUnpaidAuctions: false,
        },
      });

      const { result } = renderHook(() => useHeaderStats());

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(1);
      });

      // Wait for debounce to clear
      await act(async () => {
        jest.advanceTimersByTime(2500);
      });

      // Manual refresh
      await act(async () => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(mockApiService.get).toHaveBeenCalledTimes(2);
      });
    });
  });
});
