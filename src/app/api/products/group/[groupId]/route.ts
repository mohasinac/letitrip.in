import { NextResponse } from "next/server";
import { productRepository } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";

export const GET = withProviders(async (
  _req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) => {
  const { groupId } = await params;
  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }

  const members = await productRepository.findByGroupId(groupId);

  const items = members.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    currency: p.currency,
    images: p.images,
    slug: p.slug ?? p.id,
    isPreOrder: p.isPreOrder ?? false,
    isGroupParent: p.isGroupParent ?? false,
    groupTitle: p.groupTitle,
    condition: p.condition,
  }));

  return NextResponse.json({ data: { items, groupId } });
});
