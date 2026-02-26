/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useEventEntriesTableColumns } from "../EventEntriesTable";

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
  Badge: ({ children }: any) => <span>{children}</span>,
}));

describe("useEventEntriesTableColumns", () => {
  it("returns columns array", () => {
    const { result } = renderHook(() => useEventEntriesTableColumns(jest.fn()));
    expect(result.current.columns).toBeInstanceOf(Array);
    expect(result.current.columns.length).toBeGreaterThan(0);
  });

  it("includes userId / user column", () => {
    const { result } = renderHook(() => useEventEntriesTableColumns(jest.fn()));
    const keys = result.current.columns.map((c: any) => c.key);
    expect(keys).toContain("userId");
  });

  it("includes reviewStatus column", () => {
    const { result } = renderHook(() => useEventEntriesTableColumns(jest.fn()));
    const keys = result.current.columns.map((c: any) => c.key);
    expect(keys).toContain("reviewStatus");
  });
});
