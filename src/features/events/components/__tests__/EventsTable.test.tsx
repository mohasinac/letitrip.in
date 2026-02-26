/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { useEventsTableColumns } from "../EventsTable";

// EventsTable exports a hook — test via renderHook
import { renderHook } from "@testing-library/react";

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: { textSecondary: "text-gray-600" },
  },
}));

jest.mock("@/utils", () => ({
  formatDate: (d: any) => String(d),
}));

jest.mock("@/components", () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

jest.mock("../EventStatusBadge", () => ({
  EventStatusBadge: ({ status }: any) => (
    <span data-status={status}>{status}</span>
  ),
}));

describe("useEventsTableColumns", () => {
  it("returns columns array", () => {
    const { result } = renderHook(() =>
      useEventsTableColumns(jest.fn(), jest.fn(), jest.fn()),
    );
    expect(result.current.columns).toBeInstanceOf(Array);
    expect(result.current.columns.length).toBeGreaterThan(0);
  });

  it("includes title column", () => {
    const { result } = renderHook(() =>
      useEventsTableColumns(jest.fn(), jest.fn(), jest.fn()),
    );
    const keys = result.current.columns.map((c: any) => c.key);
    expect(keys).toContain("title");
  });

  it("includes status column", () => {
    const { result } = renderHook(() =>
      useEventsTableColumns(jest.fn(), jest.fn(), jest.fn()),
    );
    const keys = result.current.columns.map((c: any) => c.key);
    expect(keys).toContain("status");
  });

  it("includes type column", () => {
    const { result } = renderHook(() =>
      useEventsTableColumns(jest.fn(), jest.fn(), jest.fn()),
    );
    const keys = result.current.columns.map((c: any) => c.key);
    expect(keys).toContain("type");
  });
});
