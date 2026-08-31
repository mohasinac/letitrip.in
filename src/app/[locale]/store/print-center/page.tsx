import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";

/*
 * W8 C2 — folded into /store/fulfillment as a tab.
 *
 * 🛑 The redirect carries the whole query string through. `SellerOrdersView`
 * deep-links here as `?type=order&ids=…&autoprint=1` to print labels for a
 * selection, and dropping those params would land the seller on an empty Print
 * Centre with no sign anything was lost.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const carried = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((v) => carried.append(key, v));
    else if (value !== undefined) carried.set(key, value);
  }
  carried.set("tab", "print");
  redirect(`${String(ROUTES.STORE.FULFILLMENT)}?${carried.toString()}`);
}
