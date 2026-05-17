"use server";
import { makeOfferAction } from "@/actions/offer.actions";

export async function submitProductOffer(
  productId: string,
  amount: number,
  buyerNote?: string,
): Promise<void> {
  const result = await makeOfferAction({
    productId,
    offerAmount: amount,
    buyerNote,
  });
  if (!result.ok) throw new Error(result.error);
}
