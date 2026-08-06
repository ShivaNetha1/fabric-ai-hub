import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, List, Mic, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MeshBackground } from "@/components/site/mesh-background";
import { ProductCard, ProductCardSkeleton } from "@/components/site/product-card";
import { dbService } from "@/lib/db-service";
import { type Product, materials, suppliers, inr } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — Browse Premium Verified Fabrics | Texora" },
      {
        name: "description",
        content:
          "Filter cotton, silk, linen, wool and technical fabrics by MOQ, price, GSM, width and certification. Live stock from verified mills.",
      },
      { property: "og:title", content: "Texora Marketplace — Browse verified fabrics" },
      {
        property: "og:description",
        content: "Search across every connected textile mill.",
      },
    ],
  }),
  component: Marketplace,
});

const chips = ["All", ...materials];

function Marketplace() {
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [material, setMaterial] = React.useState("All");
  const [maxPrice, setMaxPrice] = React.useState(3500);
  const [maxMoq, setMaxMoq] = React.useState(500);
  const [supplierIds, setSupplierIds] = React.useState<string[]>([]);
  const [sustainableOnly, setSustainableOnly] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [visible, setVisible] = React.useState(8);

  React.useEffect(() => {
    Promise.all([
      dbService.getProducts(),
      dbService.getSuppliers()
    ]).then(([allProds, activeSups]) => {
      const activeSupIds = activeSups.map((s) => s.id);
      const filteredProds = allProds.filter((p) => activeSupIds.includes(p.supplierId));
      setProductsList(filteredProds);
      setLoading(false);
    });
  }, []);

  const filtered = productsList.filter((p) => {
    if (material !== "All" && p.material !== material) return false;
    if (p.pricePerMetre > maxPrice) return false;
    if (p.moq > maxMoq) return false;
    if (supplierIds.length && !supplierIds.includes(p.supplierId)) return false;
    if (sustainableOnly && !p.sustainable) return false;
    
    if (query) {
      const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const textToSearch = `${p.name} ${p.composition} ${p.material} ${p.tags.join(" ")}`.toLowerCase();
      // Ensure all search terms are found in the product text details
      const matchesAllTerms = searchTerms.every((term) => textToSearch.includes(term));
      if (!matchesAllTerms) return false;
    }
    
    return true;
  });

  const shown = filtered.slice(0, visible);

  return (
    <div className="relative">
      <section className="relative overflow-hidden px-6 pb-14 pt-32 sm:pt-40">
        <MeshBackground intensity="soft" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
            Find the exact fabric, <span className="text-gradient-premium">described your way</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Search by composition, hand-feel, certification or budget. Live stock from 1,200 verified mills.
          </p>

          <div className="gradient-ring mx-auto mt-9 flex max-w-2xl items-center gap-2 rounded-full bg-surface p-2 pl-5 shadow-lift">
            <Search className="size-4 shrink-0 text-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Breathable summer shirting under ₹300 with GOTS…"
              aria-label="Search fabrics"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-subtle"
            />
            {/* <Button variant="ghost" size="icon" aria-label="Voice search">
              <Mic />
            </Button> */}
            <Button size="sm" className="shrink-0 rounded-full px-5">
              Search
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => setMaterial(c)}
                aria-pressed={material === c}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-medium transition-all duration-300",
                  material === c
                    ? "gradient-ring bg-surface text-foreground shadow-soft"
                    : "border border-border bg-surface/60 text-muted-foreground hover:-translate-y-0.5 hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          <aside className="h-max rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-28">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="size-4 text-primary" /> Filters
            </p>

            <div className="mt-7 space-y-8">
              <div>
                <Label className="text-xs uppercase tracking-[0.1em] text-subtle">
                  Max price · {inr(maxPrice)}/m
                </Label>
                <Slider
                  className="mt-4"
                  value={[maxPrice]}
                  min={200}
                  max={3500}
                  step={50}
                  onValueChange={(v) => setMaxPrice(v[0] ?? 3500)}
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.1em] text-subtle">
                  Max MOQ · {maxMoq} m
                </Label>
                <Slider
                  className="mt-4"
                  value={[maxMoq]}
                  min={40}
                  max={500}
                  step={10}
                  onValueChange={(v) => setMaxMoq(v[0] ?? 500)}
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-subtle">Supplier</p>
                <div className="mt-4 space-y-3">
                  {suppliers.map((s) => (
                    <div key={s.id} className="flex items-center gap-2.5">
                      <Checkbox
                        id={s.id}
                        checked={supplierIds.includes(s.id)}
                        onCheckedChange={(c) =>
                          setSupplierIds((prev) =>
                            c ? [...prev, s.id] : prev.filter((x) => x !== s.id),
                          )
                        }
                      />
                      <Label htmlFor={s.id} className="text-sm font-normal text-muted-foreground">
                        {s.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="sustainable"
                  checked={sustainableOnly}
                  onCheckedChange={(c) => setSustainableOnly(Boolean(c))}
                />
                <Label htmlFor="sustainable" className="text-sm font-normal text-muted-foreground">
                  Sustainable only
                </Label>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setMaterial("All");
                  setMaxPrice(3500);
                  setMaxMoq(500);
                  setSupplierIds([]);
                  setSustainableOnly(false);
                  setQuery("");
                }}
              >
                Reset filters
              </Button>
            </div>
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length}</span> fabrics
                match
              </p>
              <div className="inline-flex rounded-full border border-border bg-surface p-1">
                {(["grid", "list"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    aria-label={`${v} view`}
                    aria-pressed={view === v}
                    className={cn(
                      "grid size-8 place-items-center rounded-full transition-colors",
                      view === v ? "bg-foreground text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {v === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "mt-6 gap-5",
                    view === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col",
                  )}
                >
                  {shown.map((p) => (
                    <ProductCard key={p.id} product={p} view={view} />
                  ))}
                </div>
                {shown.length === 0 ? (
                  <p className="mt-16 text-center text-sm text-muted-foreground">
                    No fabrics match these filters. Try widening MOQ or price.
                  </p>
                ) : null}
                {visible < filtered.length ? (
                  <div className="mt-12 text-center">
                    <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + 6)}>
                      Load more fabrics
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
