/**
 * useForm Tests — Phase 18.2
 *
 * Verifies form state hook: initial values, field changes, validation,
 * submit guard, onSubmit callback, reset, and isSubmitting flag.
 */

import { renderHook, act } from "@testing-library/react";
import { useForm } from "../useForm";

const initialValues = { email: "", name: "" };

describe("useForm", () => {
  // ============================================================
  // Initial state
  // ============================================================
  describe("initial state", () => {
    it("initialises field values from the provided initialValues", () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: jest.fn() }),
      );

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  // ============================================================
  // handleChange
  // ============================================================
  describe("handleChange", () => {
    it("updates a field value when handleChange is called", () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: jest.fn() }),
      );

      act(() => {
        result.current.handleChange("email", "test@example.com");
      });

      expect(result.current.values.email).toBe("test@example.com");
    });

    it("clears the field error when handleChange is called for that field", async () => {
      const validate = jest.fn().mockReturnValue({ email: "Required" });
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: jest.fn(), validate }),
      );

      // Trigger validation errors via submit
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.email).toBe("Required");

      // Changing the field should clear its error
      act(() => {
        result.current.handleChange("email", "user@example.com");
      });

      expect(result.current.errors.email).toBe("");
    });

    it("updating one field does not affect other fields", () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: jest.fn() }),
      );

      act(() => {
        result.current.handleChange("name", "Alice");
      });

      expect(result.current.values.name).toBe("Alice");
      expect(result.current.values.email).toBe("");
    });
  });

  // ============================================================
  // Validation
  // ============================================================
  describe("validation", () => {
    it("runs validator on submit and populates errors", async () => {
      const validate = jest.fn().mockReturnValue({ email: "Invalid email" });
      const onSubmit = jest.fn();
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit, validate }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors).toEqual({ email: "Invalid email" });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("does not call onSubmit when validation fails", async () => {
      const validate = jest.fn().mockReturnValue({ name: "Name is required" });
      const onSubmit = jest.fn();
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit, validate }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("calls onSubmit with current values when validation passes", async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: "user@example.com", name: "Alice" },
          onSubmit,
        }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalledWith({
        email: "user@example.com",
        name: "Alice",
      });
    });

    it("calls onSubmit with current values when no validator is provided", async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useForm({ initialValues: { email: "x@y.com", name: "Bob" }, onSubmit }),
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalledWith({ email: "x@y.com", name: "Bob" });
    });
  });

  // ============================================================
  // reset()
  // ============================================================
  describe("reset()", () => {
    it("reset() restores all values to initialValues and clears errors", async () => {
      const validate = jest.fn().mockReturnValue({ email: "Error" });
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: jest.fn(), validate }),
      );

      // Change a field and trigger errors
      act(() => {
        result.current.handleChange("email", "changed@example.com");
      });
      await act(async () => {
        await result.current.handleSubmit();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
    });

    it("reset() after value changes restores initial state", () => {
      const { result } = renderHook(() =>
        useForm({ initialValues, onSubmit: jest.fn() }),
      );

      act(() => {
        result.current.handleChange("name", "Changed");
      });

      expect(result.current.values.name).toBe("Changed");

      act(() => {
        result.current.reset();
      });

      expect(result.current.values.name).toBe("");
    });
  });

  // ============================================================
  // isSubmitting
  // ============================================================
  describe("isSubmitting", () => {
    it("sets isSubmitting=true during submit and false after completion", async () => {
      let resolveSubmit!: () => void;
      const promise = new Promise<void>((r) => {
        resolveSubmit = r;
      });
      const onSubmit = jest.fn().mockReturnValue(promise);
      const { result } = renderHook(() => useForm({ initialValues, onSubmit }));

      // Start submit without awaiting — handleSubmit sets isSubmitting=true before its first await
      act(() => {
        void result.current.handleSubmit();
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        resolveSubmit();
        await promise;
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  // ============================================================
  // handleSubmit with synthetic event
  // ============================================================
  describe("handleSubmit with event", () => {
    it("calls e.preventDefault() when a form event is passed", async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useForm({ initialValues, onSubmit }));

      const preventDefault = jest.fn();
      const fakeEvent = { preventDefault } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(fakeEvent);
      });

      expect(preventDefault).toHaveBeenCalled();
    });
  });
});
