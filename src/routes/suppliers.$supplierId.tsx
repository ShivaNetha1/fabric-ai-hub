import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { 
  Building2, 
  Clock, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Star, 
  ChevronRight, 
  ArrowLeft 
} from "lucide-react";
import { dbService } from "@/lib/db-service";
import { getSupplier, type Supplier, type Product } from "@/lib/data";
import { ProductCard } from "@/components/site/product-card";
import { MeshBackground } from "@/components/site/mesh-background";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/suppliers/$supplierId")({
  loader: async ({ params }) => {
    const supplier = await dbService.getSupplierById(params.supplierId) || getSupplier(params.supplierId);
    if (!supplier) throw notFound();

    const allProducts = await dbService.getProducts();
    const products = allProducts.filter((p) => p.supplierId === supplier.id);

    return { supplier, products };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Supplier not found — Loomly" }] };
    }
    const s = loaderData.supplier;
    return {
      meta: [
        { title: `${s.name} — Verified Textile Mill | Loomly` },
        { name: "description", content: `${s.name} in ${s.city}, ${s.country}. Verified since ${s.since} producing ${s.categories.join(", ")}.` }
      ]
    };
  },
  component: SupplierProfileView,
});

function SupplierProfileView() {
  const { supplier, products } = Route.useLoaderData() as { supplier: Supplier; products: Product[] };

  return (
    <div className="relative min-h-screen pb-24">
      <MeshBackground intensity="soft" />
      <div className="relative mx-auto max-w-[88rem] px-6 pt-32">
        
        {/* Back navigation */}
        <Link to="/marketplace" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="size-3.5" /> Back to marketplace
        </Link>

        {/* Profile Card Header */}
        <div className="glass-strong rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-lift">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <span className="grid size-16 place-items-center rounded-2xl bg-gradient-premium text-2xl font-bold text-primary-foreground shrink-0 shadow-soft">
              {supplier.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{supplier.name}</h1>
                {supplier.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                    <ShieldCheck className="size-3.5" /> Verified Mill
                  </span>
                )}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary" /> {supplier.city}, {supplier.country}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 text-warning fill-warning" /> {supplier.rating} rating ({supplier.orders}+ contracts)
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-primary" /> {supplier.responseHours}h average response
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {supplier.certificates.map((cert) => (
                  <span key={cert} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-muted-foreground">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Contact Card */}
            <div className="rounded-2xl border border-border bg-surface p-5 text-xs text-muted-foreground w-full md:w-64 space-y-3 shrink-0">
              <p className="font-semibold text-foreground flex items-center gap-1.5"><Building2 className="size-3.5" /> Mill Details</p>
              <Separator />
              <p><strong>Established</strong>: Since {supplier.since}</p>
              <p><strong>Hours</strong>: {supplier.hours}</p>
              {supplier.phone && (
                <p className="flex items-center gap-1.5"><Phone className="size-3.5" /> {supplier.phone}</p>
              )}
              {supplier.email && (
                <p className="flex items-center gap-1.5"><Mail className="size-3.5" /> {supplier.email}</p>
              )}
            </div>
          </div>

          {supplier.about && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">Operational Capabilities</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-4xl">
                {supplier.about}
              </p>
            </div>
          )}
        </div>

        {/* Supplier Catalog */}
        <section className="mt-16">
          <div className="flex items-center gap-2 mb-8">
            <Building2 className="size-4.5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">Listed Fabrics ({products.length})</h2>
          </div>

          {products.length === 0 ? (
            <div className="glass-strong rounded-3xl border border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">This supplier hasn't listed any fabrics yet.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} view="grid" />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
