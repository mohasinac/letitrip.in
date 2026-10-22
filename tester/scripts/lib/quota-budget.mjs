/*
 * Staying inside the free tiers, by construction rather than by hoping.
 *
 * 🛑 THE RUN IS THE BIGGEST CONSUMER THIS PROJECT HAS, AND IT COMPETES WITH THE
 * LIVE SITE FOR THE SAME QUOTA.
 *
 * The tester drives real page loads against production, and every one of those
 * reads Firestore on the same project real visitors use. On 2026-09-11 a run
 * exhausted the daily read quota outright: production started serving
 * `/api/site-settings` as a 500 and returning `total:0` for every search. The
 * test run did not just spend its own budget — it took the site down for anyone
 * using it, and then recorded the wreckage as product defects.
 *
 * So the budget is enforced here rather than being a number in a document that
 * somebody remembers.
 *
 * ── THE CEILINGS (CLAUDE.md § Firebase Budget, § Rule #6) ────────────────────
 *
 *   Firestore    50,000 reads/day      resets ~midnight PACIFIC   <- the binding one
 *   Vercel       1M invocations/30d, 4h Active CPU/30d
 *   Resend       100 emails/day
 *
 * Firestore binds first by a wide margin, so it is what this budgets. Vercel's
 * invocation ceiling is ~1M/month against a run's ~40k, and a tester session
 * sends no email at all.
 *
 * ── WHY A *BATCH* BUDGET AND NOT A READ COUNTER ──────────────────────────────
 *
 * The honest reason: nothing here can observe Firestore reads. They are consumed
 * server-side inside production, and the count lives in the Firebase console —
 * not in any response this harness sees. A "read counter" would therefore be a
 * fiction dressed as a measurement, which is worse than an explicit estimate.
 *
 * So a batch is the unit, with a deliberately conservative reads-per-batch
 * estimate and a large safety margin. `DEFAULT_DAILY_BATCHES` is set so the run
 * uses roughly HALF the daily quota, leaving the other half for real visitors,
 * scheduled Functions and the admin surfaces. A test run must never be the reason
 * a customer sees a 500.
 *
 * 🛑 CALIBRATE THIS AFTER PHASE 1 with the real number from the Firebase console.
 * Until then it is an estimate and is commented as one.
 */

/** Firestore free tier, per CLAUDE.md. */
export const DAILY_READ_QUOTA = 50_000;

/**
 * Estimated Firestore reads consumed by one batch.
 *
 * A batch is 5–12 cases; each case drives several page loads; each page load
 * costs several reads (listing queries, settings, session, related items). 500 is
 * a deliberate over-estimate — budgeting is the one place where guessing high is
 * the safe direction.
 */
export const ESTIMATED_READS_PER_BATCH = 500;

/**
 * Share of the daily quota the run may take. The rest belongs to the live site.
 *
 * At 0.5 and 500 reads/batch that is 50 batches/day — so the full 208-batch
 * catalogue spans about four days. Slower than the quota alone would allow, and
 * that is the point: the alternative is taking production down for everyone else.
 */
export const RUN_QUOTA_SHARE = 0.5;

export const DEFAULT_DAILY_BATCHES = Math.floor((DAILY_READ_QUOTA * RUN_QUOTA_SHARE) / ESTIMATED_READS_PER_BATCH);

/**
 * The current quota day, as Firestore reckons it: America/Los_Angeles.
 *
 * 🛑 NOT the local date. The machine runs in IST, which is 12.5–13.5 hours ahead
 * of Pacific — so for most of an Indian working day the local date is already
 * TOMORROW in Pacific terms. Keying the budget on the local date would reset it
 * mid-afternoon and hand the run a second full allowance on the same real quota
 * day, which is precisely how the ceiling gets blown through.
 */
export function quotaDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Milliseconds until the next Pacific midnight, when the quota resets. */
export function msUntilQuotaReset(now = new Date()) {
  const today = quotaDay(now);
  // Step forward in 15-minute hops until the Pacific date rolls over. Crude, but
  // it is correct across both DST transitions, which hand-rolled offset maths is
  // not — and this runs once per check, not in a loop.
  let t = now.getTime();
  const STEP = 15 * 60_000;
  for (let i = 0; i < 4 * 24 * 2; i++) {
    t += STEP;
    if (quotaDay(new Date(t)) !== today) return t - now.getTime();
  }
  return 24 * 60 * 60_000;
}

export function formatDuration(ms) {
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/**
 * How many batches may still run today.
 *
 * `state.budgetDay` carries the Pacific day the count belongs to; a different day
 * means the allowance has reset and the counter starts again.
 */
export function budgetStatus(state, now = new Date()) {
  const today = quotaDay(now);
  const limit = Number(state?.dailyBatchBudget ?? DEFAULT_DAILY_BATCHES);
  const used = state?.budgetDay === today ? Number(state?.batchesToday ?? 0) : 0;
  const remaining = Math.max(0, limit - used);
  return {
    today,
    limit,
    used,
    remaining,
    exhausted: remaining <= 0,
    estimatedReadsUsed: used * ESTIMATED_READS_PER_BATCH,
    resetInMs: msUntilQuotaReset(now),
  };
}
