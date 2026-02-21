/**
 * Tests for useAddressForm hook
 * Phase 18.4 — Address + Profile Hooks
 */

import { renderHook, act } from "@testing-library/react";
import { useAddressForm } from "../useAddressForm";

// ─── Valid address fixture ────────────────────────────────────────────────────
const VALID_ADDRESS = {
  fullName: "Alice Smith",
  phoneNumber: "9876543210",
  pincode: "400001",
  addressLine1: "123 Main Street",
  addressLine2: "",
  landmark: "",
  city: "Mumbai",
  state: "Maharashtra",
  addressType: "home" as const,
  isDefault: false,
};

// ─── Suite ────────────────────────────────────────────────────────────────────
describe("useAddressForm", () => {
  it("initialises with empty strings when no initialData is provided", () => {
    const { result } = renderHook(() => useAddressForm());

    expect(result.current.formData.fullName).toBe("");
    expect(result.current.formData.phoneNumber).toBe("");
    expect(result.current.formData.pincode).toBe("");
    expect(result.current.formData.addressLine1).toBe("");
    expect(result.current.formData.city).toBe("");
    expect(result.current.formData.state).toBe("");
    expect(result.current.formData.addressType).toBe("home");
    expect(result.current.formData.isDefault).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it("pre-fills fields when an existing address is passed as initialData", () => {
    const { result } = renderHook(() => useAddressForm(VALID_ADDRESS));

    expect(result.current.formData.fullName).toBe("Alice Smith");
    expect(result.current.formData.phoneNumber).toBe("9876543210");
    expect(result.current.formData.pincode).toBe("400001");
    expect(result.current.formData.city).toBe("Mumbai");
  });

  it("handleChange updates the specified field", () => {
    const { result } = renderHook(() => useAddressForm());

    act(() => {
      result.current.handleChange("fullName", "Bob Jones");
    });

    expect(result.current.formData.fullName).toBe("Bob Jones");
  });

  it("handleChange clears the error for the changed field", () => {
    const { result } = renderHook(() => useAddressForm());

    // Trigger validation to populate errors
    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.fullName).toBeTruthy();

    // Changing the field should clear its error
    act(() => {
      result.current.handleChange("fullName", "Alice");
    });

    expect(result.current.errors.fullName).toBeUndefined();
  });

  it("validate() returns false and populates errors for required fields", () => {
    const { result } = renderHook(() => useAddressForm());

    let valid: boolean;
    act(() => {
      valid = result.current.validate();
    });

    expect(valid!).toBe(false);
    expect(result.current.errors.fullName).toBeTruthy();
    expect(result.current.errors.pincode).toBeTruthy();
    expect(result.current.errors.addressLine1).toBeTruthy();
    expect(result.current.errors.city).toBeTruthy();
    expect(result.current.errors.state).toBeTruthy();
  });

  it("validate() returns false and sets pincode error for invalid pincode (< 6 digits)", () => {
    const { result } = renderHook(() =>
      useAddressForm({ ...VALID_ADDRESS, pincode: "123" }),
    );

    let valid: boolean;
    act(() => {
      valid = result.current.validate();
    });

    expect(valid!).toBe(false);
    expect(result.current.errors.pincode).toBeTruthy();
  });

  it("validate() returns false and sets pincode error for non-numeric pincode", () => {
    const { result } = renderHook(() =>
      useAddressForm({ ...VALID_ADDRESS, pincode: "ABCDEF" }),
    );

    let valid: boolean;
    act(() => {
      valid = result.current.validate();
    });

    expect(valid!).toBe(false);
    expect(result.current.errors.pincode).toBeTruthy();
  });

  it("validate() returns true when all required fields are valid", () => {
    const { result } = renderHook(() => useAddressForm(VALID_ADDRESS));

    let valid: boolean;
    act(() => {
      valid = result.current.validate();
    });

    expect(valid!).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it("reset() restores default empty form values and clears errors", () => {
    const { result } = renderHook(() => useAddressForm(VALID_ADDRESS));

    // Populate some errors first
    act(() => {
      result.current.validate();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.formData.fullName).toBe("");
    expect(result.current.formData.city).toBe("");
    expect(result.current.errors).toEqual({});
  });

  it("reset(data) pre-fills the form with the provided values", () => {
    const { result } = renderHook(() => useAddressForm());

    act(() => {
      result.current.reset({ fullName: "Carol", city: "Chennai" });
    });

    expect(result.current.formData.fullName).toBe("Carol");
    expect(result.current.formData.city).toBe("Chennai");
    // Fields not in reset data default to empty
    expect(result.current.formData.pincode).toBe("");
  });

  it("setFormData allows direct state override", () => {
    const { result } = renderHook(() => useAddressForm());

    act(() => {
      result.current.setFormData((prev) => ({ ...prev, city: "Bangalore" }));
    });

    expect(result.current.formData.city).toBe("Bangalore");
  });

  it("handleChange updates boolean fields (isDefault)", () => {
    const { result } = renderHook(() => useAddressForm());

    act(() => {
      result.current.handleChange("isDefault", true);
    });

    expect(result.current.formData.isDefault).toBe(true);
  });
});
