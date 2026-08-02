import {
  Sparkles,
  BadgeCheck,
  Boxes,
  Mic,
  MessageSquareText,
  Radar,
  GitCompare,
  Wand2,
  Zap,
} from "lucide-react";
import { SectionHeading, StaggerGroup, StaggerItem } from "@/components/site/reveal";

const features = [
  {
    icon: Sparkles,
    title: "AI powered discovery",
    body: "Vector search reads composition, hand-feel and finish notes — not just keywords — to rank 10,412 fabrics against your brief.",
  },
  {
    icon: BadgeCheck,
    title: "Verified suppliers",
    body: "Every mill is audited for capacity, certification and dispute history before a single listing goes live.",
  },
  {
    icon: Boxes,
    title: "Bulk ordering",
    body: "Split a purchase order across colourways, lots and delivery windows with MOQ enforced at the line level.",
  },
  {
    icon: Mic,
    title: "Voice search",
    body: "Speak a spec on the factory floor. Loom transcribes, parses GSM and width, and returns matching stock.",
  },
  {
    icon: MessageSquareText,
    title: "Natural language search",
    body: "\"Breathable summer shirting under ₹300 with GOTS\" resolves to a filtered, ranked result set instantly.",
  },
  {
    icon: Radar,
    title: "Semantic matching",
    body: "Upload a reference swatch photo and find the nearest available equivalents across every connected mill.",
  },
  {
    icon: GitCompare,
    title: "Product comparison",
    body: "Side-by-side spec, cost and lead-time comparison with landed-cost estimates to your warehouse.",
  },
  {
    icon: Wand2,
    title: "AI recommendations",
    body: "Your order history trains a private ranking model that surfaces substitutes before a mill runs short.",
  },
  {
    icon: Zap,
    title: "Fast checkout",
    body: "Saved shipping lanes, GST details and payment terms turn a repeat order into two clicks.",
  },
];

export function FeatureGrid() {
  return (
    <section className="mx-auto mt-40 max-w-[88rem] px-6">
      <SectionHeading
        align="center"
        eyebrow="Platform"
        title="Everything sourcing teams asked for, nothing they didn't"
        description="Nine capabilities that replace spreadsheets, WhatsApp threads and three-week sample hunts."
      />
      <StaggerGroup className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <StaggerItem key={f.title}>
            <article className="group h-full rounded-2xl border border-border bg-card p-7 hover-lift">
              <span className="grid size-11 place-items-center rounded-xl bg-accent transition-colors duration-500 group-hover:bg-gradient-ai">
                <f.icon className="size-5 text-primary transition-colors duration-500 group-hover:text-primary-foreground" />
              </span>
              <h3 className="mt-6 text-base font-semibold">{f.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
