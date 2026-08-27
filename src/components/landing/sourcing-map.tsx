import { motion } from "motion/react";
import { SectionHeading } from "@/components/site/reveal";

const nodes = [
  { id: "Ahmedabad", x: 68, y: 44, size: 7 },
  { id: "Kanchipuram", x: 70, y: 50, size: 6 },
  { id: "Vilnius", x: 53, y: 20, size: 6 },
  { id: "Biella", x: 48, y: 28, size: 6 },
  { id: "Porto", x: 44, y: 34, size: 5 },
  { id: "Istanbul", x: 56, y: 34, size: 5 },
  { id: "Ho Chi Minh", x: 80, y: 50, size: 5 },
  { id: "São Paulo", x: 32, y: 56, size: 5 },
  { id: "New York", x: 22, y: 28, size: 5 },
  { id: "Osaka", x: 89, y: 32, size: 5 },
];

const links: [number, number][] = [
  [8, 4],  // New York -> Porto
  [4, 3],  // Porto -> Biella
  [3, 2],  // Biella -> Vilnius
  [3, 5],  // Biella -> Istanbul
  [5, 0],  // Istanbul -> Ahmedabad
  [0, 1],  // Ahmedabad -> Kanchipuram
  [0, 6],  // Ahmedabad -> Ho Chi Minh
  [6, 9],  // Ho Chi Minh -> Osaka
  [7, 4],  // São Paulo -> Porto
];

// High-precision continent matrix generator for an authentic world map silhouette
const isRealWorldLand = (x: number, y: number): boolean => {
  // North America
  if (x >= 6 && x <= 32 && y >= 8 && y <= 22) return true; // Alaska & Canada
  if (x >= 14 && x <= 30 && y >= 22 && y <= 35) return true; // USA Mainland
  if (x >= 16 && x <= 25 && y >= 35 && y <= 45) return true; // Mexico & Central America
  if (x >= 25 && x <= 28 && y >= 36 && y <= 40) return true; // Caribbean Islands

  // South America
  if (x >= 26 && x <= 38 && y >= 45 && y <= 62) return true; // Northern South America & Brazil
  if (x >= 28 && x <= 33 && y >= 62 && y <= 76) return true; // Southern Cone

  // Europe
  if (x >= 43 && x <= 47 && y >= 18 && y <= 25) return true; // UK & Ireland
  if (x >= 48 && x <= 58 && y >= 10 && y <= 22) return true; // Scandinavia
  if (x >= 45 && x <= 58 && y >= 22 && y <= 36) return true; // Western & Central Europe
  if (x >= 44 && x <= 56 && y >= 36 && y <= 42) return true; // Mediterranean

  // Africa
  if (x >= 44 && x <= 62 && y >= 38 && y <= 48) return true; // North Africa
  if (x >= 44 && x <= 60 && y >= 48 && y <= 62) return true; // West & Central Africa
  if (x >= 52 && x <= 62 && y >= 62 && y <= 72) return true; // Southern Africa
  if (x >= 63 && x <= 66 && y >= 58 && y <= 68) return true; // Madagascar

  // Asia
  if (x >= 58 && x <= 92 && y >= 10 && y <= 26) return true; // Siberia & Northern Asia
  if (x >= 56 && x <= 66 && y >= 32 && y <= 44) return true; // Middle East
  if (x >= 64 && x <= 76 && y >= 34 && y <= 54) return true; // Indian Subcontinent
  if (x >= 72 && x <= 90 && y >= 26 && y <= 46) return true; // China & East Asia
  if (x >= 88 && x <= 92 && y >= 28 && y <= 38) return true; // Japan
  if (x >= 76 && x <= 88 && y >= 46 && y <= 62) return true; // Southeast Asia & Indonesia

  // Australia & Oceania
  if (x >= 78 && x <= 94 && y >= 60 && y <= 76) return true; // Australia
  if (x >= 92 && x <= 96 && y >= 70 && y <= 78) return true; // New Zealand

  return false;
};

const landDots: { x: number; y: number }[] = [];
for (let r = 0; r < 36; r++) {
  for (let cIdx = 0; cIdx < 55; cIdx++) {
    const x = 2 + cIdx * 1.75;
    const y = 4 + r * 2.1;
    if (isRealWorldLand(x, y)) {
      landDots.push({ x, y });
    }
  }
}

export function SourcingMap() {
  return (
    <section className="mx-auto mt-40 max-w-[88rem] px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/10 bg-card/40 p-6 sm:p-10 shadow-lift backdrop-blur-md">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 60% 40%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%)",
          }}
        />

        <SectionHeading
          align="center"
          eyebrow="Global network"
          title="Mills on four continents, one sourcing surface"
          description="Live capacity from 1,200 verified suppliers across 48 countries, priced to your delivery port."
          className="relative mb-8"
        />

        <svg
          viewBox="0 0 100 80"
          className="relative aspect-2/1 w-full"
          role="img"
          aria-label="World map showing Texora supplier hubs and active trade lanes"
        >
          <defs>
            <linearGradient id="lane" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
              <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Dotted landmass grid */}
          {landDots.map((dot, idx) => (
            <circle
              key={idx}
              cx={dot.x}
              cy={dot.y}
              r="0.38"
              fill="var(--foreground)"
              opacity="0.15"
            />
          ))}

          {nodes.map((n, i) => (
            <g key={n.id}>
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={n.size / 5}
                fill="var(--primary)"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.06 }}
              />
              <circle cx={n.x} cy={n.y} r={n.size / 5} fill="var(--primary)" opacity="0.25">
                <animate
                  attributeName="r"
                  values={`${n.size / 5};${n.size / 1.6};${n.size / 5}`}
                  dur="3.4s"
                  begin={`${i * 0.35}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.28;0;0.28"
                  dur="3.4s"
                  begin={`${i * 0.35}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}
        </svg>

        <div className="relative mt-8 grid gap-6 border-t border-border/10 pt-8 sm:grid-cols-4">
          {([
            ["48", "Countries with active mills"],
            ["11 days", "Median lead time"],
            ["98.2%", "On-time delivery"],
            ["4.9 / 5", "Average supplier rating"],
          ] as [string, string][]).map(([v, l]) => (
            <div key={l} className="group cursor-default">
              <p className="text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors duration-300">{v}</p>
              <p className="mt-1 text-xs text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
