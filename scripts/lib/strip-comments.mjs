/**
 * stripComments — the ONE comment/regex/string-aware source blanker.
 *
 * ## Why this is a shared module
 *
 * Ten audits had grown their own copy, and **eight of them carried a bug the
 * other two had already fixed**: a regex literal such as `/^https?:\/\//`
 * ends in an escaped slash followed by the delimiter, so a naive scanner sees
 * `//`, calls it a line comment, and blanks the rest of that line. Downstream
 * that either hides a real violation (the `, {` opening the next argument is
 * gone, so a brace walk unbalances) or invents one.
 *
 * The fix was written twice and back-ported to none of the other eight —
 * Recurrent Root Cause #59's shape, on the audit-tooling axis. One
 * implementation is the only way that stops recurring.
 *
 * ## Contract
 *
 * Replaces every comment with spaces (newlines preserved), so **byte offsets
 * and line numbers are unchanged** — callers can report positions against the
 * stripped text and they still point at the original file. String literals,
 * template literals and regex literals are copied through verbatim, so their
 * contents can never be mistaken for a comment, a quote or a brace.
 *
 * A `/` begins a regex only in VALUE position. The standard heuristic — the
 * previous non-whitespace character being one of `(,=:[!&|?{};` and friends,
 * or nothing at all — distinguishes that from division, and covers every case
 * this codebase actually contains.
 */
export function stripComments(source) {
  const NL = String.fromCharCode(10);
  const BACKSLASH = String.fromCharCode(92);
  const QUOTES = [String.fromCharCode(34), String.fromCharCode(39), String.fromCharCode(96)];
  const REGEX_PRECEDERS = new Set(["(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "<", ">", "~", "^"]);

  let out = "";
  let i = 0;
  let quote = null;
  let lastMeaningful = "";

  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];

    if (quote) {
      out += c;
      if (c === quote && source[i - 1] !== BACKSLASH) quote = null;
      i++;
      continue;
    }

    if (QUOTES.includes(c)) {
      quote = c;
      out += c;
      lastMeaningful = c;
      i++;
      continue;
    }

    if (c === "/" && next === "/") {
      while (i < source.length && source[i] !== NL) {
        out += " ";
        i++;
      }
      continue;
    }

    if (c === "/" && next === "*") {
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
        out += source[i] === NL ? NL : " ";
        i++;
      }
      out += "  ";
      i += 2;
      continue;
    }

    // A regex literal. Copied through verbatim so its contents can never be
    // mistaken for a comment, a quote or a brace.
    if (c === "/" && (lastMeaningful === "" || REGEX_PRECEDERS.has(lastMeaningful))) {
      out += c;
      i++;
      let inClass = false;
      while (i < source.length) {
        const r = source[i];
        if (source[i - 1] === BACKSLASH) {
          out += r;
          i++;
          continue;
        }
        if (r === "[") inClass = true;
        else if (r === "]") inClass = false;
        else if (r === "/" && !inClass) {
          out += r;
          i++;
          break;
        } else if (r === NL) {
          // Unterminated — not a regex after all. Stop rather than run away.
          break;
        }
        out += r;
        i++;
      }
      lastMeaningful = "/";
      continue;
    }

    out += c;
    if (!/\s/.test(c)) lastMeaningful = c;
    i++;
  }
  return out;
}
