/**
 * Per-generation authenticity knowledge.
 *
 * Every entry is sourced in docs/research/beyblade-authenticity-2026-10/README.md.
 * 🛑 If you cannot point at a source there, do not add it here — the whole value
 * of this surface is that it does not overclaim.
 *
 * 🛑 Three retailer claims are DELIBERATELY ABSENT and must not be added without
 * a community source: a "Takara Tomy official verification portal" that QR codes
 * resolve against, micro-engraved batch codes shaped `X24A-087`, and a universal
 * holographic authenticity sticker. All three come from a single retailer blog
 * with a commercial interest and are corroborated by nothing.
 */
import type { GenerationId, ManualCheck } from "../types";

/** Named once: it appears in three generations' producer lists. */
const HONGYI = "Hongyi (Rapidity)";

export interface GenerationInfo {
  readonly id: GenerationId;
  readonly label: string;
  /** Buyer-facing years. */
  readonly years: string;
  /** Retail product-code prefixes, used to infer the generation from a code. */
  readonly codePrefixes: readonly string[];
  /** Licensed marques that legitimately appear on this generation. */
  readonly licensedMarques: readonly string[];
  /** The category this generation maps to, so results link into the taxonomy. */
  readonly categoryId: string;
  /** Whether a box DATE code (letter + 4 digits) has a known decoding here. */
  readonly hasKnownDateCodeTable: boolean;
  /** Named non-licensed producers targeting this generation. */
  readonly knownCounterfeitProducers: readonly string[];
  readonly checks: readonly ManualCheck[];
}

/**
 * Checks that apply regardless of generation. Kept separate so the UI can show
 * "always worth checking" distinctly from "specific to this generation" — a
 * buyer who was told "aftermarket" needs the universal list most.
 */
export const UNIVERSAL_CHECKS: readonly ManualCheck[] = [
  {
    id: "marque-on-box",
    label: "A licensed marque is printed on the box",
    detail:
      "Takara Tomy, Hasbro, Sonokong or Funskool. If there is no manufacturer logo at all, or a different company's logo sits where one should be, it is not a licensed release.",
    decisive: true,
  },
  {
    id: "barcode",
    label: "A UPC/JAN barcode with readable digits underneath",
    detail:
      "Counterfeit packaging often has no barcode, or a blurry one with no numbers printed beneath the stripes.",
    decisive: false,
  },
  {
    id: "manufacturer-contact",
    label: "Manufacturer contact details on the packaging",
    detail:
      "Licensed releases carry a company address and phone number. Counterfeit boxes generally carry none.",
    decisive: false,
  },
  {
    id: "print-quality",
    label: "Print quality and spelling on the box",
    detail:
      "Blurry or faded images, art in odd places, and poor English are consistent counterfeit tells. So is a mangled product name — evasion spellings measured on one counterfeit catalogue include Scythee, Jupitar, Fireblase, Orian', Cosmec' and Libraa', often with a trailing apostrophe or a digit swapped for a letter. 🛑 But check the official spelling before calling one wrong: Takara Tomy romanises the Pegasis line as \"Pegasis\" while Hasbro prints \"Pegasus\", so both are genuine and neither is a tell on its own.",
    decisive: false,
  },
  {
    id: "rubber-parts",
    label: "Rubber parts are actually rubber",
    detail:
      "Rubber is the most commonly substituted material: a rubber tip rendered in hard plastic, or omitted entirely, is one of the strongest signals across every generation.",
    decisive: false,
  },
  {
    id: "loose-current-product",
    label: "Packaging is included, for anything currently in production",
    detail:
      "A loose or 'single' listing of a current product is higher-risk simply because the box is where most of the checkable signals live. For a genuinely vintage item, loose is normal and not a red flag.",
    decisive: false,
  },
  {
    id: "price-band",
    label: "The price is inside the realised-price band",
    detail:
      "A counterfeit catalogue measured for this site had a median price of about ₹419 against ₹1,599 for the legitimate equivalent, and 12.9× on one head-to-head SKU. A price far under the band is the pitch, not a bargain.",
    decisive: false,
  },
];

export const GENERATIONS: readonly GenerationInfo[] = [
  {
    id: "plastic",
    label: "Original / plastic generation",
    years: "1999–2003",
    codePrefixes: ["A-"],
    licensedMarques: ["Takara", "Hasbro"],
    categoryId: "category-beyblade-original",
    hasKnownDateCodeTable: false,
    knownCounterfeitProducers: [
      "TT Hongli",
      "Auldey (Alpha Group)",
      "Top Cyclone",
      "Le Xing",
      "Xinlexin",
      "Da Zhong",
      "DeXing",
      "A&L (Aoli Toys)",
      "Aoda",
    ],
    checks: [
      {
        id: "plastic-takara-copyright",
        label: "Takara copyright text moulded into the parts",
        detail:
          "Look underneath the Attack Ring and along the edge of the Blade Base. Licensed parts carry moulded copyright and part markings; counterfeits typically omit them.",
        decisive: true,
      },
      {
        id: "plastic-explosive-weight-disk",
        label: "🛑 An unusually large, round Weight Disk — do not spin it",
        detail:
          "Some counterfeit Bakuten-era beys used a Weight Disk containing a thin layer of Armstrong's mixture, a sensitive explosive, so the bey threw sparks on impact. This is the most serious safety finding in the research. If a vintage bey has an oversized round disk you cannot identify, do not battle it.",
        decisive: false,
      },
      {
        id: "plastic-thin-parts",
        label: "Part thickness and metal quality",
        detail:
          "TT Hongli's moulds produce weak, thin plastic and inferior metal, and lead has been found in their products.",
        decisive: false,
      },
    ],
  },
  {
    id: "hms",
    label: "HMS (Hard Metal System)",
    years: "2003–2005",
    codePrefixes: ["MA-"],
    licensedMarques: ["Takara", "Hasbro"],
    categoryId: "category-beyblade-original",
    hasKnownDateCodeTable: false,
    knownCounterfeitProducers: ["Aoda", "TT Hongli"],
    checks: [
      {
        id: "hms-takara-markings",
        label: "Takara markings on the metal and the base",
        detail:
          "HMS parts carry moulded manufacturer markings in the same way plastic-generation parts do. Aoda produced counterfeit HMS packaging for Dragoon MS and Gaia Dragoon MS specifically.",
        decisive: true,
      },
      {
        id: "hms-weight",
        label: "Weight against the published spec",
        detail:
          "HMS is the highest-value tier of the original generation, so it is worth weighing. Counterfeits run light because the alloy differs.",
        decisive: false,
      },
    ],
  },
  {
    id: "mfb",
    label: "Metal Fight (Metal Fusion / Masters / Fury)",
    years: "2008–2012",
    codePrefixes: ["BB-"],
    licensedMarques: ["Takara Tomy", "Hasbro", "Sonokong"],
    categoryId: "category-beyblade-metal",
    hasKnownDateCodeTable: true,
    knownCounterfeitProducers: [
      HONGYI,
      "TKTK TOYS",
      "Tisey",
      "GG",
      "CC Toys",
      "MDX",
      "Lian Fa Toys (Tornado Speed Top)",
      "PK",
      "BAM",
      "Super Combat Gyro",
      "Hurricane Metal Battle",
      "BeyPro",
      "Super Gyro",
      "Fight Top (YD Toys)",
    ],
    checks: [
      {
        id: "mfb-diecast-tip",
        label: "The Performance Tip is not fully die-cast metal",
        detail:
          "Rapidity beys always include a completely die-cast metal Performance Tip. No licensed release does. This is the single most reliable Metal Fight tell.",
        decisive: true,
      },
      {
        id: "mfb-rubber-substitution",
        label: "Rubber tips are present and are rubber",
        detail:
          "Rapidity substitutes systematically: a Storm Pegasis 105RF shipped with a plain Flat instead of the Rubber Flat, and a Big Bang Pegasis F:D with the Final Drive's rubber replaced by plastic.",
        decisive: true,
      },
      {
        id: "mfb-shine",
        label: "Metal that dulls with age rather than staying bright",
        detail:
          "Counterfeit Fusion Wheels are shinier than the originals and do not dull, because the alloy is different. Over-bright metal on an item sold as a decade-old bey is a concern.",
        decisive: false,
      },
      {
        id: "mfb-jagged-edges",
        label: "Clean mould edges on the Fusion Wheel",
        detail:
          "Midfake and counterfeit wheels show jagged edges and poorly cut detailing from low-quality moulding.",
        decisive: false,
      },
      {
        id: "mfb-box-code",
        label: "The code on the bottom of the box",
        detail:
          "A letter followed by four digits. Check it against the known-original and midfake tables above — but a code that merely exists proves nothing, because counterfeit sellers print real codes.",
        decisive: false,
      },
      {
        id: "mfb-ldrago-screw",
        label: "On L-Drago Destroy F:S — the screw in the tip",
        detail:
          "Reported on the reference post: the original uses a screw with a triangular hole, the fake does not.",
        decisive: false,
      },
      {
        id: "mfb-spin-direction",
        label: "Spin direction matches the model",
        detail:
          "A right-spin Meteo L-Drago is conclusive: that model is left-spin, and no licensed right-spin version exists.",
        decisive: true,
      },
    ],
  },
  {
    id: "zerog",
    label: "Zero-G / Shogun Steel",
    years: "2012–2013",
    codePrefixes: ["BBG-"],
    licensedMarques: ["Takara Tomy", "Hasbro"],
    categoryId: "category-beyblade-metal",
    hasKnownDateCodeTable: true,
    knownCounterfeitProducers: [HONGYI, "GG", "Super Gyro"],
    checks: [
      {
        id: "zerog-box-code",
        label: "The code on the bottom of the box",
        detail:
          "Zero-G shares the Metal Fight box-code format, and the A0813 midfake family is explicitly recorded as covering Shogun Steel beys.",
        decisive: false,
      },
      {
        id: "zerog-diecast-tip",
        label: "The Performance Tip is not fully die-cast metal",
        detail: "Same Rapidity substitution pattern as Metal Fight.",
        decisive: true,
      },
    ],
  },
  {
    id: "burst",
    label: "Burst",
    years: "2015–2023",
    codePrefixes: ["B-"],
    licensedMarques: ["Takara Tomy", "Hasbro"],
    categoryId: "category-beyblade-burst",
    hasKnownDateCodeTable: false,
    knownCounterfeitProducers: [
      "Flame (BurstTop Force)",
      HONGYI,
      "MQ Funny Toy (Storm Gyro Burst)",
      "SB (S3)",
      "W5",
      "TD",
      "GFive",
      "Cheng Fa (Yongchengfa)",
      "BEX",
      "Rotary Top",
      "Tornado Burst",
      "Trompo Galaxia",
      "3N",
      "CNDEAR",
      "YD Toys",
      "BY",
      "Sanctity",
      "Super Power",
    ],
    checks: [
      {
        id: "burst-tri-wing",
        label: "Tri-wing screws, not Phillips",
        detail:
          "Authentic Burst beys use tri-wing screws (a three-line head). Counterfeits almost always use a standard Phillips cross. This is the most widely corroborated Burst tell.",
        decisive: true,
      },
      {
        id: "burst-spin-direction",
        label: "Spin direction matches the model",
        detail:
          "A left-spin Xeno Xcalibur Magnum Impact is conclusive — no licensed left-spin version exists.",
        decisive: true,
      },
      {
        id: "burst-parts-exist",
        label: "Every part is one that actually ships with the product",
        detail:
          "Counterfeits mix parts freely — a documented fake Union Achilles shipped with 00Turn Destroy, and right-spin versions of left-spin Bloody Longinus and Dread Bahamut exist. Parts that appear in no official release are a strong signal.",
        decisive: false,
      },
      {
        id: "burst-flame-packaging",
        label: "🛑 Do not rely on packaging alone here",
        detail:
          "Flame imitates Takara Tomy packaging closely and often includes the correct parts; the differences are the company logo and print quality. On Burst specifically, open it up and check the screws.",
        decisive: false,
      },
      {
        id: "burst-regional-qr",
        label: "A missing QR code is not automatically a fake",
        detail:
          "Legitimate South-East Asia and WBBA Takara Tomy releases ship without the app QR code, and SEA layers have no NFC chip. Treat a missing QR as a question about the region, not proof of a counterfeit.",
        decisive: false,
      },
    ],
  },
  {
    id: "x",
    label: "Beyblade X",
    years: "2023–present",
    codePrefixes: ["BX-", "UX-", "CX-"],
    licensedMarques: ["Takara Tomy", "Hasbro"],
    categoryId: "category-beyblade-x",
    hasKnownDateCodeTable: false,
    knownCounterfeitProducers: [
      "Flame (Beyb A Dex)",
      "MQ Funny Toy (Beysuper X)",
      "SB (S3)",
      "YCF Toys (Battle Top X)",
      "BEYSUPER",
    ],
    checks: [
      {
        id: "x-gear-chip-logo",
        label: 'The "BEYBLADE X" logo is on the Gear Chip',
        detail:
          "Authentic blades carry the Beyblade X logo on the Gear Chip. Counterfeits put their own company name or the product code there, or leave it blank — a documented fake Cobalt Drake does exactly this.",
        decisive: true,
      },
      {
        id: "x-rivets-screws",
        label: "Rivets and tri-wing screws",
        detail: "Authentic X blades use rivets and tri-wing screws; counterfeits use Phillips screws.",
        decisive: true,
      },
      {
        id: "x-bit-metal-pin",
        label: "The Bit has a metal pin",
        detail: "Authentic Bits contain a metal pin. Counterfeit Bits do not.",
        decisive: true,
      },
      {
        id: "x-ratchet-teeth",
        label: "Ratchet tooth design matches the official part",
        detail:
          "Some counterfeit ratchets carry modified designs that differ from the authentic ones, and tolerances where the Ratchet and Bit click in are looser.",
        decisive: false,
      },
      {
        id: "x-invented-sku",
        label: "No invented SKU suffix",
        detail:
          "Takara Tomy does not issue -00 retail SKUs or colour suffixes. Measured on a counterfeit catalogue: BB108gold, BB98blue, 'BX-00 shark', 'bx- white 00-20'.",
        decisive: false,
      },
    ],
  },
];

export const GENERATION_BY_ID: Readonly<Record<GenerationId, GenerationInfo>> = Object.freeze(
  Object.fromEntries(GENERATIONS.map((g) => [g.id, g])) as Record<GenerationId, GenerationInfo>,
);
