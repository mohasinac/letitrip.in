import { createRequire } from "module";
const require = createRequire(import.meta.url);

const origRepeat = String.prototype.repeat;
String.prototype.repeat = function(count) {
  if (typeof count === "number" && (count < 0 || !isFinite(count))) {
    const err = new Error("REPEAT_INTERCEPTED count=" + count);
    Error.captureStackTrace(err);
    console.error("=== FOUND IT ===");
    console.error(err.stack);
    process.exit(99);
  }
  return origRepeat.call(this, count);
};

import("./node_modules/next/dist/esm/bin/next.js").catch(e => console.error(e));
