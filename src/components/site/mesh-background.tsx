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
      <div
        className="absolute -left-32 -top-40 h-[38rem] w-[38rem] rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--primary) 30%, transparent), transparent 70%)",
          animation: "blob-drift 26s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--cyan) 28%, transparent), transparent 70%)",
          animation: "blob-drift 32s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute bottom-[-18rem] left-1/3 h-[36rem] w-[36rem] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--violet) 24%, transparent), transparent 70%)",
          animation: "blob-drift 38s ease-in-out infinite",
        }}
      />
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
