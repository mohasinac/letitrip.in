import { initProviders } from "@/providers.config";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export async function GET(...args: Parameters<typeof import("@mohasinac/appkit").homepageSectionItemGET>) {
  await initProviders();
  const { homepageSectionItemGET } = await import("@mohasinac/appkit");
  return homepageSectionItemGET(...args);
}

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export async function PATCH(...args: Parameters<typeof import("@mohasinac/appkit").homepageSectionItemPATCH>) {
  await initProviders();
  const { homepageSectionItemPATCH } = await import("@mohasinac/appkit");
  return homepageSectionItemPATCH(...args);
}

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export async function DELETE(...args: Parameters<typeof import("@mohasinac/appkit").homepageSectionItemDELETE>) {
  await initProviders();
  const { homepageSectionItemDELETE } = await import("@mohasinac/appkit");
  return homepageSectionItemDELETE(...args);
}