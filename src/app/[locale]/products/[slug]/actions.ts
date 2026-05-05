"use server";
import { makeOfferAction } from "@/actions/offer.actions";

export async function submitProductOffer(productId: string, amount: number): Promise<void> {
  await makeOfferAction({ productId, offerAmount: amount });
}
