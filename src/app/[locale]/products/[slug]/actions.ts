"use server";
import { makeOfferAction } from "@/actions/offer.actions";

export async function submitProductOffer(productId: string, amount: number): Promise<void> {
  const result = await makeOfferAction({ productId, offerAmount: amount });
  if (!result.ok) throw new Error(result.error);
}
