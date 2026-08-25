import { AddAddressClient } from "@/components";

/**
 * Create an address — the standard `/new` shape.
 *
 * `/user/addresses/add` and `/user/addresses/edit/[id]` were the only two
 * non-standard route shapes in the codebase; every other entity uses `/new`
 * and `/[id]/edit`. Both old paths remain as redirects, so bookmarks and any
 * link already in the wild keep working.
 */
export default function Page() {
  return <AddAddressClient />;
}
