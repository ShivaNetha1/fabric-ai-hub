import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { MeshBackground } from "@/components/site/mesh-background";
import { Logo } from "@/components/site/logo";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Verifying — Texora" },
      { name: "description", content: "Email verification in progress." },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<"verifying" | "error">("verifying");
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    let isMounted = true;

    async function handleCallback() {
      try {
        // Supabase JS client automatically detects the hash fragment
        // (#access_token=...&type=signup) and exchanges it for a session.
        // We just need to call getSession() to let it complete.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!session?.user) {
          // No session established — tokens may be invalid or expired
          throw new Error("Verification failed. The link may have expired.");
        }

        if (!isMounted) return;

        toast.success("Email verified successfully! Welcome to Texora.");

        // Check if user has completed onboarding
        let onboardingCompleted = false;
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("onboarding_completed, role")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profileData?.onboarding_completed) {
            onboardingCompleted = true;
            const role = profileData.role?.toLowerCase();
            navigate({
              to: role === "supplier" ? "/dashboard/supplier" : "/dashboard/buyer",
            });
            return;
          }
        } catch {
          // Profile query failed — default to onboarding
        }

        if (!onboardingCompleted) {
          navigate({ to: "/onboarding" });
        }
      } catch (err: any) {
        if (!isMounted) return;
        const message = err.message || "Email verification failed. Please try again.";
        setErrorMsg(message);
        setStatus("error");
        toast.error(message);
      }
    }

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      <MeshBackground intensity="soft" />
      <div className="glass-strong relative w-full max-w-md rounded-3xl p-9 shadow-lift text-center">
        <Logo />
        {status === "verifying" ? (
          <>
            <h1 className="mt-8 text-xl font-semibold tracking-[-0.03em]">
              Verifying your email…
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Please wait while we confirm your account.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-8 text-xl font-semibold tracking-[-0.03em] text-destructive">
              Verification failed
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {errorMsg}
            </p>
            <button
              onClick={() => navigate({ to: "/auth", search: { mode: "signin" } })}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
