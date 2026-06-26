import { initProviders } from "@/providers.config";

// rbac-scope-enforced-in-handler: requireAuthFromRequest or own verification
export async function GET(...args: Parameters<typeof import("@mohasinac/appkit").homepageSectionItemGET>) {
  await initProviders();
  const { homepageSectionItemGET } = await import("@mohasinac/appkit");
  return homepageSectionItemGET(...args);
}

// rbac-scope-enforced-in-handler: requireAuthFromRequest or own verification
export async function PATCH(...args: Parameters<typeof import("@mohasinac/appkit").homepageSectionItemPATCH>) {
  await initProviders();
  const { homepageSectionItemPATCH } = await import("@mohasinac/appkit");
  return homepageSectionItemPATCH(...args);
}

// rbac-scope-enforced-in-handler: requireAuthFromRequest or own verification
export async function DELETE(...args: Parameters<typeof import("@mohasinac/appkit").homepageSectionItemDELETE>) {
  await initProviders();
  const { homepageSectionItemDELETE } = await import("@mohasinac/appkit");
  return homepageSectionItemDELETE(...args);
}