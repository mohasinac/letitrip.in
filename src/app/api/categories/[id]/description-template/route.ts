import { withProviders } from "@/providers.config";
import { GET as categoryDescriptionTemplateGET } from "@mohasinac/appkit/features/categories/api/[id]/description-template/route";

export const GET = withProviders(categoryDescriptionTemplateGET);
