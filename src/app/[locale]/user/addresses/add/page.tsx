import { redirect } from "next/navigation";
import { ROUTES } from "@mohasinac/appkit";

/**
 * Legacy path. The canonical route is `/user/addresses/new`.
 *
 * Kept rather than deleted: this URL has been live and may be bookmarked, and
 * a 404 is a worse outcome than a redirect for a path that costs three lines
 * to honour.
 */
export default function Page() {
  redirect(String(ROUTES.USER.ADDRESSES_NEW));
}
