import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Package, TrendingUp, Truck, Users } from "lucide-react";
import { SectionHeading, Reveal } from "@/components/site/reveal";
import { fabricImages, inr } from "@/lib/data";
import { cn } from "@/lib/utils";

const tabs = ["Buyer workspace", "Supplier console"] as const;
type Tab = (typeof tabs)[number];

export function ProductPreview() {
  const [tab, setTab] = React.useState<Tab>("Buyer workspace");

  return (
    <section className="mx-auto mt-40 max-w-[88rem] px-6">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Product preview"
          title="Two sides of the same order, perfectly in sync"
          description="Buyers track landed cost and delivery windows. Mills see demand, capacity and payouts. One shared source of truth."
        />
        <Reveal delay={0.1}>
          <div
            role="tablist"
            aria-label="Preview surface"
            className="inline-flex rounded-full border border-border bg-surface p-1 shadow-soft"
          >
            {tabs.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  tab === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab === t ? (
                  <motion.span
                    layoutId="preview-pill"
                    className="absolute inset-0 rounded-full bg-foreground"
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  />
                ) : null}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.05} className="mt-14 max-w-none">
        <div className="relative overflow-hidden rounded-3xl border border-border/10 bg-card/60 p-3 shadow-lift sm:p-5 backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-24 h-48 opacity-70 blur-[80px]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)",
            }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {tab === "Buyer workspace" ? <BuyerPreview /> : <SupplierPreview />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-2xl border border-border/10 bg-surface/50 p-5 shadow-soft hover-lift transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-xl bg-accent/70">
          <Icon className="size-4 text-primary" />
        </span>
        <span className="flex items-center gap-0.5 text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
          <ArrowUpRight className="size-3.5" />
          {delta}
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function BuyerPreview() {
  return (
    <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile icon={Package} label="Active orders" value="14" delta="12%" />
          <StatTile icon={Truck} label="On-time delivery" value="98.2%" delta="1.4%" />
          <StatTile icon={TrendingUp} label="Spend this quarter" value="₹2.43 Cr" delta="8%" />
        </div>
        <div className="rounded-2xl border border-border/10 bg-surface/50 p-6 backdrop-blur-md">
          <p className="text-sm font-semibold tracking-tight text-foreground">Order timeline · LM-48213</p>
          <ol className="mt-6 space-y-5">
            {([
              ["Purchase order confirmed", "12 Jul · Arvind Weaving House"],
              ["Yarn dyed and loaded", "16 Jul · Lot AW-2211"],
              ["Quality inspection passed", "23 Jul · 4-point system, 0 defects"],
              ["In transit to Tiruppur", "ETA 29 Jul"],
            ] as [string, string][]).map(([title, meta], i) => (
              <li key={title} className="flex gap-4">
                <span className="relative mt-1 flex flex-col items-center">
                  <span
                    className={cn(
                      "size-2.5 rounded-full transition-all duration-300",
                      i < 3 ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-primary ring-4 ring-primary/20",
                    )}
                  />
                  {i < 3 ? <span className="mt-1 h-9 w-px bg-border/60" /> : null}
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">{title}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{meta}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="space-y-3">
        <div className="gradient-ring rounded-2xl bg-surface/50 p-6 backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Spotlight Swatch
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Enzyme-washed European flax linen with lived-in softness. Pre-shrunk and garment-ready for seasonal shirting collections.
          </p>
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-border/10 bg-background/50 p-3 hover:border-primary/30 transition-all">
            <img
              src={fabricImages.linen}
              alt=""
              loading="lazy"
              className="size-12 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">European Flax Linen 185 GSM</p>
              <p className="text-xs text-muted-foreground">{inr(486)} / m · MOQ 200 m</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/10 bg-surface/50 p-6 backdrop-blur-md">
          <p className="text-sm font-semibold">Saved suppliers</p>
          <ul className="mt-4 space-y-3.5">
            {([
              ["Arvind Weaving House", "Ahmedabad · 2h response"],
              ["Baltic Linen Works", "Vilnius · 6h response"],
              ["Milano Lana Tessuti", "Biella · 8h response"],
            ] as [string, string][]).map(([n, m]) => (
              <li key={n} className="flex items-center gap-3 group">
                <span className="grid size-8 place-items-center rounded-full bg-accent text-[0.65rem] font-bold text-primary group-hover:scale-105 transition-transform duration-300">
                  {n.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{n}</span>
                  <span className="block text-xs text-muted-foreground">{m}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SupplierPreview() {
  const bars = [42, 58, 51, 74, 66, 88, 79, 96];
  return (
    <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatTile icon={TrendingUp} label="Revenue this month" value="₹74.8 L" delta="18%" />
          <StatTile icon={Users} label="Repeat buyers" value="22" delta="6%" />
        </div>
        <div className="rounded-2xl border border-border/10 bg-surface/50 p-6 backdrop-blur-md">
          <p className="text-sm font-semibold">Capacity utilisation</p>
          <div className="mt-6 flex h-32 items-end gap-2.5">
            {bars.map((h, i) => (
              <motion.span
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 rounded-t-md bg-gradient-to-t from-primary/30 to-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]"
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            42 air-jet looms · 96% booked through August
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-border/10 bg-surface/50 p-6 backdrop-blur-md">
        <p className="text-sm font-semibold">Incoming purchase orders</p>
        <div className="mt-5 space-y-2.5">
          {([
            ["LM-48219", "Nordvelt Apparel", "2,400 m", 508800, "Pending"],
            ["LM-48214", "Kestrel & Co.", "1,200 m", 427200, "Pending"],
            ["LM-48201", "Maison Cera", "800 m", 593600, "Accepted"],
            ["LM-48188", "Lumen Apparel", "5,000 m", 1340000, "Accepted"],
          ] as [string, string, string, number, string][]).map(([id, buyer, qty, value, stage]) => (
            <div
              key={id}
              className="flex items-center gap-4 rounded-xl border border-border/10 bg-background/30 px-4 py-3.5 transition-all hover:bg-accent/40 hover:-translate-y-0.5"
            >
              <span className="w-20 shrink-0 font-mono text-xs text-subtle">{id}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{buyer}</span>
                <span className="block text-xs text-muted-foreground">{qty}</span>
              </span>
              <span className="hidden text-sm font-semibold sm:block">{inr(value)}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold",
                  stage === "Pending" ? "bg-warning/15 text-warning" : "bg-success/12 text-success",
                )}
              >
                {stage}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
