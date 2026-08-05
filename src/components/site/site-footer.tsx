import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter } from "lucide-react";
import { Logo } from "./logo";

const columns = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse fabrics", to: "/marketplace" },
      { label: "Shopping cart", to: "/cart" },
      { label: "Checkout", to: "/checkout" },
      { label: "Onboarding", to: "/onboarding" },
    ],
  },
  {
    title: "For buyers",
    links: [
      { label: "Buyer dashboard", to: "/dashboard/buyer" },
      { label: "Order tracking", to: "/orders" },
      { label: "Sign up", to: "/auth", search: { mode: "signup", role: "buyer" } },
      { label: "Product detail", to: "/products/organic-cotton-poplin" },
    ],
  },
  {
    title: "For suppliers",
    links: [
      { label: "Supplier dashboard", to: "/dashboard/supplier" },
      { label: "Inventory manager", to: "/inventory" },
      { label: "Supplier profile", to: "/suppliers/arvind-weaves" },
      { label: "Become a supplier", to: "/auth", search: { mode: "signup", role: "supplier" } },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Sourcing guides", to: "/marketplace" },
      { label: "Certification index", to: "/marketplace" },
      { label: "Privacy policy", to: "/" },
      { label: "Terms of service", to: "/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-border bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-80 opacity-60 blur-[100px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-[88rem] px-6 py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_3fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The intelligence layer for global textile sourcing. Verified mills, semantic fabric
              discovery and bulk ordering — in one calm workspace.
            </p>
            <div className="mt-7 flex gap-2">
              {[
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Github, label: "GitHub" },
                { Icon: Twitter, label: "Twitter" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-subtle">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        search={(l as any).search}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-subtle">
            © 2026 Loomly Technologies. Registered in Bengaluru, India.
          </p>
          <p className="text-xs text-subtle">
            Trusted by 1,200 verified mills across 48 countries.
          </p>
        </div>
      </div>
    </footer>
  );
}
