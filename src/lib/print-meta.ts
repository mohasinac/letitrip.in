import type { SellerProductDraft } from "@mohasinac/appkit";

/**
 * `SellerProductDraft` collects print metadata as flat fields
 * (printSize/printMaterial/printFinish/printEditionSize) for the wizard
 * step, but `ProductDocument.printMeta` stores them nested. Converts one to
 * the other for the art/stickers create + edit page server actions.
 */
export function buildPrintMetaPayload(draft: SellerProductDraft) {
  const { printSize, printMaterial, printFinish, printEditionSize, ...rest } = draft;
  const hasPrintMeta = printSize || printMaterial || printFinish || printEditionSize;
  return {
    ...rest,
    ...(hasPrintMeta
      ? {
          printMeta: {
            ...(printSize ? { size: printSize } : {}),
            ...(printMaterial ? { material: printMaterial } : {}),
            ...(printFinish ? { finish: printFinish } : {}),
            ...(printEditionSize ? { editionSize: printEditionSize } : {}),
          },
        }
      : {}),
  };
}
