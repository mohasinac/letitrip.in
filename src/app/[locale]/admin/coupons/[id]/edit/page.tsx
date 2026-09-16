import { notFound } from "next/navigation";
import { couponsRepository } from "@mohasinac/appkit";
import { CouponEditClient } from "./coupon-edit-client";

/*
 * 🛑 THE EXISTENCE CHECK IS SERVER-SIDE, AND IT IS THE POINT OF THIS FILE.
 *
 * This was a bare client shim with no check at all, so
 * /admin/coupons/zzzznope-not-a-coupon-42/edit rendered a fully editable
 * coupon form — every field, a "Save changes" button and a "Delete coupon"
 * button — for an id that does not exist. An admin arriving from a stale
 * bookmark or a mistyped id got a form that looked ready to save.
 *
 * The sibling /admin/orders/[id]/view already does exactly this and 404s
 * correctly; it is the reference implementation, and the two only differed
 * because this one never grew the check.
 *
 * Verified live: the order URL showed "404 — Page not found" with zero inputs
 * and zero save buttons, while this one showed 12 inputs and a Save button.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const coupon = await couponsRepository.findById(id);
  if (!coupon) return notFound();

  return <CouponEditClient id={id} />;
}
