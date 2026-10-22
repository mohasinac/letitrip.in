/*
 * Calibration controls — the anti-rubber-stamp mechanism.
 *
 * An LLM tester's failure mode is not a false red, it is a plausible false green:
 * a `yes` on a case it never actually checked. That is invisible in a report and
 * indistinguishable from real coverage, which is exactly the shape of Recurrent
 * Root Cause #83 (a test that passes AGAINST the bug is worth less than no test).
 *
 * So every batch carries two cases whose answers are known here but not stated to
 * the tester. One must come back `yes`, one must come back `no`. A batch that gets
 * either wrong has ALL its verdicts quarantined rather than published — the batch,
 * not just the control, because a tester that mis-answered a control has told you
 * nothing reliable about the cases beside it.
 *
 * The failing control asks about a URL that cannot exist. It is deliberately not
 * subtle: the point is not to be hard, it is to be impossible to get right without
 * looking. A tester that pattern-matches "sounds like it should work → yes" fails it.
 */

/**
 * 🛑 A CONTROL MUST BE INDISTINGUISHABLE FROM A REAL CASE.
 *
 * Every real case now carries the six-part procedure — roles, startPage, steps,
 * expectedBehaviour, expectedUiState, endResult. If the controls stayed bare, they
 * would be the ONLY two cases in the batch without steps, and "no steps ⇒ this is
 * the calibration pair" is a pattern any competent reader picks up on the second
 * batch. A control that can be identified is not a control.
 *
 * So these carry the same shape, written to the same standard: no assertion verbs
 * in the steps, literal values, an expectation that is checkable from a screenshot.
 *
 * `expected` is consumed by record-verdicts.mjs and never shown to the tester —
 * that is why it lives in `controlExpectations` below and not on these objects.
 */
export function CONTROL_CASES(runId) {
  return [
    {
      id: `control-pass-${runId}`,
      label: "The site homepage renders with a visible site header and at least one navigation link",
      description:
        "A baseline sanity check that the site under test is serving pages at all.",
      href: "/",
      roles: ["guest"],
      startPage: "/",
      steps: [
        "Open / on the site under test.",
        "Read the header at the top of the page.",
        "Read the navigation links inside it.",
      ],
      expectedBehaviour:
        "The homepage serves and renders its own chrome. If this does not hold, nothing else measured in this batch means anything.",
      expectedUiState:
        "A site header is visible at the top of the page and contains at least one navigation link.",
      endResult: "Read-only.",
      priorAnswer: null,
      isControl: true,
    },
    {
      id: `control-fail-${runId}`,
      label: `The page at /__tester-control-${runId} renders a product listing grid with at least one product card`,
      description:
        "Report exactly what this URL serves. Do not infer from the path what the page ought to contain.",
      href: `/__tester-control-${runId}`,
      roles: ["guest"],
      startPage: `/__tester-control-${runId}`,
      steps: [
        `Open /__tester-control-${runId}.`,
        "Read what the page renders.",
        "Read the HTTP status of the document response.",
      ],
      expectedBehaviour:
        "The claim in the label is either true of this URL or it is not. Answer from what the page actually served.",
      expectedUiState:
        "A grid of product cards with at least one card present.",
      endResult: "Read-only.",
      priorAnswer: null,
      isControl: true,
    },
  ];
}

/** The expected verdicts, kept apart from the case objects handed to the tester. */
export function controlExpectations(runId) {
  return new Map([
    [`control-pass-${runId}`, "yes"],
    [`control-fail-${runId}`, "no"],
  ]);
}

export function isControlId(id) {
  return typeof id === "string" && id.startsWith("control-");
}
