/**
 * Algolia client singleton for Firebase Functions.
 *
 * Uses the ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY environment variables,
 * which are injected at deploy-time via `firebase functions:secrets` or
 * `firebase.json` environment config.
 *
 * In production the vars are set as Vercel/Firebase environment variables.
 * Locally set them in functions/.env or export them in the shell before
 * running the emulator.
 */
import { algoliasearch } from "algoliasearch";
import { ConfigurationError } from "../lib/errors";

let _client: ReturnType<typeof algoliasearch> | null = null;

export function getAlgoliaClient(): ReturnType<typeof algoliasearch> {
  if (_client) return _client;

  const appId = process.env.ALGOLIA_APP_ID;
  const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;

  if (!appId || !apiKey) {
    throw new ConfigurationError(
      "ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY must be set",
    );
  }

  _client = algoliasearch(appId, apiKey);
  return _client;
}

export const ALGOLIA_INDEX = process.env.ALGOLIA_INDEX_NAME ?? "products";
