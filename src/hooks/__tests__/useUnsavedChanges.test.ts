/**
 * Tests for useUnsavedChanges hook
 * Phase 18.3 — Security / UX Hooks
 * Updated Phase 37.13 — window.confirm replaced with eventBus
 */

import { renderHook, act } from "@testing-library/react";
import { useUnsavedChanges, UNSAVED_CHANGES_EVENT } from "../useUnsavedChanges";

// ─── Mock @/constants ─────────────────────────────────────────────────────────
jest.mock("@/constants", () => ({
  UI_LABELS: {
    CONFIRM: {
      UNSAVED_CHANGES:
        "You have unsaved changes. Are you sure you want to leave?",
    },
  },
}));

// ─── Mock eventBus ────────────────────────────────────────────────────────────
const mockEmit = jest.fn();
jest.mock("@/classes", () => ({
  eventBus: {
    emit: (...args: unknown[]) => mockEmit(...args),
  },
}));

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.spyOn(window, "addEventListener");
  jest.spyOn(window, "removeEventListener");
  mockEmit.mockReset();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── Suite ────────────────────────────────────────────────────────────────────
describe("useUnsavedChanges", () => {
  it("isDirty is false when formValues match initialValues", () => {
    const initialValues = { name: "Alice", email: "alice@example.com" };
    const { result } = renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Alice", email: "alice@example.com" },
        initialValues,
      }),
    );
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isFormDirty).toBe(false);
  });

  it("isFormDirty is true when a field differs from initial snapshot", () => {
    const initialValues = { name: "Alice" };
    const { result } = renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Bob" },
        initialValues,
      }),
    );
    expect(result.current.isFormDirty).toBe(true);
    expect(result.current.isDirty).toBe(true);
  });

  it("isDirty is true when extraDirty is true even if form is clean", () => {
    const initialValues = { name: "Alice" };
    const { result } = renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Alice" },
        initialValues,
        extraDirty: true,
      }),
    );
    expect(result.current.isFormDirty).toBe(false);
    expect(result.current.isDirty).toBe(true);
  });

  it("registers beforeunload listener when isDirty is true", () => {
    const initialValues = { name: "Alice" };
    renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Changed" },
        initialValues,
      }),
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
  });

  it("does NOT register beforeunload listener when isDirty is false", () => {
    const initialValues = { name: "Alice" };
    renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Alice" },
        initialValues,
      }),
    );
    const beforeunloadCalls = (
      window.addEventListener as jest.Mock
    ).mock.calls.filter(([event]) => event === "beforeunload");
    expect(beforeunloadCalls).toHaveLength(0);
  });

  it("removes beforeunload listener on unmount when dirty", () => {
    const initialValues = { name: "Alice" };
    const { unmount } = renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Changed" },
        initialValues,
      }),
    );
    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
  });

  it("markClean() sets isDirty to false after a value change", () => {
    const initialValues = { name: "Alice" };
    const { result } = renderHook(
      ({ values }) =>
        useUnsavedChanges({
          formValues: values,
          initialValues,
        }),
      { initialProps: { values: { name: "Bob" } } },
    );

    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.markClean();
    });

    expect(result.current.isDirty).toBe(false);
    expect(result.current.isFormDirty).toBe(false);
  });

  it("confirmLeave() resolves true immediately when not dirty", async () => {
    const initialValues = { name: "Alice" };
    const { result } = renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Alice" },
        initialValues,
      }),
    );

    let confirmed: boolean | undefined;
    await act(async () => {
      confirmed = await result.current.confirmLeave();
    });

    expect(mockEmit).not.toHaveBeenCalled();
    expect(confirmed).toBe(true);
  });

  it("confirmLeave() emits eventBus event when dirty", async () => {
    const initialValues = { name: "Alice" };
    const { result } = renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Changed" },
        initialValues,
      }),
    );

    mockEmit.mockImplementation(
      (_event: string, resolve: (v: boolean) => void) => {
        resolve(true);
      },
    );

    let confirmed: boolean | undefined;
    await act(async () => {
      confirmed = await result.current.confirmLeave();
    });

    expect(mockEmit).toHaveBeenCalledWith(
      UNSAVED_CHANGES_EVENT,
      expect.any(Function),
    );
    expect(confirmed).toBe(true);
  });

  it("confirmLeave() resolves false when user rejects the modal", async () => {
    const initialValues = { name: "Alice" };
    const { result } = renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Changed" },
        initialValues,
      }),
    );

    mockEmit.mockImplementation(
      (_event: string, resolve: (v: boolean) => void) => {
        resolve(false);
      },
    );

    let confirmed: boolean | undefined;
    await act(async () => {
      confirmed = await result.current.confirmLeave();
    });

    expect(confirmed).toBe(false);
  });

  it("isFormDirty remains false when initialValues is null (not yet loaded)", () => {
    const { result } = renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Alice" },
        initialValues: null,
      }),
    );
    expect(result.current.isFormDirty).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it("sets savedSnapshot when initialValues arrives after null", () => {
    const { result, rerender } = renderHook(
      ({ initVals }: { initVals: Record<string, string> | null }) =>
        useUnsavedChanges({
          formValues: { name: "Alice" },
          initialValues: initVals,
        }),
      { initialProps: { initVals: null } },
    );

    expect(result.current.isFormDirty).toBe(false);

    // Simulate profile data arriving
    rerender({ initVals: { name: "Alice" } as any });

    // Values match the snapshot, so still clean
    expect(result.current.isFormDirty).toBe(false);
  });
});
