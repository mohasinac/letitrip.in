/**
 * useContactSubmit Tests — Phase 61
 *
 * Verifies that useContactSubmit delegates to contactService.send()
 * and wires the mutation correctly.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useContactSubmit } from "../useContactSubmit";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isLoading: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
}));

jest.mock("@/services", () => ({
  contactService: {
    send: jest.fn().mockResolvedValue(undefined),
  },
}));

const { useApiMutation } = require("@/hooks");
const { contactService } = require("@/services");

describe("useContactSubmit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls contactService.send with form data when mutate is invoked", () => {
    const { result } = renderHook(() => useContactSubmit());
    const payload = {
      name: "Alice",
      email: "alice@example.com",
      subject: "Help",
      message: "I need help",
    };
    result.current.mutate(payload);
    expect(contactService.send).toHaveBeenCalledWith(payload);
  });

  it("wires mutationFn through useApiMutation", () => {
    renderHook(() => useContactSubmit());
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    );
  });

  it("returns mutation state from useApiMutation", () => {
    (useApiMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: true,
      error: null,
      data: undefined,
      reset: jest.fn(),
    });
    const { result } = renderHook(() => useContactSubmit());
    expect(result.current.isLoading).toBe(true);
  });
});
