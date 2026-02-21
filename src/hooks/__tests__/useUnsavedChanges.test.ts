/**
 * Tests for useUnsavedChanges hook
 * Phase 18.3 — Security / UX Hooks
 */

import { renderHook, act } from "@testing-library/react";
import { useUnsavedChanges } from "../useUnsavedChanges";

// ─── Mock @/constants ─────────────────────────────────────────────────────────
// jest.mock is hoisted above variable declarations, so the factory must be self-contained
jest.mock("@/constants", () => ({
  UI_LABELS: {
    CONFIRM: {
      UNSAVED_CHANGES:
        "You have unsaved changes. Are you sure you want to leave?",
    },
  },
}));

// Used in assertions — must match the literal above
const UNSAVED_MSG = "You have unsaved changes. Are you sure you want to leave?";

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.spyOn(window, "addEventListener");
  jest.spyOn(window, "removeEventListener");
  jest.spyOn(window, "confirm").mockReturnValue(false);
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

  it("confirmLeave() returns true without calling window.confirm when not dirty", () => {
    const initialValues = { name: "Alice" };
    const { result } = renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Alice" },
        initialValues,
      }),
    );

    let confirmed: boolean | undefined;
    act(() => {
      confirmed = result.current.confirmLeave();
    });

    expect(window.confirm).not.toHaveBeenCalled();
    expect(confirmed).toBe(true);
  });

  it("confirmLeave() calls window.confirm when dirty and returns its result", () => {
    (window.confirm as jest.Mock).mockReturnValue(true);
    const initialValues = { name: "Alice" };
    const { result } = renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Changed" },
        initialValues,
      }),
    );

    let confirmed: boolean | undefined;
    act(() => {
      confirmed = result.current.confirmLeave();
    });

    expect(window.confirm).toHaveBeenCalledWith(UNSAVED_MSG);
    expect(confirmed).toBe(true);
  });

  it("confirmLeave() returns false when user rejects the confirm dialog", () => {
    (window.confirm as jest.Mock).mockReturnValue(false);
    const initialValues = { name: "Alice" };
    const { result } = renderHook(() =>
      useUnsavedChanges({
        formValues: { name: "Changed" },
        initialValues,
      }),
    );

    let confirmed: boolean | undefined;
    act(() => {
      confirmed = result.current.confirmLeave();
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
    rerender({ initVals: { name: "Alice" } });

    // Values match the snapshot, so still clean
    expect(result.current.isFormDirty).toBe(false);
  });
});
