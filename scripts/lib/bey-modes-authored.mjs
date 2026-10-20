/**
 * HAND-AUTHORED modes, keyed on the PART that provides them.
 *
 * ── 🛑 WHY THIS IS KEYED ON A PART AND NOT ON A BEY ───────────────────────
 *
 * Every single mode the owner has confirmed turned out to be a property of a
 * FUSION WHEEL or a TIP, not of an assembled bey: the Phantom wheel flips, the
 * Blitz wheel takes two contact-point configurations, Jade's balls lock or run
 * free, the Fusion wheel can sit rubber-up or metal-up, Kreis' halves slip
 * under impact, Delta Drive takes three tips, Final Drive changes with speed.
 *
 * That is also what the corpus itself says, in the one measurement that was
 * easy to misread: of 147 mode candidates extracted from the case study, only
 * 12 resolved to a bey — and the other **135 are part-level analyses**
 * ("Metal Wheel Compliance (Kreis)", "Energy Ring as Contact-Point Override",
 * "Fusion Wheel + Energy Ring as a Composite Contact System"). I first
 * recorded that as a join failure. It is the data telling you where the field
 * belongs.
 *
 * So a mode is authored ONCE against its part, and the generator fans it out
 * to every bey whose `composition[].partId` uses that part. Two consequences
 * worth having:
 *
 *   - A wheel used by six beys is described once. Listing bey slugs by hand
 *     would have meant six copies that drift (Root Cause #75's shape).
 *   - The fan-out follows OUR OWN composition data, never a name prefix.
 *     "Fusion Hades" carries the *Fusion* wheel while "Hades Kerbecs" carries
 *     the *Hades* wheel — in MFB naming the first word is the fusion wheel, so
 *     a `startsWith("hades")` sweep would have attached the Fusion wheel's
 *     modes to the wrong bey. `partId` cannot be wrong in that way.
 *
 * 🛑 `modes` still lands on the BEY document, because that is what
 * `/beys/{slug}` renders and a buyer reads. `appliesToPart` travels with each
 * mode so the part-level origin is recorded rather than lost — and so a later
 * pass can lift these onto `partGlossary` mechanically instead of re-reading
 * eight passages.
 *
 * ── 🛑 THE CORPUS IS NOT A USABLE SOURCE HERE WITHOUT REVIEW ──────────────
 *
 * This file originally authored four beys from reading the case study. The
 * owner reviewed them and **every claim drawn from the corpus alone was wrong
 * in some way.** Four distinct errors, each in a passage that reads as precise
 * because it carries numbers:
 *
 *   Case 809  F:D's transition INVERTED (rubber -> bearing). It is
 *             sharp-at-high-speed -> rubber-flat-as-speed-falls, and the
 *             trigger is SPEED, confirmed by the owner.
 *   Case 1836 Variares' mode given as launch SPIN DIRECTION. The launch
 *             direction is not a mode; Delta Drive has THREE changeable tips.
 *             The same case also calls D:D "Duo:Dual" — it is DELTA DRIVE,
 *             and our own glossary says so (`performance-tip--delta-drive`,
 *             `aliases: ["delta-drive", "D:D"]`).
 *   Case 678  Phantom Orion's mode attributed to the B:D BOTTOM releasing a
 *             bearing cage, triggered passively by spin decay. It is the
 *             FUSION WHEEL being flipped — wrong part AND wrong kind of
 *             trigger.
 *   Case 1958 The FS tip's direction stated as flat-at-high / sharp-at-low,
 *             the opposite way round from the F:D behaviour the owner
 *             confirmed. Withheld; see `MECHANISMS_WITHHELD`.
 *
 * 🛑 **SO NOTHING SHIPS UNCONFIRMED.** Each mode carries `confirmed`, and
 * `generate-beys-seed.mjs` emits only confirmed entries. An unconfirmed
 * candidate stays in `PENDING_REVIEW` below where it is visible and cheap to
 * rule on — it does not reach a public reference page on the strength of a
 * passage that has an established error rate.
 *
 * My own share of this: on Variares I WROTE DOWN the conflation ("the corpus
 * attributes the left-spin setting to a special move") and authored it anyway.
 * A caveat beside a claim does not make the claim true, and the caveat is
 * evidence I had already seen the problem.
 *
 * For balance, because the corpus is not worthless: total assembly MASS is 95%
 * self-consistent there — 72 of 76 multiply-documented beys agree exactly. It
 * is the mode PROSE specifically that cannot be trusted unreviewed.
 *
 * ── 🛑 NO THRESHOLDS, AND NO ANIME ───────────────────────────────────────
 *
 * `BeyMode` has no numeric field. F:D alone was given ~420 rad/s (Case 809),
 * 500 and 300 rad/s (Case 1824, in one section), and 94.3 rad/s (the plan) —
 * four numbers for one transition whose DIRECTION was also wrong. The
 * direction is now settled; no threshold is. A field that does not exist
 * cannot be filled with one of those four by someone who assumes the absence
 * was an oversight.
 *
 * And a SPECIAL MOVE IS NOT A MODE: the corpus's `[SPECIAL MOVE]` cases are
 * anime finishers with game-engine values (Case 654's "Armageddon" is a 200 px
 * proximity-damage field with phase timings). Six were excluded by the
 * extractor, and Wyborg was excluded here despite resolving, because its only
 * stated trigger is a character's special move.
 *
 * @tag domain:beys
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — a data table
 */

/** Confirmed by the owner, who is the domain authority, on this date. */
const OWNER = "owner-2026-10-21";

/**
 * `partId -> BeyMode[]`. Every key was checked against the seeded part
 * glossary; an unresolvable key is a HARD ERROR in the generator, because a
 * key that matches nothing contributes nothing and afterwards reads as "that
 * part has no modes" rather than "the map is wrong" (Root Cause #90).
 *
 * 🛑 `trigger` stays PROSE alongside the `switchKind` enum. The kind is what
 * a filter or a game reads; the sentence is what a person reads, and
 * "Assemble the wheel for six contact points" is not recoverable from
 * "config".
 */
export const AUTHORED_PART_MODES = {
  /*
   * Final Drive. Owner, 2026-10-21: *"FD mode change depends on the speed of
   * the beyblade not direction, and how its high speed opens the tip while
   * lower [speed] opens an aggressive attack."*
   *
   * This OVERTURNS Case 809, which had it as rubber -> bearing with a one-way
   * centrifugal latch. It is not one-way and it is not a latch: the behaviour
   * follows how fast the top is still turning.
   */
  "performance-tip--final-drive": [
    {
      name: "Sharp tip",
      behaviour:
        "While it is still spinning fast it rides on a narrow central point. Very little " +
        "touches the floor, so it holds its spin and stays roughly where it was launched.",
      trigger: "How it behaves at high speed. Nothing to set.",
      switchKind: "speed",
      confirmed: OWNER,
    },
    {
      name: "Final Drive",
      behaviour:
        "As the speed drops the wide rubber ring around the tip takes over and the top " +
        "starts moving hard around the stadium — it turns most aggressive late in a " +
        "battle, when an opponent expects it to be winding down.",
      trigger: "Takes over on its own as speed falls. Nothing to set.",
      switchKind: "speed",
      confirmed: OWNER,
    },
  ],

  /*
   * Delta Drive. Owner, 2026-10-21: *"variares mode switch is similar to
   * dranzer F top change; for the delta drive the launch spin direction is NOT
   * a mode change — it has 3 changeable tips: flat, semi flat and sharp."*
   */
  "performance-tip--delta-drive": [
    {
      name: "Flat",
      behaviour:
        "The widest and grippiest of the three. It drives the top around the stadium and " +
        "hunts the opponent down, at the cost of using its spin up quickly.",
      trigger: "Fit the flat tip before launch.",
      switchKind: "swap",
      configIndex: 1,
      confirmed: OWNER,
    },
    {
      name: "Semi-flat",
      behaviour:
        "Between the other two. It still moves about and seeks contact, but holds its " +
        "spin noticeably longer than the flat tip does.",
      trigger: "Fit the semi-flat tip before launch.",
      switchKind: "swap",
      configIndex: 2,
      confirmed: OWNER,
    },
    {
      name: "Sharp",
      behaviour:
        "A narrow point with very little touching the floor. It stays close to where it " +
        "is launched and spins for a long time, giving up the ability to attack.",
      trigger: "Fit the sharp tip before launch.",
      switchKind: "swap",
      configIndex: 3,
      confirmed: OWNER,
    },
  ],

  /* Owner, 2026-10-21: *"phantom orion's fusion wheel can be flipped to create
   * a stamina and attack mode."* Case 678 put this in the bottom. */
  "fusion-wheel--phantom": [
    {
      name: "Attack",
      behaviour:
        "This way up the wheel presents its edge outward, so it bites into an opponent on " +
        "contact and hits harder.",
      trigger: "Flip the fusion wheel before launch.",
      switchKind: "flip",
      confirmed: OWNER,
    },
    {
      name: "Stamina",
      behaviour:
        "Flipped over, the wheel presents a smoother profile. It gives up attacking power " +
        "and keeps spinning considerably longer.",
      trigger: "Flip the fusion wheel before launch.",
      switchKind: "flip",
      confirmed: OWNER,
    },
  ],

  /* Owner, 2026-10-21: *"blitz striker fusion wheel can be configured in 2
   * modes, smash and barrage mode, based on its config and point of contacts
   * 3 vs 6."* */
  "fusion-wheel--blitz": [
    {
      name: "Smash",
      behaviour:
        "Configured so three points stand out. Fewer, heavier hits — each contact lands " +
        "with more force behind it, which suits knocking an opponent out of the stadium.",
      trigger: "Assemble the wheel for three contact points, before launch.",
      switchKind: "config",
      configIndex: 1,
      confirmed: OWNER,
    },
    {
      name: "Barrage",
      behaviour:
        "Configured so six points stand out. Twice as many hits, each lighter — it wears " +
        "an opponent down and keeps them unsettled rather than landing one big blow.",
      trigger: "Assemble the wheel for six contact points, before launch.",
      switchKind: "config",
      configIndex: 2,
      confirmed: OWNER,
    },
  ],

  /*
   * ── 🛑 FS IS F:D IN REVERSE, AND MY WITHHOLDING IT WAS MY ERROR ──────────
   *
   * Owner, 2026-10-21: *"final survive or FS is similar to F:D just reverse."*
   *
   * So **Case 1958 was RIGHT**: FS runs flat at high spin and sharp at low
   * spin. I withheld it because that is the opposite direction from F:D, and
   * Case 809 had just been shown to invert F:D — so an inverted-looking claim
   * read as the same defect. It is not a defect, it is the design: the two
   * tips are deliberate mirrors of each other.
   *
   * That is over-generalising from a single correction, which is the same
   * mistake in the other direction as trusting the corpus unreviewed. One
   * source being wrong about one transition is not evidence about a different
   * part. Root Cause #96: n=1 is not a measurement, including when n=1 is a
   * known error.
   *
   * 🛑 The part is `performance-tip--final-survive` — the id COMPOSITIONS use.
   * The glossary also carries `performance-tip--4d-bottom-f-s-final-survive`,
   * which I keyed on first and which no bey references, so the modes attached
   * to nothing. Two glossary rows for one part, and only one is wired; check
   * what the compositions say, not just that an id exists.
   */
  "performance-tip--final-survive": [
    {
      name: "Flat",
      behaviour:
        "At high speed the wide flat face is in contact, so the top moves aggressively " +
        "around the stadium and attacks while it still has spin to spend.",
      trigger: "How it behaves at high speed. Nothing to set.",
      switchKind: "speed",
      confirmed: OWNER,
    },
    {
      name: "Final Survive",
      behaviour:
        "As the speed drops it settles onto a narrow point, friction falls away and it " +
        "stops moving about — trading its attack for the longest possible spin at the " +
        "end of a battle. The mirror image of Final Drive, which attacks late instead.",
      trigger: "Takes over on its own as speed falls. Nothing to set.",
      switchKind: "speed",
      confirmed: OWNER,
    },
  ],

  /*
   * Owner, 2026-10-21: *"duo uranus also has similar config where one gives it
   * a balanced weight while 2nd config gives it a weight heavy on one side
   * making it more attacking."*
   *
   * The corpus has this too, as a part-level analysis — "Duo Fusion Wheel:
   * Deliberate Static Imbalance as Attack Mechanism" — which is one more of
   * the 135 part-level candidates I first recorded as a join failure.
   */
  "fusion-wheel--duo": [
    {
      name: "Balanced",
      behaviour:
        "Assembled so the weight sits evenly around the wheel. It spins true and stays " +
        "stable, which favours lasting rather than hitting.",
      trigger: "Assemble the wheel in its balanced configuration, before launch.",
      switchKind: "config",
      configIndex: 1,
      confirmed: OWNER,
    },
    {
      name: "Weighted",
      behaviour:
        "Rotated so the weight is concentrated on one side. The top wobbles into a wider " +
        "path and throws more of its mass into each contact — deliberately unbalanced, " +
        "to attack.",
      trigger: "Assemble the wheel in its weighted configuration, before launch.",
      switchKind: "config",
      configIndex: 2,
      confirmed: OWNER,
    },
  ],

  /*
   * Owner, 2026-10-21: *"jade jupiter fusion wheel can be rotated in 2 configs,
   * one where the balls move freely and other where they are fixed, each
   * working differently."*
   *
   * 🛑 This is also why `fusion-wheel--jade` is classified multi-PIECE and NOT
   * integrated: the balls are separate pieces, which is a different thing from
   * one piece filling two slots.
   */
  "fusion-wheel--jade": [
    {
      name: "Balls free",
      behaviour:
        "The ball bearings are left loose, so they roll as the top spins and when it is " +
        "struck. The movement soaks up some of a hit instead of passing it all on.",
      trigger: "Rotate the wheel to the configuration that frees the balls, before launch.",
      switchKind: "config",
      configIndex: 1,
      confirmed: OWNER,
    },
    {
      name: "Balls fixed",
      behaviour:
        "The balls are locked in place, so the wheel behaves as one solid mass. Hits are " +
        "met rigidly rather than absorbed.",
      trigger: "Rotate the wheel to the configuration that locks the balls, before launch.",
      switchKind: "config",
      configIndex: 2,
      confirmed: OWNER,
    },
  ],

  /*
   * Owner, 2026-10-21: *"fusion hades also has different config based on what
   * is up, rubber or the metal part."*
   *
   * 🛑 The part is the **Fusion** wheel, not Hades. "Fusion Hades AD145SWD"
   * names the fusion wheel first, so Hades there is the energy ring — which is
   * exactly why these are keyed on `partId` and not on a bey-name prefix.
   */
  "fusion-wheel--fusion": [
    {
      name: "Rubber up",
      behaviour:
        "With the rubber facing up it is the rubber that meets an opponent. Rubber grips " +
        "and absorbs, so hits are deadened and some of the opponent's spin is taken.",
      trigger: "Assemble the wheel rubber-side up, before launch.",
      switchKind: "flip",
      confirmed: OWNER,
    },
    {
      name: "Metal up",
      behaviour:
        "With the metal facing up, contact is hard and the top hits back rather than " +
        "soaking the blow up.",
      trigger: "Assemble the wheel metal-side up, before launch.",
      switchKind: "flip",
      confirmed: OWNER,
    },
  ],

  /*
   * Owner, 2026-10-21: *"kreis cygnus has 2 modes, but mode 1 is default launch
   * and when it gets attacked the fusion wheels slip on each other to activate
   * mode 2; the slip adds a defensive layer."*
   *
   * 🛑 A FOURTH KIND OF TRIGGER — not a setting, not speed, not the surface,
   * but being HIT. It is the clearest argument for `trigger` staying free
   * text: an enum built from the first three would have had nowhere to put it.
   */
  "fusion-wheel--kreis": [
    {
      name: "Default",
      behaviour: "How it launches, with the two halves of the wheel aligned.",
      trigger: "The state it starts in.",
      switchKind: "impact",
      confirmed: OWNER,
    },
    {
      name: "Slipped",
      behaviour:
        "Being hit makes the two halves of the wheel slip against each other. That slip " +
        "takes the edge off the impact instead of transmitting it, so the top is harder " +
        "to shift once an opponent has started attacking it.",
      trigger: "Activates on being hit. Nothing to set.",
      switchKind: "impact",
      confirmed: OWNER,
    },
  ],

  /*
   * ── 🛑 WYBORG'S BASE IS REAL, AND EXCLUDING IT WAS MY MISTAKE ────────────
   *
   * Owner, 2026-10-21: *"wyborg's base is a mode switch base where if it gets
   * impact it switches from sharp tip to a flat tip making it more aggressive,
   * and the flaps which get hit move so they align better with its AR making
   * it heavier."*
   *
   * I had put Wyborg in `MODES_WITHHELD` because Case 1889 gave its trigger as
   * an anime special move ("Sand Bind execution"), and this file's own rule is
   * that a special move is not a mode. The rule is right; applying it here was
   * not. **The corpus mislabelled the TRIGGER of a real mechanism, and I threw
   * out the mechanism with the label.** The correct response to a bad trigger
   * is to doubt the trigger, not to conclude the part does nothing.
   *
   * 🛑 Our own glossary corroborates the owner independently: the part is
   * `blade-base--auto-change-base` — it is CALLED "Auto Change Base", and the
   * spin gear beside it is `spin-gear--right-spin-auto-change-version`. The
   * name states the mechanism. I had the evidence in hand and did not look at
   * it, which is the same failure as the `categoryId` regex: the data answers
   * the question if you ask it.
   *
   * The flaps are a second effect of the same event, so they are described
   * inside the mode rather than listed as a third mode — one trigger, one
   * state change.
   */
  "blade-base--auto-change-base": [
    {
      name: "Sharp",
      behaviour:
        "How it launches. A narrow point, so it stays put and holds its spin while it " +
        "waits to be attacked.",
      trigger: "The state it starts in.",
      switchKind: "impact",
      confirmed: OWNER,
    },
    {
      name: "Flat",
      behaviour:
        "Being hit switches the base from its sharp point to a flat one, and the top " +
        "starts moving aggressively instead of holding station. The flaps that take the " +
        "hit also shift so they line up better with the attack ring above, putting more " +
        "of the weight behind the ring's own contact points.",
      trigger: "Switches on being hit. Nothing to set.",
      switchKind: "impact",
      confirmed: OWNER,
    },
  ],

  /*
   * ── 🛑 HEIGHT-CHANGING TRACKS: 2 CONFIGS, AND ONE WITH 3 ─────────────────
   *
   * Owner, 2026-10-21: *"ch120 mad gasher, cancer dark etc has 2 configs of
   * changeable height; similarly there is another one ch170 for beat lynx which
   * gives the user 3 heights to choose from, each config gives more height and
   * different wing distributions."*
   *
   * 🛑 The 170 is **TH170 — "Triple Height"**, not CH170. Our own glossary has
   * `spin-track--triple-height-170` and `beat-lynx-th170wd` carries it, and
   * "Triple" is exactly the three heights described. The letters differ from
   * the message and the DATA settles it — this is the third time a part's
   * initials have been read wrong this session (D:D as "Duo:Dual", FS as
   * "Flat Sharp" rather than Final Survive), so initials get looked up now
   * instead of expanded.
   *
   * This also confirms the CH120 reading I had parked in `PENDING_REVIEW` from
   * Case 1958, so two of the corpus's claims have now survived review. The
   * part of that same case I did NOT keep — the FS tip direction — turned out
   * to be right as well, for a reason I could not have guessed (FS is F:D in
   * reverse by design). One case, two sound claims and one I mishandled in
   * each direction.
   *
   * `configIndex` is the height order, so a consumer can sort them without
   * parsing the names.
   */
  "spin-track--change-height-120": [
    {
      name: "120 — low",
      behaviour:
        "Set short, so the wheel meets an opponent low down. A low hit tends to push the " +
        "other top sideways rather than lift it, and sitting lower is more stable.",
      trigger: "Set the track to its 120 mm height, before launch.",
      switchKind: "config",
      configIndex: 1,
      confirmed: OWNER,
    },
    {
      name: "145 — high",
      behaviour:
        "Set tall, so contact lands higher up an opponent — under its upper edge, which " +
        "unsettles it and can tip it over.",
      trigger: "Set the track to its 145 mm height, before launch.",
      switchKind: "config",
      configIndex: 2,
      confirmed: OWNER,
    },
  ],

  "spin-track--triple-height-170": [
    {
      name: "Lowest",
      behaviour:
        "The shortest of the three settings. The most stable, and it strikes an opponent " +
        "low.",
      trigger: "Set the track to its lowest height, before launch.",
      switchKind: "config",
      configIndex: 1,
      confirmed: OWNER,
    },
    {
      name: "Middle",
      behaviour:
        "The middle setting. Taller, and the wings sit at a different spacing than either " +
        "of the other two — each height changes where the protrusions fall, not just how " +
        "high the top rides.",
      trigger: "Set the track to its middle height, before launch.",
      switchKind: "config",
      configIndex: 2,
      confirmed: OWNER,
    },
    {
      name: "Highest",
      behaviour:
        "The tallest setting, at 170 mm. It reaches over the top of most opponents, which " +
        "suits attacking from above — and gives up stability for it.",
      trigger: "Set the track to its highest height, before launch.",
      switchKind: "config",
      configIndex: 3,
      confirmed: OWNER,
    },
  ],

  /*
   * ── 🛑 A CLASS RULE, NOT A PER-PART FACT ─────────────────────────────────
   *
   * Owner, 2026-10-21: *"any track with wings such as switch 145 or upper
   * wings 145 or boost disk 145 can be flipped and placed over so that the
   * protrusions of its wings is aligned differently; most cases causes
   * scraping or can help with attacks."*
   *
   * So this is a property of WINGED TRACKS generally. Two things follow:
   *
   *   - It CONFIRMS the SW145 reading I had parked in `PENDING_REVIEW` from
   *     Case 690, which makes it the only corpus mode claim so far that
   *     survived review. Worth recording: the corpus is not uniformly wrong,
   *     it is unreliable, and those call for the same handling but different
   *     expectations.
   *   - 🛑 I am authoring only the THREE the owner named, against ids verified
   *     in our glossary — not sweeping all 74 `spin-track--*` rows for the
   *     word "wing". "Left Wing 160" and "Wing 105" look like members and I
   *     have not been told they are, and a wrong flip claim on a track is
   *     exactly the kind of plausible-looking error this file exists to avoid.
   *
   * Each track appears TWICE in our glossary — once code-prefixed, once plain
   * ("spin-track--uw145-upper-wing-145" and "spin-track--upper-wing-145") —
   * so both ids carry the modes, or half the beys using it would show nothing.
   *
   * 🛑 "Most cases causes scraping" is stated as a REAL DOWNSIDE rather than
   * softened. A buyer flipping a track to attack and finding it drags on the
   * stadium floor needs to have been told that is the usual outcome.
   */
  ...Object.fromEntries(
    [
      ["spin-track--sw145-switch-145-gimmick-track", "Switch 145"],
      ["spin-track--switch-145", "Switch 145"],
      ["spin-track--upper-wing-145", "Upper Wing 145"],
      ["spin-track--bd145-boost-disk-145", "Boost Disk 145"],
      ["spin-track--boost-disk-145", "Boost Disk 145"],
    ].map(([partId, label]) => [
      partId,
      [
        {
          name: "Wings down",
          behaviour:
            `The ${label} track mounted the usual way up. The wings sit clear of the ` +
            "stadium floor, so the top runs cleanly and the wings only come into play " +
            "when they meet an opponent.",
          trigger: "Mount the track the usual way up, before launch.",
          switchKind: "flip",
          confirmed: OWNER,
        },
        {
          name: "Wings up",
          behaviour:
            "Flipped over, the wings present at a different angle and can add to an " +
            "attack. 🛑 In most cases they also scrape along the stadium floor, which " +
            "costs spin quickly — so this is a trade, not a straight upgrade.",
          trigger: "Flip the track over and mount it inverted, before launch.",
          switchKind: "flip",
          confirmed: OWNER,
        },
      ],
    ]),
  ),

  /*
   * ── 🛑 A MODE THAT BELONGS TO A PAIR OF PARTS, NOT TO ONE ────────────────
   *
   * Owner, 2026-10-21: *"even lightning l drago has 2 modes, one attack and one
   * normal mode, where the teeth of the dragon align with the teeth on the
   * fusion wheel."*
   *
   * This is why `requiresPart` exists. The mode is the ALIGNMENT between the
   * energy ring's dragon heads and the wheel's teeth — neither part does it
   * alone, and keying it on the wheel without naming the ring would claim the
   * wheel alone did.
   *
   * The pairing comes from our own composition data, not from the bey name:
   * `lightning-l-drago-100hf` carries `fusion-wheel--lightning` +
   * `energy-ring--l-drago-i`. Three other `lightning-l-drago-*` rows carry a
   * DIFFERENT wheel or none, so a name sweep would have mis-tagged them.
   */
  "fusion-wheel--lightning": [
    {
      name: "Normal",
      behaviour:
        "The dragon heads on the energy ring sit between the wheel's teeth, leaving a " +
        "more even outline. It spins steadily and is the safer way to launch it.",
      trigger: "Line the ring's heads up between the wheel's teeth, before launch.",
      switchKind: "config",
      configIndex: 1,
      requiresPart: "energy-ring--l-drago-i",
      confirmed: OWNER,
    },
    {
      name: "Attack",
      behaviour:
        "Rotated so the dragon heads line up ON the wheel's teeth, which pushes the " +
        "contact points out and makes each hit bite harder.",
      trigger: "Line the ring's heads up with the wheel's teeth, before launch.",
      switchKind: "config",
      configIndex: 2,
      requiresPart: "energy-ring--l-drago-i",
      confirmed: OWNER,
    },
  ],

  /*
   * Owner, 2026-10-21: *"meteo l drago has 6 teeth on meteo wheel and 3 heads
   * on the energy rings; based on how the 3 heads align the mode is either
   * absorb mode or attack mode"*, and *"similar cases with other meteos."*
   *
   * 🛑 Six teeth against three heads is why there are exactly two states: with
   * three heads over six teeth the ring either sits ON teeth or BETWEEN them,
   * and there is no third alignment. The geometry is the reason, not a count
   * somebody chose.
   *
   * "Other meteos" is handled for free — keying on the WHEEL fans this out to
   * all three Meteo rows in our data (`lw105lf`, `85lf-rush-version`,
   * `lw105jb-assault-version`), which carry three DIFFERENT L-Drago energy
   * rings. So `requiresPart` is deliberately absent here: the mode belongs to
   * the wheel-plus-any-L-Drago-ring family rather than to one named ring, and
   * naming only `--l-drago-ii` would have been wrong for two of the three.
   */
  "fusion-wheel--meteo": [
    {
      name: "Absorb",
      behaviour:
        "Aligned so the rubber of the dragon heads is what meets the opponent. Rubber " +
        "grips rather than deflects, so it takes spin off the other top instead of " +
        "knocking it away — the spin-steal setting.",
      trigger: "Align the ring's three heads for rubber contact, before launch.",
      switchKind: "config",
      configIndex: 1,
      confirmed: OWNER,
    },
    {
      name: "Attack",
      behaviour:
        "Aligned so the wheel's own teeth lead instead. Contact is hard and the top " +
        "strikes rather than draining.",
      trigger: "Align the ring's three heads for tooth contact, before launch.",
      switchKind: "config",
      configIndex: 2,
      confirmed: OWNER,
    },
  ],
};

/**
 * Confirmed to HAVE modes, but without enough detail to name them yet.
 *
 * 🛑 Separate from `PENDING_REVIEW`, and the distinction matters: these are
 * not unverified corpus claims, they are owner-confirmed mechanisms whose
 * individual mode NAMES I have not been told. Authoring names for them would
 * be inventing, and inventing a plausible name is worse than an absent one —
 * it reads as researched.
 */
export const CONFIRMED_PENDING_DETAIL = {
  "fusion-wheel--l-drago-destructor": {
    alsoApplies: ["fusion-wheel--l-drago-destructor-hasbro"],
    owner: OWNER,
    statement:
      "\"l drago destroyer and guardian also have similar modes based on the spin steal " +
      "and other modes\" — so the alignment family continues into the Destructor and " +
      "Guardian wheels, including a spin-steal setting. The mode names and what each " +
      "alignment does are not yet recorded.",
  },
  "fusion-wheel--l-drago-guardian": {
    alsoApplies: ["fusion-wheel--l-drago-guardian-hasbro"],
    owner: OWNER,
    statement:
      "Same statement as the Destructor wheel. The corpus's Case 40 describes a " +
      "\"Armor-Flat Metal Frame + Full Rubber Core\" for Guardian, which is consistent " +
      "with a rubber/metal alignment choice — but the corpus is not a usable source " +
      "unreviewed here, so nothing is authored from it.",
  },
};

/**
 * Candidates read from the corpus but NOT shipped, each awaiting a ruling.
 *
 * 🛑 Here rather than deleted so the reading is not lost and a decision is
 * cheap — and NOT in `AUTHORED_PART_MODES`, because the corpus's mode prose
 * has a demonstrated error rate of four-for-four on everything reviewed.
 */
export const PENDING_REVIEW = {
};

/**
 * ── 🛑 THINGS THAT LOOK LIKE MODES AND ARE NOT ───────────────────────────
 *
 * This list exists because it is where most of my errors landed, and because
 * each one is a FIXED PROPERTY that a future pass — or an extractor matching
 * "free spin" or "switch" — will want to turn back into a mode.
 *
 * The distinction: a mode has two or more states the same part can be in. A
 * free-spinning bearing has ONE state; it always free-spins. Describing it as
 * a mode invents a second state that does not exist, and a reader then looks
 * for a setting there isn't.
 *
 * All four were corrected by the owner on 2026-10-21.
 */
export const NOT_MODES = {
  eternal:
    "\"Eternal\" MEANS free-spinning. Anything named Eternal (Archer Hercules 13 Eternal, " +
    "the Eternal and High Eternal drivers) free-spins by design — it is a fixed property, " +
    "not a mode change. The corpus's \"Shield Mode Comparison\" heading on Case 1276 is " +
    "what would otherwise have pulled it in.",
  "f230 / free 230":
    "The F in F230 is \"Free\" — a free-spinning track. Always free; no second state.",
  "tb / tapered ball":
    "TB is \"Tapered Ball\", Bandit Genbu's tip, and it is JUST A SHAPE — fixed, no modes " +
    "at all. The corpus (Case 1842) described it as running on a ball or a cylinder rim " +
    "depending on the surface; that is wrong, and it was the only candidate for a " +
    "\"surface\" switch kind, which is why no such kind exists in the schema.",
  "launch spin direction":
    "Which way you launch is not a mode of any part. Case 1836 recorded Variares' modes " +
    "as Right-spin/Left-spin on that basis; its real mode is Delta Drive's three " +
    "changeable tips.",
  "special moves":
    "Anime finishers. The corpus's [SPECIAL MOVE] cases carry game-engine values " +
    "(Case 654's \"Armageddon\" is a 200 px proximity-damage field with phase timings), " +
    "which is combat scripting, not a property of the object.",
};

/** Beys deliberately left without modes, and why. Reported by the generator. */
export const MODES_WITHHELD = {
  "master-dranzer":
    "Its only mode heading is \"Structural Failure Mode\" — a way of breaking, not a " +
    "configuration.",
};

/**
 * Mechanisms read, resolved, and still not authored — with the reason.
 *
 * 🛑 On the record so a later pass reads the absence as a decision rather than
 * an oversight, and does not "fix" it from the same unreliable passage.
 */
export const MECHANISMS_WITHHELD = {
  "performance-tip--final-drive::threshold":
    "Four different switch thresholds exist across sources for one transition (~420, " +
    "500, 300, 94.3 rad/s). The DIRECTION is settled by the owner; the number is not, " +
    "and BeyMode deliberately has nowhere to put one.",
};
