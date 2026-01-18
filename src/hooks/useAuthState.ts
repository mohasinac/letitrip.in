import type { AuthState } from "@/contexts/auth/AuthStateContext";
import { AuthStateContext } from "@/contexts/auth/AuthStateContext";
import { useAuthState as useAuthStateLib } from "@letitrip/react-library";

/**
 * Hook to access authentication state
 * @returns Current authentication state including user, loading status, and role flags
 */
export function useAuthState(): AuthState {
  return useAuthStateLib(AuthStateContext);
}
