import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Blog Post | JustForView.in`,
    description: "Read our latest blog post",
  };
}

export default function BlogPostPage({ params }: Props) {
  return <BlogPostClient slug={params.slug} />;
}
