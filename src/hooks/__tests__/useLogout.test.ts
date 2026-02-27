/**
 * useLogout Tests — Phase 62
 *
 * Verifies that useLogout delegates to authService.logout() and
 * forwards optional onSuccess/onError callbacks.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useLogout } from "../useLogout";

jest.mock("../useApiMutation", () => ({
  useApiMutation: jest.fn((opts: any) => ({
    mutate: () => opts.mutationFn(),
    mutateAsync: () => opts.mutationFn(),
    isLoading: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
}));

jest.mock("@/services", () => ({
  authService: {
    logout: jest.fn().mockResolvedValue(undefined),
  },
}));

const { useApiMutation } = require("../useApiMutation");
const { authService } = require("@/services");

describe("useLogout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls authService.logout when mutate is invoked", () => {
    const { result } = renderHook(() => useLogout());
    result.current.mutate();
    expect(authService.logout).toHaveBeenCalled();
  });

  it("forwards onSuccess callback to useApiMutation", () => {
    const onSuccess = jest.fn();
    renderHook(() => useLogout({ onSuccess }));
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onSuccess }),
    );
  });

  it("forwards onError callback to useApiMutation", () => {
    const onError = jest.fn();
    renderHook(() => useLogout({ onError }));
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onError }),
    );
  });

  it("works with no options", () => {
    expect(() => renderHook(() => useLogout())).not.toThrow();
  });
});
