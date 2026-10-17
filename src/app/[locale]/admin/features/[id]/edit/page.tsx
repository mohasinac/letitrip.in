import { AdminFeatureEditorView } from "@mohasinac/appkit/features/admin/components/AdminFeatureEditorView";
import { productFeaturesRepository } from "@mohasinac/appkit/features/products/repository/product-features.repository";
import { requireRecord } from "@mohasinac/appkit/next/routing/require-record";

export const metadata = { title: "Edit Feature — Admin" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRecord(() => productFeaturesRepository.findById(id), {
    route: "/admin/features/[id]/edit",
    key: "productFeatures.findById",
  });
  return <AdminFeatureEditorView featureId={id} />;
}
