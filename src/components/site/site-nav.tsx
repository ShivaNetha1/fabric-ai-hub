import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from "motion/react";
import { Menu, Search, ShoppingBag, X, LayoutGrid, Factory, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const megaMenu = {
  Marketplace: [
    { label: "All fabrics", to: "/marketplace", desc: "10,400 indexed materials" },
    { label: "Cotton & shirting", to: "/marketplace", desc: "Poplin, twill, chambray" },
    { label: "Luxury silk", to: "/marketplace", desc: "Charmeuse, dupion, jacquard" },
    { label: "Technical & recycled", to: "/marketplace", desc: "GRS, performance finishes" },
  ],
  Solutions: [
    { label: "Buyer dashboard", to: "/dashboard/buyer", desc: "Orders, reorders, insights" },
    { label: "Supplier dashboard", to: "/dashboard/supplier", desc: "Revenue and demand" },
    { label: "Inventory", to: "/inventory", desc: "Live stock across mills" },
    { label: "Order pipeline", to: "/orders", desc: "Kanban from PO to dispatch" },
  ],
};

export function SiteNav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const last = React.useRef(0);
  const cart = useCart();
  const { user, profile } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  React.useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 12);
    if (y > last.current && y > 220) setHidden(true);
    else setHidden(false);
    last.current = y;
  });

  return (
    <motion.header
      animate={{ y: hidden && !mobileOpen ? "-120%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto flex max-w-[88rem] items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-500 sm:px-4",
          scrolled ? "glass-strong shadow-soft" : "border border-transparent",
        )}
      >
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Loomly home">
          <Logo />
        </Link>

        <div className="ml-2 hidden items-center gap-1 lg:flex">
          {Object.keys(megaMenu).map((key) => (
            <button
              key={key}
              onMouseEnter={() => setOpenMenu(key)}
              onFocus={() => setOpenMenu(key)}
              onClick={() => setOpenMenu(openMenu === key ? null : key)}
              aria-expanded={openMenu === key}
              className="group relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {key}
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-300",
                  openMenu === key && "rotate-180",
                )}
              />
              <span className="absolute inset-x-3.5 bottom-1 h-px origin-left scale-x-0 bg-foreground/60 transition-transform duration-300 group-hover:scale-x-100" />
            </button>
          ))}
          <NavLink to="/suppliers/arvind-weaves">Suppliers</NavLink>
          <NavLink to="/onboarding">Onboarding</NavLink>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon" asChild aria-label="Search the marketplace">
            <Link to="/marketplace">
              <Search />
            </Link>
          </Button>
          {profile?.role !== "supplier" ? (
            <Button variant="ghost" size="icon" asChild aria-label={`Cart, ${cart.count} items`}>
              <Link to="/cart" className="relative">
                <ShoppingBag />
                {cart.count > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
                    {cart.count}
                  </span>
                ) : null}
              </Link>
            </Button>
          ) : null}
          {user ? (
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link
                to={
                  profile?.role === "supplier"
                    ? "/dashboard/supplier"
                    : profile?.role === "buyer"
                      ? "/dashboard/buyer"
                      : "/onboarding"
                }
                className="gap-1.5"
              >
                <User className="size-3.5 text-primary" />
                <span className="max-w-[100px] truncate">{profile?.full_name || user.email}</span>
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/auth" search={{ mode: "signup" }}>Sign up</Link>
            </Button>
          )}
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/marketplace">Explore marketplace</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {openMenu ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-2 hidden max-w-[88rem] lg:block"
          >
            <div className="glass-strong w-[38rem] rounded-2xl p-2.5 shadow-lift">
              <div className="grid grid-cols-2 gap-1.5">
                {megaMenu[openMenu as keyof typeof megaMenu].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="group rounded-xl p-3.5 transition-colors hover:bg-accent"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {openMenu === "Marketplace" ? (
                        <LayoutGrid className="size-4 text-primary" />
                      ) : (
                        <Factory className="size-4 text-primary" />
                      )}
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{item.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-strong mx-auto mt-2 max-w-[88rem] rounded-2xl p-3 shadow-lift lg:hidden"
          >
            <div className="grid gap-0.5">
              {[
                { label: "Marketplace", to: "/marketplace" },
                { label: "Buyer dashboard", to: "/dashboard/buyer" },
                { label: "Supplier dashboard", to: "/dashboard/supplier" },
                { label: "Inventory", to: "/inventory" },
                { label: "Orders", to: "/orders" },
                { label: "Supplier profile", to: "/suppliers/arvind-weaves" },
                { label: "Onboarding", to: "/onboarding" },
              ].map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {i.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {user ? (
                <Button variant="outline" asChild>
                  <Link
                    to={
                      profile?.role === "supplier"
                        ? "/dashboard/supplier"
                        : profile?.role === "buyer"
                          ? "/dashboard/buyer"
                          : "/onboarding"
                    }
                  >
                    Profile
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link to="/auth" search={{ mode: "signup" }}>Sign up</Link>
                </Button>
              )}
              <Button asChild>
                <Link to="/marketplace">Explore</Link>
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group relative rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      activeProps={{ className: "text-foreground" }}
    >
      {children}
      <span className="absolute inset-x-3.5 bottom-1 h-px origin-left scale-x-0 bg-foreground/60 transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}
