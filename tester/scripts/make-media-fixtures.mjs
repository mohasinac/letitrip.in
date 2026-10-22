#!/usr/bin/env node
/*
 * Generate the media upload fixtures into public/test-media/.
 *
 * Usage (from the consumer repo root):
 *   node tester/scripts/make-media-fixtures.mjs
 *   node tester/scripts/make-media-fixtures.mjs --with-oversized   # the >10MB one
 *   node tester/scripts/make-media-fixtures.mjs --verify           # check, write nothing
 *
 * Exit: 0 all fixtures valid, 1 a fixture failed verification.
 *
 * 🛑 EVERY FIXTURE IS A LOCAL FILE. NO REMOTE URLS, EVER.
 *
 * A case that points at an image hosted somewhere else depends on a third party
 * being up and unchanged, and a red result then says nothing about this app.
 * These bytes are generated here, deterministically, and committed.
 *
 * 🛑 AND EVERY FIXTURE IS VERIFIED WITH THE SERVER'S OWN DETECTOR.
 *
 * `/api/media/finalize` runs `fileTypeFromBuffer` and returns 422 MIME_MISMATCH
 * when the magic bytes disagree with the declared type. A fixture whose bytes are
 * subtly wrong would therefore be testing the rejection path while its NAME says
 * happy path — the test passes, in the sense that something is refused, and the
 * upload path it was meant to cover is never exercised. So each fixture is run
 * through the same library and the expected detection is asserted here, where the
 * failure is legible, rather than discovered as a puzzling 422 during a run.
 *
 * The two deliberate mismatches assert their mismatch just as explicitly.
 */

import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { fileTypeFromBuffer } from "file-type";

import { flag } from "./lib/firestore.mjs";

const REPO_ROOT = process.cwd();
const DIR = resolve(REPO_ROOT, "public/test-media");
const VERIFY_ONLY = flag("verify") === true;
const WITH_OVERSIZED = flag("with-oversized") === true;

/**
 * The REAL caps, read from the shared limits module rather than restated.
 *
 * The plan for this work assumed 25MB for images and 10MB for PDFs; both are
 * wrong (10MB and 20MB). A fixture built to a remembered cap either fails to
 * trip the limit it exists to trip, or trips one it was not testing.
 */
const limits = readFileSync(resolve(REPO_ROOT, "appkit/src/_internal/shared/media/limits.ts"), "utf8");
const capOf = (name) => {
  // The caps are written as `10 * MEGABYTE`, so the unit has to be resolved too.
  // Substituting only the identifiers that appear in the file — rather than
  // assuming a value for MEGABYTE — keeps this honest if the unit is ever renamed:
  // the lookup fails loudly instead of silently producing a fixture sized in bytes.
  const unit = limits.match(/\bMEGABYTE\s*=\s*([0-9_*\s]+);/);
  const m = limits.match(new RegExp(`\\b${name}\\s*=\\s*([0-9_*\\sA-Z]+);`));
  if (!m || !unit) throw new Error(`Could not read ${name} from limits.ts — the fixture sizes would be guesses.`);
  const expr = m[1].replace(/\bMEGABYTE\b/g, `(${unit[1].replace(/_/g, "")})`).replace(/_/g, "");
  if (/[a-zA-Z]/.test(expr)) throw new Error(`${name} resolves to "${expr}", which is not arithmetic — resolve its identifiers here.`);
  // eslint-disable-next-line no-new-func -- a numeric expression from our own source, asserted above
  return Number(new Function(`return ${expr}`)());
};
const MAX_IMAGE_BYTES = capOf("MAX_IMAGE_BYTES");

/* ── A real PNG encoder, because zlib is the only codec we have ───────────── */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/**
 * @param {(x:number,y:number)=>[number,number,number]} pixel
 * @param {number} level zlib level — 0 makes the output INCOMPRESSIBLE, which is
 *   how the oversized fixture reaches >10MB without a 10MB pixel buffer.
 */
function png(width, height, pixel, level = 9) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  const raw = Buffer.alloc(height * (1 + width * 3));
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * Obviously a fixture at a glance — public/ is served, so these are reachable by
 * anyone and must not be mistakable for real product media. Magenta/cyan
 * checkerboard with a solid border: no photograph looks like this.
 */
const fixtureLook = (x, y) => {
  const border = x < 4 || y < 4 || x > 251 || y > 123;
  if (border) return [17, 17, 17];
  return ((x >> 4) + (y >> 4)) % 2 ? [236, 72, 153] : [34, 211, 238];
};

/* ── Fixtures that cannot be synthesised from zlib ────────────────────────── */

/*
 * Minimal valid files, embedded as base64 rather than downloaded.
 *
 * JPEG and WebP have no encoder in the Node standard library, and a remote fetch
 * is forbidden above. Each is a canonical 1×1 file; the assertion below is what
 * makes embedding them safe — if a byte were wrong, `fileTypeFromBuffer` would
 * disagree with the expectation and this script fails rather than shipping a
 * fixture that quietly tests the 422 path instead.
 */
const JPEG_1PX =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a" +
  "HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAA" +
  "AAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==";

const WEBP_1PX = "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";

/** A hand-written, structurally complete one-page PDF. Text, so it is reviewable. */
function pdf() {
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 100] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    null, // stream, built below
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  const stream = "BT /F1 12 Tf 12 56 Td (LetItRip QA fixture) Tj 0 -18 Td (not a real document) Tj ET";
  objs[3] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;

  let out = "%PDF-1.4\n";
  const offsets = [];
  objs.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) out += `${String(off).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "ascii");
}

/* ── The set ──────────────────────────────────────────────────────────────── */

/**
 * Committed, never generated — and that is a different kind of fixture.
 *
 * Node has no video encoder, and a hand-rolled container that merely satisfies
 * `fileTypeFromBuffer` would pass the detection check while failing to PLAY, so the
 * "preview renders" case would go red for a reason that is not a bug in this app.
 *
 * Downloaded ONCE from MDN's CC0 sample set
 * (interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4) and committed.
 * The committed bytes are the fixture; that URL is provenance, not a dependency —
 * nothing fetches it at runtime, which is the whole no-remote-URL rule.
 *
 * The sha is pinned because this file cannot be rebuilt if it is corrupted: unlike
 * every other entry, `--verify` is the ONLY thing standing between a mangled video
 * and a puzzling failure months later. Git's autocrlf is the realistic threat, and
 * public/test-media/.gitattributes marks the directory `-text` for that reason.
 */
const COMMITTED = [
  {
    name: "sample-video.mp4",
    why: "happy path — video upload, poster frame, and the theater-mode player",
    expect: "video/mp4",
    sha256: "0cd83d944a6ca782",
  },
];

/*
 * Two more PNGs that are VISUALLY distinct from sample-image.png and from each
 * other, for the gallery-ordering and slot-collision cases.
 *
 * They have to be tellable apart by eye: those cases ask the tester to drag the
 * third thumbnail to first and confirm the order survived, and to confirm the
 * main image and the first gallery image are not the same picture. Three
 * identical-looking checkerboards would make both unanswerable — the same defect
 * as a case citing a fixture that does not exist, one step subtler.
 */
const fixtureLookAmber = (x, y) => {
  const border = x < 4 || y < 4 || x > 251 || y > 123;
  if (border) return [17, 17, 17];
  return ((x >> 4) + (y >> 4)) % 2 ? [245, 158, 11] : [30, 41, 59];
};
const fixtureLookLime = (x, y) => {
  const border = x < 4 || y < 4 || x > 251 || y > 123;
  if (border) return [17, 17, 17];
  // Diagonal bands rather than a checkerboard, so it differs in PATTERN as well
  // as colour — a colour-blind reader can still tell the three apart.
  return ((x + y) >> 4) % 2 ? [132, 204, 22] : [15, 23, 42];
};

/*
 * An SVG, for the disallowed-type case.
 *
 * SVG is deliberately absent from ALLOWED_IMAGE_MIMES (limits.ts): it is a
 * document format that can carry script, and this app serves uploads from its
 * own origin. `fileTypeFromBuffer` does not report a type for SVG at all, which
 * is why `expect` is null below — the same shape as the other rejection
 * fixtures.
 */
const SVG_FIXTURE = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="128" viewBox="0 0 256 128">
  <rect width="256" height="128" fill="#7c3aed"/>
  <circle cx="128" cy="64" r="40" fill="#fbbf24"/>
  <text x="128" y="70" font-family="sans-serif" font-size="16" fill="#111" text-anchor="middle">TEST SVG</text>
</svg>
`;

const FIXTURES = [
  {
    name: "sample-image.png",
    why: "happy path — PNG upload and preview",
    build: () => png(256, 128, fixtureLook),
    expect: "image/png",
  },
  {
    name: "sample-image-2.png",
    why: "gallery ordering / slot collision — must be visually distinct from sample-image.png",
    build: () => png(256, 128, fixtureLookAmber),
    expect: "image/png",
  },
  {
    name: "sample-image-3.png",
    why: "gallery ordering — a third distinct image, different in pattern as well as colour",
    build: () => png(256, 128, fixtureLookLime),
    expect: "image/png",
  },
  {
    name: "sample-vector.svg",
    why: "rejection — SVG is outside the allowed image types (a document format that can carry script)",
    build: () => Buffer.from(SVG_FIXTURE, "utf8"),
    expect: null,
  },
  {
    name: "sample-image.jpg",
    why: "happy path — JPEG, the format most product photos arrive as",
    build: () => Buffer.from(JPEG_1PX, "base64"),
    expect: "image/jpeg",
  },
  {
    name: "sample-image.webp",
    why: "happy path — WebP, which the media proxy converts to",
    build: () => Buffer.from(WEBP_1PX, "base64"),
    expect: "image/webp",
  },
  {
    name: "sample-doc.pdf",
    why: "happy path — the PDF branch (invoices, payout docs, shipping proofs)",
    build: pdf,
    expect: "application/pdf",
  },
  {
    /*
     * The fixture the magic-byte check exists for. Its bytes are UTF-8 text and
     * its name claims PNG, so `/api/media/finalize` must answer 422 MIME_MISMATCH
     * — not accept it, and not fail with a generic 500.
     */
    name: "not-really-an-image.png",
    why: "rejection — declared PNG, actually text; must return 422 MIME_MISMATCH",
    build: () => Buffer.from("This is not a PNG. If you can see this rendered as an image, the magic-byte check did not run.\n", "utf8"),
    expect: null, // fileTypeFromBuffer must NOT recognise it
  },
  {
    /*
     * Zero bytes is its own case: it is not a mismatch, there is nothing to
     * detect, and the failure has historically been a stack trace rather than a
     * message a person can act on.
     */
    name: "empty.png",
    why: "rejection — zero-length file; must fail with a readable message, not a stack trace",
    build: () => Buffer.alloc(0),
    expect: null,
  },
];

const OVERSIZED = {
  name: "oversized.png",
  why: `rejection — larger than the ${(MAX_IMAGE_BYTES / 1024 / 1024).toFixed(0)}MB image cap`,
  /*
   * Deliberately NOT committed, and generated only on request.
   *
   * It is >10MB of intentionally incompressible noise; committing that to git to
   * assert a size check is a poor trade, and it is reproducible in a second. The
   * no-remote-URL rule is about not depending on a third party — a file this
   * script generates locally satisfies it completely. .gitignore excludes it.
   */
  build: () => {
    const px = Math.ceil(Math.sqrt(MAX_IMAGE_BYTES / 3)) + 64;
    let seed = 0x2f6e2b1;
    return png(px, px, () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return [seed & 0xff, (seed >> 8) & 0xff, (seed >> 16) & 0xff];
    }, 0);
  },
  expect: "image/png",
  minBytes: MAX_IMAGE_BYTES + 1,
};

mkdirSync(DIR, { recursive: true });

let failed = 0;
const rows = [];

// Checked on every run, generated on none — a committed fixture has no build step,
// so verification is the only thing that can notice it has been damaged.
for (const f of COMMITTED) {
  const path = resolve(DIR, f.name);
  if (!existsSync(path)) {
    console.error(`  ✗ ${f.name} — missing. It is committed, not generated; restore it from git.`);
    failed++;
    continue;
  }
  const buf = readFileSync(path);
  const detected = (await fileTypeFromBuffer(buf))?.mime ?? null;
  const sha = createHash("sha256").update(buf).digest("hex").slice(0, 16);
  if (detected !== f.expect || sha !== f.sha256) {
    console.error(
      `  ✗ ${f.name} — detected ${detected ?? "nothing"} (expected ${f.expect}), sha ${sha} (expected ${f.sha256}). ` +
        `It cannot be regenerated; restore it from git.`,
    );
    failed++;
    continue;
  }
  rows.push({ name: f.name, bytes: buf.length, detected, why: f.why, sha: sha.slice(0, 12) });
}

for (const f of [...FIXTURES, ...(WITH_OVERSIZED ? [OVERSIZED] : [])]) {
  const path = resolve(DIR, f.name);
  let buf;
  if (VERIFY_ONLY) {
    if (!existsSync(path)) {
      console.error(`  ✗ ${f.name} — missing`);
      failed++;
      continue;
    }
    buf = readFileSync(path);
  } else {
    buf = f.build();
    writeFileSync(path, buf);
  }

  const detected = buf.length ? (await fileTypeFromBuffer(buf))?.mime ?? null : null;
  const ok = detected === f.expect && (!f.minBytes || buf.length >= f.minBytes);
  if (!ok) {
    console.error(
      `  ✗ ${f.name} — detected ${detected ?? "nothing"}, expected ${f.expect ?? "nothing"}` +
        (f.minBytes && buf.length < f.minBytes ? `; ${buf.length} bytes is under the ${f.minBytes} required to trip the cap` : ""),
    );
    failed++;
    continue;
  }
  rows.push({ name: f.name, bytes: buf.length, detected: detected ?? "—", why: f.why, sha: createHash("sha256").update(buf).digest("hex").slice(0, 12) });
}

for (const r of rows) {
  console.log(`  ✓ ${r.name.padEnd(26)} ${String(r.bytes).padStart(9)} B  ${String(r.detected).padEnd(16)} ${r.sha}`);
}

if (!VERIFY_ONLY && !failed) {
  writeFileSync(
    resolve(DIR, "README.md"),
    `# Test media fixtures

Generated by \`node tester/scripts/make-media-fixtures.mjs\`. **Do not edit by hand** —
every file's bytes are asserted against \`fileTypeFromBuffer\`, the same detector
\`/api/media/finalize\` uses, and a hand edit silently moves a fixture from the happy
path to the rejection path or back.

🛑 These are inert test files served from a public directory. They are deliberately
garish so nothing here can be mistaken for real product media.

| File | Bytes | Detected | Purpose |
|---|---|---|---|
${rows.map((r) => `| \`${r.name}\` | ${r.bytes} | ${r.detected} | ${r.why} |`).join("\n")}

\`oversized.png\` is **not committed** — it is >${(MAX_IMAGE_BYTES / 1024 / 1024).toFixed(0)}MB of incompressible noise, reproducible in a
second with \`--with-oversized\`, and not worth carrying in git to assert a size check.

Caps are read from \`appkit/src/_internal/shared/media/limits.ts\` at generation time,
never restated here: image ${(MAX_IMAGE_BYTES / 1024 / 1024).toFixed(0)}MB.
`,
  );
}

const stray = readdirSync(DIR).filter(
  (f) =>
    f !== "README.md" &&
    f !== ".gitattributes" &&
    f !== OVERSIZED.name &&
    ![...FIXTURES, ...COMMITTED].some((x) => x.name === f),
);
if (stray.length) console.warn(`  ⚠ Unrecognised files in public/test-media: ${stray.join(", ")}`);

console.log(`\n${failed ? "✗" : "✓"} ${rows.length} fixture(s) ${VERIFY_ONLY ? "verified" : "written"}${failed ? `, ${failed} failed` : ""}.`);
process.exit(failed ? 1 : 0);
