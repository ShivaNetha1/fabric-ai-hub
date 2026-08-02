import { motion } from "motion/react";
import { SectionHeading } from "@/components/site/reveal";

const nodes = [
  { id: "Ahmedabad", x: 68, y: 46, size: 7 },
  { id: "Kanchipuram", x: 71, y: 56, size: 6 },
  { id: "Vilnius", x: 53, y: 26, size: 6 },
  { id: "Biella", x: 48, y: 33, size: 6 },
  { id: "Porto", x: 43, y: 36, size: 5 },
  { id: "Istanbul", x: 56, y: 36, size: 5 },
  { id: "Ho Chi Minh", x: 78, y: 55, size: 5 },
  { id: "São Paulo", x: 30, y: 70, size: 5 },
  { id: "New York", x: 22, y: 35, size: 5 },
  { id: "Osaka", x: 85, y: 40, size: 5 },
];

const links: [number, number][] = [
  [0, 2],
  [0, 3],
  [1, 8],
  [2, 8],
  [3, 9],
  [0, 6],
  [7, 8],
  [5, 0],
];

export function SourcingMap() {
  return (
    <section className="mx-auto mt-40 max-w-[88rem] px-6">
      <SectionHeading
        align="center"
        eyebrow="Global network"
        title="Mills on four continents, one sourcing surface"
        description="Live capacity from 1,200 verified suppliers across 48 countries, priced to your delivery port."
      />

      <div className="relative mt-16 overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 60% 40%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%)",
          }}
        />
        <svg
          viewBox="0 0 100 80"
          className="relative aspect-2/1 w-full"
          role="img"
          aria-label="World map showing Loomly supplier hubs and active trade lanes"
        >
          <defs>
            <linearGradient id="lane" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.05" />
              <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Dotted landmass grid */}
          {Array.from({ length: 30 }).map((_, r) =>
            Array.from({ length: 46 }).map((_, cIdx) => {
              const x = 2 + cIdx * 2.15;
              const y = 4 + r * 2.4;
              const inLand =
                (x > 14 && x < 34 && y > 18 && y < 44) ||
                (x > 26 && x < 38 && y > 50 && y < 74) ||
                (x > 40 && x < 60 && y > 18 && y < 38) ||
                (x > 44 && x < 58 && y > 40 && y < 64) ||
                (x > 60 && x < 90 && y > 18 && y < 58);
              if (!inLand) return null;
              return (
                <circle
                  key={`${r}-${cIdx}`}
                  cx={x}
                  cy={y}
                  r="0.4"
                  fill="var(--foreground)"
                  opacity="0.12"
                />
              );
            }),
          )}

          {links.map(([a, b], i) => {
            const from = nodes[a]!;
            const to = nodes[b]!;
            const mx = (from.x + to.x) / 2;
            const my = Math.min(from.y, to.y) - 10;
            const d = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
            return (
              <motion.path
                key={i}
                d={d}
                fill="none"
                stroke="url(#lane)"
                strokeWidth="0.35"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, delay: 0.2 + i * 0.12, ease: "easeInOut" }}
              />
            );
          })}

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

        <div className="relative mt-8 grid gap-6 border-t border-border pt-8 sm:grid-cols-4">
          {[
            ["48", "Countries with active mills"],
            ["11 days", "Median lead time"],
            ["98.2%", "On-time delivery"],
            ["4.9 / 5", "Average supplier rating"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-2xl font-semibold tracking-tight">{v}</p>
              <p className="mt-1 text-xs text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
