/*
 * Cases for the 2026-10-24 events work: likes, the segmented spin wheel, the
 * charts, the event-type label, the nav swap and the carousel.
 *
 * 🛑 EVERY CASE IS WRITTEN AS AN EXPLICIT BEFORE -> AFTER. Nearly every defect
 * in this codebase returns HTTP 200 with plausible rows, so a case reading
 * "check the wheel works" passes AGAINST the bug it exists to catch. Each
 * `expectedBehaviour` below names the wrong-looking thing that was actually
 * there, so a tester can tell "fixed" from "looks fine".
 */

const authored = {
  // ── Likes ───────────────────────────────────────────────────────────────
  "checklist-content-discovery-event-likes-count-not-entries": {
    roles: ["guest"],
    startPage: "/events",
    steps: [
      "Open /events in a private window with no session.",
      "Read the bottom meta row of every event card.",
      "Open the homepage and read the same row on the Events & Offers strip.",
      "Open any event, e.g. /events/festive-cashback-10, and read the row under the title.",
    ],
    expectedBehaviour:
      "BEFORE: every card's meta row read '\u{1F465} 0 entries' and the detail hero read 'Participants: 0'. Both came from stats.totalEntries, which is 0 BY CONSTRUCTION on an offer or a sale — nobody 'enters' a cashback code — so the number was structurally zero across most of the corpus while still being rendered. AFTER: the card shows a like count ('♥ 9 likes') and the detail hero shows a Like button with a 'Liked by' rail instead of a participant count.",
    expectedUiState:
      "No card and no event hero anywhere shows the word 'entries' or 'Participants'. The seeded festive hub shows 9 likes, launch week 5, and the quieter events 1–3. A count of 0 on an event nobody has liked is correct; the word 'entries' is not.",
    endResult: "Read-only.",
  },

  "checklist-content-discovery-event-likes-guest-sees-signin": {
    roles: ["guest"],
    startPage: "/events/festive-cashback-10",
    steps: [
      "Open /events/festive-cashback-10 in a private window with no session.",
      "WAIT a few seconds for the page to settle after first paint.",
      "Read the Like button — note whether it looks already-liked.",
      "Click Like.",
    ],
    expectedBehaviour:
      "A guest cannot like: the document id is {eventId}__{userId}, so there is no identity to key a guest like on, and the POST is auth:true. Clicking opens the sign-in modal rather than erroring or silently doing nothing. 🛑 The button must NOT appear already-liked for a signed-out visitor at any point, including during the moment after hydration when the viewer-state probe is still in flight.",
    expectedUiState:
      "The Like button renders unfilled with the event's real like count beside it. Clicking opens the sign-in modal. No toast fires — a 401 is turned into a prompt, and a toast on top of it would be noise.",
    endResult: "Nothing persists. No like row is created.",
  },

  "checklist-content-discovery-event-likes-toggle-is-idempotent": {
    roles: ["buyer"],
    startPage: "/events/festive-cashback-10",
    steps: [
      "Sign in, open /events/festive-cashback-10 and WAIT for the page to settle.",
      "Note the like count.",
      "Click Like once. Note the count and whether the heart filled.",
      "Click it again to unlike. Note the count.",
      "Click Like once more, then RELOAD the page and wait for it to settle.",
      "Read the count and the button state after the reload.",
    ],
    expectedBehaviour:
      "The count moves by exactly ONE per click and the state survives a reload. 🛑 The failure to look for is a count that jumps by two on one click: the counter lives on the event document and the membership on the like row, so a bare increment beside a bare set would double-count a fast double-click. They are written in one transaction specifically to stop that. The like row id is deterministic, so liking twice cannot create two rows.",
    expectedUiState:
      "After the reload the heart is filled and the count includes you exactly once. Unliking returns the count to its starting value, never below it.",
    endResult:
      "One eventLikes row at {eventId}__{yourUid} exists (or does not, if you finished on unlike), and the event's stats.likeCount agrees with it.",
  },

  "checklist-content-discovery-event-likes-rail-shows-real-names": {
    roles: ["guest"],
    startPage: "/events/festive-cashback-10",
    steps: [
      "Open /events/festive-cashback-10 with no session.",
      "Read the 'Liked by' row under the Like button.",
      "Read the avatars and the names in the summary line.",
      "Click 'View all' and read the list in the modal.",
    ],
    expectedBehaviour:
      "Names are REAL display names joined from each user's public profile projection — not masked. 🛑 The wrong-looking-but-plausible failure is a rail reading 'A*** K***, R*** S*** and 7 others': that is what you get if the name is taken from the encrypted event ENTRY and run through maskPii, which is correct for a leaderboard and useless as a face. displayName and photoURL are in USER_PUBLIC_FIELDS and already render on public profile pages.",
    expectedUiState:
      "A stack of avatars, then 'Liked by <Name>, <Name> and N others'. No asterisks anywhere. 'View all' opens a modal listing likers with avatars. An event with no likes shows no rail at all rather than 'Be the first to like this'.",
    endResult: "Read-only.",
  },

  // ── The wheel ───────────────────────────────────────────────────────────
  "checklist-content-discovery-event-likes-wheel-is-a-real-wheel": {
    roles: ["guest"],
    startPage: "/events/spin-the-launcher",
    steps: [
      "Open /events/spin-the-launcher with no session.",
      "Open the Participate tab.",
      "Look at the wheel BEFORE clicking anything.",
      "Count the labelled segments and compare them to the prize list below the wheel.",
      "Check whether there is a pointer, and where it sits.",
    ],
    expectedBehaviour:
      "BEFORE: this was not a wheel. It was a plain CSS circle with a single \u{1F381} emoji rotating inside it, no segments and no pointer, and the prize list was loaded but used ONLY to decide whether to disable the button — so a visitor could not see what they might win. AFTER: a segmented SVG wheel with one labelled wedge per active prize and a fixed pointer at the top.",
    expectedUiState:
      "Six labelled segments matching the six prizes, all the SAME SIZE. 🛑 Equal sizing is required, not cosmetic: segment width would otherwise publish each prize's weight, which is the odds, and those are deliberately withheld from the client. The prize list renders below the wheel before any spin.",
    endResult: "Read-only.",
  },

  "checklist-content-discovery-event-likes-wheel-lands-on-its-prize": {
    roles: ["buyer"],
    startPage: "/events/spin-the-launcher/participate",
    steps: [
      "Sign in and open /events/spin-the-launcher/participate.",
      "Click Spin and WATCH the wheel rather than the result card.",
      "Note whether the wheel stops before or after the prize is announced.",
      "When it stops, read which segment is under the pointer.",
      "Read the prize named in the result card and compare the two.",
    ],
    expectedBehaviour:
      "The segment under the pointer IS the prize the card announces. 🛑 BEFORE: the animation started on click, ran a fixed 3.2s, and the prize was revealed by a blind setTimeout AFTER the server call resolved — so the real wait was latency plus 3200ms, the wheel visibly stopped before the prize appeared, and it never landed anywhere meaningful because the keyframes always finished at 0deg mod 360. AFTER: the result is awaited first, then the wheel animates to that segment and the card appears when it stops.",
    expectedUiState:
      "The wheel decelerates, overshoots its target by a few degrees, pauses, and eases back onto it — then the prize card appears. The named prize matches the segment under the pointer. The wheel never stops and then sits idle for a second before anything happens.",
    endResult:
      "One spin is consumed for your account (spinMaxPerUser is 1), and the won coupon is claimable from the result card.",
  },

  "checklist-content-discovery-event-likes-wheel-reduced-motion": {
    roles: ["buyer"],
    startPage: "/events/spin-the-launcher/participate",
    steps: [
      "Turn ON the operating system's 'reduce motion' setting.",
      "Sign in with an account that has not spun, open the Participate tab and click Spin.",
      "Watch what the wheel does.",
    ],
    expectedBehaviour:
      "BEFORE: prefers-reduced-motion was ignored entirely here, while every other Motion.tsx primitive honours it — the wheel spun six full turns regardless. AFTER: the wheel renders already landed on the won segment with no travel. The RESULT is identical; only the journey is removed.",
    expectedUiState:
      "No spinning. The pointer sits on the won segment and the prize card appears. Nothing is lost — the prize, the coupon and the claim button are all the same as the animated path.",
    endResult: "One spin consumed, same as the animated case.",
  },

  // ── Charts ──────────────────────────────────────────────────────────────
  "checklist-content-discovery-event-likes-charts-are-real-or-absent": {
    roles: ["guest"],
    startPage: "/events/festive-cashback-10",
    steps: [
      "Open /events/festive-cashback-10 and scroll to 'By the numbers'.",
      "Read the 'What each code saves' chart and its caption.",
      "Compare the bars at the ₹2,000 basket for CASHBACK10 and CASHBACK500.",
      "Now open /events/burst-clearance-weekend and look for the same section.",
    ],
    expectedBehaviour:
      "Savings are computed with the real calculateDiscount, so the caps and minimums are honoured. 🛑 At ₹2,000 the two 10% codes TIE at ₹200 — both caps are far above that basket — and an uncapped 5% only overtakes a ₹500-capped 10% past ₹10,000. A chart where the capped and uncapped codes differ at ₹2,000 means the percentage was computed inline instead of delegated. FREESHIP2000 and BUY3GET1 are named in the CAPTION and have no bars: free shipping is a delivery waiver rather than a subtotal discount, and a BOGO's value depends on what is in the basket, so a zero bar for either would read as 'this code saves nothing'.",
    expectedUiState:
      "A grouped bar chart across four basket sizes. The quieter event (burst clearance, 1 like, no attached percentage coupons) renders NO 'By the numbers' section at all rather than an empty frame — an absent chart says 'not enough data', a flat one claims a measurement.",
    endResult: "Read-only.",
  },

  "checklist-content-discovery-event-likes-type-label-humanised": {
    roles: ["guest"],
    startPage: "/events/spin-the-launcher",
    steps: [
      "Open /events/spin-the-launcher.",
      "Read the type pill beside the status pill in the hero.",
      "Open /events and read the type pill on each card.",
      "Compare the pill colours for the offer event and the raffle event.",
    ],
    expectedBehaviour:
      "BEFORE: the hero printed the RAW ENUM under a CSS `capitalize`, so a spin_wheel event announced itself as 'Spin_wheel' — CSS cannot humanise an underscore. The card showed an emoji from a private map the hero could not reach, with no text companion at all, so a screen reader got no event type from a card. Colours lived in a third file where offer/survey shared one class and feedback/raffle shared another. AFTER: all three resolve to one map.",
    expectedUiState:
      "The pill reads 'Spin the Wheel', never 'Spin_wheel'. Every card's pill shows an emoji AND a readable label. The offer and raffle pills are visibly different colours.",
    endResult: "Read-only.",
  },

  // ── Nav + carousel ──────────────────────────────────────────────────────
  "checklist-content-discovery-event-likes-nav-blog-is-parent": {
    roles: ["guest"],
    startPage: "/",
    steps: [
      "Open the homepage with no session on a desktop-width window.",
      "Read the top navigation bar left to right.",
      "Hover the entry between Stores and Reviews and read its dropdown.",
      "Click the parent entry itself and read the address bar.",
    ],
    expectedBehaviour:
      "Blog is the top-level entry and Events is its child — swapped because events already have a homepage carousel slide and a homepage rail while the blog has neither, so the top-level slot is the blog's only discovery path. Clicking the parent navigates to /blog rather than doing nothing.",
    expectedUiState:
      "The bar reads Home · Products · Categories · Stores · Blog · Reviews · About Us · Tools. The dropdown lists Blog then Events, both with descriptions. The label reads 'Blog', never a raw key or 'nav.blog'.",
    endResult: "Read-only.",
  },

  "checklist-content-discovery-event-likes-carousel-title-fits": {
    roles: ["guest"],
    startPage: "/",
    steps: [
      "Open the homepage at a 1440px-wide window with no session.",
      "Read the headline on each carousel slide, letting it auto-advance through all of them.",
      "Look specifically at whether any headline overlaps the small line above it or the paragraph below it.",
      "Resize the window to 390px wide and read every headline again.",
      "On the slide made of tiles, count the tiles and check each has its own button.",
    ],
    expectedBehaviour:
      "BEFORE: at ≥1024px a two-line slide headline drew 96px glyphs inside a 40px line box — the responsive size classes set font-size only and left line-height at whatever the base class declared — so the lines overlapped each other and spilled into the eyebrow above and the description below. AFTER: every headline sits on its own line with clear space above and below.",
    expectedUiState:
      "No headline overlaps anything at either width, and none runs off the right edge. At 390px the tiled slide stacks its tiles ONE PER ROW — 🛑 the failure here is every tile landing on top of the others in a single cell, which is what an explicit grid column against a one-column grid produces.",
    endResult: "Read-only.",
  },
};

export { authored };
