/**
 * HAND-AUTHORED bey modes. One entry per bey, written after reading the case.
 *
 * ── 🛑 WHY THIS IS A HAND-WRITTEN MAP AND NOT AN EXTRACTOR ────────────────
 *
 * The plan's item 3b measured the sourcing and it still holds: the wiki carries
 * ZERO mode data (0 `Modes=` fields across 2,248 part pages and 2,011 bey
 * pages), while the local case-study corpus mentions modes 1,290 times. So the
 * corpus is the only source — and it is analytical PROSE with ASCII diagrams,
 * not a table. `scripts/extract-case-study-modes.mjs` finds the CANDIDATES;
 * turning one into a claim is reading, which is why this file is authored.
 *
 * ── 🛑 WHAT THE MEASUREMENT ACTUALLY SAID, AND WHY COVERAGE IS 4 ──────────
 *
 *   cases carrying mode content ....................... 163
 *   candidate beys after excluding special moves ...... 147
 *   of those, resolving to a real bey in our data ..... 12
 *   minus 1 contested + 1 "Structural Failure Mode" ... 10
 *   authored here, after reading the passage ..........  4
 *
 * **135 of the 147 do not resolve because they are not beys.** They are
 * PART-level analyses — "Metal Wheel Compliance", "Energy Ring as
 * Contact-Point Override", "Fusion Wheel + Energy Ring as a Composite Contact
 * System". That is a real structural finding rather than a join failure: the
 * corpus's mode content is mostly about PARTS, so most of it belongs on
 * `partGlossary` and not here. It is left unmodelled rather than forced into
 * the wrong collection.
 *
 * ── 🛑 THE ONE CONTESTED BEY IS EXCLUDED, AND THE REASON IS NOT MARGINAL ──
 *
 * **Cosmic Pegasus F:D is documented twice and the two cases describe the
 * transition in OPPOSITE DIRECTIONS:**
 *
 *   Case 809  : wide flat RUBBER (r 3-9 mm, mu 0.40) -> central BEARING
 *               (r 1.5 mm, mu 0.010). Attack -> stamina. Trigger ~420 rad/s.
 *   Case 1824 : sharp inner POINT (r 1.5 mm) -> flat rubber OUTER ring
 *               (r 10 mm). Stamina -> attack. Trigger 500 rad/s, and 300 rad/s
 *               in that same section's own worked example.
 *
 * A third threshold (94.3 rad/s) is quoted in the plan. The wheel mass
 * disagrees (43.5 g vs 32.0 g) and so does the product code (BB-105 vs
 * BB-113). Picking one account would publish a coin flip as a fact.
 *
 * 🛑 Do NOT "fill the gap" for F:D later without resolving the contradiction
 * against a primary source. The gap is a decision, not an oversight.
 *
 * For contrast — and because it is the reason not to write the whole corpus
 * off — total assembly MASS is 95% self-consistent here: 72 of 76 beys
 * documented more than once agree exactly. The mode prose specifically is what
 * cannot be verified at scale.
 *
 * ── 🛑 NO THRESHOLDS, AND NO ANIME ───────────────────────────────────────
 *
 * `BeyMode` is `{ name, behaviour, trigger, sourceCase }` with no numeric
 * field, because every threshold cross-checked disagreed. A field that does
 * not exist cannot be filled with a contested value by someone who assumes the
 * absence was an oversight.
 *
 * And a SPECIAL MOVE IS NOT A MODE. The corpus's `[SPECIAL MOVE]` cases are
 * anime finishers carrying game-engine values — Case 654's "Armageddon" is a
 * 200 px proximity-damage field with phase timings, not a configuration of a
 * physical top. Six were excluded by the extractor. **Wyborg (Case 1889) was
 * excluded HERE for the same reason even though it resolved**: the corpus says
 * its blade base "switches to HF attack mode for Sand Bind execution", which
 * is a character's special move, so there is no mechanism to state.
 *
 * `sourceCase` travels with every mode. A claim whose derivation nobody can
 * find is a claim nobody can correct.
 *
 * @tag domain:beys
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — a data table
 */

/**
 * `beySlug -> BeyMode[]`. Every key was checked against the 1,988 seeded bey
 * slugs before being written here; a key that does not resolve is a hard error
 * in `generate-beys-seed.mjs` rather than a silently ignored row.
 *
 * 🛑 Two beys were READ and deliberately NOT authored because our own data
 * could not confirm their identity: the corpus's "Mad Gasher CH120FS" and
 * "Heat Salamander 12 Operate" have no matching slug, and the nearest
 * candidates (`mad-cancer-ch120fs`, and nothing for Salamander) would rely on
 * my own recall of the Hasbro renames — which no `aka` field in our 1,988 rows
 * corroborates. Both are left out rather than mapped on memory.
 */
export const AUTHORED_BEY_MODES = {
  /*
   * Case 1836. D:D is "Duo:Dual" — a spin track and performance tip
   * integrated into one piece (which is why `integratedRoles` on it is
   * `["track","tip"]`), and its defining feature is that the spin DIRECTION is
   * set by the owner rather than fixed by the part.
   *
   * The corpus attributes the left-spin setting to a special move ("Sword of
   * Ares"); the SETTING itself is a physical property of the track, so the
   * trigger is stated as the selection and the move is not mentioned.
   */
  "variares-d-d": [
    {
      name: "Right-spin",
      behaviour:
        "The standard configuration. Spins clockwise, so it meets the great majority of " +
        "Beyblades in the same direction and trades spin normally on contact.",
      trigger: "Set on the D:D track before launch.",
      sourceCase: 1836,
    },
    {
      name: "Left-spin",
      behaviour:
        "Spins anticlockwise. Against a right-spin opponent the two meet in opposition, " +
        "which raises the force of every exchange and can take spin off the opponent " +
        "rather than losing it.",
      trigger: "Set on the D:D track before launch.",
      sourceCase: 1836,
    },
  ],

  /*
   * Case 678. The B:D bottom's spring releases the outer bearing cage, which
   * drops the effective contact radius from 14 mm to 4 mm. The transition is
   * PASSIVE — it happens as spin falls, with no input — which is the
   * distinction the schema's `trigger` field exists to carry.
   */
  "phantom-orion-b-d": [
    {
      name: "Attack orbit",
      behaviour:
        "Runs on the outer bearing, giving a wide sweeping orbit around the stadium and " +
        "an aggressive approach. The broad contact costs spin quickly.",
      trigger: "The starting state at launch.",
      sourceCase: 678,
    },
    {
      name: "Stamina",
      behaviour:
        "Settles to a centred spin on a much smaller contact point, cutting friction " +
        "sharply and extending how long it keeps spinning.",
      trigger:
        "Changes by itself as spin falls — an internal spring releases the bearing cage. " +
        "There is nothing for the owner to do.",
      sourceCase: 678,
    },
  ],

  /*
   * Case 690. SW145 is "Switch 145": three wings that mount either way round.
   * Both faces are described in the source — rounded backs forward is
   * "deflection geometry", the pointed faces are "smash geometry" — so both
   * modes are stated rather than one being inferred from the word "reversible".
   */
  "ninja-salamander-sw145sd": [
    {
      name: "Defense",
      behaviour:
        "The wings sit rounded-side forward, so a hit is spread along a curve and " +
        "glances away instead of landing square. Little of the force comes back as recoil.",
      trigger: "Mount the SW145 wings rounded-side forward before launch.",
      sourceCase: 690,
    },
    {
      name: "Attack",
      behaviour:
        "The wings are reversed so the pointed faces lead, concentrating a hit at a " +
        "point rather than spreading it.",
      trigger: "Reverse the SW145 wings before launch.",
      sourceCase: 690,
    },
  ],

  /*
   * Case 1842. The TB ("Tip Ball") tip is a hard plastic ball around a
   * flat-topped cylinder core. 🛑 The trigger here is neither a setting nor
   * spin decay — it is what the tip is running ON, which is why the field is
   * free text and not an enum: a three-value enum would have forced this into
   * the wrong one.
   */
  "bandit-genbu-f230tb": [
    {
      name: "Ball contact",
      behaviour:
        "On a smooth floor the tip rides on the ball, which keeps friction low and holds " +
        "spin for a long time.",
      trigger: "Running on a smooth surface.",
      sourceCase: 1842,
    },
    {
      name: "Cylinder rim contact",
      behaviour:
        "Tipped over onto the rim of the inner cylinder, the contact grips far harder and " +
        "drives the top around the stadium instead of letting it sit.",
      trigger: "Tipping onto the rim on a rough or angled surface.",
      sourceCase: 1842,
    },
  ],
};

/** Beys deliberately left without modes, and why. Reported by the generator. */
export const MODES_WITHHELD = {
  "cosmic-pegasus-f-d":
    "Cases 809 and 1824 describe the F:D transition in opposite directions, with three " +
    "thresholds across them and the plan, plus disagreeing wheel mass and product code.",
  wyborg:
    "The source gives only an anime special move (\"Sand Bind\") as the trigger, so there " +
    "is no mechanism to state.",
  "master-dranzer":
    "Its only mode heading is \"Structural Failure Mode\" — a way of breaking, not a " +
    "configuration.",
  "mad-cancer-ch120fs":
    "The corpus documents \"Mad Gasher CH120FS\" (Case 1958) and no aka field in our 1,988 " +
    "rows corroborates Gasher = Cancer, so the identity rests on recall alone.",
};
