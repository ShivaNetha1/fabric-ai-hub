import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  BadgeCheck,
  Box,
  Clock,
  RotateCw,
  Sparkles,
  Truck,
  GitCompare,
  Star,
  ArrowLeft,
} from "lucide-react";
import { useRouter, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/site/product-card";
import { QuickViewModal } from "@/components/site/quick-view-modal";
import { Reveal } from "@/components/site/reveal";
import { getProduct, getSupplier, products, inr, type Product } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { dbService } from "@/lib/db-service";

export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params }) => {
    const product = await dbService.getProductById(params.productId);
    if (!product) throw notFound();
    const supplier = await dbService.getSupplierById(product.supplierId) || getSupplier(product.supplierId);
    return { product, supplier };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Fabric not found — Texora" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — ${inr(p.pricePerMetre)}/m | Texora` },
        { name: "description", content: p.description.slice(0, 155) },
        { property: "og:title", content: `${p.name} — Texora` },
        { property: "og:description", content: p.description.slice(0, 155) },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product, supplier } = Route.useLoaderData() as { product: Product; supplier: any };
  const [active, setActive] = React.useState(0);
  const [colour, setColour] = React.useState(product.colors[0]?.name ?? "");
  const [metres, setMetres] = React.useState(product.moq);
  const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null);
  const cart = useCart();

  const related = products.filter((p) => p.id !== product.id && p.material === product.material).slice(0, 3);
  const fallback = products.filter((p) => p.id !== product.id).slice(0, 3);

  const selectedColorObj = product.colors.find((c) => c.name === colour) || product.colors[0];
  const selectedColorIdx = product.colors.findIndex((c) => c.name === colour);
  const displayMainImage = selectedColorObj?.image || product.gallery[selectedColorIdx >= 0 ? selectedColorIdx : active] || product.image;

  return (
    <div className="mx-auto max-w-[88rem] px-6 pb-24 pt-32">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="px-2">/</span>
        <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.div
            key={displayMainImage}
            initial={{ opacity: 0.4, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card"
          >
            <img
              src={displayMainImage}
              alt={`${product.name} - ${colour}`}
              width={900}
              height={720}
              className="aspect-4/3 w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
            />
            <span className="glass-strong absolute bottom-4 left-4 rounded-full px-3.5 py-1.5 text-[0.7rem] font-medium">
              Hover to zoom · 360° viewer coming soon
            </span>
          </motion.div>

          <div className="mt-4 flex gap-3">
            {product.gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "overflow-hidden rounded-xl border-2 transition-all",
                  active === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <img src={g} alt="" loading="lazy" className="size-20 object-cover" />
              </button>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <SpecCard title="Specifications" rows={[
              ["Composition", product.composition],
              ["Weight", `${product.gsm} GSM`],
              ["Width", `${product.widthCm} cm`],
              ["Material", product.material],
              ["Finish", product.subtitle],
            ]} />
            <SpecCard title="Commercial terms" rows={[
              ["Price", `${inr(product.pricePerMetre)} / metre`],
              ["MOQ", `${product.moq} metres`],
              ["Lead time", `${product.leadTimeDays} days`],
              ["Availability", product.availability],
              ["Stock", `${product.stockMetres.toLocaleString("en-IN")} m`],
            ]} />
          </div>

          <div className="gradient-ring mt-4 rounded-2xl bg-surface p-6">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" /> AI explains this fabric
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {product.description} At {product.moq} m your landed cost lands near{" "}
              {inr(product.pricePerMetre * product.moq)} before duties, with {product.leadTimeDays}-day
              production. Closest substitute in the index is within 6% on hand-feel.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => toast("Comparison opened", { description: product.name })}>
                <GitCompare /> Compare fabrics
              </Button>
              <Button variant="ai" size="sm" onClick={() => toast("Texora AI is drafting a spec sheet")}>
                <Sparkles /> Generate spec sheet
              </Button>
            </div>
          </div>

          <section className="mt-12">
            <h2 className="text-lg font-semibold">Buyer reviews</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Ananya Rao", "Nordvelt", 5, "Third repeat order. Shade consistency across 2,400 m was flawless and the 4-point inspection report arrived before dispatch."],
                ["Marc Feld", "Atelier 9", 5, "Hand-feel matched the swatch exactly. Lead time beat the quoted window by two days."],
                ["Giulia Orsini", "Orsini Milano", 4, "Excellent quality. Only note is that the smallest lot size still sits above our sampling needs."],
              ].map(([name, org, stars, text]) => (
                <article key={name as string} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-accent text-xs font-bold text-primary">
                      {(name as string).slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{name}</p>
                      <p className="text-xs text-muted-foreground">{org}</p>
                    </div>
                    <span className="ml-auto flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("size-3.5", i < (stars as number) ? "fill-warning text-warning" : "text-border-strong")} />
                      ))}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky purchase panel */}
        <div>
          <div className="lg:sticky lg:top-28">
            <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <span key={t} className="rounded-full bg-accent px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em]">{product.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{product.composition}</p>

              <p className="mt-6 text-3xl font-semibold tracking-tight">
                {inr(product.pricePerMetre)}
                <span className="text-sm font-normal text-subtle"> / metre</span>
              </p>

              {/* Colourway selection access commented out */}
              {/* <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.1em] text-subtle">Colourway</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setColour(c.name);
                        setActive(i);
                      }}
                      aria-pressed={colour === c.name}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-all cursor-pointer",
                        colour === c.name
                          ? "border-primary bg-accent font-semibold text-foreground ring-2 ring-primary/30"
                          : "border-border text-muted-foreground hover:border-border-strong",
                      )}
                    >
                      <span className="size-3.5 rounded-full border border-border-strong shadow-xs" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div> */}

              <div className="mt-6">
                <label htmlFor="metres" className="text-xs uppercase tracking-[0.1em] text-subtle">
                  Quantity (metres) · MOQ {product.moq}
                </label>
                <input
                  id="metres"
                  type="number"
                  min={product.moq}
                  step={10}
                  value={metres}
                  onChange={(e) => setMetres(Number(e.target.value))}
                  className="mt-3 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary/50"
                />
              </div>

              <Separator className="my-6" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Order subtotal</span>
                <span className="text-lg font-semibold">{inr(product.pricePerMetre * metres)}</span>
              </div>

              <motion.div whileTap={{ scale: 0.98 }} className="mt-5">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    cart.add(product.id, metres, colour);
                    toast.success("Added to cart", { description: `${metres} m · ${colour}` });
                  }}
                >
                  Add to cart
                </Button>
              </motion.div>
              <Button variant="outline" size="lg" className="mt-2.5 w-full" asChild>
                <Link to="/checkout">Request bulk quote</Link>
              </Button>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center">
                {[
                  [Box, `${product.moq} m`, "MOQ"],
                  [Clock, `${product.leadTimeDays} d`, "Lead time"],
                  [Truck, "Free", "Sampling"],
                ].map(([Icon, v, l]) => {
                  const I = Icon as React.ElementType;
                  return (
                    <div key={l as string}>
                      <I className="mx-auto size-4 text-primary" />
                      <p className="mt-2 text-sm font-semibold">{v as string}</p>
                      <p className="text-[0.68rem] text-subtle">{l as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-border bg-card p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-gradient-premium text-sm font-bold text-primary-foreground">
                  {supplier.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {supplier.name}
                    {supplier.verified ? <BadgeCheck className="size-4 text-primary" /> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {supplier.city}, {supplier.country} · since {supplier.since}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
                <div><p className="text-base font-semibold">{supplier.rating}</p><p className="text-subtle">Rating</p></div>
                <div><p className="text-base font-semibold">{supplier.orders.toLocaleString("en-IN")}</p><p className="text-subtle">Orders</p></div>
                <div><p className="text-base font-semibold">{supplier.responseHours}h</p><p className="text-subtle">Response</p></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {product.certifications.map((c) => (
                  <span key={c} className="rounded-full bg-success/10 px-2.5 py-1 text-[0.68rem] font-medium text-success">
                    {c}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-6 w-full" asChild>
                <Link to="/suppliers/$supplierId" params={{ supplierId: supplier.id }}>
                  View supplier profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-24">
        <div className="flex items-center gap-3">
          <RotateCw className="size-4 text-primary" />
          <h2 className="text-lg font-semibold">Related fabrics</h2>
        </div>
        <Reveal className="mt-8 max-w-none">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(related.length ? related : fallback).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        </Reveal>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

function SpecCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm font-semibold">{title}</p>
      <dl className="mt-5 space-y-3.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
