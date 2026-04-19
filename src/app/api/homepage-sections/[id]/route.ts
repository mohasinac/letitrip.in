import { initProviders } from "@/providers.config";

export async function GET(...args: Parameters<typeof import("@mohasinac/appkit/server").homepageSectionItemGET>) {
  await initProviders();
  const { homepageSectionItemGET } = await import("@mohasinac/appkit/server");
  return homepageSectionItemGET(...args);
}

export async function PATCH(...args: Parameters<typeof import("@mohasinac/appkit/server").homepageSectionItemPATCH>) {
  await initProviders();
  const { homepageSectionItemPATCH } = await import("@mohasinac/appkit/server");
  return homepageSectionItemPATCH(...args);
}

export async function DELETE(...args: Parameters<typeof import("@mohasinac/appkit/server").homepageSectionItemDELETE>) {
  await initProviders();
  const { homepageSectionItemDELETE } = await import("@mohasinac/appkit/server");
  return homepageSectionItemDELETE(...args);
}