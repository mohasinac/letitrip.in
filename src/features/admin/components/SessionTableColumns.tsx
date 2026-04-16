"use client";
import { Text, Caption, Badge } from "@mohasinac/appkit/ui";

import { formatRelativeTime, formatDate, isFuture } from "@mohasinac/appkit/utils";


/**
 * SESSION_TABLE_COLUMNS
 * Path: src/components/admin/SessionTableColumns.tsx
 *
 * Static column definitions for the Admin Sessions DataTable.
 * Consumed by AdminSessionsManager.tsx.
 */

import { UI_LABELS } from "@/constants";
import type { SessionDocument } from "@/db/schema/sessions";

const S = UI_LABELS.ADMIN.SESSIONS;

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
    header: S.COL_USER,
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
    header: S.COL_DEVICE,
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
    header: S.COL_LOCATION,
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
    header: S.COL_LAST_ACTIVE,
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
    header: UI_LABELS.TABLE.STATUS,
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

