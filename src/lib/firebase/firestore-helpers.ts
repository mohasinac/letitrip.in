// Thin shim — delegates to @mohasinac/db-firebase with looser types for back-compat.
// The package uses Record<string,unknown>; callers use typed interfaces without index signatures.
import {
  prepareForFirestore as _prepareForFirestore,
  removeUndefined as _removeUndefined,
  deserializeTimestamps,
} from "@mohasinac/appkit/providers/db-firebase";

export { deserializeTimestamps };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeUndefined = _removeUndefined as <
  T extends Record<string, any>,
>(
  obj: T,
) => Partial<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prepareForFirestore = _prepareForFirestore as <
  T extends Record<string, any>,
>(
  data: T,
) => Partial<T>;
