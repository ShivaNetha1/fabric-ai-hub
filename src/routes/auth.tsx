import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Building2, ShoppingBag, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { MeshBackground } from "@/components/site/mesh-background";
import { fabricImages } from "@/lib/data";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { z } from "zod";

const authSearchSchema = z.object({
  mode: z.string().optional(),
  role: z.string().optional(),
  redirectTo: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => authSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Authentication — Texora Textile Marketplace" },
      { name: "description", content: "Sign in or sign up as a fabric buyer or supplier to access Texora's AI sourcing workspace." },
      { property: "og:title", content: "Authentication — Texora" },
      { property: "og:description", content: "Buyer and supplier access to AI-powered textile sourcing." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [isSignUp, setIsSignUp] = React.useState(search.mode === "signup");
  const [role, setRole] = React.useState<"Buyer" | "Supplier">(
    search.role === "supplier" ? "Supplier" : "Buyer"
  );
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [showVerificationModal, setShowVerificationModal] = React.useState(false);
  const [registeredEmail, setRegisteredEmail] = React.useState("");

  React.useEffect(() => {
    setIsSignUp(search.mode === "signup");
    if (search.role) {
      setRole(search.role === "supplier" ? "Supplier" : "Buyer");
    }
  }, [search.mode, search.role]);

  React.useEffect(() => {
    if (search.mode !== "signin" || !search.redirectTo) return;

    let isMounted = true;

    const redirectAfterSignIn = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!isMounted || !session?.user) return;
      navigate({ to: search.redirectTo as string });
    };

    redirectAfterSignIn();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted || !session?.user) return;
      navigate({ to: search.redirectTo as string });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, search.mode, search.redirectTo]);

  const validEmail = /\S+@\S+\.\S+/.test(email);
  const validForm = isSignUp
    ? validEmail && password.length >= 6 && fullName.trim() !== "" && companyName.trim() !== ""
    : validEmail && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!validForm) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters.");
      }
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?mode=signin${role === "Supplier" ? "&redirectTo=/onboarding" : ""}`,
            data: {
              role: role.toLowerCase(),
              full_name: fullName,
              company_name: companyName,
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          toast.success("Account created and signed in!");
          if (role === "Supplier") {
            navigate({ to: "/onboarding" });
          } else {
            navigate({ to: "/dashboard/buyer" });
          }
        } else {
          setRegisteredEmail(email);
          setShowVerificationModal(true);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Fetch user profile to route correctly
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user?.id)
          .single();

        if (profileError) throw profileError;

        const dbRole = (profileData.role || "").toLowerCase();
        const uiRole = role.toLowerCase();

        if (dbRole !== uiRole) {
          toast.info(`Account registered as ${profileData.role === "supplier" ? "Supplier" : "Buyer"}. Routing to your workspace.`);
        } else {
          toast.success("Signed in successfully!");
        }

        navigate({
          to: dbRole === "supplier" ? "/dashboard/supplier" : "/dashboard/buyer",
        });
      }
    } catch (err: any) {
      const message = err.message || "Authentication failed.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={fabricImages.hero} alt="Premium fabric swatches" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/25 to-transparent" />
        <div className="absolute inset-x-12 bottom-14">
          <p className="text-2xl font-semibold leading-snug tracking-[-0.03em] text-primary-foreground">
            “Texora turned a three-week sourcing hunt into an eleven-minute search.”
          </p>
          <p className="mt-4 text-sm text-primary-foreground/70">Ananya Rao · Head of Sourcing, Nordvelt</p>
        </div>
      </div>

      <div className="relative flex items-center justify-center overflow-hidden px-6 py-24">
        <MeshBackground intensity="soft" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong relative w-full max-w-md rounded-3xl p-9 shadow-lift"
        >
          <Logo />
          <h1 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignUp ? "Sign up to start B2B sourcing." : "Sign in to your sourcing workspace."}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-2 rounded-full border border-border bg-surface p-1">
            {(["Buyer", "Supplier"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={cn(
                  "relative flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                  role === r ? "text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {role === r ? (
                  <motion.span layoutId="auth-pill" className="absolute inset-0 rounded-full bg-foreground" />
                ) : null}
                <span className="relative flex items-center gap-2">
                  {r === "Buyer" ? <ShoppingBag className="size-4" /> : <Building2 className="size-4" />}
                  {r}
                </span>
              </button>
            ))}
          </div>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <AnimatePresence initial={false}>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ananya Rao"
                      className="mt-2 h-11 rounded-xl"
                      required={isSignUp}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">
                      {role === "Buyer" ? "Company name" : "Mill name"}
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={role === "Buyer" ? "Nordvelt Apparel" : "Kanchi Silk Mills"}
                      className="mt-2 h-11 rounded-xl"
                      required={isSignUp}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="you@company.com"
                className="mt-2 h-11 rounded-xl"
                aria-invalid={touched && !validEmail}
                required
              />
              {touched && !validEmail ? (
                <p className="mt-1.5 text-xs text-destructive">Enter a valid work email address.</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="mt-2 h-11 rounded-xl"
                required
                minLength={6}
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-destructive">{errorMsg}</p>
            )}

            <Button size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <span>Loading...</span>
              ) : (
                <span className="flex items-center gap-1.5">
                  {isSignUp ? "Sign Up" : "Continue"} as {role} <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4 text-[0.7rem] uppercase tracking-[0.12em] text-subtle">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Google", "Microsoft"].map((p) => (
              <Button key={p} variant="outline" className="h-11" onClick={() => toast.info(`${p} OAuth integration is a prototype.`)}>{p}</Button>
            ))}
          </div>

          <p className="mt-7 text-center text-xs text-muted-foreground">
            {isSignUp ? "Already have an account?" : "New to Texora?"}{" "}
            <button
              onClick={() => {
                const nextMode = !isSignUp ? "signup" : "signin";
                setIsSignUp(!isSignUp);
                setErrorMsg("");
                navigate({
                  to: "/auth",
                  search: { mode: nextMode },
                });
              }}
              className="font-medium text-primary hover:underline"
            >
              {isSignUp ? "Sign in instead" : "Create an account"}
            </button>
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {showVerificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="glass-strong relative w-full max-w-md rounded-3xl p-8 text-center shadow-lift border border-border bg-card"
            >
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Mail className="size-6" />
              </div>
              <h2 className="mt-6 text-xl font-bold tracking-tight text-foreground">Confirm your email</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We've sent an activation link to:
              </p>
              <div className="mt-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-foreground inline-block">
                {registeredEmail}
              </div>
              <p className="mt-4 text-xs text-subtle leading-relaxed">
                Please click the link in the email to activate your account. Once verified, you can sign in to begin listing or sourcing fabrics.
              </p>
              <Button
                size="lg"
                className="mt-8 w-full rounded-2xl animate-pulse-subtle"
                onClick={() => {
                  setShowVerificationModal(false);
                  setIsSignUp(false);
                  navigate({
                    to: "/auth",
                    search: {
                      mode: "signin",
                      ...(role === "Supplier" ? { redirectTo: "/onboarding" } : {}),
                    },
                  });
                }}
              >
                Continue to Sign In
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
