/*
 * Turn `.env.local` into the format `docker run --env-file` actually parses.
 *
 * 🛑 `--env-file` IS NOT dotenv, and the difference does not look like an env
 * problem. It performs NO quote processing: a line
 *
 *     NEXT_PUBLIC_APP_URL="http://localhost:3000"
 *
 * yields a value whose first and last characters are literal `"`. A shell
 * strips those, dotenv strips those, docker ships them verbatim. The build then
 * dies in page-data collection with
 *
 *     ERR_INVALID_URL  input: '"http://localhost:3000"'
 *     Failed to collect page data for /_not-found
 *
 * which reads as an application crash and was chased as one.
 *
 * 🛑 This lives in a lib because there are now TWO consumers — the build probe
 * and the serve script — and a rule that is reachable by copy-paste will be
 * copied. That is Root Cause #75 exactly: `unitPriceFor` documented itself as
 * the single source of truth and was still re-derived in four places, one of
 * which missed a branch and charged the wrong price. One definition.
 *
 * @tag domain:build
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:writes the normalised env file
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/** Where the normalised copy is written. Gitignored AND allow-listed in
 *  audit-gitignore — it carries the same live secrets as .env.local. */
export const DOCKER_ENV_FILE = ".env.docker-probe";

/**
 * Write a docker-parseable copy of `.env.local`.
 *
 * @param {string} root  directory containing .env.local
 * @returns {string[]}   docker args — `["--env-file", path]`, or `[]` if absent
 */
export function dockerEnvArgs(root) {
  const source = resolve(root, ".env.local");
  if (!existsSync(source)) return [];

  const normalised = readFileSync(source, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => {
      const eq = l.indexOf("=");
      const key = l.slice(0, eq).trim();
      let val = l.slice(eq + 1).trim();
      /* Strip ONE matching pair of surrounding quotes — the same thing a shell
       * would have done, and no more. Stripping unmatched quotes would corrupt
       * a value that legitimately starts with one. */
      if (val.length >= 2 && (val[0] === '"' || val[0] === "'") && val.at(-1) === val[0]) {
        val = val.slice(1, -1);
      }
      /* docker cannot express a multi-line value at all, and a half-parsed key
       * is worse than an absent one — a truncated private key fails as a crypto
       * error rather than as a missing variable. */
      return val.includes("\\n") ? null : `${key}=${val}`;
    })
    .filter(Boolean)
    .join("\n");

  const out = resolve(root, DOCKER_ENV_FILE);
  writeFileSync(out, `${normalised}\n`, "utf8");
  return ["--env-file", out];
}
