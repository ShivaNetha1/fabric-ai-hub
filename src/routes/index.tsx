import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/hero";
import { LogoMarquee } from "@/components/landing/logo-marquee";
import { ProductPreview } from "@/components/landing/product-preview";
import { SourcingMap } from "@/components/landing/sourcing-map";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Testimonials, ClosingCta } from "@/components/landing/testimonials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Texora — Premium Textile Marketplace for Buyers & Mills" },
      {
        name: "description",
        content:
          "Discover thousands of fabrics from verified mills. Semantic search, live inventory, bulk ordering and smart supplier matches for apparel sourcing teams.",
      },
      { property: "og:title", content: "Texora — Premium Textile Marketplace" },
      {
        property: "og:description",
        content:
          "Connecting buyers and suppliers with intelligent product discovery across 48 countries.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background selection:bg-primary/10">
      <h1 className="sr-only">Texora — Premium B2B textile marketplace</h1>
      <Hero />
      <LogoMarquee />
      <ProductPreview />
      <FeatureGrid />
      <SourcingMap />
      <Testimonials />
      <ClosingCta />
    </div>
  );
}
