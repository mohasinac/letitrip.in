import { withProviders } from "@/providers.config";
import { blogSlugGET } from "@mohasinac/appkit/features/blog/server";
export const GET = withProviders(blogSlugGET);
