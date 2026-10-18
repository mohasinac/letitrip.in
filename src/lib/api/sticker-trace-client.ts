/**
 * Typed client for the sticker-sheet tracer's admin routes.
 *
 * Modelled on `digital-content-client.ts`, with ONE deliberate difference: that
 * module downloads bytes through a route, because a delivered digital good must
 * not sit behind a 5-minute bearer URL. Here the opposite trade is correct —
 * an admin's own scan is not a paid good — so **nothing in this file ever
 * receives a binary body**. `assetUrl()` returns a signed GCS URL and the
 * browser fetches from Google directly, which is what keeps every image in this
 * tool off Vercel's 10 GB Fast Origin Transfer allowance (Root Cause #104).
 *
 * 🛑 The three-hop upload is the only flow here worth reading twice:
 *
 *     createSheet()  -> row + signed PUT url   (the row MUST exist first:
 *                                               the object path contains its id)
 *     PUT to GCS     -> bytes, never via us
 *     attachScan()   -> magic-byte verified, recorded on the sheet
 *
 * A failure at hop 2 or 3 leaves a sheet with `bytes: 0` — recoverable, and
 * visible in the list. The reverse order would leave an orphan object in the
 * bucket that no document points at, which is unreachable AND unmeterable.
 */

import { API_ENDPOINTS } from "@mohasinac/appkit/constants";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

/**
 * Unwrap the `{ success, data }` envelope, THROWING on failure.
 *
 * 🛑 Never return a falsy value on error. "The request failed" and "this sheet
 * has no runs yet" would become the same observation — the shape that let the
 * digital-code pool sit broken behind a silent empty list for months.
 */
async function unwrap<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as
    | { success?: boolean; data?: T; error?: string }
    | null;
  if (!res.ok || !json || json.success === false) {
    throw new Error(json?.error ?? `Request failed (${res.status})`);
  }
  return (json.data ?? json) as T;
}

const getJson = async <T,>(url: string): Promise<T> =>
  unwrap<T>(await fetch(url, { credentials: CREDS }));

const postJson = async <T,>(url: string, body: unknown): Promise<T> =>
  unwrap<T>(
    await fetch(url, {
      method: "POST",
      headers: JSON_HEADERS,
      credentials: CREDS,
      body: JSON.stringify(body),
    }),
  );

export type StickerAssetKind =
  | "scan"
  | "preview"
  | "overlay"
  | "geometry"
  | "cutSvg"
  | "thumbAtlas";

export interface SignedUpload {
  uploadUrl: string;
  assetPath: string;
  expiresAt: string;
}

export interface CreateSheetResult {
  sheetId: string;
  upload: SignedUpload;
}

export interface TraceRunRow {
  id: string;
  name: string;
  tier: string;
  status: string;
  stage: string | null;
  partCount: number;
  groupCount: number;
  durationMs: number | null;
  createdAt: string;
  finishedAt: string | null;
  isActive: boolean;
  isPromoted: boolean;
  has: {
    preview: boolean;
    overlay: boolean;
    geometry: boolean;
    cutSvg: boolean;
    thumbAtlas: boolean;
  };
  error?: { stage: string; code: string; message: string; partOrdinal?: number } | null;
}

export interface StartRunResult {
  runId: string;
  customToken: string;
}

export interface RetryRunResult extends StartRunResult {
  resume: { stage: string; requested: string; clamped: boolean; forcedBy?: string };
  /** The sentence the retry panel MUST show. Empty when nothing was clamped. */
  notice: string;
}

const E = API_ENDPOINTS.STICKER_SHEETS;

/** Create the sheet row and mint the scan's write URL, in one call. */
export async function createSheet(input: {
  title: string;
  contentType: string;
  extension: string;
  scanType?: "auto" | "paper" | "art";
}): Promise<CreateSheetResult> {
  return postJson<CreateSheetResult>(E.SHEETS, input);
}

/**
 * PUT the bytes straight to Google.
 *
 * 🛑 The `Content-Type` must match what was signed EXACTLY or GCS answers 403 —
 * the type is bound into the signature on purpose, so a client that uploads
 * different bytes than it declared is refused rather than stored as a lie.
 * This is also the only fetch here that does not carry our credentials: the
 * signed URL IS the authorisation, and it is not our origin.
 */
export async function putScanBytes(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error(
      `Upload failed (${res.status}). The signed link may have expired — try again.`,
    );
  }
}

/**
 * Finalize: verify the magic bytes and record the scan on the sheet.
 *
 * `widthPx`/`heightPx` come from the browser's own decode — appkit cannot probe
 * an image, and downloading up to 100 MB into a function to read a header is
 * the egress mistake this whole feature avoids.
 *
 * 🛑 Pass `dpi` ONLY when one was actually read. Absent dpi is the documented
 * signal that millimetre output is withheld; a default here would manufacture
 * confident mm figures, and a fabricated millimetre on a cut file is a physical
 * production error rather than a cosmetic one.
 */
export async function attachScan(
  sheetId: string,
  input: {
    assetPath: string;
    widthPx: number;
    heightPx: number;
    dpi?: number;
    dpiSource?: "embedded" | "manual" | "calibrated";
    scanType?: "auto" | "paper" | "art";
    sha256?: string;
  },
): Promise<{ ok: true; bytes: number }> {
  return postJson<{ ok: true; bytes: number }>(E.UPLOAD(sheetId), input);
}

export async function listRuns(sheetId: string, limit = 50): Promise<TraceRunRow[]> {
  const res = await getJson<{ runs: TraceRunRow[]; total: number }>(
    `${E.RUNS(sheetId)}?limit=${limit}`,
  );
  return res.runs;
}

/** 🛑 `name` is required and the server rejects an empty one — tester case 4. */
export async function startRun(
  sheetId: string,
  input: {
    name: string;
    tier: "draft" | "standard" | "precise" | "max";
    paramOverrides?: Record<string, number>;
  },
): Promise<StartRunResult> {
  return postJson<StartRunResult>(E.RUNS(sheetId), input);
}

/**
 * Retry as a NEW named run.
 *
 * 🛑 The caller MUST surface `notice`. The server clamps the resume point
 * forward when a parameter from an earlier stage changed, and swallowing that
 * leaves an operator who asked for a fast resume staring at a full re-trace
 * with no explanation — which reads as the tool being broken.
 */
export async function retryRun(
  sheetId: string,
  runId: string,
  input: {
    name: string;
    tier: "draft" | "standard" | "precise" | "max";
    requestedResumeStage?: string;
    paramOverrides?: Record<string, number>;
  },
): Promise<RetryRunResult> {
  return postJson<RetryRunResult>(E.RUN_RETRY(sheetId, runId), input);
}

/**
 * Resolve one asset to a short-lived signed URL.
 *
 * Returns null on 404, which is the NORMAL state of an unfinished or failed
 * run — a run that died at `ridge` has no overlay and never will. Treating that
 * as an error would make every in-progress sheet look broken.
 */
export async function assetUrl(
  sheetId: string,
  kind: StickerAssetKind,
  runId?: string,
): Promise<{ url: string; expiresAt: string } | null> {
  const res = await fetch(E.ASSET(sheetId, kind, runId), { credentials: CREDS });
  /*
   * 404 is the only status swallowed, and deliberately narrowly: any OTHER
   * failure still throws. Catching everything here would turn an auth failure
   * or a 500 into "no overlay yet", which is the lie this module's `unwrap`
   * docstring exists to prevent.
   */
  if (res.status === 404) return null;
  return unwrap<{ url: string; expiresAt: string }>(res);
}
