import type { Metadata } from "next";
import DisputeClient from "./DisputeClient";

export const metadata: Metadata = {
  title: "Report a problem with this order",
  description:
    "Tell us what went wrong — the item arrived damaged or wrong, or the parcel never reached you.",
};

/**
 * `/user/orders/[id]/dispute` — the buyer's dispute form, finally mounted.
 *
 * The model, the gate, the collection, the seed and the API all landed earlier
 * and `RaiseDisputeForm` has existed with **no mount site at all**: a complete
 * feature reachable from nowhere, which is Root Cause #37's shape and exactly
 * what `/api/dispute-reasons` was built ahead of.
 *
 * 🛑 It sits beside `cancel`, `claim`, `invoice`, `payment`, `return` and
 * `track` — the established `/user/orders/{id}/<action>` shape. The plan said
 * `/user/orders/view/{id}`, which is now a REDIRECT shim kept only so old
 * emails keep working; putting a new surface behind it would have added a hop
 * to every visit and split the action set across two URL shapes again.
 */
export default function Page(props: { params: Promise<{ id: string }> }) {
  return <DisputeClient {...props} />;
}
