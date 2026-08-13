import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeshBackground } from "@/components/site/mesh-background";
import { Reveal } from "@/components/site/reveal";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Active Contracts Under Construction — Texora" },
      { name: "description", content: "Order tracking and contract history console is coming soon." }
    ],
  }),
  component: OrdersUnderConstruction,
});

function OrdersUnderConstruction() {
  const { user, profile } = useAuth();

  // Smart link determination based on auth state and role
  const getDashboardLink = () => {
    if (!user) return "/auth";
    return profile?.role === "supplier" ? "/dashboard/supplier" : "/dashboard/buyer";
  };

  const getDashboardLabel = () => {
    if (!user) return "Sign In to Track Orders";
    return profile?.role === "supplier" ? "Go to Supplier Console" : "Track Buyer Orders";
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      <MeshBackground intensity="soft" />
      <div className="relative w-full max-w-md text-center">
        
        <Reveal>
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-premium shadow-lift text-primary-foreground">
            <FileText className="size-9 animate-bounce" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="mt-8 text-2xl font-bold tracking-tight sm:text-3xl">
            Contracts & <span className="text-gradient-premium">Orders</span>
          </h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Under Construction
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="glass-strong mt-6 rounded-3xl p-6 shadow-soft text-left border border-border/80">
            <p className="text-sm leading-relaxed text-muted-foreground">
              We are building a unified escrow contract manager, digital customs clearance integration, and real-time shipping carrier feeds.
            </p>
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-accent/40 p-3.5 border border-border/60">
              <ShieldAlert className="size-4.5 text-primary shrink-0 mt-0.5" />
              <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                <strong>Current Status</strong>: Order status stages, shipment updates, and purchase history are fully managed within your role-based workspace.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="rounded-full">
              <Link to={getDashboardLink()} className="flex items-center gap-2">
                <ArrowLeft className="size-4" /> {getDashboardLabel()}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
