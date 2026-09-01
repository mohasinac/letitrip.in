import { redirect } from "next/navigation";
import { ROUTES } from "@mohasinac/appkit";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


interface Props {
  params: Promise<{ id: string }>;
}

/** Legacy path. The canonical route is `/user/addresses/[id]/edit`. */
export default async function Page({ params }: Props) {
  const { id } = await params;
  redirect(String(ROUTES.USER.ADDRESSES_EDIT(id)));
}
