/**
 * Firebase HTTPS Function — Listing Processor (Q1 — S13)
 *
 * Single entry point for all public listing queries. Replaces direct Sieve
 * repository calls from Vercel routes with a Firebase-side processor, so
 * Vercel becomes a thin caching proxy.
 *
 * Cursor support: opaque base64 over `{page}`. Callers may choose either
 *   - `mode="pages"` → pass `p` directly, ignore `cursor`
 *   - `mode="infinite"` → start with no cursor, then forward the `cursor`
 *     returned in each response. Both modes hit the same handler.
 *
 * Auth: `x-internal-secret` header (server-to-server only).
 */

import { onRequest } from "firebase-functions/v2/https";
import type { Request, Response } from "express";
import { productRepository } from "../lib/appkit";
import { REGION } from "../config/constants";
import { logInfo, logError } from "../utils/logger";

const FN = "listingProcessor";

interface ListingRequestBody {
  collection: string;
  q?: string;
  f?: string;
  s?: string;
  p?: number | string;
  ps?: number | string;
  cursor?: string;
  /** Optional collection-specific base options (e.g. `status`, `storeId`). */
  baseOpts?: {
    status?: string;
    storeId?: string;
    categoriesIn?: string[];
  };
}

interface ListingResponseBody {
  items: unknown[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  /** Opaque next-page token; null when at the last page. */
  cursor: string | null;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function verifySecret(req: Request): boolean {
  const secret = process.env.LETITRIP_INTERNAL_SECRET;
  if (!secret) return false;
  const header = req.headers["x-internal-secret"];
  const value = Array.isArray(header) ? header[0] : header;
  return value === secret;
}

function decodeCursor(cursor: string | undefined | null): number | null {
  if (!cursor) return null;
  try {
    const json = Buffer.from(cursor, "base64").toString("utf8");
    const parsed = JSON.parse(json) as { page?: number };
    const page = Number(parsed.page);
    return Number.isFinite(page) && page > 0 ? page : null;
  } catch {
    return null;
  }
}

function encodeCursor(page: number): string {
  return Buffer.from(JSON.stringify({ page }), "utf8").toString("base64");
}

function clampPageSize(raw: number | string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.floor(n), MAX_PAGE_SIZE);
}

function clampPage(raw: number | string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE;
  return Math.floor(n);
}

async function runProducts(
  body: ListingRequestBody,
): Promise<ListingResponseBody> {
  const cursorPage = decodeCursor(body.cursor);
  const page = cursorPage ?? clampPage(body.p);
  const pageSize = clampPageSize(body.ps);

  // q is folded into the filter string by the caller (Vercel route) when
  // present — listingProcessor stays purely a Sieve passthrough so filter
  // composition rules remain owned by the route that knows the safe-field set.
  const result = await productRepository.list(
    {
      filters: body.f ?? "",
      sorts: body.s ?? "-createdAt",
      page: String(page),
      pageSize: String(pageSize),
    },
    body.baseOpts,
  );

  return {
    items: result.items,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    hasMore: result.hasMore,
    cursor: result.hasMore ? encodeCursor(result.page + 1) : null,
  };
}

export const listingProcessor = onRequest(
  {
    region: REGION,
    timeoutSeconds: 30,
    memory: "256MiB",
    maxInstances: 20,
    minInstances: 0,
    cors: false,
  },
  async (req: Request, res: Response) => {
    if (!verifySecret(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const body = req.body as ListingRequestBody;
    if (!body || typeof body.collection !== "string") {
      res.status(400).json({ error: "Missing collection" });
      return;
    }

    try {
      let payload: ListingResponseBody;
      switch (body.collection) {
        case "products":
          payload = await runProducts(body);
          break;
        default:
          res
            .status(400)
            .json({ error: `Unsupported collection: ${body.collection}` });
          return;
      }

      logInfo(FN, "listing served", {
        collection: body.collection,
        page: payload.page,
        pageSize: payload.pageSize,
        total: payload.total,
      });

      res.setHeader(
        "Cache-Control",
        "public, max-age=60, s-maxage=120, stale-while-revalidate=60",
      );
      res.status(200).json(payload);
    } catch (error) {
      logError(FN, "listing failed", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);
