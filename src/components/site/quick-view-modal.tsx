import * as React from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, ShieldCheck, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getSupplier, inr, type Product } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const cart = useCart();
  const [activeImg, setActiveImg] = React.useState(0);
  const [color, setColor] = React.useState("");
  const [metres, setMetres] = React.useState(100);

  React.useEffect(() => {
    if (product) {
      setActiveImg(0);
      setColor(product.colors[0]?.name ?? "Default");
      setMetres(product.moq);
    }
  }, [product]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const supplier = getSupplier(product.supplierId);
  const activeColorIdx = product.colors.findIndex((c) => c.name === color);
  const activeColorObj = product.colors[activeColorIdx >= 0 ? activeColorIdx : 0] || product.colors[0];
  const displayImg = activeColorObj?.image || product.gallery[activeColorIdx >= 0 ? activeColorIdx : activeImg] || product.image;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-border bg-card shadow-lift"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="glass-strong absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
            {/* Gallery */}
            <div>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <img
                  src={displayImg}
                  alt={`${product.name} - ${color}`}
                  className="aspect-4/3 w-full object-cover transition-all duration-500"
                />
              </div>
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                {product.gallery.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                      activeImg === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <img src={g} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info & Ordering */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                <span>{supplier?.name}</span>
                <span className="ml-auto font-medium text-foreground">★ {product.rating}</span>
              </div>

              <h2 className="mt-2 text-xl font-semibold sm:text-2xl">{product.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{product.composition} · {product.gsm} GSM · {product.widthCm} cm</p>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-bold">{inr(product.pricePerMetre)}</span>
                <span className="text-xs text-subtle">/ metre · MOQ {product.moq} m</span>
              </div>

              <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              {/* Colorways selection access commented out */}
              {/* <div className="mt-5">
                <p className="text-[0.7rem] uppercase tracking-wider text-subtle font-medium">Select Colorway</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setColor(c.name);
                        setActiveImg(i);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all cursor-pointer",
                        color === c.name ? "border-primary bg-accent font-semibold text-foreground ring-2 ring-primary/30" : "border-border text-muted-foreground hover:border-border-strong",
                      )}
                    >
                      <span className="size-3 rounded-full border border-border-strong" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div> */}

              {/* Quantity */}
              <div className="mt-5">
                <label htmlFor="quick-metres" className="text-[0.7rem] uppercase tracking-wider text-subtle font-medium">
                  Quantity (metres)
                </label>
                <input
                  id="quick-metres"
                  type="number"
                  min={product.moq}
                  step={10}
                  value={metres}
                  onChange={(e) => setMetres(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-primary/50"
                />
              </div>

              {/* Total & Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Est. Subtotal</span>
                  <span className="font-semibold text-sm">{inr(product.pricePerMetre * metres)}</span>
                </div>

                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => {
                    cart.add(product.id, metres, color);
                    toast.success(`${metres} m added to cart`, { description: `${product.name} (${color})` });
                    onClose();
                  }}
                >
                  <ShoppingCart className="size-4" /> Add to cart
                </Button>

                <Button variant="outline" size="lg" className="w-full gap-2" asChild>
                  <Link
                    to="/products/$productId"
                    params={{ productId: product.id }}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                  >
                    View full details <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
