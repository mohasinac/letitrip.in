export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
  featured: boolean;
}

export type OnBlogChange = (field: keyof BlogFormData, value: any) => void;
