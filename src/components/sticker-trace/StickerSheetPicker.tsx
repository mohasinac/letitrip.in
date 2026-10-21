"use client";

/**
 * The sheet picker the tracer index page has always told operators to use.
 *
 * 🛑 WHY THIS EXISTS: the index page's own copy reads "Pick a scanned sheet to
 * trace its kiss-cut outlines" and it rendered `<StickerTracerWorkbench />`
 * with no list. The only ways `sheetId` became non-null were creating a sheet
 * in the same session, or typing `/tools/sticker-tracer/<id>` by hand —
 * `ROUTES.TOOL_STICKER_SHEET` had zero callers anywhere in the repo. So every
 * sheet committed in a previous session was unreachable, and the instruction
 * on the page was unactionable.
 *
 * Nothing new was needed server-side: `GET /api/admin/sticker-sheets` already
 * lists them, admin-gated and projected.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
/*
 * 🛑 `/client`, NOT the bare `@mohasinac/appkit`. This file is `"use client"`,
 * and `audit-client-server-only-leak` blocks a client module reaching the main
 * barrel: that barrel's chain pulls server-only modules toward the client
 * bundle, and importing both entries from one file instantiates appkit TWICE
 * under two conditions — the dual-registry fault that answers 401 to every
 * valid session. It caught this on the first run, along with a second
 * occurrence I had shipped in Phase 5.
 */
import {
  Badge,
  Button,
  Div,
  normalizeError,
  ROUTES,
  Row,
  Span,
  Stack,
  Text,
} from "@mohasinac/appkit/client";
import { listSheets, type SheetPickerRow } from "@/lib/api/sticker-trace-client";

/** `12.4 MB` — a scan is tens of megabytes and bytes are unreadable at that size. */
function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/**
 * 🛑 `traceStatus` drives the tone, and an UNRECOGNISED value falls through to
 * neutral rather than to a guess. A status this component has not been taught
 * is a fact it does not know — colouring it green because it is not red is how
 * a dashboard misinforms the person reading it.
 */
function statusTone(status: string): "success" | "warning" | "danger" | "default" {
  if (status === "traced" || status === "promoted") return "success";
  if (status === "tracing" || status === "queued") return "warning";
  if (status === "failed") return "danger";
  return "default";
}

export function StickerSheetPicker() {
  const [sheets, setSheets] = useState<SheetPickerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listSheets()
      .then((rows) => {
        if (!cancelled) setSheets(rows);
      })
      .catch((err: unknown) => {
        /*
         * 🛑 Reported, not swallowed. `.catch(() => null)` here would render
         * an empty picker, which says "you have no sheets" about a request
         * that failed — the exact lie that makes a broken query invisible
         * (Root Cause #59). `normalizeError` first, per the catch convention.
         */
        const normalized = normalizeError(err);
        if (!cancelled) setError(normalized.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <Div surface="danger-surface" padding="md" rounded="lg">
        <Text size="sm" color="error">
          Could not load your sheets: {error}
        </Text>
      </Div>
    );
  }

  if (sheets === null) {
    return (
      <Text size="sm" color="muted">
        Loading sheets…
      </Text>
    );
  }

  /*
   * An honest empty state: the tracer's entry point is the scan upload in the
   * workbench below, so this says so rather than offering a dead control.
   */
  if (sheets.length === 0) {
    return (
      <Div surface="muted" padding="md" rounded="lg">
        <Text size="sm" color="muted">
          No sheets yet — scan one below and it will appear here.
        </Text>
      </Div>
    );
  }

  return (
    <Stack gap="sm">
      <Text size="sm" weight="semibold">
        Your scanned sheets
      </Text>
      {sheets.map((sheet) => (
        /*
         * `next/link`, not an anchor: a plain `<a>` does a full page load, and
         * `ROUTES.TOOL_STICKER_SHEET` is the route helper that had no callers
         * until now — using it is what keeps `audit-nav-page-wiring` able to
         * see that this page is reachable.
         */
        <Button key={sheet.id} variant="ghost" justify="between" gap="sm" asChild>
          <Link href={String(ROUTES.PUBLIC.TOOL_STICKER_SHEET(sheet.id))}>
            <Row align="center" gap="sm" className="min-w-0">
              <Span size="sm" weight="medium" truncate>
                {sheet.title}
              </Span>
              <Badge variant={statusTone(sheet.traceStatus)}>
                {sheet.traceStatus}
              </Badge>
            </Row>
            <Row align="center" gap="sm">
              {/*
                Part count only once there is one — "0 parts" on an untraced
                sheet reads as a traced sheet that found nothing.
              */}
              {sheet.partCount > 0 && (
                <Span size="xs" color="muted">
                  {sheet.partCount} parts
                </Span>
              )}
              <Span size="xs" color="muted">
                {formatBytes(sheet.sourceScanBytes)}
              </Span>
            </Row>
          </Link>
        </Button>
      ))}
    </Stack>
  );
}
