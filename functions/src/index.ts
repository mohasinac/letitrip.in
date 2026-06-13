/**
 * Firebase Cloud Functions — LetItRip
 *
 * Thin binding barrel built from the appkit Function Registry (Track A).
 * Every Firebase function appears exactly once in `APPKIT_FUNCTIONS` (the
 * single source of truth). Consumer-specific functions live in
 * `./consumer-functions.ts` and are merged in below.
 *
 * To add a function: write the pure handler in
 * `appkit/src/_internal/server/jobs/handlers/<name>.ts`, declare it via
 * `defineFunction(...)` in `appkit/src/_internal/server/functions/<category>/<name>.ts`,
 * include it in `APPKIT_FUNCTIONS`. No edits to this file are required.
 *
 * To shadow an appkit function from the consumer side: see the override rules
 * documented in `consumer-functions.ts`.
 */

import {
  APPKIT_FUNCTIONS,
  bindAllFromRegistry,
  mergeFunctionRegistries,
} from "@mohasinac/appkit/jobs";
import { CONSUMER_FUNCTIONS } from "./consumer-functions";

const REGISTRY = mergeFunctionRegistries(APPKIT_FUNCTIONS, CONSUMER_FUNCTIONS);

Object.assign(exports, bindAllFromRegistry(REGISTRY));
