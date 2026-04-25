import { withProviders } from "@/providers.config";
import { preOrdersGET, preOrdersPOST } from "@mohasinac/appkit";

export const GET = withProviders(preOrdersGET);
export const POST = withProviders(preOrdersPOST);
