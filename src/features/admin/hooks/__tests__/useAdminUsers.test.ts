/**
 * useAdminUsers Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminUsers } from "../useAdminUsers";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isPending: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock("@/services", () => ({
  adminService: {
    listUsers: jest.fn().mockResolvedValue({ users: [], meta: {} }),
  },
}));

jest.mock("@/actions", () => ({
  adminUpdateUserAction: jest.fn().mockResolvedValue({}),
  adminDeleteUserAction: jest.fn().mockResolvedValue({}),
}));

const { useQuery } = require("@tanstack/react-query");
const { adminService } = require("@/services");
const { adminUpdateUserAction, adminDeleteUserAction } = require("@/actions");

describe("useAdminUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls adminService.listUsers with sieveParams", () => {
    renderHook(() => useAdminUsers("page=1"));
    expect(adminService.listUsers).toHaveBeenCalledWith("page=1");
  });

  it("uses queryKey ['admin', 'users', sieveParams]", () => {
    renderHook(() => useAdminUsers("page=1"));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "users", "page=1"] }),
    );
  });

  it("updateUserMutation calls adminUpdateUserAction with uid and data", () => {
    const { result } = renderHook(() => useAdminUsers(""));
    result.current.updateUserMutation.mutate({
      uid: "user-1",
      data: { role: "seller" },
    });
    expect(adminUpdateUserAction).toHaveBeenCalledWith("user-1", {
      role: "seller",
    });
  });

  it("deleteUserMutation calls adminDeleteUserAction with uid", () => {
    const { result } = renderHook(() => useAdminUsers(""));
    result.current.deleteUserMutation.mutate("user-1");
    expect(adminDeleteUserAction).toHaveBeenCalledWith("user-1");
  });
});
