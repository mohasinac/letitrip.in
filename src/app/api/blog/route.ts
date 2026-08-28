import { withProviders } from "@/providers.config";
import { blogGET } from "@mohasinac/appkit";

/**
 * A bare pass-through, deliberately.
 *
 * This used to wrap `blogGET` in a fallback that, on a missing-index error,
 * DELETED `q` from the query and re-issued the request — returning the
 * unfiltered blog list as though it were search results, with HTTP 200. A
 * reader searching "dranzer" got all 18 posts and had no way to tell that from
 * a genuine match. The warn line it logged went to the server; the user was
 * told nothing.
 *
 * It was scaffolding for the pre-`searchTxt` era, when blog search ran as
 * `title@=*` — a case-sensitive prefix match that needed an index nobody had
 * declared. `blogGET` now pushes a `searchTxt` `array-contains` clause down,
 * and the four blogPosts composite indexes it needs are deployed.
 *
 * Verified against production before deleting the fallback, with the
 * nonsense-term control that is the only thing distinguishing "filtering" from
 * "returning everything": q=beyblade → 6, q=zzzznope → 0, no q → 18.
 *
 * If a future query shape does lack an index, the correct outcome is a loud
 * failure, not a plausible-looking wrong answer.
 */
export const GET = withProviders(blogGET);
