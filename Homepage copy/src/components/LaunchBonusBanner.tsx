import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useLaunchBonus } from "@/hooks/useLaunchBonus";
import { useToast } from "@/hooks/use-toast";

export const LaunchBonusBanner: React.FC = () => {
  const location = useLocation();
  const { hasClaimed, loading, startCheckout, isEnabled } = useLaunchBonus();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  // Check localStorage for dismissal (for non-logged-in users who dismissed)
  const isDismissedInStorage =
    typeof window !== "undefined" &&
    localStorage.getItem("launch_bonus_banner_dismissed") === "true";

  // Hide banner on the success page (they just paid, don't show "Claim Now" again)
  const isOnSuccessPage = location.pathname === "/launch-bonus-success";

  // Don't show banner if:
  // - Feature is disabled
  // - Still loading
  // - User already claimed bonus
  // - Banner was dismissed
  // - On the success page (just paid)
  if (
    !isEnabled ||
    loading ||
    hasClaimed ||
    dismissed ||
    isDismissedInStorage ||
    isOnSuccessPage
  ) {
    return null;
  }

  const handleClaimClick = async () => {
    setIsStartingCheckout(true);

    const result = await startCheckout();

    if (!result.success) {
      toast({
        title: "Error",
        description:
          result.error || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setIsStartingCheckout(false);
    }
    // If successful, user will be redirected to Stripe
  };

  return (
    <div className="bg-primary text-white relative">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-center gap-3 py-2.5 text-sm">
          {/* <Zap className="h-4 w-4 text-yellow-300 animate-pulse" /> */}
          <span className="font-medium">
            🎉 <b>Launch week deal:</b> Get 100 email credits for just $29 —
            this week only.
          </span>
          <button
            onClick={handleClaimClick}
            disabled={isStartingCheckout}
            className="ml-1 px-3 py-1 bg-white text-primary font-semibold text-xs rounded-full hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isStartingCheckout ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Claim Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
