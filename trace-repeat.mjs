// Trace-repeat: intercept String.repeat(-1) to find the caller
const origRepeat = String.prototype.repeat;
String.prototype.repeat = function(count) {
  if (typeof count === "number" && (count < 0 || !isFinite(count))) {
    const e = new Error("String.repeat(" + count + ") intercepted");
    Error.captureStackTrace(e, String.prototype.repeat);
    console.error("=== STRING.REPEAT(" + count + ") CALLED ===");
    console.error(e.stack);
    throw e; // re-throw so normal error handling still works
  }
  return origRepeat.call(this, count);
};

// Now start Next.js
const nextPath = new URL("./node_modules/next/dist/bin/next", import.meta.url);
await import(nextPath.href);
