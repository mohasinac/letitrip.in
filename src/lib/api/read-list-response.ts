/**
 * Unwrap a list response, turning a FAILED request into a thrown error.
 *
 * 🛑 WHY THIS EXISTS, AND WHY `.catch()` ALONE DOES NOT FIX THE BUG.
 *
 * Seven admin/store pages loaded their data like this:
 *
 *     fetchSomething(URL)
 *       .then((r) => r.json())
 *       .then((j) => setItems(j?.data?.items ?? []))
 *       .finally(() => setLoading(false));
 *
 * No `.catch`, and no error UI — so the obvious reading is "a rejected
 * promise is swallowed". That is NOT what happens, and it is why adding a
 * `.catch` would have left every one of these pages broken in exactly the
 * same way:
 *
 *   `errorResponse()` returns `NextResponse.json({ success: false, error })`.
 *   It is VALID JSON with a non-2xx status. So on a 500:
 *
 *     - `r.json()` RESOLVES — there is a real JSON body to parse
 *     - `j.data` is undefined, so `j?.data?.items ?? []` yields `[]`
 *     - nothing rejects, so `.catch` never runs
 *     - `loading` goes false and the page renders its EMPTY STATE
 *
 * A seller whose request 500s is told "No templates yet". An admin whose
 * moderation queue fails is told "Inbox zero". The page is confidently wrong,
 * which is worse than an error: there is nothing to retry and nothing to
 * report.
 *
 * So the fix is the status check, not the catch. The catch is what then
 * surfaces it.
 *
 * `success === false` is checked as well as `res.ok` because the two can
 * disagree: a handler may return a 200 carrying a failure envelope, and the
 * envelope is the more specific signal.
 */
export async function readListResponse<T>(
  res: Response,
  /** Used in the fallback message, e.g. "templates" -> "Couldn't load templates". */
  label: string,
): Promise<T[]> {
  // A non-JSON body is itself a failure mode (an HTML error page from an edge
  // proxy, say), so parse defensively rather than letting it throw a
  // SyntaxError that reads as a bug in this helper.
  const json = (await res.json().catch(() => null)) as
    | { success?: boolean; error?: string; data?: { items?: T[] } }
    | null;

  if (!res.ok || json?.success === false) {
    throw new Error(
      json?.error || `Couldn't load ${label} (HTTP ${res.status}).`,
    );
  }
  return json?.data?.items ?? [];
}
