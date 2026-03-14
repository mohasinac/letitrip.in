import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { UserEditAddressView } from "@/features/user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("addresses");
  return {
    title: `${t("metaTitleEdit")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescriptionEdit"),
    robots: { index: false, follow: false },
  };
}

export default function EditAddressPage() {
  return <UserEditAddressView />;
}
