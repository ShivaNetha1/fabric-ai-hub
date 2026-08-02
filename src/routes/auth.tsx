import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Building2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { MeshBackground } from "@/components/site/mesh-background";
import { fabricImages } from "@/lib/data";
import { cn } from "@/lib/utils";

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
  const [role, setRole] = React.useState<"Buyer" | "Supplier">("Buyer");
  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const valid = /\S+@\S+\.\S+/.test(email);

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
          <h1 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your sourcing workspace.</p>

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

          <form
            className="mt-7 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              setTouched(true);
            }}
          >
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
                aria-invalid={touched && !valid}
              />
              {touched && !valid ? (
                <p className="mt-1.5 text-xs text-destructive">Enter a valid work email address.</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••••" className="mt-2 h-11 rounded-xl" />
            </div>
            <Button size="lg" className="w-full" type="submit" asChild={valid}>
              {valid ? (
                <Link to={role === "Buyer" ? "/dashboard/buyer" : "/dashboard/supplier"}>
                  Continue as {role} <ArrowRight />
                </Link>
              ) : (
                <span>Continue as {role}</span>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4 text-[0.7rem] uppercase tracking-[0.12em] text-subtle">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Google", "Microsoft"].map((p) => (
              <Button key={p} variant="outline" className="h-11">{p}</Button>
            ))}
          </div>
          <p className="mt-7 text-center text-xs text-muted-foreground">
            New to Loomly?{" "}
            <Link to="/onboarding" className="font-medium text-primary hover:underline">
              Start AI onboarding
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
