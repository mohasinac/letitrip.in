import { withProviders } from "@/providers.config";
import { blogSlugGET } from "@mohasinac/appkit/features/blog";
export const GET = withProviders(blogSlugGET);
