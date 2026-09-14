"use client";

/**
 * Consumer-side mount for appkit's `DigitalContentPoolManager`.
 *
 * The component takes its API as a prop so appkit never hard-codes a path — the
 * same contract `CodeRevealPanel` uses. The transport lives in
 * `@/lib/api/digital-content-client`, which is where a direct `fetch` is
 * allowed (audit-direct-fetch-ui exempts `/lib/api/`).
 */

import React from "react";
import { DigitalContentPoolManager } from "@mohasinac/appkit/client";
import {
  listPoolEntries,
  addPoolCodes,
  addPoolAsset,
  removePoolEntry,
} from "@/lib/api/digital-content-client";

const api = {
  list: listPoolEntries,
  addCodes: addPoolCodes,
  addAsset: addPoolAsset,
  remove: removePoolEntry,
};

export function DigitalContentPoolSlot({
  productId,
  canUploadFiles,
}: {
  productId: string;
  canUploadFiles?: boolean;
}) {
  return (
    <DigitalContentPoolManager
      productId={productId}
      canUploadFiles={canUploadFiles}
      api={api}
    />
  );
}
