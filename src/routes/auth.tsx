import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Building2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { MeshBackground } from "@/components/site/mesh-background";
import { fabricImages } from "@/lib/data";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Loomly Textile Marketplace" },
      { name: "description", content: "Sign in as a fabric buyer or supplier to access Loomly's AI sourcing workspace." },
      { property: "og:title", content: "Sign in to Loomly" },
      { property: "og:description", content: "Buyer and supplier access to AI-powered textile sourcing." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [role, setRole] = React.useState<"Buyer" | "Supplier">("Buyer");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

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
          navigate({ to: role === "Buyer" ? "/dashboard/buyer" : "/dashboard/supplier" });
        } else {
          toast.success("Verification email sent! Please check your inbox.");
          setIsSignUp(false);
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

        toast.success("Signed in successfully!");
        navigate({
          to: profileData.role === "supplier" ? "/dashboard/supplier" : "/dashboard/buyer",
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
            “Loomly turned a three-week sourcing hunt into an eleven-minute search.”
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
            {isSignUp ? "Already have an account?" : "New to Loomly?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg("");
              }}
              className="font-medium text-primary hover:underline"
            >
              {isSignUp ? "Sign in instead" : "Create an account"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
