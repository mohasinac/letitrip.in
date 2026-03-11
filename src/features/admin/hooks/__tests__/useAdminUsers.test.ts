/**
 * useAdminUsers Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminUsers } from "../useAdminUsers";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isPending: false,
    error: null,
  })),
}));

jest.mock("@/services", () => ({
  adminService: {
    listUsers: jest.fn().mockResolvedValue({ users: [], meta: {} }),
    updateUser: jest.fn().mockResolvedValue({}),
    deleteUser: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { adminService } = require("@/services");

describe("useAdminUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
    (useApiMutation as jest.Mock).mockImplementation((opts: any) => ({
      mutate: (data: unknown) => opts.mutationFn(data),
      isPending: false,
    }));
  });

  it("calls adminService.listUsers with sieveParams", () => {
    renderHook(() => useAdminUsers("page=1"));
    expect(adminService.listUsers).toHaveBeenCalledWith("page=1");
  });

  it("uses queryKey ['admin', 'users', sieveParams]", () => {
    renderHook(() => useAdminUsers("page=1"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "users", "page=1"] }),
    );
  });

  it("updateUserMutation calls adminService.updateUser with uid and data", () => {
    const { result } = renderHook(() => useAdminUsers(""));
    result.current.updateUserMutation.mutate({
      uid: "user-1",
      data: { role: "seller" },
    });
    expect(adminService.updateUser).toHaveBeenCalledWith("user-1", {
      role: "seller",
    });
  });

  it("deleteUserMutation calls adminService.deleteUser with uid", () => {
    const { result } = renderHook(() => useAdminUsers(""));
    result.current.deleteUserMutation.mutate("user-1");
    expect(adminService.deleteUser).toHaveBeenCalledWith("user-1");
  });
});
