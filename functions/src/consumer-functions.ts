/**
 * Consumer-defined Firebase functions.
 *
 * Empty by default. To add a consumer-specific function:
 *   1. Write the pure handler in a sibling file.
 *   2. Wrap it in defineFunction({ name, description, trigger, handler, options? }).
 *   3. Add the result to CONSUMER_FUNCTIONS below.
 *
 * To intentionally shadow an appkit function (e.g. consumer-specific override
 * of `onOrderCreate`), declare `options.overrides: <name>` on the consumer
 * definition referencing the name being shadowed. `mergeFunctionRegistries`
 * throws on any collision without an explicit `overrides` field.
 */

import { defineFunction } from "@mohasinac/appkit/jobs";
import type { FunctionDefinition } from "@mohasinac/appkit/jobs";
import { invoicePdfHandler } from "./invoice-pdf";

export const CONSUMER_FUNCTIONS: readonly FunctionDefinition[] = [
  defineFunction({
    name: "invoicePdf",
    description: "P-8 GST — Rule-46-compliant order invoice PDF generator.",
    trigger: { kind: "https" },
    handler: invoicePdfHandler,
    options: {
      region: "asia-south1",
      timeoutSeconds: 30,
      memory: "256MiB",
      maxInstances: 10,
      cors: false,
      secretEnvVar: "LETITRIP_INTERNAL_SECRET",
    },
  }),
] as unknown as readonly FunctionDefinition[];
