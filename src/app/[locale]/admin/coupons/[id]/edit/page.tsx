import { CouponEditClient } from "./coupon-edit-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CouponEditClient id={id} />;
}
