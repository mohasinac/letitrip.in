/**
 * @jest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { SESSION_TABLE_COLUMNS } from "@/features/admin/components/SessionTableColumns";
import type { SessionDocument } from "@/db/schema/sessions";

interface SessionWithUser extends SessionDocument {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: string;
  } | null;
}

const mockSession: SessionWithUser = {
  id: "sess-001",
  userId: "user-001",
  deviceInfo: {
    browser: "Chrome",
    os: "Windows",
    device: "desktop",
    ip: "192.168.1.1",
  },
  location: { city: "Delhi", country: "India" },
  createdAt: new Date("2026-03-01T10:00:00Z"),
  lastActivity: new Date("2026-03-01T11:00:00Z"),
  expiresAt: new Date("2026-04-01T10:00:00Z"),
  isActive: true,
  user: {
    uid: "user-001",
    email: "user@example.com",
    displayName: "Test User",
    role: "user",
  },
};

jest.mock("@/components", () => ({
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Caption: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock("@/utils", () => ({
  formatRelativeTime: () => "1 hour ago",
  formatDate: () => "Mar 1, 2026",
  isFuture: () => true,
}));

describe("SESSION_TABLE_COLUMNS", () => {
  it("has the expected number of columns", () => {
    expect(SESSION_TABLE_COLUMNS).toHaveLength(5);
  });

  it("column keys are correct", () => {
    const keys = SESSION_TABLE_COLUMNS.map((c) => c.key);
    expect(keys).toEqual([
      "user",
      "device",
      "location",
      "lastActivity",
      "status",
    ]);
  });

  it("user column renders display name", () => {
    const col = SESSION_TABLE_COLUMNS.find((c) => c.key === "user")!;
    const { getByText } = render(<>{col.render!(mockSession)}</>);
    expect(getByText("Test User")).toBeTruthy();
  });

  it("device column renders browser info", () => {
    const col = SESSION_TABLE_COLUMNS.find((c) => c.key === "device")!;
    const { getByText } = render(<>{col.render!(mockSession)}</>);
    expect(getByText(/Chrome/)).toBeTruthy();
  });

  it("location column renders city", () => {
    const col = SESSION_TABLE_COLUMNS.find((c) => c.key === "location")!;
    const { getByText } = render(<>{col.render!(mockSession)}</>);
    expect(getByText(/Delhi/)).toBeTruthy();
  });

  it("status column renders Active for valid session", () => {
    const col = SESSION_TABLE_COLUMNS.find((c) => c.key === "status")!;
    const { getByText } = render(<>{col.render!(mockSession)}</>);
    expect(getByText("Active")).toBeTruthy();
  });
});
