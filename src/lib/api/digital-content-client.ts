// NOT "use client" — typed REST wrappers for the digital-content pool.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.
//
// 🛑 THE UPLOAD IS THREE HOPS AND THAT IS THE POINT: sign → PUT straight to
// Storage → finalize. The bytes never traverse the Next.js function (Rule #6
// caps a request body at 4.5 MB), and `finalize` is where the file is proven by
// its MAGIC BYTES rather than by the Content-Type the browser guessed. A
// one-shot "POST the file to our API" would break both.

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

export interface PoolEntryRow {
  id: string;
  contentKind: "code" | "image" | "file";
  status: string;
  fileName?: string;
  orderId?: string;
  claimedAt?: string;
  createdAt?: string;
}

function poolUrl(productId: string) {
  return `/api/store/products/${encodeURIComponent(productId)}/codes`;
}

/**
 * Unwrap `successResponse`'s `{ success, data }` envelope, and THROW the
 * server's message on a failure.
 *
 * Returning a falsy value on error instead would make "the request failed" and
 * "the pool is empty" the same observation — which is the shape that let this
 * whole feature sit broken behind a 501 and a silent "code pool exhausted".
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

export async function listPoolEntries(productId: string): Promise<PoolEntryRow[]> {
  const res = await fetch(poolUrl(productId), { credentials: CREDS });
  const data = await unwrap<{ entries: PoolEntryRow[] }>(res);
  return data.entries ?? [];
}

export async function addPoolCodes(productId: string, codes: string[]): Promise<void> {
  const res = await fetch(poolUrl(productId), {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({
      entries: codes.map((code) => ({ contentKind: "code", code })),
    }),
  });
  await unwrap(res);
}

export async function addPoolAsset(productId: string, file: File): Promise<void> {
  const signRes = await fetch(`${poolUrl(productId)}/upload`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({
      step: "sign",
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });
  const signed = await unwrap<{ uploadUrl: string; storagePath: string }>(signRes);

  /*
   * No credentials on THIS one. It goes to a Google Storage signed URL, not to
   * our API — the signature in the URL is the entire authorisation, and sending
   * our session cookie to a third-party origin would be a needless leak. The
   * Content-Type must match what was signed byte for byte or Storage rejects it.
   */
  const put = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);

  const finRes = await fetch(`${poolUrl(productId)}/upload`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({
      step: "finalize",
      storagePath: signed.storagePath,
      contentType: file.type,
    }),
  });
  const finalized = await unwrap<{
    storagePath: string;
    contentType: string;
    fileName: string;
    contentKind: "image" | "file";
  }>(finRes);

  const addRes = await fetch(poolUrl(productId), {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({
      entries: [
        {
          contentKind: finalized.contentKind,
          assetPath: finalized.storagePath,
          fileName: finalized.fileName,
          contentType: finalized.contentType,
        },
      ],
    }),
  });
  await unwrap(addRes);
}

export async function removePoolEntry(productId: string, entryId: string): Promise<void> {
  const res = await fetch(
    `${poolUrl(productId)}?entryId=${encodeURIComponent(entryId)}`,
    { method: "DELETE", credentials: CREDS },
  );
  await unwrap(res);
}
