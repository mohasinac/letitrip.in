import { withProviders } from "@/providers.config";
import { eventIdGET } from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: per-verb auth enforced within handler
export const GET = withProviders(eventIdGET);