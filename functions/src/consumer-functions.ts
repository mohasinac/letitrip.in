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

import type { FunctionDefinition } from "@mohasinac/appkit/jobs";

export const CONSUMER_FUNCTIONS: readonly FunctionDefinition[] = [];
