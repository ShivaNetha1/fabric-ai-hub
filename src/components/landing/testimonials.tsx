import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading, StaggerGroup, StaggerItem, Reveal } from "@/components/site/reveal";
import { testimonials } from "@/lib/data";

export function Testimonials() {
  return (
    <section className="mx-auto mt-40 max-w-[88rem] px-6">
      <SectionHeading
        eyebrow="Customers"
        title="Sourcing leads who stopped chasing samples"
        description="Three-week hunts compressed into an afternoon, with compliance evidence attached to every line item."
      />
      <StaggerGroup className="mt-16 grid gap-4 lg:grid-cols-3">
        {testimonials.map((t) => (
          <StaggerItem key={t.name}>
            <figure className="flex h-full flex-col rounded-2xl border border-border/10 bg-card/40 p-8 hover-lift shadow-soft backdrop-blur-md transition-all duration-300">
              <blockquote className="text-[0.98rem] leading-relaxed text-foreground italic">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-8">
                <span className="grid size-10 place-items-center rounded-full bg-gradient-premium text-xs font-bold text-primary-foreground shadow-soft">
                  {t.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section className="mx-auto mt-40 max-w-[88rem] px-6">
      <Reveal className="max-w-none">
        <div className="noise relative overflow-hidden rounded-[2rem] border border-white/10 bg-foreground px-6 py-24 text-center sm:px-16 shadow-lift">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(ellipse 70% 80% at 50% 120%, color-mix(in oklab, var(--primary) 65%, transparent), transparent 70%), radial-gradient(ellipse 50% 60% at 15% 0%, color-mix(in oklab, var(--violet) 45%, transparent), transparent 70%), radial-gradient(ellipse 50% 60% at 90% 10%, color-mix(in oklab, var(--cyan) 35%, transparent), transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold leading-[1.06] tracking-[-0.035em] text-primary-foreground sm:text-5xl">
              Start sourcing with intelligence
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/70">
              Free for buyers. Mills pay only on fulfilled orders. Onboard in under four minutes
              with our conversational setup.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button size="xl" variant="outline" asChild className="border-white/10 text-primary-foreground hover:bg-white/10">
                <Link to="/onboarding">
                  Start AI onboarding <ArrowRight />
                </Link>
              </Button>
              <Button size="xl" variant="ai" asChild>
                <Link to="/marketplace">Browse 10,412 fabrics</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
