import { brandLogos } from "@/lib/data";

export function LogoMarquee() {
  const row = [...brandLogos, ...brandLogos];
  return (
    <section className="mt-40 overflow-hidden py-6" aria-label="Brands sourcing on Loomly">
      <p className="mb-8 text-center text-[0.7rem] uppercase tracking-[0.18em] text-subtle">
        Sourcing teams building on Loomly
      </p>
      <div
        className="relative"
        style={{
          maskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div
          className="flex w-max gap-16 pr-16"
          style={{ animation: "marquee-x 34s linear infinite" }}
        >
          {row.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap text-lg font-semibold tracking-[-0.02em] text-subtle transition-colors hover:text-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
