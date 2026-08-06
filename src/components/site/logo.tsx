export function Logo({ label = "Texora" }: { label?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-[0.7rem] bg-gradient-premium shadow-soft">
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden>
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M8 3v18M16 3v18"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </span>
      <span className="text-[1.05rem] font-semibold tracking-[-0.02em]">{label}</span>
    </span>
  );
}
