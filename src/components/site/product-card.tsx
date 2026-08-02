import * as React from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, ShieldCheck, Sparkles, Eye, Scale } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupplier, inr, type Product } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const availabilityTone: Record<string, string> = {
  "In stock": "bg-success/10 text-success",
  "Low stock": "bg-warning/15 text-warning",
  "Made to order": "bg-primary/10 text-primary",
};

export function ProductCard({
  product,
  view = "grid",
  onQuickView,
}: {
  product: Product;
  view?: "grid" | "list";
  onQuickView?: (p: Product) => void;
}) {
  const supplier = getSupplier(product.supplierId);
  const [saved, setSaved] = React.useState(false);
  const cart = useCart();
  const ref = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -6,
      y: ((e.clientX - r.left) / r.width - 0.5) * 6,
    });
  };

  if (view === "list") {
    return (
      <article className="group flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 hover-lift sm:flex-row">
        <Link
          to="/products/$productId"
          params={{ productId: product.id }}
          className="relative w-full shrink-0 overflow-hidden rounded-xl sm:w-56"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-4/3 w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{product.composition}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold",
                availabilityTone[product.availability],
              )}
            >
              {product.availability}
            </span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm">
            <span className="font-semibold">
              {inr(product.pricePerMetre)}
              <span className="font-normal text-subtle"> / metre</span>
            </span>
            <span className="text-muted-foreground">MOQ {product.moq} m</span>
            <span className="text-muted-foreground">{product.gsm} GSM</span>
            <span className="text-muted-foreground">{product.widthCm} cm</span>
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => {
                cart.add(product.id, product.moq, product.colors[0]?.name ?? "Default");
                toast.success(`${product.moq} m added to cart`, { description: product.name });
              }}
            >
              Add to cart
            </Button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      style={{ transformStyle: "preserve-3d", perspective: 900 }}
      className="group relative h-full"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card hover-lift">
        <Link
          to="/products/$productId"
          params={{ productId: product.id }}
          className="relative block overflow-hidden"
          aria-label={`View ${product.name}`}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={900}
            height={720}
            className="aspect-5/4 w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-foreground/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[0.68rem] font-semibold backdrop-blur-md",
                availabilityTone[product.availability],
              )}
            >
              {product.availability}
            </span>
            {product.sustainable ? (
              <span className="rounded-full bg-surface/80 px-2.5 py-1 text-[0.68rem] font-semibold text-success backdrop-blur-md">
                Sustainable
              </span>
            ) : null}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex translate-y-3 gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onQuickView?.(product);
              }}
              className="glass-strong flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-foreground transition-colors hover:bg-surface"
            >
              <Eye className="size-3.5" /> Quick view
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toast("Added to comparison", { description: product.name });
              }}
              aria-label="Compare fabric"
              className="glass-strong grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-surface"
            >
              <Scale className="size-3.5" />
            </button>
          </div>
        </Link>

        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          onClick={() => setSaved((v) => !v)}
          className="glass-strong absolute right-3 top-3 grid size-9 place-items-center rounded-full transition-transform duration-300 hover:scale-110"
        >
          <Heart
            className={cn(
              "size-4 transition-colors",
              saved ? "fill-destructive text-destructive" : "text-muted-foreground",
            )}
          />
        </button>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            <span className="truncate">{supplier?.name}</span>
            <span className="ml-auto shrink-0 font-medium text-foreground">★ {product.rating}</span>
          </div>
          <h3 className="mt-2.5 text-[0.98rem] font-semibold leading-snug">
            <Link to="/products/$productId" params={{ productId: product.id }}>
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{product.subtitle}</p>

          <div className="mt-4 flex items-center gap-1.5">
            {product.colors.map((col) => (
              <span
                key={col.name}
                title={col.name}
                className="size-4 rounded-full border border-border-strong"
                style={{ backgroundColor: col.hex }}
              />
            ))}
            <span className="ml-1 text-[0.7rem] text-subtle">{product.gsm} GSM</span>
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
            <div>
              <p className="text-lg font-semibold tracking-tight">{inr(product.pricePerMetre)}</p>
              <p className="text-[0.7rem] text-subtle">per metre · MOQ {product.moq} m</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                cart.add(product.id, product.moq, product.colors[0]?.name ?? "Default");
                toast.success(`${product.moq} m added to cart`, { description: product.name });
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </article>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-5/4 w-full rounded-none shimmer" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-1/2 shimmer" />
        <Skeleton className="h-4 w-4/5 shimmer" />
        <Skeleton className="h-3 w-2/3 shimmer" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-6 w-20 shimmer" />
          <Skeleton className="h-8 w-16 rounded-full shimmer" />
        </div>
      </div>
    </div>
  );
}

export function AiRecommendBanner() {
  return (
    <div className="gradient-ring relative overflow-hidden rounded-2xl bg-surface p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-ai">
          <Sparkles className="size-5 text-primary-foreground" />
        </span>
        <div>
          <h3 className="text-base font-semibold">Matched to your last three orders</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Loomly AI ranked these by hand-feel similarity, landed cost and mill capacity for your
            September cut date.
          </p>
        </div>
      </div>
    </div>
  );
}
