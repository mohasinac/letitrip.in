import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export interface RealtimeTokenResponse {
  customToken: string;
  expiresAt: number;
}

/**
 * Service for obtaining a Firebase custom token for Realtime Database
 * read-only subscriptions from the server-issued token endpoint.
 */
export const realtimeTokenService = {
  getToken: () =>
    apiClient.post<RealtimeTokenResponse>(API_ENDPOINTS.REALTIME.TOKEN, {}),
};
