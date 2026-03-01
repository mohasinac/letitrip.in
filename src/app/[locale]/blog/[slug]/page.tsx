"use client";

import { use } from "react";
import { BlogPostView } from "@/features/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const { slug } = use(params);
  return <BlogPostView slug={slug} />;
}
