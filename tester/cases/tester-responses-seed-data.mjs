const TESTER_ID = "user-yugi-muto";
const TESTER_NAME = "Mock User 3";
const responseId = (testerId, checklistItemId) => `${testerId}__${checklistItemId}`;
const DEMO_V1 = "checklist-admin-bug-hunter-rewards-demo-fixture";
const DEMO_V2 = "checklist-admin-bug-hunter-rewards-demo-fixture-v2";
const seededAt = /* @__PURE__ */ new Date("2026-08-18T09:30:00.000Z");
const testerResponsesSeedData = [
  /*
   * The ALREADY-CONFIRMED submission. The v1 catalogue item carries
   * bugConfirmed:true / bugHunterId:"user-yugi-muto" / bugHunterName:"Mock User
   * 3", and until now there was no response row behind that credit — so
   * /admin/tester-feedback showed "No feedback submitted yet" while the
   * leaderboard showed a confirmed bug. This is the missing half.
   *
   * Backs: confirm-bug-idempotent (needs a row that is already confirmed) and
   * reopen-case (needs the v1 credit to be visible from a real submission).
   *
   * `status: "reviewed"` because an admin has already acted on it.
   */
  {
    id: responseId(TESTER_ID, DEMO_V1),
    testerId: TESTER_ID,
    testerDisplayName: TESTER_NAME,
    checklistItemId: DEMO_V1,
    groupKey: "admin",
    pageKey: "bug-hunter-rewards",
    phase: 1,
    answer: "no",
    comment: "Seed fixture \u2014 the reported bug behind the v1 demo case. Already confirmed and credited, then reopened as v2. Exists so an admin can see what a confirmed submission looks like without waiting for a real tester to file one.",
    status: "reviewed",
    createdAt: seededAt,
    updatedAt: seededAt
  },
  /*
   * The UNCONFIRMED submission, against the active v2 retest. This is the row
   * "Mark as Bug" is meant to be tried on end-to-end.
   *
   * 🛑 status MUST stay "new" and the case MUST stay un-confirmed, or the
   * confirm-bug case has nothing left to do — it would open an already-confirmed
   * row and correctly report that it could not perform its own steps. A fixture
   * that pre-completes the thing under test is worse than no fixture, because it
   * looks like coverage.
   */
  {
    id: responseId(TESTER_ID, DEMO_V2),
    testerId: TESTER_ID,
    testerDisplayName: TESTER_NAME,
    checklistItemId: DEMO_V2,
    groupKey: "admin",
    pageKey: "bug-hunter-rewards",
    phase: 1,
    answer: "no",
    comment: "Seed fixture \u2014 a fresh 'No' on the reopened v2 case, deliberately NOT yet confirmed. This is the row to try Mark as Bug against.",
    status: "new",
    createdAt: seededAt,
    updatedAt: seededAt
  }
];
export {
  testerResponsesSeedData
};
