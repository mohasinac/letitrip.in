/**
 * Public bundle detail page — SB3-G + SB3-I.
 */
import { notFound } from "next/navigation";
import { bundlesRepository } from "@mohasinac/appkit/server";
import BundleDetailClient from "./BundleDetailClient";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const bundle = await bundlesRepository.findBySlug(slug);
  if (!bundle || bundle.status === "draft" || bundle.status === "archived") {
    notFound();
  }
  return <BundleDetailClient bundle={bundle} />;
}
