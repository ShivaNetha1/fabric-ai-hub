import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { getSupplier, inr } from "@/lib/data";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart — Texora" },
      { name: "description", content: "Review fabric quantities, colourways and mill terms before raising your purchase order." },
      { property: "og:title", content: "Your Texora cart" },
      { property: "og:description", content: "Bulk fabric lines, MOQ-checked and ready for checkout." },
    ],
  }),
  component: Cart,
});

function Cart() {
  const cart = useCart();
  const gst = cart.subtotal * 0.05;
  const logistics = cart.subtotal > 0 ? 14500 : 0;

  return (
    <div className="mx-auto max-w-[76rem] px-6 pb-24 pt-32">
      <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Your cart</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {cart.count} fabric {cart.count === 1 ? "line" : "lines"} · MOQ verified against each mill.
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {cart.detailed.map(({ line, product }) => (
            <article key={line.productId + "-" + line.colour} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:flex-row">
              <img src={product.image} alt={product.name} loading="lazy" className="size-28 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      <Link to="/products/$productId" params={{ productId: product.id }}>{product.name}</Link>
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getSupplier(product.supplierId)?.name} · {line.colour} · {product.gsm} GSM
                    </p>
                  </div>
                  <button
                    onClick={() => cart.remove(product.id)}
                    aria-label={`Remove ${product.name}`}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-subtle transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-1 rounded-full border border-border p-1">
                    <button
                      onClick={() => cart.setMetres(product.id, line.metres - 50)}
                      aria-label="Decrease quantity"
                      className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-20 text-center text-sm font-medium">{line.metres} m</span>
                    <button
                      onClick={() => cart.setMetres(product.id, line.metres + 50)}
                      aria-label="Increase quantity"
                      className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-lg font-semibold">{inr(product.pricePerMetre * line.metres)}</p>
                </div>
              </div>
            </article>
          ))}

          {cart.count === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-14 text-center">
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              <Button className="mt-6" asChild><Link to="/marketplace">Browse fabrics</Link></Button>
            </div>
          ) : null}
        </div>

        <aside className="h-max rounded-2xl border border-border bg-card p-7 lg:sticky lg:top-28">
          <h2 className="text-base font-semibold">Order summary</h2>
          <dl className="mt-6 space-y-3.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-medium">{inr(cart.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">GST (5%)</dt><dd className="font-medium">{inr(gst)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Logistics estimate</dt><dd className="font-medium">{inr(logistics)}</dd></div>
          </dl>
          <Separator className="my-6" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-semibold tracking-tight">{inr(cart.subtotal + gst + logistics)}</span>
          </div>
          <Button size="lg" className="mt-7 w-full" asChild disabled={cart.count === 0}>
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" /> Escrow-protected until inspection passes
          </p>
        </aside>
      </div>
    </div>
  );
}
