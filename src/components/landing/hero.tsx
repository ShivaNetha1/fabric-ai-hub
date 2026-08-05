import * as React from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Sparkles, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeshBackground } from "@/components/site/mesh-background";
import { fabricImages, marketplaceStats, inr } from "@/lib/data";
import { cn } from "@/lib/utils";

const floatCards = [
  {
    image: fabricImages.silk,
    title: "Mulberry Silk 19 MM",
    meta: "Kanchi Silk Mills · MOQ 100 m",
    price: 1480,
    className: "left-[2%] top-[14%] w-52 sm:w-60",
    depth: 28,
    delay: 0.2,
    productId: "mulberry-silk-charmeuse",
  },
  {
    image: fabricImages.linen,
    title: "European Flax Linen",
    meta: "Baltic Linen Works · GOTS",
    price: 486,
    className: "right-[3%] top-[8%] w-52 sm:w-60",
    depth: -34,
    delay: 0.35,
    productId: "european-flax-linen",
  },
  {
    image: fabricImages.wool,
    title: "Super 130s Wool",
    meta: "Milano Lana · Biella, Italy",
    price: 2260,
    className: "bottom-[6%] left-[8%] w-48 sm:w-56",
    depth: 44,
    delay: 0.5,
    productId: "super-130s-wool",
  },
];

export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const pctX = (e.clientX - r.left) / r.width;
    const pctY = (e.clientY - r.top) / r.height;
    
    // Set custom CSS variables directly on the element style
    e.currentTarget.style.setProperty("--mouse-x", `${pctX * 100}%`);
    e.currentTarget.style.setProperty("--mouse-y", `${pctY * 100}%`);
    e.currentTarget.style.setProperty("--mouse-offset-x", `${pctX - 0.5}`);
    e.currentTarget.style.setProperty("--mouse-offset-y", `${pctY - 0.5}`);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative isolate overflow-hidden px-6 pb-24 pt-36 sm:pt-44"
    >
      <MeshBackground />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), color-mix(in oklab, var(--primary) 10%, transparent), transparent 65%)`,
        }}
      />

      <motion.div style={{ y, opacity: fade }} className="relative mx-auto max-w-3xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="gradient-ring inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-medium text-muted-foreground shadow-soft"
        >
          <Sparkles className="size-3.5 text-primary" />
          Semantic fabric search is live in 48 countries
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 text-[2.7rem] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[4.6rem]"
        >
          Next-Gen
          <br />
          <span className="text-gradient-premium">Textile Marketplace</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Connecting buyers and suppliers with intelligent product discovery — from first swatch to
          bulk purchase order, in a single calm workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button size="xl" variant="hero" asChild>
            <Link to="/marketplace">
              Explore marketplace <ArrowRight />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link to="/auth" search={{ mode: "signup", role: "supplier" }}>Become a supplier</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-success" /> Mill-level verification
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="size-3.5 text-warning" /> 4.9 average supplier rating
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" /> Vector search across 10,412 fabrics
          </span>
        </motion.div>
      </motion.div>

      {/* Floating fabric cards — interactive GPU depth layer */}
      <div className="absolute inset-0 hidden xl:block pointer-events-none">
        {floatCards.map((card) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: card.delay, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute ${card.className} pointer-events-auto`}
          >
            <div
              style={{
                transform: `translate3d(calc(var(--mouse-offset-x, 0) * ${card.depth}px), calc(var(--mouse-offset-y, 0) * ${card.depth}px), 0) rotate(${card.depth > 0 ? -3 : 3}deg)`,
                willChange: "transform",
                transition: "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Link
                to="/products/$productId"
                params={{ productId: card.productId }}
                className="block"
              >
                <div className="glass-strong overflow-hidden rounded-2xl p-2.5 shadow-lift border border-border/10 hover:border-primary/40 hover:shadow-soft transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="aspect-4/3 w-full rounded-xl object-cover"
                  />
                  <div className="px-1.5 pb-1 pt-3">
                    <p className="text-xs font-semibold">{card.title}</p>
                    <p className="mt-0.5 text-[0.68rem] text-muted-foreground">{card.meta}</p>
                    <p className="mt-2 text-sm font-semibold">
                      {inr(card.price)}
                      <span className="text-[0.68rem] font-normal text-subtle"> / m</span>
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hero visual */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto mt-20 max-w-5xl"
      >
        <div className="overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-lift">
          <img
            src={fabricImages.hero}
            alt="Folded premium cotton, silk and linen fabrics from verified mills"
            width={1408}
            height={1008}
            className="aspect-16/9 w-full rounded-2xl object-cover"
          />
        </div>

        <div className="glass-strong absolute inset-x-4 -bottom-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl shadow-lift sm:inset-x-10 md:grid-cols-4">
          {marketplaceStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + i * 0.08 }}
              className="bg-surface/70 px-5 py-6 text-center"
            >
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.12em] text-subtle">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
