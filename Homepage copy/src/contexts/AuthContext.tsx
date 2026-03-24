import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAuthIntent } from "@/utils/authIntent";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscribed: boolean;
  subscriptionTier: string;
  subscriptionEnd: string | null;
  checkingSubscription: boolean;
  signUp: (
    email: string,
    password: string,
    metadata?: any
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState("free");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  const checkSubscription = async () => {
    if (!session) return;

    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "check-subscription",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }

      setSubscribed(data.subscribed || false);
      setSubscriptionTier(data.subscription_tier || "free");
      setSubscriptionEnd(data.subscription_end || null);
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Check subscription when user signs in
      if (session?.user && event === "SIGNED_IN") {
        await checkSubscription();

        // Store IP address for new signups
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/store-signup-ip`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );
        } catch (error) {
          console.error("Failed to store signup IP:", error);
          // Non-critical, continue
        }
      }

      // Reset subscription state when user signs out
      if (event === "SIGNED_OUT") {
        setSubscribed(false);
        setSubscriptionTier("free");
        setSubscriptionEnd(null);
        localStorage.removeItem("emailGenerationState");

        // Redirect to home after auth state is properly cleared
        console.log("🔄 Auth state cleared, redirecting to home");
        window.location.href = "/";
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Check subscription for existing session
      if (session?.user) {
        await checkSubscription();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: metadata || {},
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // Don't redirect immediately for login - let SignupModal handle it
    return { error };
  };

  const signOut = async () => {
    try {
      console.log("🚪 Starting logout process...");

      // Clear all browser storage to remove Google OAuth data
      localStorage.clear();
      sessionStorage.clear();

      // Clear Google-related cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie =
          name +
          "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.google.com";
        document.cookie =
          name +
          "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.googleapis.com";
      });

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Logout failed:", error);
        return { error };
      }

      console.log("✅ Logout successful, waiting for auth state to clear...");
      // Don't redirect immediately - let onAuthStateChange handle it
      // This prevents the race condition with Index.tsx redirect logic
      return { error: null };
    } catch (err) {
      console.error("❌ Logout error:", err);
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    console.log("🔵 AuthContext: signInWithGoogle called");

    const intent = getAuthIntent();
    console.log("🎯 AuthContext: Auth intent:", intent);

    // Fallback to workflow local storage to decide redirect
    const lsWorkflow =
      localStorage.getItem("emailGenerationState") ||
      localStorage.getItem("digistorms_workflow_state");
    const parsed = lsWorkflow ? JSON.parse(lsWorkflow) : null;
    const step = parsed?.currentStep;
    const selectedEmail = parsed?.selectedEmail;
    const briefData = parsed?.briefData;

    // Set flag to check for questionnaire after OAuth
    console.log(
      "🚩 AuthContext: Setting 'pending_google_auth' flag for post-OAuth detection"
    );
    localStorage.setItem("pending_google_auth", "true");

    // IMPORTANT: `redirectTo` triggers a full page load after OAuth.
    // If the host isn't configured to rewrite `/portal/*` to the SPA entrypoint,
    // returning to `/portal/...` can yield a platform 404 before React Router loads.
    //
    // So we always return to `/` (which is guaranteed to exist) and let the app's
    // normal post-auth redirect logic (authIntent + workflow state) route in-app.
    const redirectUrl = `${window.location.origin}/`;

    console.log(
      `🔄 AuthContext: Redirecting to Google OAuth, will return to: ${redirectUrl}`
    );

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      console.error("❌ AuthContext: Google OAuth error:", error);
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    checkingSubscription,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    checkSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
