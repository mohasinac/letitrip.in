"use client";

/**
 * SESSION_TABLE_COLUMNS
 * Path: src/components/admin/SessionTableColumns.tsx
 *
 * Static column definitions for the Admin Sessions DataTable.
 * Consumed by AdminSessionsManager.tsx.
 */

import { Text, Caption, Badge } from "@/components";
import { formatRelativeTime, formatDate, isFuture } from "@/utils";
import type { SessionDocument } from "@/db/schema/sessions";

interface SessionWithUser extends SessionDocument {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: string;
  } | null;
}

type Column = {
  key: string;
  header: string;
  render?: (item: SessionWithUser) => React.ReactNode;
  width?: string;
};

import React from "react";

export const SESSION_TABLE_COLUMNS: Column[] = [
  {
    key: "user",
    header: "User",
    width: "20%",
    render: (s) => (
      <div className="flex flex-col gap-0.5">
        <Text size="sm" weight="medium">
          {s.user?.displayName ?? "Unknown User"}
        </Text>
        <Caption>{s.user?.email ?? "—"}</Caption>
        {s.user?.role && (
          <Badge
            variant={
              s.user.role === "admin"
                ? "danger"
                : s.user.role === "moderator"
                  ? "warning"
                  : s.user.role === "seller"
                    ? "info"
                    : "default"
            }
          >
            {s.user.role}
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: "device",
    header: "Device",
    width: "20%",
    render: (s) => (
      <div className="flex flex-col gap-0.5">
        <Text size="sm">
          {s.deviceInfo?.browser ?? "—"}
          {s.deviceInfo?.os ? ` on ${s.deviceInfo.os}` : ""}
        </Text>
        {s.deviceInfo?.device && <Caption>{s.deviceInfo.device}</Caption>}
        {s.deviceInfo?.ip && <Caption>IP: {s.deviceInfo.ip}</Caption>}
      </div>
    ),
  },
  {
    key: "location",
    header: "Location",
    width: "15%",
    render: (s) =>
      s.location?.city ? (
        <Caption>
          {s.location.city}, {s.location.country}
        </Caption>
      ) : (
        <Caption>Unknown</Caption>
      ),
  },
  {
    key: "lastActivity",
    header: "Last Active",
    width: "15%",
    render: (s) => (
      <Caption>
        {s.lastActivity
          ? formatRelativeTime(s.lastActivity)
          : formatDate(s.createdAt)}
      </Caption>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: "15%",
    render: (s) =>
      s.isActive && isFuture(s.expiresAt) ? (
        <Badge variant="success">Active</Badge>
      ) : s.revokedAt ? (
        <Badge variant="danger">Revoked</Badge>
      ) : (
        <Badge variant="default">Expired</Badge>
      ),
  },
];
