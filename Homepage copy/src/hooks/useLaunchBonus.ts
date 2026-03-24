import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Feature flag - set to false to disable the launch bonus feature entirely
// When false, the banner won't show and no DB queries will be made
export const LAUNCH_BONUS_ENABLED = true;

interface LaunchBonusState {
  hasClaimed: boolean;
  bonusCredits: number;
  loading: boolean;
  error: string | null;
  isEnabled: boolean;
}

export const useLaunchBonus = () => {
  const { user, session } = useAuth();
  const [state, setState] = useState<LaunchBonusState>({
    hasClaimed: false,
    bonusCredits: 0,
    loading: LAUNCH_BONUS_ENABLED, // Only show loading if enabled
    error: null,
    isEnabled: LAUNCH_BONUS_ENABLED,
  });

  const checkBonusStatus = useCallback(async () => {
    // Skip all checks if feature is disabled
    if (!LAUNCH_BONUS_ENABLED) {
      setState((prev) => ({ ...prev, loading: false, isEnabled: false }));
      return;
    }

    if (!user || !session) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Get user's OWNED organization (they may be invited to other orgs)
      const { data: orgMembers } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .limit(1);

      const orgMember = orgMembers?.[0];

      if (!orgMember) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      // Query subscription - bonus_credits columns may not exist if migration hasn't run yet
      const { data: subscription, error } = await supabase
        .from("organization_subscriptions")
        .select("*")
        .eq("organization_id", orgMember.organization_id)
        .single();

      if (error) {
        console.error("Error checking bonus status:", error);
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      // Safely access bonus fields (may not exist until migration runs)
      const bonusClaimed = (subscription as any)?.bonus_credits_claimed_at;
      const bonusAmount = (subscription as any)?.bonus_credits || 0;

      setState({
        hasClaimed: !!bonusClaimed,
        bonusCredits: bonusAmount,
        loading: false,
        error: null,
        isEnabled: LAUNCH_BONUS_ENABLED,
      });
    } catch (err) {
      console.error("Error in useLaunchBonus:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, [user, session]);

  const startCheckout = useCallback(async () => {
    // Don't allow checkout if feature is disabled
    if (!LAUNCH_BONUS_ENABLED) {
      return { success: false, error: "Launch bonus is no longer available" };
    }

    try {
      const headers: Record<string, string> = {};

      // Add auth header if user is logged in
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const { data, error } = await supabase.functions.invoke(
        "create-launch-bonus-checkout",
        { headers }
      );

      if (error) {
        // Check if it's the "already claimed" or "already purchased" error
        if (
          error.message?.includes("BONUS_ALREADY_CLAIMED") ||
          error.message?.includes("BONUS_ALREADY_PURCHASED")
        ) {
          return {
            success: false,
            error: "You have already claimed the launch bonus!",
          };
        }
        throw error;
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
        return { success: true };
      }

      return { success: false, error: "No checkout URL returned" };
    } catch (err) {
      console.error("Error starting checkout:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to start checkout",
      };
    }
  }, [session]);

  const applyPendingBonus = useCallback(async () => {
    if (!session?.access_token) {
      return { applied: false, error: "Not authenticated" };
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "apply-launch-bonus",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        throw error;
      }

      if (data?.applied) {
        // Refresh bonus status
        await checkBonusStatus();
        return { applied: true, credits: data.credits };
      }

      return { applied: false };
    } catch (err) {
      console.error("Error applying bonus:", err);
      return {
        applied: false,
        error: err instanceof Error ? err.message : "Failed to apply bonus",
      };
    }
  }, [session, checkBonusStatus]);

  useEffect(() => {
    checkBonusStatus();
  }, [checkBonusStatus]);

  return {
    ...state,
    startCheckout,
    applyPendingBonus,
    refresh: checkBonusStatus,
  };
};
