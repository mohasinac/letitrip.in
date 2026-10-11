import { withProviders } from "@/providers.config";
import { GET as eventIdGET } from "@mohasinac/appkit/features/events/api/[id]/route";

const __GET__g = withProviders(eventIdGET);

export const GET = __GET__g;
