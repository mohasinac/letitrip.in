import { withProviders } from "@/providers.config";
import { GET as _GET, POST as _POST } from "@mohasinac/feat-homepage/server";
export const GET = withProviders(_GET);
export const POST = withProviders(_POST);
