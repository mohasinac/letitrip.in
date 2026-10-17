/**
 * Who is licensed, who is not, and which channels carry which risk.
 *
 * Sourced in docs/research/beyblade-authenticity-2026-10/README.md.
 *
 * 🛑 The LICENSED list is the load-bearing half. A buyer in India who sees
 * "Funskool" on a box and is told by a tool that it is not Takara Tomy would
 * reasonably conclude it is fake — and Funskool is a legitimate licensed
 * importer. Getting the allow-list wrong manufactures false positives against
 * real sellers, which is the failure mode this whole surface is built to avoid.
 */
import type { GenerationId } from "../types";

/** Manufacturers whose marque on a box is a positive signal. */
export const LICENSED_MANUFACTURERS: readonly string[] = [
  "Takara",
  "Takara Tomy",
  "Tomy",
  "TT",
  "Hasbro",
  "Sonokong",
];

/**
 * Regional importers and distributors. A box carrying one of these, or their
 * holographic sticker / certificate, is *more* likely authentic, not less.
 */
export const LICENSED_IMPORTERS: readonly { readonly name: string; readonly region: string }[] = [
  { name: "Funskool", region: "India" },
  { name: "Mani Limited", region: "Hong Kong" },
  { name: "Funbox Toys", region: "Taiwan" },
  { name: "Sheng Tai Toys", region: "Singapore" },
  { name: "NewBoy FZCO", region: "Middle East" },
  { name: "Bankee Trading", region: "Philippines" },
  { name: "PT Emway Globalindo", region: "Indonesia" },
];

export interface CounterfeitMarque {
  readonly name: string;
  /** Spellings seen in the wild, lower-cased for matching. */
  readonly aliases: readonly string[];
  readonly generations: readonly GenerationId[];
  readonly note: string;
  /** Lead or other toxic material specifically evidenced for this producer. */
  readonly toxicityEvidence: boolean;
}

/**
 * Named non-licensed producers. Matching one of these in a user's input is the
 * ONLY path to a `likely-reproduction` verdict on brand grounds — and even then
 * it is a statement about the brand on the box, not about the seller.
 */
export const COUNTERFEIT_MARQUES: readonly CounterfeitMarque[] = [
  {
    name: "Hongyi / Rapidity",
    aliases: ["hongyi", "rapidity", "top set rapidity", "rapidity top plate", "tktk", "tktk toys"],
    generations: ["mfb", "zerog", "burst"],
    note:
      "The most prominent Metal Fight counterfeiter. Always ships a fully die-cast Performance Tip, replaces rubber with plastic, and uses metal that stays bright instead of dulling. The name comes from the 'Top Set Rapidity' logo on the box. No longer active.",
    toxicityEvidence: true,
  },
  {
    name: "TT Hongli",
    aliases: ["hongli", "tt hongli"],
    generations: ["plastic", "hms"],
    note:
      "Original-generation counterfeiter whose packaging closely imitates Takara's, with its own logo and Chinese/English text replacing the Japanese. Lead has been evidenced in their products.",
    toxicityEvidence: true,
  },
  {
    name: "Flame",
    aliases: ["flame", "bursttop force", "beyb a dex", "beybadex"],
    generations: ["burst", "x"],
    note:
      "🛑 The hardest to spot. Flame's moulds are close to official and it often includes the correct parts — the differences are the logo and print quality. On a Flame suspicion, check the screws (tri-wing vs Phillips) rather than the box.",
    toxicityEvidence: true,
  },
  {
    name: "MQ Funny Toy",
    aliases: ["mq funny toy", "mq funny", "storm gyro burst", "beysuper x", "beysuper"],
    generations: ["burst", "x"],
    note:
      "Produces wrong-spin and wrong-part combinations — a right-spin Bloody Longinus, a right-spin Dread Bahamut, a Union Achilles shipped with 00Turn Destroy.",
    toxicityEvidence: false,
  },
  {
    name: "SB (S3)",
    aliases: ["sb", "s3", "sb toys"],
    generations: ["burst", "x"],
    note: "Burst and Beyblade X counterfeits, including fake Metal Coat beys.",
    toxicityEvidence: false,
  },
  {
    name: "Aoda",
    aliases: ["aoda"],
    generations: ["plastic", "hms"],
    note: "Produced counterfeit HMS packaging, specifically for Dragoon MS and Gaia Dragoon MS.",
    toxicityEvidence: false,
  },
  {
    name: "Auldey / Alpha Group",
    aliases: ["auldey", "alpha group"],
    generations: ["plastic"],
    note: "Original-generation producer.",
    toxicityEvidence: false,
  },
  {
    name: "A&L (Aoli Toys)",
    aliases: ["a&l", "aoli", "aoli toys"],
    generations: ["plastic"],
    note: "Original-generation producer; documented fake Dragoon V2 packaging.",
    toxicityEvidence: false,
  },
  {
    name: "YCF Toys / Battle Top X",
    aliases: ["ycf", "ycf toys", "battle top x"],
    generations: ["x"],
    note: "Beyblade X counterfeits.",
    toxicityEvidence: false,
  },
  {
    name: "GG",
    aliases: ["gg toys"],
    generations: ["mfb", "zerog"],
    note: "Metal Saga counterfeits.",
    toxicityEvidence: false,
  },
  {
    name: "Super Gyro",
    aliases: ["super gyro", "super combat gyro", "hurricane metal battle", "beypro"],
    generations: ["mfb", "zerog", "burst"],
    note: "Family of Metal-era counterfeit brands sold under several near-identical names.",
    toxicityEvidence: false,
  },
  {
    name: "Other named producers",
    aliases: [
      "top cyclone",
      "le xing",
      "xinlexin",
      "da zhong",
      "dexing",
      "tisey",
      "mdx",
      "lian fa",
      "tornado speed top",
      "cc toys",
      "bam",
      "fight top",
      "yd toys",
      "bex",
      "rotary top",
      "tornado burst",
      "trompo galaxia",
      "cndear",
      "sanctity",
      "gfive",
      "cheng fa",
      "yongchengfa",
      "w5",
      "3n",
    ],
    generations: ["plastic", "hms", "mfb", "zerog", "burst", "x"],
    note:
      "One of roughly forty named non-licensed producers recorded across the generations. Presence of the name is enough; the specific company matters less than the fact that it is not a licensed marque.",
    toxicityEvidence: false,
  },
];

/**
 * 🛑 A seller's own house brand is the pattern in this market, and it is NOT
 * covered by the list above.
 *
 * Measured for this project: a counterfeit catalogue of 1,277 products made
 * **zero** authenticity claims — not even false ones — and instead led 97.7% of
 * its titles with its own brand name, describing itself as an "aftermarket
 * brand" offering "custom parts or upgraded components". So the question a buyer
 * needs answered is not "does it say fake" but "whose marque is this, and is
 * that marque licensed".
 */
export const AFTERMARKET_FRAMING_NOTE =
  "Sellers of unlicensed tops in this market rarely claim to be originals. They sell as their own brand — 'aftermarket', 'custom', 'upgraded components', 'limited edition'. That framing is not a grey area: if the marque on the box is not Takara Tomy, Hasbro, Sonokong or a licensed regional importer, it is an unlicensed product whatever it is called.";

/** Channel-level risk, India first since that is this marketplace's market. */
export const CHANNEL_NOTES: readonly { readonly channel: string; readonly note: string }[] = [
  {
    channel: "Listings with no packaging photo",
    note:
      "Most checkable signals are on the box. For a current-production item, ask for the box bottom and the screws before paying.",
  },
  {
    channel: "OLX and Facebook Marketplace",
    note:
      "Flagged in the India-specific guidance as almost always either inflated or counterfeit, because sellers carry no reputation. Ask for disassembled photos of every part, from both sides.",
  },
  {
    channel: "AliExpress and Alibaba",
    note: "Named as the source channel for Beyblade X knockoffs.",
  },
  {
    channel: "A seller who will not send more photos",
    note:
      "Reluctance to provide extra photos or a video is itself one of the listed red flags — a genuine item has nothing to hide at close range.",
  },
];

/** Normalised membership test for the licensed set. */
export function isLicensedMarque(raw: string): boolean {
  const n = raw.trim().toLowerCase();
  if (!n) return false;
  return (
    LICENSED_MANUFACTURERS.some((m) => m.toLowerCase() === n || n.includes(m.toLowerCase())) ||
    LICENSED_IMPORTERS.some((i) => n.includes(i.name.toLowerCase()))
  );
}

/** Find a named counterfeit producer in free text. */
export function findCounterfeitMarque(raw: string): CounterfeitMarque | null {
  const n = raw.trim().toLowerCase();
  if (!n) return null;
  for (const m of COUNTERFEIT_MARQUES) {
    for (const alias of m.aliases) {
      /*
       * Word-boundary match, not `includes`. "sb" and "gg" and "w5" are short
       * enough that a substring test would fire on ordinary words — "sb" is
       * inside "frisbee" — and a false counterfeit call is the one output this
       * module must never produce by accident.
       */
      const re = new RegExp(`(^|[^a-z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`);
      if (re.test(n)) return m;
    }
  }
  return null;
}
