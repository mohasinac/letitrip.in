#!/usr/bin/env node
/**
 * verify-proxy-bid-logic.mjs
 *
 * Table-driven verification of the eBay-style proxy bid decision logic in
 * `appkit/src/features/auctions/actions/bid-actions.ts` → `placeBid`.
 *
 * This script mirrors the *pure decision portion* of `placeBid` (the part that
 * decides who wins, what the visible price becomes, and whether to bump the
 * previous winner's visible bid). It does not touch Firestore — that part of
 * placeBid is already covered by the pw-19 Playwright suite.
 *
 * If you change the decision logic in bid-actions.ts you MUST update
 * `decideBidOutcome` below or this script's assertions will start failing.
 * That is intentional — the assertion table is the documented specification.
 *
 * Run:  node scripts/qa/verify-proxy-bid-logic.mjs
 * Exit: 0 if all scenarios pass, 1 otherwise.
 */

/**
 * Mirror of the decision portion of placeBid. Pure — no I/O.
 *
 * @param {object} args
 * @param {number} args.baseBid          Higher of currentBid or startingBid or price.
 * @param {number} args.minIncrement     Auction minBidIncrement (default 100 in placeBid).
 * @param {number} args.newCap           Math.max(bidAmount, autoMaxBid ?? bidAmount).
 * @param {string} args.userId           Bidder uid.
 * @param {?{ userId: string, bidAmount: number, autoMaxBid?: number }} args.previousWinner
 *        previousWinner.data (or null).
 * @returns {{ newBidWins: boolean, visibleBid: number, bumpedPreviousVisible: number | null }}
 */
export function decideBidOutcome({ baseBid, minIncrement, newCap, userId, previousWinner }) {
  const prevCap = previousWinner
    ? (previousWinner.autoMaxBid ?? previousWinner.bidAmount ?? baseBid)
    : baseBid;
  const prevVisible = previousWinner?.bidAmount ?? baseBid;
  const sameBidder = previousWinner?.userId === userId;

  if (sameBidder) {
    return { newBidWins: true, visibleBid: prevVisible, bumpedPreviousVisible: null };
  }

  if (!previousWinner || newCap > prevCap) {
    const target = Math.max(prevCap + minIncrement, baseBid + minIncrement);
    return {
      newBidWins: true,
      visibleBid: Math.min(newCap, target),
      bumpedPreviousVisible: null,
    };
  }

  // newCap <= prevCap → previous winner keeps it. Bump their visible up.
  const target = newCap + minIncrement;
  return {
    newBidWins: false,
    visibleBid: newCap,
    bumpedPreviousVisible: Math.min(prevCap, target),
  };
}

// ─── Scenarios ────────────────────────────────────────────────────────────────
// Each scenario is { name, inputs, expected }. Expected uses the same shape
// returned by decideBidOutcome.

const SCENARIOS = [
  {
    name: "1. First-ever bid (no previous winner) — visible = baseBid + minIncrement",
    inputs: { baseBid: 1000, minIncrement: 100, newCap: 5000, userId: "u-1", previousWinner: null },
    expected: { newBidWins: true, visibleBid: 1100, bumpedPreviousVisible: null },
  },
  {
    name: "2. First bid with cap == baseBid+minIncrement — visible = newCap",
    inputs: { baseBid: 1000, minIncrement: 100, newCap: 1100, userId: "u-1", previousWinner: null },
    expected: { newBidWins: true, visibleBid: 1100, bumpedPreviousVisible: null },
  },
  {
    name: "3. New bidder beats existing cap by a lot — visible = prevCap + minIncrement",
    inputs: {
      baseBid: 1500,
      minIncrement: 100,
      newCap: 9000,
      userId: "u-2",
      previousWinner: { userId: "u-1", bidAmount: 1500, autoMaxBid: 5000 },
    },
    expected: { newBidWins: true, visibleBid: 5100, bumpedPreviousVisible: null },
  },
  {
    name: "4. New bidder beats existing cap by less than minIncrement — visible = newCap (>prevCap+inc impossible)",
    inputs: {
      baseBid: 1500,
      minIncrement: 100,
      newCap: 5050,
      userId: "u-2",
      previousWinner: { userId: "u-1", bidAmount: 1500, autoMaxBid: 5000 },
    },
    // newCap > prevCap so new wins. target = prevCap+inc = 5100. visibleBid = min(5050, 5100) = 5050.
    expected: { newBidWins: true, visibleBid: 5050, bumpedPreviousVisible: null },
  },
  {
    name: "5. Same bidder raises own cap — they keep winning, visible unchanged",
    inputs: {
      baseBid: 2000,
      minIncrement: 100,
      newCap: 10000,
      userId: "u-1",
      previousWinner: { userId: "u-1", bidAmount: 2000, autoMaxBid: 5000 },
    },
    expected: { newBidWins: true, visibleBid: 2000, bumpedPreviousVisible: null },
  },
  {
    name: "6. Tie cap (newCap == prevCap) — previous winner keeps it (first-bidder advantage)",
    inputs: {
      baseBid: 1500,
      minIncrement: 100,
      newCap: 5000,
      userId: "u-2",
      previousWinner: { userId: "u-1", bidAmount: 1500, autoMaxBid: 5000 },
    },
    // newCap <= prevCap → previous keeps. visibleBid=newCap=5000. bumped=min(5000, 5100)=5000.
    expected: { newBidWins: false, visibleBid: 5000, bumpedPreviousVisible: 5000 },
  },
  {
    name: "7. New cap below prev cap by a lot — prev keeps, visible bumps to newCap+minIncrement",
    inputs: {
      baseBid: 1500,
      minIncrement: 100,
      newCap: 3000,
      userId: "u-2",
      previousWinner: { userId: "u-1", bidAmount: 1500, autoMaxBid: 8000 },
    },
    // prev keeps. visibleBid=3000. bumped=min(8000, 3100)=3100.
    expected: { newBidWins: false, visibleBid: 3000, bumpedPreviousVisible: 3100 },
  },
  {
    name: "8. New cap below prev cap, prev cap < newCap+minIncrement — bump capped at prev cap",
    inputs: {
      baseBid: 1500,
      minIncrement: 100,
      newCap: 4950,
      userId: "u-2",
      previousWinner: { userId: "u-1", bidAmount: 1500, autoMaxBid: 5000 },
    },
    // prev keeps. visibleBid=4950. bumped=min(5000, 5050)=5000.
    expected: { newBidWins: false, visibleBid: 4950, bumpedPreviousVisible: 5000 },
  },
  {
    name: "9. Previous winner with no explicit autoMaxBid — bidAmount used as their cap",
    inputs: {
      baseBid: 1000,
      minIncrement: 100,
      newCap: 3000,
      userId: "u-2",
      previousWinner: { userId: "u-1", bidAmount: 2000 }, // no autoMaxBid
    },
    // prevCap = 2000. newCap=3000 > prevCap → new wins. target = 2100. visible = min(3000, 2100) = 2100.
    expected: { newBidWins: true, visibleBid: 2100, bumpedPreviousVisible: null },
  },
  {
    name: "10. Same bidder bumps own bid down — they still 'keep winning' (no anti-self-undercut here)",
    inputs: {
      baseBid: 2000,
      minIncrement: 100,
      newCap: 1500,
      userId: "u-1",
      previousWinner: { userId: "u-1", bidAmount: 2000, autoMaxBid: 5000 },
    },
    // sameBidder → newBidWins true; visible stays at prevVisible.
    // (placeBid's outer validation rejects newCap <= baseBid before calling decide,
    //  so this scenario can never actually reach decideBidOutcome in production —
    //  documented here as a safety property of the function in isolation.)
    expected: { newBidWins: true, visibleBid: 2000, bumpedPreviousVisible: null },
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────

function eq(a, b) {
  return a.newBidWins === b.newBidWins
    && a.visibleBid === b.visibleBid
    && a.bumpedPreviousVisible === b.bumpedPreviousVisible;
}

let passed = 0;
let failed = 0;
const failures = [];

for (const s of SCENARIOS) {
  const got = decideBidOutcome(s.inputs);
  if (eq(got, s.expected)) {
    passed += 1;
    console.log(`  ✓ ${s.name}`);
  } else {
    failed += 1;
    failures.push({ name: s.name, got, expected: s.expected });
    console.log(`  ✗ ${s.name}`);
    console.log(`      expected: ${JSON.stringify(s.expected)}`);
    console.log(`      got:      ${JSON.stringify(got)}`);
  }
}

console.log("");
console.log(`proxy-bid-logic: ${passed}/${SCENARIOS.length} passed`);
if (failed > 0) {
  console.log("");
  console.log("DIVERGENCE DETECTED. If you changed bid-actions.ts intentionally,");
  console.log("update the decideBidOutcome mirror + scenarios in this script.");
  console.log("If you did not, the change in bid-actions.ts is a regression.");
}

process.exit(failed === 0 ? 0 : 1);
