import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Hammer, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeshBackground } from "@/components/site/mesh-background";
import { Reveal } from "@/components/site/reveal";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory Manager Under Construction — Texora" },
      { name: "description", content: "Automated stock control and loom integrations are coming soon." }
    ],
  }),
  component: InventoryUnderConstruction,
});

function InventoryUnderConstruction() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24">
      <MeshBackground intensity="soft" />
      <div className="relative w-full max-w-md text-center">
        
        <Reveal>
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-premium shadow-lift text-primary-foreground">
            <Hammer className="size-9 animate-bounce" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="mt-8 text-2xl font-bold tracking-tight sm:text-3xl">
            Inventory <span className="text-gradient-premium">Manager</span>
          </h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Under Construction
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="glass-strong mt-6 rounded-3xl p-6 shadow-soft text-left border border-border/80">
            <p className="text-sm leading-relaxed text-muted-foreground">
              We are currently weaving our live loom feed integrations, batch tracking capabilities, and automated barcode systems.
            </p>
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-accent/40 p-3.5 border border-border/60">
              <ShieldAlert className="size-4.5 text-primary shrink-0 mt-0.5" />
              <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                <strong>Temporary Note</strong>: You can still create, edit, and delete active fabrics in your catalog directly from the <strong>Supplier Dashboard</strong>.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="rounded-full">
              <Link to="/dashboard/supplier" className="flex items-center gap-2">
                <ArrowLeft className="size-4" /> Go to Dashboard
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
