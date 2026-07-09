import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEarnTokens as useEarnTokensMutation } from "@workspace/api-client-react";
import type { EarnTokensInputAction } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";

export function useEarnTokens() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const mutation = useEarnTokensMutation();

  const earn = useCallback(
    (action: EarnTokensInputAction, targetName?: string) => {
      if (!isAuthenticated) return;
      mutation.mutate(
        { data: { action, targetName } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getMyTokenBalance"] });
            queryClient.invalidateQueries({ queryKey: ["getLeaderboard"] });
          },
        },
      );
    },
    [isAuthenticated, mutation, queryClient],
  );

  return earn;
}
