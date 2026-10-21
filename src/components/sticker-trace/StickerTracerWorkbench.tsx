"use client";

/**
 * The tracer workbench — the client half of `/tools/sticker-tracer`.
 *
 * The page itself stays a Server Component (its layout holds the admin guard);
 * this owns everything that needs state: the three-hop commit, the live
 * progress channel, the attempt history and the retry panel.
 *
 * 🛑 THE TRANSPORT LIVES HERE, NOT IN APPKIT. `StickerCommitPanel` takes an
 * `onCommit` callback rather than importing the client module itself — the same
 * seam the codec uses. appkit owns the surface and the rules; the consumer owns
 * how bytes get to Google. It is also what keeps appkit free of a `fetch` to a
 * route only this app serves.
 *
 * 🛑 Progress is PUSH, never a poll. `useStickerTraceProgress` subscribes to
 * the per-run RTDB channel with the custom token the create route minted; a
 * `refetchInterval` here would be a standing server bill (Root Cause #94) and
 * `audit-client-poll-cost` blocks a sub-60s literal anyway.
 */

import { useCallback, useEffect, useState } from "react";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
/*
 * 🛑 `/client`, not the bare package. This module is `"use client"`, so it sits
 * in the client graph — and the bare entry's import chain reaches firebase-admin
 * (Root Cause #6). Note this is the exact OPPOSITE of what a Server Component
 * must do: there the bare entry is required, because `/client` is `"use client"`
 * and a runtime value imported from it becomes a client-reference proxy that
 * throws an opaque React #441 (Root Cause #76). Two audits pull in opposite
 * directions here; which one applies is decided by this file's first line.
 */
import { Alert, Card, Heading, Stack, Text } from "@mohasinac/appkit/client";
import { StickerTraceStudio } from "@mohasinac/appkit/features/sticker-trace/components/StickerTraceStudio";
import { StickerCommitPanel } from "@mohasinac/appkit/features/sticker-trace/components/StickerCommitPanel";
import {
  StickerRunHistoryPanel,
  type StickerRunRow,
} from "@mohasinac/appkit/features/sticker-trace/components/StickerRunHistoryPanel";
import { StickerRetryPanel } from "@mohasinac/appkit/features/sticker-trace/components/StickerRetryPanel";
import { StickerPrintPanel } from "@mohasinac/appkit/features/sticker-trace/components/StickerPrintPanel";
import { useStickerTraceProgress } from "@mohasinac/appkit/features/sticker-trace/hooks/useStickerTraceProgress";
import {
  assetUrl,
  attachScan,
  createSheet,
  listRuns,
  putScanBytes,
  retryRun,
  startRun,
  exportReport,
  promoteRun,
  type StickerAssetKind,
} from "@/lib/api/sticker-trace-client";

/** The extension the signed upload is keyed on, derived from the real filename. */
function extensionOf(file: File): string {
  const dot = file.name.lastIndexOf(".");
  const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : "";
  return /^[a-z0-9]{1,5}$/.test(ext) ? ext : "png";
}

export interface StickerTracerWorkbenchProps {
  /**
   * Open on an EXISTING sheet instead of waiting for a new scan.
   *
   * 🛑 Without this the workbench could only ever show a sheet it had just
   * created in the same session: `sheetId` started `null` and was set only
   * inside `handleCommit`, after an upload. Every panel below is gated on it,
   * so a fresh visit to /tools/sticker-tracer showed no run history at all —
   * which is the reported "shows no previous runs", and it was not a loading
   * bug but a missing seam. A real sheet existed in Firestore and was
   * reachable only through the admin API.
   *
   * `ROUTES.PUBLIC.TOOL_STICKER_SHEET` has existed with zero callers; this is
   * what makes it mean something.
   */
  initialSheetId?: string;
}

export function StickerTracerWorkbench({
  initialSheetId,
}: StickerTracerWorkbenchProps = {}) {
  const [sheetId, setSheetId] = useState<string | null>(initialSheetId ?? null);
  const [runs, setRuns] = useState<StickerRunRow[]>([]);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [retrySource, setRetrySource] = useState<StickerRunRow | null>(null);
  /*
   * Two states, not one. `notice` is the server's resume-clamp sentence — an
   * explanation of something that worked differently from what was asked.
   * `loadError` is a failure. Rendering both through one warning Alert made a
   * successful clamped retry look like an error, which is the opposite of what
   * the clamp message is for.
   */
  const [notice, setNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { progress, subscribe, label, error: progressError } =
    useStickerTraceProgress();

  /** The sheet's accepted run, if any — what the print panel exports. */
  const activeRun = runs.find((r) => r.isActive) ?? null;

  const refreshRuns = useCallback(async (id: string) => {
    setLoadingRuns(true);
    try {
      setRuns(await listRuns(id));
    } catch (err) {
      const n = normalizeError(err);
      /*
       * Reported, never swallowed. An empty attempt list and a failed fetch look
       * identical on screen, and this feature's whole premise is that the
       * attempts are the record — "no runs yet" when there are eight is the
       * worst thing this panel could say.
       */
      setLoadError(`Could not load the attempt history: ${n.message}`);
    } finally {
      setLoadingRuns(false);
    }
  }, []);

  /*
   * Load the history for a sheet we were HANDED, not one we just made.
   *
   * `handleCommit` already calls `refreshRuns` for a sheet it created; an
   * `initialSheetId` arrives before any of that, so without this the panel
   * would render with an empty `runs` array and say "no runs yet" about a
   * sheet that has eight — the exact sentence `refreshRuns`' own comment
   * calls the worst thing it could say.
   *
   * Keyed on `initialSheetId` rather than `sheetId`, deliberately: `sheetId`
   * also changes when a commit creates one, and re-fetching then would
   * duplicate the fetch `handleCommit` has already started.
   */
  useEffect(() => {
    if (!initialSheetId) return;
    void refreshRuns(initialSheetId);
  }, [initialSheetId, refreshRuns]);

  /**
   * The three hops, in the one order that cannot orphan an object.
   *
   * Row first (the path contains its id) → bytes straight to Google → finalize,
   * where the magic bytes are checked and a mismatch deletes the object. Only
   * then is a run started, so a failed upload never leaves a run pointing at a
   * scan that does not exist.
   */
  const handleCommit = useCallback(
    async (input: {
      file: File;
      title: string;
      tier: "draft" | "standard" | "precise" | "max";
      widthPx: number;
      heightPx: number;
    }) => {
      const created = await createSheet({
        title: input.title,
        contentType: input.file.type || "image/png",
        extension: extensionOf(input.file),
      });

      await putScanBytes(created.upload.uploadUrl, input.file);

      await attachScan(created.sheetId, {
        assetPath: created.upload.assetPath,
        widthPx: input.widthPx,
        heightPx: input.heightPx,
      });

      const run = await startRun(created.sheetId, {
        name: input.title,
        tier: input.tier,
      });

      setSheetId(created.sheetId);
      subscribe(run.runId, run.customToken);
      void refreshRuns(created.sheetId);

      return { sheetId: created.sheetId, ...run };
    },
    [subscribe, refreshRuns],
  );

  /**
   * Open an artifact.
   *
   * 🛑 `window.open` on a SIGNED URL — the bytes come from Google, never
   * through us. Rendering it into an `<img>` would be equivalent here, but a
   * new tab is honest about the 5-minute expiry: a stale tab fails visibly
   * rather than showing a broken image inside the tool.
   */
  const handleOpenAsset = useCallback(
    async (runId: string, kind: StickerAssetKind) => {
      if (!sheetId) return;
      const resolved = await assetUrl(sheetId, kind, runId);
      if (!resolved) {
        setLoadError("That artifact does not exist for this run.");
        return;
      }
      window.open(resolved.url, "_blank", "noopener,noreferrer");
    },
    [sheetId],
  );

  /**
   * Accept a run, then refresh the list so its "accepted" badge moves.
   *
   * The full-resolution render runs in the background fan-out, so this returns
   * as soon as the sheet is updated — the list reflects the acceptance
   * immediately and the parts appear when the shards finish.
   */
  const handlePromote = useCallback(
    async (run: StickerRunRow) => {
      if (!sheetId) return;
      try {
        const res = await promoteRun(sheetId, run.id);
        setNotice(
          `Accepted "${run.name}" — rendering ${res.partCount} part(s) at full resolution.`,
        );
        void refreshRuns(sheetId);
      } catch (err) {
        const n = normalizeError(err);
        setLoadError(n.message);
      }
    },
    [sheetId, refreshRuns],
  );

  const handleRetry = useCallback(
    async (input: {
      name: string;
      tier: "draft" | "standard" | "precise" | "max";
      requestedResumeStage: string;
    }) => {
      if (!sheetId || !retrySource) return;
      const result = await retryRun(sheetId, retrySource.id, input);
      /*
       * Surface the server's own clamp sentence, not the panel's prediction.
       * The panel predicts so the operator sees it before submitting; THIS is
       * the decision, and if the two ever disagree the server is right.
       */
      setNotice(result.notice || null);
      setRetrySource(null);
      subscribe(result.runId, result.customToken);
      void refreshRuns(sheetId);
    },
    [sheetId, retrySource, subscribe, refreshRuns],
  );

  return (
    <Stack gap="comfortable">
      <StickerTraceStudio
        renderCommit={({ file, dimensions }) => (
          <StickerCommitPanel
            file={file}
            dimensions={dimensions}
            onCommit={handleCommit}
          />
        )}
      />

      {notice ? <Alert variant="warning">{notice}</Alert> : null}
      {loadError ? <Alert variant="error">{loadError}</Alert> : null}

      {/*
        * The live bar names the STAGE, never just a percentage. "Processing 43%"
        * is what a spinner says; "ridge 22%" is what lets an operator see a
        * halftone scan stuck in the detector rather than in the upload.
        */}
      {label ? (
        <Card variant="default">
          <Stack gap="dense">
            <Heading level={3}>Running</Heading>
            <Text>{label}</Text>
            {progress.message ? (
              <Text size="sm" color="muted">
                {progress.message}
              </Text>
            ) : null}
          </Stack>
        </Card>
      ) : null}

      {progressError ? (
        <Alert variant="warning">
          Lost the live progress channel ({progressError}). The run keeps going —
          reload to see where it got to.
        </Alert>
      ) : null}

      {sheetId ? (
        <StickerRunHistoryPanel
          runs={runs}
          loading={loadingRuns}
          onOpenAsset={(runId, kind) => void handleOpenAsset(runId, kind)}
          onRetry={setRetrySource}
          onPromote={handlePromote}
        />
      ) : null}

      {/*
        * The print panel appears once a run is accepted, not before. Exporting
        * an unpromoted run would offer a cut file for parts that have not been
        * rendered — the panel would have to explain an absence the UI created.
        */}
      {sheetId && activeRun ? (
        <StickerPrintPanel
          loadReport={(profile, page) => exportReport(sheetId, activeRun.id, profile, page)}
          onDownloadCutFile={() => void handleOpenAsset(activeRun.id, "cutSvg")}
        />
      ) : null}

      {retrySource ? (
        <StickerRetryPanel
          source={{
            id: retrySource.id,
            name: retrySource.name,
            tier: retrySource.tier as "draft" | "standard" | "precise" | "max",
          }}
          onSubmit={handleRetry}
          onCancel={() => setRetrySource(null)}
        />
      ) : null}
    </Stack>
  );
}
