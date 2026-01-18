import type { AuthActions } from "@/contexts/auth/AuthActionsContext";
import { AuthActionsContext } from "@/contexts/auth/AuthActionsContext";
import { useAuthActions as useAuthActionsLib } from "@letitrip/react-library";

/**
 * Hook to access authentication actions
 * @returns Authentication methods including login, logout, register, etc.
 */
export function useAuthActions(): AuthActions {
  return useAuthActionsLib(AuthActionsContext);
}
