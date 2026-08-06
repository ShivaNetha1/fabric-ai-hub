import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, CreditCard, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { dbService } from "@/lib/db-service";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Texora" },
      { name: "description", content: "Confirm shipping lane, GST details and payment terms to raise your fabric purchase order." },
      { property: "og:title", content: "Checkout — Texora" },
      { property: "og:description", content: "Two-step bulk fabric checkout with escrow protection." },
    ],
  }),
  component: Checkout,
});

const stepsList = [
  { title: "Delivery", icon: MapPin },
  { title: "Payment", icon: CreditCard },
  { title: "Confirm", icon: Check },
];

function Checkout() {
  const cart = useCart();
  const { user } = useAuth();
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const total = cart.subtotal * 1.05 + 14500;

  // Form states
  const [company, setCompany] = React.useState("Nordvelt Apparel Pvt Ltd");
  const [gstin, setGstin] = React.useState("33AABCN1429P1ZV");
  const [address, setAddress] = React.useState("Plot 42, Textile Park Road");
  const [city, setCity] = React.useState("Tiruppur");
  const [pincode, setPincode] = React.useState("641604");

  const handlePlaceOrder = async () => {
    if (cart.lines.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!user) {
      toast.info("Proceeding as guest prototype. Sign in to save purchase orders.");
      cart.clear();
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = `${address}, ${city}, PIN: ${pincode} (GSTIN: ${gstin})`;
      
      for (const item of cart.detailed) {
        await dbService.createOrder({
          buyerId: user.id,
          supplierId: item.product.supplierId,
          productId: item.product.id,
          productName: item.product.name,
          colour: item.line.colour,
          qty: item.line.metres,
          unitPrice: item.product.pricePerMetre,
          totalAmount: item.product.pricePerMetre * item.line.metres,
          shippingAddress,
        });
      }

      await cart.clear();
      toast.success("All purchase orders raised successfully!");
      setStep(2);
    } catch (err: any) {
      console.error("Error creating orders:", err);
      toast.error(err.message || "Failed to raise purchase orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      await handlePlaceOrder();
    }
  };

  return (
    <div className="mx-auto max-w-[76rem] px-6 pb-24 pt-32">
      <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Checkout</h1>

      <div className="mt-10 flex items-center gap-3">
        {stepsList.map((s, i) => (
          <React.Fragment key={s.title}>
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full text-xs font-semibold transition-colors",
                  i <= step ? "bg-foreground text-primary-foreground" : "border border-border text-subtle",
                )}
              >
                <s.icon className="size-4" />
              </span>
              <span className={cn("text-sm font-medium", i <= step ? "text-foreground" : "text-subtle")}>
                {s.title}
              </span>
            </div>
            {i < stepsList.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          {step === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="mt-2 h-11 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="gstin">GSTIN</Label>
                <Input id="gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} className="mt-2 h-11 rounded-xl" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Delivery address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2 h-11 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-2 h-11 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="pincode">PIN code</Label>
                <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="mt-2 h-11 rounded-xl" />
              </div>
              <div className="sm:col-span-2 rounded-xl border border-border bg-surface p-5">
                <p className="flex items-center gap-2 text-sm font-medium"><Truck className="size-4 text-primary" /> Consolidated freight</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  All lines ship together from the Ahmedabad consolidation hub. Estimated arrival 29 July 2026.
                </p>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Cardholder name" defaultValue="Ananya Rao" className="sm:col-span-2" />
              <Field label="Card number" defaultValue="4242 4242 4242 4242" className="sm:col-span-2" />
              <Field label="Expiry" defaultValue="09 / 29" />
              <Field label="CVC" defaultValue="•••" />
              <div className="sm:col-span-2 rounded-xl border border-border bg-surface p-5">
                <p className="text-sm font-medium">Net 30 terms available</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Verified buyers with three fulfilled orders qualify for 30-day credit at 0% for the first cycle.
                </p>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="text-center">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
                className="mx-auto grid size-14 place-items-center rounded-2xl bg-success"
              >
                <Check className="size-6 text-success-foreground" />
              </motion.span>
              <h2 className="mt-6 text-xl font-semibold">Purchase order raised</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                The respective mills have been notified. You'll get an acceptance confirmation within their
                stated response windows, and funds stay in escrow until inspection passes.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild><Link to="/dashboard/buyer">Track this order</Link></Button>
                <Button variant="outline" asChild><Link to="/marketplace">Continue sourcing</Link></Button>
              </div>
            </div>
          ) : null}

          {step < 2 ? (
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
              <Button onClick={handleNext} disabled={loading}>
                {loading ? "Processing..." : (step === 0 ? "Continue to payment" : "Place purchase order")}
              </Button>
            </div>
          ) : null}
        </motion.div>

        <aside className="h-max rounded-2xl border border-border bg-card p-7 lg:sticky lg:top-28">
          <h2 className="text-base font-semibold">Order</h2>
          <ul className="mt-5 space-y-4">
            {cart.detailed.map(({ line, product }) => (
              <li key={line.productId + "-" + line.colour} className="flex gap-3">
                <img src={product.image} alt="" loading="lazy" className="size-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{line.metres} m · {line.colour}</p>
                </div>
                <p className="text-sm font-semibold">{inr(product.pricePerMetre * line.metres)}</p>
              </li>
            ))}
          </ul>
          <Separator className="my-6" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total incl. GST</span>
            <span className="text-2xl font-semibold tracking-tight">{inr(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, className }: { label: string; defaultValue: string; className?: string }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} defaultValue={defaultValue} className="mt-2 h-11 rounded-xl" />
    </div>
  );
}
