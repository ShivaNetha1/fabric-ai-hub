import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, MapPin, Star, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { dbService } from "@/lib/db-service";
import { type Supplier } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { MeshBackground } from "@/components/site/mesh-background";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/reveal";

export const Route = createFileRoute("/suppliers/")({
  loader: async () => {
    const suppliers = await dbService.getSuppliers();
    return { suppliers };
  },
  head: () => ({
    meta: [
      { title: "Verified Textile Mills — Texora" },
      { name: "description", content: "Browse and inspect certified fabric mills. Low MOQs, GOTS/OEKO-TEX traceability." }
    ],
  }),
  component: SuppliersList,
});

function SuppliersList() {
  const { suppliers } = Route.useLoaderData() as { suppliers: Supplier[] };

  return (
    <div className="relative min-h-screen pb-24">
      <MeshBackground intensity="soft" />
      <div className="relative mx-auto max-w-[88rem] px-6 pt-32">
        
        {/* Header */}
        <Reveal>
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Verified Textile <span className="text-gradient-premium">Mills</span>
            </h1>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Connect directly with premium fabric suppliers. View verified certifications, response times, active capacity, and global trade compliance records.
            </p>
          </div>
        </Reveal>

        {/* Directory Grid */}
        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <StaggerItem key={s.id}>
              <div className="group glass-strong flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-premium text-base font-bold text-primary-foreground shrink-0 shadow-soft">
                    {s.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base truncate flex items-center gap-1.5 group-hover:text-primary transition-colors">
                      {s.name}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="size-3 text-primary shrink-0" />
                      {s.city}, {s.country}
                    </p>
                  </div>
                </div>

                <p className="mt-5 line-clamp-3 text-xs leading-relaxed text-muted-foreground flex-1">
                  {s.about || "Verified premium textile manufacturer producing sustainable fabrics for apparel brands worldwide."}
                </p>

                {/* Categories */}
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {s.categories.slice(0, 3).map((cat) => (
                    <span key={cat} className="rounded-full bg-accent/70 px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground">
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Separator */}
                <div className="my-5 h-px bg-border/60" />

                {/* Rating & Response Metrics */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5 fill-warning text-warning" />
                    <span className="font-semibold text-foreground">{s.rating.toFixed(1)}</span>
                    <span>({s.orders}+ POs)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5 text-primary" />
                    <span>Avg response: <strong>{s.responseHours}h</strong></span>
                  </span>
                </div>

                {/* Certificates */}
                {s.certificates.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {s.certificates.slice(0, 2).map((cert) => (
                      <span key={cert} className="inline-flex items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-[0.62rem] font-semibold text-success">
                        <ShieldCheck className="size-3" />
                        {cert}
                      </span>
                    ))}
                  </div>
                )}

                {/* Profile Link Button */}
                <Button variant="outline" size="sm" asChild className="mt-6 w-full rounded-full">
                  <Link to="/suppliers/$supplierId" params={{ supplierId: s.id }} className="flex items-center justify-center gap-1">
                    View profile <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </div>
  );
}
