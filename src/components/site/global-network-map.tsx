import { motion } from "motion/react";
import { useId } from "react";

interface NodePoint {
  id: string;
  name: string;
  x: number;
  y: number;
  type: "supplier" | "buyer" | "hub";
}

const mapNodes: NodePoint[] = [
  { id: "ny", name: "New York", x: 380, y: 290, type: "buyer" },
  { id: "la", name: "Los Angeles", x: 230, y: 310, type: "buyer" },
  { id: "sp", name: "São Paulo", x: 480, y: 560, type: "supplier" },
  { id: "lon", name: "London", x: 670, y: 220, type: "buyer" },
  { id: "por", name: "Porto", x: 650, y: 340, type: "supplier" },
  { id: "bie", name: "Biella", x: 740, y: 280, type: "supplier" },
  { id: "ist", name: "Istanbul", x: 840, y: 330, type: "hub" },
  { id: "cai", name: "Cairo", x: 820, y: 410, type: "supplier" },
  { id: "sur", name: "Surat", x: 990, y: 410, type: "supplier" },
  { id: "kan", name: "Kanchipuram", x: 1020, y: 480, type: "supplier" },
  { id: "hcm", name: "Ho Chi Minh", x: 1180, y: 490, type: "hub" },
  { id: "osa", name: "Osaka", x: 1300, y: 330, type: "supplier" },
  { id: "syd", name: "Sydney", x: 1320, y: 650, type: "supplier" },
];

const supplyRoutes: [number, number][] = [
  [8, 3],  // Surat -> London
  [9, 0],  // Kanchipuram -> New York
  [5, 0],  // Biella -> New York
  [6, 3],  // Istanbul -> London
  [4, 2],  // Porto -> São Paulo
  [10, 1], // Ho Chi Minh -> Los Angeles
  [11, 0], // Osaka -> New York
  [7, 5],  // Cairo -> Biella
  [12, 10] // Sydney -> Ho Chi Minh
];

// Realistic world continent vector paths
const continents = [
  // North America
  "M 160,80 Q 220,50 340,70 Q 420,60 480,100 Q 520,130 460,180 Q 420,200 380,240 Q 380,300 320,340 Q 280,360 250,420 Q 230,460 250,470 Q 220,440 200,380 Q 180,360 160,320 Q 140,280 180,240 Q 160,200 120,160 Q 100,120 160,80 Z",
  // Greenland
  "M 440,70 Q 500,40 550,60 Q 560,110 520,150 Q 460,160 430,120 Z",
  // South America
  "M 380,460 Q 440,440 540,480 Q 580,540 540,620 Q 460,680 430,710 Q 410,700 420,650 Q 420,580 380,520 Q 360,480 380,460 Z",
  // Europe
  "M 640,220 Q 660,160 740,110 Q 820,90 840,150 Q 820,220 780,250 Q 820,280 840,320 Q 800,360 750,360 Q 720,380 670,360 Q 640,340 650,300 Q 630,260 640,220 Z",
  // Africa
  "M 660,390 Q 750,370 880,390 Q 900,440 880,500 Q 900,560 880,640 Q 820,720 760,700 Q 740,640 760,560 Q 680,560 650,500 Q 640,440 660,390 Z",
  // Asia
  "M 840,120 Q 1020,80 1280,90 Q 1380,120 1360,220 Q 1320,280 1360,340 Q 1300,380 1240,360 Q 1200,420 1260,460 Q 1220,520 1140,540 Q 1100,480 1080,420 Q 1020,440 980,520 Q 940,540 920,460 Q 940,420 900,360 Q 860,320 840,220 Z",
  // Australia & Oceania
  "M 1160,590 Q 1280,570 1380,610 Q 1400,680 1340,710 Q 1240,730 1180,690 Q 1140,650 1160,590 Z"
];

export function GlobalNetworkMap({ className }: { className?: string }) {
  const gradientId = useId();

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className || ""}`}
    >
      <svg
        viewBox="0 0 1440 720"
        preserveAspectRatio="xMidYMid slice"
        className="size-full opacity-60 dark:opacity-40"
        style={{
          maskImage: "radial-gradient(ellipse 90% 75% at 50% 35%, #000 45%, transparent 95%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 75% at 50% 35%, #000 45%, transparent 95%)",
        }}
      >
        <defs>
          <linearGradient id={`route-grad-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.85" />
            <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* 1. Realistic Vector World Map Continents */}
        <g className="text-foreground">
          {continents.map((pathD, idx) => (
            <path
              key={idx}
              d={pathD}
              fill="currentColor"
              fillOpacity="0.06"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeOpacity="0.18"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* 3. Blue circular nodes representing global textile suppliers & buyers */}
        {mapNodes.map((node, i) => (
          <g key={node.id}>
            {/* Gentle outer node pulse ring */}
            <circle
              cx={node.x}
              cy={node.y}
              r="7"
              fill="var(--primary)"
              opacity="0.25"
            >
              <animate
                attributeName="r"
                values="5;14;5"
                dur="3.8s"
                begin={`${i * 0.28}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.35;0;0.35"
                dur="3.8s"
                begin={`${i * 0.28}s`}
                repeatCount="indefinite"
              />
            </circle>

            {/* Core blue circular node */}
            <circle
              cx={node.x}
              cy={node.y}
              r="4"
              fill="var(--primary)"
              className="drop-shadow-sm"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="1.8"
              fill="#ffffff"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
