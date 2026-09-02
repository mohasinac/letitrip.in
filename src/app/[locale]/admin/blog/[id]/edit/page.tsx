import { BlogEditClient } from "./blog-edit-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogEditClient id={id} />;
}
