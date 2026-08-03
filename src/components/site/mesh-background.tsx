import { cn } from "@/lib/utils";

/**
 * Layered mesh-gradient + animated blob backdrop.
 * Purely decorative — never announced to assistive tech.
 */
export function MeshBackground({
  className,
  intensity = "default",
}: {
  className?: string;
  intensity?: "default" | "soft";
}) {
  const opacity = intensity === "soft" ? "opacity-50" : "opacity-100";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden noise", opacity, className)}
    >
      {/* Animated background blobs */}
      <div
        className="allow-animation absolute -left-32 -top-40 h-[38rem] w-[38rem] rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--primary) 30%, transparent), transparent 70%)",
          animation: "blob-drift 26s ease-in-out infinite",
        }}
      />
      <div
        className="allow-animation absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--cyan) 28%, transparent), transparent 70%)",
          animation: "blob-drift 32s ease-in-out infinite reverse",
        }}
      />
      <div
        className="allow-animation absolute bottom-[-18rem] left-1/3 h-[36rem] w-[36rem] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--violet) 24%, transparent), transparent 70%)",
          animation: "blob-drift 38s ease-in-out infinite",
        }}
      />

      {/* Decorative loom textures and threads */}
      <div className="allow-animation textile-weave absolute inset-[-12%]" />
      <div className="allow-animation textile-shuttle absolute left-[-20%] top-[22%]" />
      <div className="allow-animation textile-thread textile-thread-primary absolute -left-1/3 top-[-20%] h-[140%]" />
      <div className="allow-animation textile-thread textile-thread-cyan absolute -right-1/3 top-[-28%] h-[150%]" />
      <div className="allow-animation textile-thread textile-thread-violet absolute left-1/3 top-[-34%] h-[160%]" />

      {/* High-fidelity moving yarn threads (highly visible animated textile curves)
      <svg
        className="absolute inset-0 size-full pointer-events-none opacity-40 dark:opacity-25"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="yarn-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.85" />
            <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="yarn-grad-violet" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="yarn-grad-cyan" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        <path
          d="M -100,150 C 300,50 600,450 900,320 C 1200,200 1300,750 1600,850"
          fill="none"
          stroke="url(#yarn-grad-primary)"
          strokeWidth="3.5"
          strokeDasharray="9 7"
          className="allow-animation animate-yarn-1"
        />

        <path
          d="M 1600,150 C 1200,350 900,120 600,550 C 300,950 100,750 -100,850"
          fill="none"
          stroke="url(#yarn-grad-violet)"
          strokeWidth="3"
          strokeDasharray="8 6"
          className="allow-animation animate-yarn-2"
        />

        <path
          d="M -100,500 C 350,380 550,600 850,480 C 1150,380 1350,550 1600,450"
          fill="none"
          stroke="url(#yarn-grad-cyan)"
          strokeWidth="4"
          strokeDasharray="10 8"
          className="allow-animation animate-yarn-3"
        />

        <path
          d="M 200,-100 C 300,250 80,550 250,750 C 350,900 120,1000 180,1100"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeDasharray="8 5"
          className="allow-animation animate-yarn-4"
          opacity="0.8"
        />

        <path
          d="M 1200,-100 C 1100,280 1300,580 1150,780 C 1050,920 1250,1020 1200,1100"
          fill="none"
          stroke="var(--cyan)"
          strokeWidth="3"
          strokeDasharray="8 5"
          className="allow-animation animate-yarn-5"
          opacity="0.85"
        />
      </svg>
      */ }

      {/* Grid lines overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 20%, #000 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
