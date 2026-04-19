import { initProviders } from "@/providers.config";

export async function GET(...args: Parameters<typeof import("@mohasinac/appkit/features/homepage/server").homepageSectionItemGET>) {
  await initProviders();
  const { homepageSectionItemGET } = await import("@mohasinac/appkit/features/homepage/server");
  return homepageSectionItemGET(...args);
}

export async function PATCH(...args: Parameters<typeof import("@mohasinac/appkit/features/homepage/server").homepageSectionItemPATCH>) {
  await initProviders();
  const { homepageSectionItemPATCH } = await import("@mohasinac/appkit/features/homepage/server");
  return homepageSectionItemPATCH(...args);
}

export async function DELETE(...args: Parameters<typeof import("@mohasinac/appkit/features/homepage/server").homepageSectionItemDELETE>) {
  await initProviders();
  const { homepageSectionItemDELETE } = await import("@mohasinac/appkit/features/homepage/server");
  return homepageSectionItemDELETE(...args);
}